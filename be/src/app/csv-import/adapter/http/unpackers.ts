import type {
  CsvUpload,
  UploadImportResult,
  UploadPreview
} from '../../domain/domain-model'

export const unpackUploadResponse = (input: {
  upload: CsvUpload
  headers: string[]
  sampleRows: Record<string, string>[]
}) => {
  return {
    id: input.upload.id,
    accountId: input.upload.accountId,
    fileName: input.upload.fileName,
    status: input.upload.status,
    headers: input.headers,
    sampleRows: input.sampleRows,
    createdAt: input.upload.createdAt
  }
}

export const unpackUploadListResponse = (uploads: CsvUpload[]) => {
  return uploads.map((upload) => {
    return {
      id: upload.id,
      accountId: upload.accountId,
      fileName: upload.fileName,
      status: upload.status,
      createdAt: upload.createdAt
    }
  })
}

export const unpackUploadDetailsResponse = (upload: CsvUpload) => {
  return {
    id: upload.id,
    accountId: upload.accountId,
    fileName: upload.fileName,
    status: upload.status,
    createdAt: upload.createdAt,
    statementYear: upload.statementYear,
    statementMonth: upload.statementMonth
  }
}

export const unpackPreviewResponse = (preview: UploadPreview) => {
  return {
    uploadId: preview.uploadId,
    parsedRowCount: preview.parsedRowCount,
    invalidRowCount: preview.invalidRowCount,
    duplicateRowCount: preview.duplicateRowCount,
    inflowTotalCents: preview.inflowTotalCents,
    outflowTotalCents: preview.outflowTotalCents,
    appliedCategoryCount: preview.appliedCategoryCount,
    unmappedTransactionCount: preview.unmappedTransactionCount,
    rows: preview.rows
  }
}

export const unpackImportResponse = (result: UploadImportResult) => {
  return {
    uploadId: result.uploadId,
    insertedCount: result.insertedCount,
    skippedDuplicateCount: result.skippedDuplicateCount,
    invalidRowCount: result.invalidRowCount
  }
}
