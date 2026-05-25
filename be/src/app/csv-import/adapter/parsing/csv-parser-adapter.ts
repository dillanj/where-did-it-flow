import { parse } from 'csv-parse/sync'
import { AppError } from '../../../../shared/errors/app-error'
import type { CsvParserPort } from '../../domain/domain-ports'

export const createCsvParserAdapter = (): CsvParserPort => {
  return {
    parse: (csvText) => {
      try {
        const records = parse(csvText, {
          columns: true,
          bom: true,
          skip_empty_lines: true,
          trim: true
        }) as Record<string, string>[]

        const firstRow = records[0]
        const headers = firstRow ? Object.keys(firstRow) : []

        return {
          headers,
          rows: records
        }
      } catch {
        throw new AppError({
          code: 'csv_parse_failed',
          message: 'CSV could not be parsed',
          statusCode: 400
        })
      }
    }
  }
}
