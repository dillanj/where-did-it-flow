import { describe, expect, it } from 'vitest'
import { CsvImportDomain } from '../csv-import-domain'

describe('CsvImportDomain', () => {
  const createDomain = () => {
    return new CsvImportDomain({
      clock: {
        nowIso: () => '2026-01-01T00:00:00.000Z'
      },
      idGenerator: {
        createId: () => 'upload-1'
      },
      hash: {
        sha256: (value) => value
      }
    })
  }

  it('builds preview rows and counts invalid rows', () => {
    const domain = createDomain()

    const preview = domain.buildPreview({
      uploadId: 'upload-1',
      accountId: 'account-1',
      parsedCsv: {
        headers: ['Date', 'Description', 'Amount'],
        rows: [
          {
            Date: '2026-01-01',
            Description: 'Paycheck',
            Amount: '100.00'
          },
          {
            Date: 'not-a-date',
            Description: 'Bad Row',
            Amount: '10.00'
          }
        ]
      },
      columnMapping: {
        dateColumn: 'Date',
        descriptionColumn: 'Description',
        amountColumn: 'Amount'
      },
      existingFingerprints: new Set<string>()
    })

    expect(preview.parsedRowCount).toBe(1)
    expect(preview.invalidRowCount).toBe(1)
    expect(preview.rows).toHaveLength(2)
    expect(preview.rows[1]?.invalidReason).toBe('invalid_date')
  })

  it('marks duplicates from existing fingerprints', () => {
    const domain = createDomain()

    const existingFingerprint = 'account-1|2026-01-01|paycheck|10000'

    const preview = domain.buildPreview({
      uploadId: 'upload-1',
      accountId: 'account-1',
      parsedCsv: {
        headers: ['Date', 'Description', 'Amount'],
        rows: [
          {
            Date: '2026-01-01',
            Description: 'Paycheck',
            Amount: '100.00'
          }
        ]
      },
      columnMapping: {
        dateColumn: 'Date',
        descriptionColumn: 'Description',
        amountColumn: 'Amount'
      },
      existingFingerprints: new Set<string>([existingFingerprint])
    })

    expect(preview.duplicateRowCount).toBe(1)
    expect(preview.validTransactions).toHaveLength(0)
  })
})
