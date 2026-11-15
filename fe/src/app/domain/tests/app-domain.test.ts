import { describe, expect, it } from 'vitest'
import type { Account } from '../../accounts/domain/domain-model'
import { AppDomain } from '../app-domain'
import type { AppApiPort } from '../domain-ports'

const createApi = (): AppApiPort & {
  getListAccountsCallCount: () => number
  getListCategoryRulesCallCount: () => number
  getListUploadsAccountIds: () => string[]
} => {
  const accounts: Account[] = [
    {
      id: 'acct-1',
      name: 'Main',
      type: 'checking',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ]
  let listAccountsCallCount = 0
  let listCategoryRulesCallCount = 0
  const listUploadsAccountIds: string[] = []

  return {
    accountsApi: {
      listAccounts: async () => {
        listAccountsCallCount += 1
        return [...accounts]
      },
      createAccount: async (input) => {
        const account: Account = {
          id: `acct-${accounts.length + 1}`,
          name: input.name,
          type: input.type,
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z'
        }

        accounts.push(account)

        return account
      }
    },
    categoryRulesApi: {
      listCategories: async () => {
        return []
      },
      createCategory: async (input) => {
        return {
          id: 'category-1',
          parentCategoryId: input.parentCategoryId,
          name: input.name,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      },
      updateCategory: async (input) => {
        return {
          id: input.categoryId,
          parentCategoryId: input.parentCategoryId,
          name: input.name,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z'
        }
      },
      deleteCategory: async () => {
        return
      },
      listRules: async () => {
        listCategoryRulesCallCount += 1

        return []
      },
      createRule: async (input) => {
        return {
          id: 'rule-1',
          name: input.name,
          matchColumn: 'description',
          matchType: input.matchType,
          matchValue: input.matchValue,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId,
          outflowClassification: input.outflowClassification,
          priority: input.priority,
          isEnabled: input.isEnabled,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      },
      updateRule: async (input) => {
        return {
          id: input.ruleId,
          name: input.name,
          matchColumn: 'description',
          matchType: input.matchType,
          matchValue: input.matchValue,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId,
          outflowClassification: input.outflowClassification,
          priority: input.priority,
          isEnabled: input.isEnabled,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z'
        }
      },
      deleteRule: async () => {
        return
      }
    },
    csvImportApi: {
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
      getUploadById: async () => {
        throw new Error('not implemented')
      },
      previewUpload: async () => {
        throw new Error('not implemented')
      },
      importUpload: async () => {
        throw new Error('not implemented')
      }
    },
    getListAccountsCallCount: () => listAccountsCallCount,
    getListCategoryRulesCallCount: () => listCategoryRulesCallCount,
    getListUploadsAccountIds: () => listUploadsAccountIds
  }
}

describe('AppDomain', () => {
  it('initializes child domains from the root app boundary', async () => {
    const api = createApi()
    const domain = new AppDomain({
      api
    })

    await domain.initialize()

    expect(domain.hasInitialized.get()).toBe(true)
    expect(domain.accountsDomain.accountsBroadcast.get()).toHaveLength(1)
    expect(domain.accountsDomain.getSelectedAccountId()).toBe('acct-1')
    expect(api.getListUploadsAccountIds()).toEqual(['acct-1'])
    expect(api.getListCategoryRulesCallCount()).toBe(1)

    domain.dispose()
  })

  it('does not initialize child domains more than once', async () => {
    const api = createApi()
    const domain = new AppDomain({
      api
    })

    await domain.initialize()
    await domain.initialize()

    expect(api.getListAccountsCallCount()).toBe(1)
    expect(api.getListCategoryRulesCallCount()).toBe(1)
    expect(api.getListUploadsAccountIds()).toEqual(['acct-1'])

    domain.dispose()
  })

  it('coordinates account creation from the root app boundary', async () => {
    const api = createApi()
    const domain = new AppDomain({
      api
    })

    await domain.initialize()
    await domain.uploadCsv(
      new File(['Date,Description,Amount'], 'test.csv', {
        type: 'text/csv'
      })
    )
    await domain.createAccount({
      name: 'Travel Card',
      type: 'credit_card'
    })

    expect(domain.accountsDomain.accountsBroadcast.get()).toHaveLength(2)
    expect(domain.accountsDomain.getSelectedAccountId()).toBe('acct-2')
    expect(api.getListUploadsAccountIds()).toEqual(['acct-1', 'acct-2'])
    expect(domain.categoryRulesDomain.rules.get()).toEqual([])
    expect(domain.csvImportDomain.mappingPreviewDomain.contextUploadId.get()).toBe(null)

    domain.dispose()
  })
})
