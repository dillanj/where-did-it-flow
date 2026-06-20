import { describe, expect, it } from 'vitest'
import { CsvImportDomain } from '../csv-import-domain'
import type { CsvImportApiPort } from '../domain-ports'

const createApi = (): CsvImportApiPort & {
  getListUploadsAccountIds: () => (string | null)[]
} => {
  const listUploadsAccountIds: (string | null)[] = []

  return {
    uploadCsv: async (input) => {
      return {
        id: 'upload-1',
        accountId: input.accountId,
        fileName: 'test.csv',
        status: 'uploaded',
        headers: ['Date', 'Description', 'Amount'],
        sampleRows: [],
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    },
    listUploadsByAccountId: async (accountId) => {
      listUploadsAccountIds.push(accountId)

      return []
    },
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
    },
    getListUploadsAccountIds: () => listUploadsAccountIds
  }
}

const createDomain = (api: CsvImportApiPort) => {
  return new CsvImportDomain({
    api
  })
}

describe('CsvImportDomain', () => {
  it('loads uploads for the provided account boundary', async () => {
    const api = createApi()
    const domain = createDomain(api)

    await domain.loadByAccountId('acct-1')

    expect(api.getListUploadsAccountIds()).toEqual(['acct-1'])

    domain.dispose()
  })

  it('autofills mapping guesses from upload headers', async () => {
    const api = createApi()
    const domain = createDomain(api)

    const file = new File(['Date,Description,Amount'], 'test.csv', {
      type: 'text/csv'
    })

    await domain.uploadCsv({
      accountId: 'acct-1',
      file
    })

    expect(domain.mappingPreviewDomain.mapping.get().dateColumn).toBe('Date')
    expect(domain.mappingPreviewDomain.mapping.get().descriptionColumn).toBe('Description')
    expect(domain.mappingPreviewDomain.mapping.get().amountColumn).toBe('Amount')
    expect(domain.mappingPreviewDomain.contextUploadId.get()).toBe('upload-1')

    domain.dispose()
  })

  it('reloads uploads for the provided account after import', async () => {
    const api = createApi()
    const domain = createDomain(api)

    await domain.uploadCsv({
      accountId: 'acct-1',
      file: new File(['Date,Description,Amount'], 'test.csv', {
        type: 'text/csv'
      })
    })
    await domain.importSelectedUpload({
      accountId: 'acct-1'
    })

    expect(api.getListUploadsAccountIds()).toEqual(['acct-1'])

    domain.dispose()
  })
})
