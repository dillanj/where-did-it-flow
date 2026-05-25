import type { DraftCsvColumnMappingRequest } from '../../domain/domain-model'
import { AppError } from '../../../../shared/errors/app-error'

const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const packColumnMapping = (
  value: unknown
): DraftCsvColumnMappingRequest => {
  if (!value || typeof value !== 'object') {
    throw new AppError({
      code: 'invalid_csv_mapping',
      message: 'columnMapping is required',
      statusCode: 400
    })
  }

  const payload = value as Record<string, unknown>

  if (!isString(payload.dateColumn) || !isString(payload.descriptionColumn)) {
    throw new AppError({
      code: 'invalid_csv_mapping',
      message: 'dateColumn and descriptionColumn are required',
      statusCode: 400
    })
  }

  return {
    dateColumn: payload.dateColumn,
    descriptionColumn: payload.descriptionColumn,
    amountColumn: isString(payload.amountColumn) ? payload.amountColumn : null,
    debitColumn: isString(payload.debitColumn) ? payload.debitColumn : null,
    creditColumn: isString(payload.creditColumn) ? payload.creditColumn : null,
    categoryColumn: isString(payload.categoryColumn) ? payload.categoryColumn : null,
    notesColumn: isString(payload.notesColumn) ? payload.notesColumn : null,
    dateFormat: isString(payload.dateFormat) ? payload.dateFormat : null
  }
}

export const packPreviewUploadBody = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    throw new AppError({
      code: 'invalid_request',
      message: 'request body is required',
      statusCode: 400
    })
  }

  const payload = body as Record<string, unknown>

  return {
    columnMapping: packColumnMapping(payload.columnMapping)
  }
}

export const packImportUploadBody = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    throw new AppError({
      code: 'invalid_request',
      message: 'request body is required',
      statusCode: 400
    })
  }

  const payload = body as Record<string, unknown>

  const skipDuplicates = payload.skipDuplicates === false ? false : true

  const columnMapping = payload.columnMapping

  return {
    skipDuplicates,
    columnMapping: packColumnMapping(columnMapping)
  }
}
