import { AppError } from '../../shared/errors/app-error'
import type { CsvImportApiPort } from './domain-ports'
import type { ColumnMapping } from './domain-model'
import { MappingPreviewDomain } from './mapping-preview-domain'
import { UploadsDomain } from './uploads-domain'

export class CsvImportDomain {
  readonly uploadsDomain: UploadsDomain
  readonly mappingPreviewDomain: MappingPreviewDomain

  constructor(input: {
    api: CsvImportApiPort
  }) {
    this.uploadsDomain = new UploadsDomain({
      api: input.api
    })
    this.mappingPreviewDomain = new MappingPreviewDomain({
      api: input.api
    })
  }

  loadByAccountId = async (accountId: string | null) => {
    await this.uploadsDomain.loadByAccountId(accountId)
  }

  clearForSelectedAccountChange = () => {
    this.mappingPreviewDomain.clearForSelectedAccountChange()
  }

  selectUpload = async (uploadId: string) => {
    const previousUploadId = this.uploadsDomain.getSelectedUploadId()

    await this.uploadsDomain.selectUpload(uploadId)

    if (previousUploadId !== uploadId) {
      this.mappingPreviewDomain.clearForSelectedUploadChange()
    }
  }

  uploadCsv = async (input: { accountId: string; file: File }) => {
    const upload = await this.uploadsDomain.uploadCsv({
      accountId: input.accountId,
      file: input.file
    })

    this.mappingPreviewDomain.setUploadContext(upload)
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this.mappingPreviewDomain.updateMapping(field, value)
  }

  previewSelectedUpload = async () => {
    const selectedUploadId = this.uploadsDomain.getSelectedUploadId()

    if (!selectedUploadId) {
      throw new AppError('Select an upload before running preview.')
    }

    await this.mappingPreviewDomain.previewUpload(selectedUploadId)
  }

  importSelectedUpload = async (input: { accountId: string | null }) => {
    const selectedUploadId = this.uploadsDomain.getSelectedUploadId()

    if (!selectedUploadId) {
      throw new AppError('Select an upload before importing.')
    }

    await this.mappingPreviewDomain.importUpload({
      uploadId: selectedUploadId,
      skipDuplicates: true
    })

    await this.uploadsDomain.loadByAccountId(input.accountId)
  }

  dispose = () => {
    this.uploadsDomain.dispose()
    this.mappingPreviewDomain.dispose()
  }
}
