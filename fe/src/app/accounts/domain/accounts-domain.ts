import { Runner, Signal } from '@tcn/state'
import type { AccountsApiPort } from './domain-ports'
import type { Account, AccountType } from './domain-model'

export class AccountsDomain {
  private readonly _api: AccountsApiPort

  readonly accounts = new Signal<Account[]>([])
  readonly selectedAccountId = new Signal<string | null>(null)
  readonly message = new Signal<string | null>(null)

  readonly initializeRunner = new Runner<void>(undefined)
  readonly createAccountRunner = new Runner<void>(undefined)

  constructor(input: { api: AccountsApiPort }) {
    this._api = input.api
  }

  initialize = async () => {
    await this.initializeRunner.execute(async () => {
      const accounts = await this._api.listAccounts()
      const currentSelectedAccountId = this.selectedAccountId.get()
      const hasCurrentSelection =
        currentSelectedAccountId !== null &&
        accounts.some((account) => account.id === currentSelectedAccountId)
      const nextSelectedAccountId =
        hasCurrentSelection ? currentSelectedAccountId : (accounts[0]?.id ?? null)

      this.accounts.set(accounts)
      this.selectedAccountId.set(nextSelectedAccountId)
      this.message.set(
        accounts.length > 0 ? null : 'Create your first account to start importing CSV files.'
      )
    })
  }

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this.createAccountRunner.execute(async () => {
      const createdAccount = await this._api.createAccount(input)
      const accounts = await this._api.listAccounts()
      const createdAccountExists = accounts.some((account) => account.id === createdAccount.id)

      this.accounts.set(accounts)
      this.selectedAccountId.set(
        createdAccountExists ? createdAccount.id : (accounts[0]?.id ?? null)
      )
      this.message.set(
        createdAccountExists
          ? `Created account: ${createdAccount.name}`
          : `Account created. Selected ${accounts[0]?.name ?? 'latest account'}.`
      )
    })
  }

  selectAccount = (accountId: string) => {
    this.selectedAccountId.set(accountId)
    this.message.set(null)
  }

  getSelectedAccountId = () => {
    return this.selectedAccountId.get()
  }

  dispose = () => {
    this.accounts.dispose()
    this.selectedAccountId.dispose()
    this.message.dispose()
    this.initializeRunner.dispose()
    this.createAccountRunner.dispose()
  }
}
