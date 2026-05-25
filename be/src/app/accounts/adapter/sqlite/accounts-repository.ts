import type { DatabaseClient } from '../../../../db/connection'
import type { AccountRepositoryPort } from '../../domain/domain-ports'
import type { Account } from '../../domain/domain-model'
import { accountsTable } from './schema'

const toAccount = (row: typeof accountsTable.$inferSelect): Account => {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export const createAccountsRepository = (
  databaseClient: DatabaseClient
): AccountRepositoryPort => {
  return {
    listAccounts: () => {
      const rows = databaseClient.db.select().from(accountsTable).all()

      return rows.map(toAccount)
    },
    insertAccount: (account) => {
      databaseClient.db
        .insert(accountsTable)
        .values({
          id: account.id,
          name: account.name,
          type: account.type,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        })
        .run()
    }
  }
}
