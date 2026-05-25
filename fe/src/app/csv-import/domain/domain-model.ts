export const accountTypes = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'other'
] as const

export type AccountType = (typeof accountTypes)[number]

export type Account = {
  id: string
  name: string
  type: AccountType
  createdAt: string
  updatedAt: string
}

export type CsvUpload = {
  id: string
  accountId: string
  fileName: string
  status: string
  createdAt: string
}

export type CsvUploadDetails = {
  id: string
  accountId: string
  fileName: string
  status: string
  createdAt: string
  statementYear: number | null
  statementMonth: number | null
}

export type UploadRowPreview = {
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
  rows: UploadRowPreview[]
}

export type UploadImportResult = {
  uploadId: string
  insertedCount: number
  skippedDuplicateCount: number
  invalidRowCount: number
}

export type ColumnMapping = {
  dateColumn: string
  descriptionColumn: string
  amountColumn: string | null
  debitColumn: string | null
  creditColumn: string | null
  categoryColumn: string | null
  notesColumn: string | null
  dateFormat: string | null
}

export type CsvUploadResult = {
  id: string
  accountId: string
  fileName: string
  status: string
  headers: string[]
  sampleRows: Record<string, string>[]
  createdAt: string
}

export type CsvImportDomainState = {
  accounts: Account[]
  selectedAccountId: string | null
  uploads: CsvUpload[]
  selectedUploadId: string | null
  selectedUploadDetails: CsvUploadDetails | null
  headers: string[]
  sampleRows: Record<string, string>[]
  mapping: ColumnMapping
  preview: UploadPreview | null
  importResult: UploadImportResult | null
  message: string | null
}

export const createEmptyColumnMapping = (): ColumnMapping => {
  return {
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
    debitColumn: '',
    creditColumn: '',
    categoryColumn: '',
    notesColumn: '',
    dateFormat: ''
  }
}

export const createInitialCsvImportState = (): CsvImportDomainState => {
  return {
    accounts: [],
    selectedAccountId: null,
    uploads: [],
    selectedUploadId: null,
    selectedUploadDetails: null,
    headers: [],
    sampleRows: [],
    mapping: createEmptyColumnMapping(),
    preview: null,
    importResult: null,
    message: null
  }
}
