import type { Account } from './domain-model'

export type AccountRepositoryPort = {
  listAccounts: () => Account[]
  insertAccount: (account: Account) => void
}

export type ClockPort = {
  nowIso: () => string
}

export type IdGeneratorPort = {
  createId: () => string
}
