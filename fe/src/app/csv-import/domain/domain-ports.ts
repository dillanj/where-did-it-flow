import type {
  Account,
  AccountType,
  ColumnMapping,
  CsvUpload,
  CsvUploadDetails,
  CsvUploadResult,
  UploadImportResult,
  UploadPreview
} from './domain-model'

export type CsvImportApiPort = {
  listAccounts: () => Promise<Account[]>
  createAccount: (input: {
    name: string
    type: AccountType
  }) => Promise<Account>
  uploadCsv: (input: {
    accountId: string
    file: File
  }) => Promise<CsvUploadResult>
  listUploadsByAccountId: (accountId: string) => Promise<CsvUpload[]>
  getUploadById: (uploadId: string) => Promise<CsvUploadDetails>
  previewUpload: (input: {
    uploadId: string
    mapping: ColumnMapping
  }) => Promise<UploadPreview>
  importUpload: (input: {
    uploadId: string
    mapping: ColumnMapping
    skipDuplicates: boolean
  }) => Promise<UploadImportResult>
}
