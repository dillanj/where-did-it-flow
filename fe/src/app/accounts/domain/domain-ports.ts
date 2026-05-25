import type { Account, AccountType } from './domain-model'

export type AccountsApiPort = {
  listAccounts: () => Promise<Account[]>
  createAccount: (input: {
    name: string
    type: AccountType
  }) => Promise<Account>
}
