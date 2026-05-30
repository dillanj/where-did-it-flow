import { parse } from 'csv-parse/sync'
import { AppError } from '../../../../shared/errors/app-error'
import type { CsvParserPort } from '../../domain/domain-ports'

const knownFinancialHeaderNames = new Set([
  'account',
  'account number',
  'account type',
  'amount',
  'category',
  'credit',
  'daily balance',
  'date',
  'debit',
  'description',
  'memo',
  'notes',
  'transaction code',
  'transaction date'
])

const countFilledValues = (record: string[]) => {
  return record.filter((value) => value.trim() !== '').length
}

const countSameWidthFollowers = (records: string[][], index: number) => {
  const recordWidth = records[index]?.length ?? 0
  const nextRecords = records.slice(index + 1, index + 6)

  return nextRecords.filter((record) => record.length === recordWidth).length
}

const countKnownHeaderNames = (record: string[]) => {
  return record.filter((value) => {
    return knownFinancialHeaderNames.has(value.trim().toLowerCase())
  }).length
}

const findHeaderIndex = (records: string[][]) => {
  let bestIndex = 0
  let bestScore = Number.NEGATIVE_INFINITY

  records.forEach((record, index) => {
    const filledValueCount = countFilledValues(record)

    if (filledValueCount === 0) {
      return
    }

    const score =
      filledValueCount * 3 +
      countSameWidthFollowers(records, index) * 5 +
      countKnownHeaderNames(record) * 10

    if (score > bestScore) {
      bestIndex = index
      bestScore = score
    }
  })

  return bestIndex
}

const createUniqueHeaders = (record: string[]) => {
  const headerCounts = new Map<string, number>()

  return record.map((header, index) => {
    const fallbackHeader = `Column ${index + 1}`
    const baseHeader = header.trim() || fallbackHeader
    const nextCount = (headerCounts.get(baseHeader) ?? 0) + 1

    headerCounts.set(baseHeader, nextCount)

    return nextCount === 1 ? baseHeader : `${baseHeader} ${nextCount}`
  })
}

const createRow = (headers: string[], record: string[]) => {
  return headers.reduce<Record<string, string>>((row, header, index) => {
    row[header] = record[index] ?? ''

    return row
  }, {})
}

export const createCsvParserAdapter = (): CsvParserPort => {
  return {
    parse: (csvText) => {
      try {
        const records = parse(csvText, {
          bom: true,
          relax_column_count: true,
          skip_empty_lines: true,
          trim: true
        }) as string[][]

        const nonEmptyRecords = records.filter((record) => {
          return countFilledValues(record) > 0
        })

        if (nonEmptyRecords.length === 0) {
          return {
            headers: [],
            rows: []
          }
        }

        const headerIndex = findHeaderIndex(nonEmptyRecords)
        const headers = createUniqueHeaders(nonEmptyRecords[headerIndex] ?? [])
        const rows = nonEmptyRecords
          .slice(headerIndex + 1)
          .map((record) => createRow(headers, record))

        return {
          headers,
          rows
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
