import type { Account } from '../../domain/domain-model'

export const unpackAccount = (account: Account) => {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt
  }
}
