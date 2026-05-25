import { describe, expect, it } from 'vitest'
import { CsvImportDomain } from '../csv-import-domain'
import type { CsvImportApiPort } from '../domain-ports'

const createApi = (): CsvImportApiPort => {
  return {
    listAccounts: async () => [
      {
        id: 'acct-1',
        name: 'Main',
        type: 'checking',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    createAccount: async ({ name, type }) => {
      return {
        id: 'acct-2',
        name,
        type,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }
    },
    uploadCsv: async () => {
      return {
        id: 'upload-1',
        accountId: 'acct-1',
        fileName: 'test.csv',
        status: 'uploaded',
        headers: ['Date', 'Description', 'Amount'],
        sampleRows: [],
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    },
    listUploadsByAccountId: async () => [],
    getUploadById: async (uploadId) => {
      return {
        id: uploadId,
        accountId: 'acct-1',
        fileName: 'test.csv',
        status: 'uploaded',
        createdAt: '2026-01-01T00:00:00.000Z',
        statementYear: null,
        statementMonth: null
      }
    },
    previewUpload: async () => {
      return {
        uploadId: 'upload-1',
        parsedRowCount: 0,
        invalidRowCount: 0,
        duplicateRowCount: 0,
        inflowTotalCents: 0,
        outflowTotalCents: 0,
        appliedCategoryCount: 0,
        unmappedTransactionCount: 0,
        rows: []
      }
    },
    importUpload: async () => {
      return {
        uploadId: 'upload-1',
        insertedCount: 0,
        skippedDuplicateCount: 0,
        invalidRowCount: 0
      }
    }
  }
}

describe('CsvImportDomain', () => {
  it('loads accounts and selects first account on initialize', async () => {
    const domain = new CsvImportDomain({
      api: createApi()
    })

    await domain.initialize()

    const state = domain.state.get()

    expect(state.accounts).toHaveLength(1)
    expect(state.selectedAccountId).toBe('acct-1')

    domain.dispose()
  })

  it('autofills mapping guesses from upload headers', async () => {
    const domain = new CsvImportDomain({
      api: createApi()
    })

    await domain.initialize()

    const file = new File(['Date,Description,Amount'], 'test.csv', {
      type: 'text/csv'
    })

    await domain.uploadCsv(file)

    const state = domain.state.get()

    expect(state.mapping.dateColumn).toBe('Date')
    expect(state.mapping.descriptionColumn).toBe('Description')
    expect(state.mapping.amountColumn).toBe('Amount')

    domain.dispose()
  })
})
