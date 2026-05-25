import { createHash } from 'node:crypto'
import { createId } from '../../../shared/ids/create-id'
import { AppError } from '../../../shared/errors/app-error'
import { CsvImportDomain } from '../domain/csv-import-domain'
import type {
  CsvFileStoragePort,
  CsvParserPort,
  CsvUploadRepositoryPort
} from '../domain/domain-ports'
import type {
  CsvUpload,
  DraftCsvColumnMappingRequest,
  UploadImportResult,
  UploadPreview
} from '../domain/domain-model'

export type CreateCsvImportServiceInput = {
  repository: CsvUploadRepositoryPort
  fileStorage: CsvFileStoragePort
  csvParser: CsvParserPort
}

export class CsvImportService {
  private readonly _repository: CsvUploadRepositoryPort
  private readonly _fileStorage: CsvFileStoragePort
  private readonly _csvParser: CsvParserPort
  private readonly _domain: CsvImportDomain

  constructor(input: CreateCsvImportServiceInput) {
    this._repository = input.repository
    this._fileStorage = input.fileStorage
    this._csvParser = input.csvParser
    this._domain = new CsvImportDomain({
      clock: {
        nowIso: () => new Date().toISOString()
      },
      idGenerator: {
        createId
      },
      hash: {
        sha256: (value) => {
          return createHash('sha256').update(value).digest('hex')
        }
      }
    })
  }

  uploadCsv = (input: {
    accountId: string
    fileName: string
    fileBuffer: Buffer
  }): {
    upload: CsvUpload
    headers: string[]
    sampleRows: Record<string, string>[]
  } => {
    if (!this._repository.accountExists(input.accountId)) {
      throw new AppError({
        code: 'account_not_found',
        message: 'Account was not found',
        statusCode: 404
      })
    }

    const provisionalUploadId = createId()

    const storedFile = this._fileStorage.store({
      accountId: input.accountId,
      uploadId: provisionalUploadId,
      fileName: input.fileName,
      fileBuffer: input.fileBuffer
    })

    const originalFileHash = createHash('sha256')
      .update(input.fileBuffer)
      .digest('hex')

    const upload = this._domain.createUploadRecord({
      uploadId: provisionalUploadId,
      accountId: input.accountId,
      fileName: input.fileName,
      storedFilePath: storedFile.storedFilePath,
      originalFileHash
    })

    this._repository.insertUpload(upload)

    const csvText = input.fileBuffer.toString('utf8')
    const parsedCsv = this._csvParser.parse(csvText)

    return {
      upload,
      headers: parsedCsv.headers,
      sampleRows: parsedCsv.rows.slice(0, 10)
    }
  }

  listUploadsByAccountId = (accountId: string) => {
    if (!this._repository.accountExists(accountId)) {
      throw new AppError({
        code: 'account_not_found',
        message: 'Account was not found',
        statusCode: 404
      })
    }

    return this._repository.listUploadsByAccountId(accountId)
  }

  getUploadById = (uploadId: string) => {
    const upload = this._repository.findUploadById(uploadId)

    if (!upload) {
      throw new AppError({
        code: 'upload_not_found',
        message: 'Upload was not found',
        statusCode: 404
      })
    }

    return upload
  }

  previewUpload = (input: {
    uploadId: string
    columnMapping: DraftCsvColumnMappingRequest
  }): UploadPreview => {
    const upload = this.getUploadById(input.uploadId)
    const csvText = this._fileStorage.read(upload.storedFilePath)
    const parsedCsv = this._csvParser.parse(csvText)

    const provisionalPreview = this._domain.buildPreview({
      uploadId: upload.id,
      accountId: upload.accountId,
      parsedCsv,
      columnMapping: input.columnMapping,
      existingFingerprints: new Set<string>()
    })

    const fingerprints = provisionalPreview.validTransactions.map(
      (transaction) => transaction.fingerprint
    )

    const existingFingerprints = this._repository.findExistingFingerprints(
      upload.accountId,
      fingerprints
    )

    return this._domain.buildPreview({
      uploadId: upload.id,
      accountId: upload.accountId,
      parsedCsv,
      columnMapping: input.columnMapping,
      existingFingerprints
    })
  }

  importUpload = (input: {
    uploadId: string
    columnMapping: DraftCsvColumnMappingRequest
    skipDuplicates: boolean
  }): UploadImportResult => {
    const preview = this.previewUpload({
      uploadId: input.uploadId,
      columnMapping: input.columnMapping
    })

    const transactions = input.skipDuplicates
      ? preview.validTransactions
      : preview.validTransactions

    const insertionResult = this._repository.insertTransactions(transactions)

    this._repository.updateUploadStatus(input.uploadId, 'imported')

    return {
      uploadId: input.uploadId,
      insertedCount: insertionResult.insertedCount,
      skippedDuplicateCount:
        preview.duplicateRowCount + insertionResult.skippedDuplicateCount,
      invalidRowCount: preview.invalidRowCount
    }
  }

  deleteUpload = (uploadId: string) => {
    const upload = this.getUploadById(uploadId)

    this._repository.deleteTransactionsByUploadIds([uploadId])
    this._repository.deleteUploadById(uploadId)
    this._fileStorage.delete(upload.storedFilePath)
  }

  deleteAccountMonth = (input: {
    accountId: string
    statementYear: number
    statementMonth: number
  }) => {
    const uploadIds = this._repository.listUploadIdsByAccountMonth(
      input.accountId,
      input.statementYear,
      input.statementMonth
    )

    if (uploadIds.length === 0) {
      return
    }

    const uploads = uploadIds
      .map((uploadId) => this._repository.findUploadById(uploadId))
      .filter((upload): upload is CsvUpload => upload !== null)

    this._repository.deleteTransactionsByUploadIds(uploadIds)

    uploads.forEach((upload) => {
      this._repository.deleteUploadById(upload.id)
      this._fileStorage.delete(upload.storedFilePath)
    })
  }
}
