import type {
  CsvUpload,
  CsvUploadDetails,
  CsvUploadResult,
  UploadImportResult,
  UploadPreview
} from '../domain/domain-model'

export const unpackUpload = (value: unknown): CsvUpload => {
  const payload = value as CsvUpload

  return {
    id: payload.id,
    accountId: payload.accountId,
    fileName: payload.fileName,
    status: payload.status,
    createdAt: payload.createdAt
  }
}

export const unpackUploadDetails = (value: unknown): CsvUploadDetails => {
  const payload = value as CsvUploadDetails

  return {
    id: payload.id,
    accountId: payload.accountId,
    fileName: payload.fileName,
    status: payload.status,
    createdAt: payload.createdAt,
    statementYear: payload.statementYear,
    statementMonth: payload.statementMonth
  }
}

export const unpackUploadResult = (value: unknown): CsvUploadResult => {
  const payload = value as CsvUploadResult

  return {
    id: payload.id,
    accountId: payload.accountId,
    fileName: payload.fileName,
    status: payload.status,
    headers: payload.headers,
    sampleRows: payload.sampleRows,
    createdAt: payload.createdAt
  }
}

export const unpackUploadPreview = (value: unknown): UploadPreview => {
  const payload = value as UploadPreview

  return {
    ...payload,
    rows: payload.rows.map((row) => {
      return {
        rowIndex: row.rowIndex,
        transactionDate: row.transactionDate,
        description: row.description,
        amountCents: row.amountCents,
        isDuplicate: row.isDuplicate,
        isValid: row.isValid,
        invalidReason: row.invalidReason,
        categoryId: row.categoryId ?? null,
        categoryName: row.categoryName ?? null,
        subcategoryId: row.subcategoryId ?? null,
        subcategoryName: row.subcategoryName ?? null,
        outflowClassification: row.outflowClassification ?? null,
        appliedRuleId: row.appliedRuleId ?? null,
        appliedRuleName: row.appliedRuleName ?? null
      }
    })
  }
}

export const unpackUploadImportResult = (value: unknown): UploadImportResult => {
  return value as UploadImportResult
}
