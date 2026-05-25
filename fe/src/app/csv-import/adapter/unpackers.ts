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
  return value as UploadPreview
}

export const unpackUploadImportResult = (value: unknown): UploadImportResult => {
  return value as UploadImportResult
}
