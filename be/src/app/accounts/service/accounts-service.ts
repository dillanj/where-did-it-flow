import { createId } from '../../../shared/ids/create-id'
import { AccountsDomain } from '../domain/accounts-domain'
import type { AccountRepositoryPort } from '../domain/domain-ports'

export type CreateAccountsServiceInput = {
  repository: AccountRepositoryPort
}

export class AccountsService {
  private readonly _repository: AccountRepositoryPort
  private readonly _domain: AccountsDomain

  constructor(input: CreateAccountsServiceInput) {
    this._repository = input.repository
    this._domain = new AccountsDomain({
      clock: {
        nowIso: () => new Date().toISOString()
      },
      idGenerator: {
        createId
      }
    })
  }

  listAccounts = () => {
    return this._repository.listAccounts()
  }

  createAccount = (input: {
    name: string
    type: string
  }) => {
    const account = this._domain.createAccount(input)

    this._repository.insertAccount(account)

    return account
  }
}
