export type CsvUploadStatus =
  | 'uploaded'
  | 'mapped'
  | 'imported'
  | 'failed'
  | 'deleted'

export type CsvUpload = {
  id: string
  accountId: string
  fileName: string
  storedFilePath: string
  originalFileHash: string
  statementYear: number | null
  statementMonth: number | null
  status: CsvUploadStatus
  createdAt: string
}

export type ParsedCsvFile = {
  headers: string[]
  rows: Record<string, string>[]
}

export type DraftCsvColumnMappingRequest = {
  dateColumn: string
  descriptionColumn: string
  amountColumn?: string | null
  debitColumn?: string | null
  creditColumn?: string | null
  categoryColumn?: string | null
  notesColumn?: string | null
  dateFormat?: string | null
}

export type ParsedTransactionCandidate = {
  uploadId: string
  accountId: string
  transactionDate: string
  description: string
  normalizedDescription: string
  amount: number
  currency: string
  categoryId: string | null
  subcategoryId: string | null
  outflowClassification: 'negative_outflow' | 'positive_outflow' | null
  fingerprint: string
}

export type UploadPreviewRow = {
  rowIndex: number
  transactionDate: string | null
  description: string | null
  amountCents: number | null
  isDuplicate: boolean
  isValid: boolean
  invalidReason: string | null
}

export type UploadPreview = {
  uploadId: string
  parsedRowCount: number
  invalidRowCount: number
  duplicateRowCount: number
  inflowTotalCents: number
  outflowTotalCents: number
  appliedCategoryCount: number
  unmappedTransactionCount: number
  rows: UploadPreviewRow[]
  validTransactions: ParsedTransactionCandidate[]
}

export type UploadImportResult = {
  uploadId: string
  insertedCount: number
  skippedDuplicateCount: number
  invalidRowCount: number
}
