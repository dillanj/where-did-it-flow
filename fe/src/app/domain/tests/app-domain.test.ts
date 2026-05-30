import { describe, expect, it } from 'vitest'
import type { Account } from '../../accounts/domain/domain-model'
import { AppDomain } from '../app-domain'
import type { AppApiPort } from '../domain-ports'

const createApi = (): AppApiPort & {
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
  const listUploadsAccountIds: string[] = []

  return {
    accountsApi: {
      listAccounts: async () => {
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
    csvImportApi: {
      uploadCsv: async () => {
        throw new Error('not implemented')
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

    domain.dispose()
  })
})
