import type {
  CsvUpload,
  CsvUploadStatus,
  ParsedCsvFile,
  ParsedTransactionCandidate
} from './domain-model'

export type CsvUploadRepositoryPort = {
  accountExists: (accountId: string) => boolean
  insertUpload: (upload: CsvUpload) => void
  listUploadsByAccountId: (accountId: string) => CsvUpload[]
  findUploadById: (uploadId: string) => CsvUpload | null
  updateUploadStatus: (uploadId: string, status: CsvUploadStatus) => void
  deleteUploadById: (uploadId: string) => void
  listUploadIdsByAccountMonth: (
    accountId: string,
    statementYear: number,
    statementMonth: number
  ) => string[]
  deleteTransactionsByUploadIds: (uploadIds: string[]) => void
  findExistingFingerprints: (accountId: string, fingerprints: string[]) => Set<string>
  insertTransactions: (
    transactions: ParsedTransactionCandidate[]
  ) => {
    insertedCount: number
    skippedDuplicateCount: number
  }
}

export type CsvFileStoragePort = {
  store: (input: {
    accountId: string
    uploadId: string
    fileName: string
    fileBuffer: Buffer
  }) => {
    storedFilePath: string
  }
  read: (storedFilePath: string) => string
  delete: (storedFilePath: string) => void
}

export type CsvParserPort = {
  parse: (csvText: string) => ParsedCsvFile
}

export type ClockPort = {
  nowIso: () => string
}

export type IdGeneratorPort = {
  createId: () => string
}

export type HashPort = {
  sha256: (value: string) => string
}
