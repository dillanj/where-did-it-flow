import { Runner, Signal } from '@tcn/state'
import { AppError } from '../../shared/errors/app-error'
import type { CsvUpload, CsvUploadDetails, CsvUploadResult } from './domain-model'
import type { CsvImportApiPort } from './domain-ports'

export class UploadsDomain {
  private readonly _api: CsvImportApiPort

  readonly uploads = new Signal<CsvUpload[]>([])
  readonly selectedUploadId = new Signal<string | null>(null)
  readonly selectedUploadDetails = new Signal<CsvUploadDetails | null>(null)
  readonly message = new Signal<string | null>(null)

  readonly loadUploadsRunner = new Runner<void>(undefined)
  readonly uploadRunner = new Runner<void>(undefined)
  readonly selectUploadRunner = new Runner<void>(undefined)

  constructor(input: { api: CsvImportApiPort }) {
    this._api = input.api
  }

  loadByAccountId = async (accountId: string | null) => {
    await this.loadUploadsRunner.execute(async () => {
      if (!accountId) {
        this.uploads.set([])
        this.selectedUploadId.set(null)
        this.selectedUploadDetails.set(null)
        return
      }

      const uploads = await this._api.listUploadsByAccountId(accountId)
      const currentSelectedUploadId = this.selectedUploadId.get()
      const nextSelectedUploadId =
        currentSelectedUploadId && uploads.some((upload) => upload.id === currentSelectedUploadId)
          ? currentSelectedUploadId
          : (uploads[0]?.id ?? null)

      this.uploads.set(uploads)
      this.selectedUploadId.set(nextSelectedUploadId)
      this.selectedUploadDetails.set(null)
    })
  }

  uploadCsv = async (input: { accountId: string; file: File }): Promise<CsvUploadResult> => {
    let uploadResult: CsvUploadResult | null = null

    await this.uploadRunner.execute(async () => {
      const createdUpload = await this._api.uploadCsv(input)
      uploadResult = createdUpload

      this.uploads.set([
        {
          id: createdUpload.id,
          accountId: createdUpload.accountId,
          fileName: createdUpload.fileName,
          status: createdUpload.status,
          createdAt: createdUpload.createdAt
        },
        ...this.uploads.get()
      ])
      this.selectedUploadId.set(createdUpload.id)
      this.selectedUploadDetails.set({
        id: createdUpload.id,
        accountId: createdUpload.accountId,
        fileName: createdUpload.fileName,
        status: createdUpload.status,
        createdAt: createdUpload.createdAt,
        statementYear: null,
        statementMonth: null
      })
      this.message.set('CSV uploaded. Review mapping and run preview.')
    })

    if (!uploadResult) {
      throw new AppError('Upload did not return a result.')
    }

    return uploadResult
  }

  selectUpload = async (uploadId: string) => {
    await this.selectUploadRunner.execute(async () => {
      const uploadDetails = await this._api.getUploadById(uploadId)

      this.selectedUploadId.set(uploadId)
      this.selectedUploadDetails.set(uploadDetails)
      this.message.set(null)
    })
  }

  getSelectedUploadId = () => {
    return this.selectedUploadId.get()
  }

  dispose = () => {
    this.uploads.dispose()
    this.selectedUploadId.dispose()
    this.selectedUploadDetails.dispose()
    this.message.dispose()
    this.loadUploadsRunner.dispose()
    this.uploadRunner.dispose()
    this.selectUploadRunner.dispose()
  }
}
