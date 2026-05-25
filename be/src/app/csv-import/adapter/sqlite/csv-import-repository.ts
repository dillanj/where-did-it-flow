import { and, eq, inArray } from 'drizzle-orm'
import type { DatabaseClient } from '../../../../db/connection'
import type { CsvUploadRepositoryPort } from '../../domain/domain-ports'
import type { CsvUpload } from '../../domain/domain-model'
import { accountsTable, csvUploadsTable, transactionsTable } from './schema'

export const createCsvImportRepository = (
  databaseClient: DatabaseClient
): CsvUploadRepositoryPort => {
  return {
    accountExists: (accountId) => {
      const row = databaseClient.db
        .select({ id: accountsTable.id })
        .from(accountsTable)
        .where(eq(accountsTable.id, accountId))
        .get()

      return Boolean(row)
    },

    insertUpload: (upload) => {
      databaseClient.db.insert(csvUploadsTable).values({
        id: upload.id,
        accountId: upload.accountId,
        fileName: upload.fileName,
        storedFilePath: upload.storedFilePath,
        originalFileHash: upload.originalFileHash,
        statementYear: upload.statementYear,
        statementMonth: upload.statementMonth,
        status: upload.status,
        createdAt: upload.createdAt
      }).run()
    },

    listUploadsByAccountId: (accountId) => {
      const rows = databaseClient.db
        .select()
        .from(csvUploadsTable)
        .where(eq(csvUploadsTable.accountId, accountId))
        .all()

      return rows.map((row): CsvUpload => {
        return {
          id: row.id,
          accountId: row.accountId,
          fileName: row.fileName,
          storedFilePath: row.storedFilePath,
          originalFileHash: row.originalFileHash,
          statementYear: row.statementYear,
          statementMonth: row.statementMonth,
          status: row.status,
          createdAt: row.createdAt
        }
      })
    },

    findUploadById: (uploadId) => {
      const row = databaseClient.db
        .select()
        .from(csvUploadsTable)
        .where(eq(csvUploadsTable.id, uploadId))
        .get()

      if (!row) {
        return null
      }

      return {
        id: row.id,
        accountId: row.accountId,
        fileName: row.fileName,
        storedFilePath: row.storedFilePath,
        originalFileHash: row.originalFileHash,
        statementYear: row.statementYear,
        statementMonth: row.statementMonth,
        status: row.status,
        createdAt: row.createdAt
      }
    },

    updateUploadStatus: (uploadId, status) => {
      databaseClient.db
        .update(csvUploadsTable)
        .set({ status })
        .where(eq(csvUploadsTable.id, uploadId))
        .run()
    },

    deleteUploadById: (uploadId) => {
      databaseClient.db
        .delete(csvUploadsTable)
        .where(eq(csvUploadsTable.id, uploadId))
        .run()
    },

    listUploadIdsByAccountMonth: (accountId, statementYear, statementMonth) => {
      const rows = databaseClient.db
        .select({ id: csvUploadsTable.id })
        .from(csvUploadsTable)
        .where(
          and(
            eq(csvUploadsTable.accountId, accountId),
            eq(csvUploadsTable.statementYear, statementYear),
            eq(csvUploadsTable.statementMonth, statementMonth)
          )
        )
        .all()

      return rows.map((row) => row.id)
    },

    deleteTransactionsByUploadIds: (uploadIds) => {
      if (uploadIds.length === 0) {
        return
      }

      databaseClient.db
        .delete(transactionsTable)
        .where(inArray(transactionsTable.uploadId, uploadIds))
        .run()
    },

    findExistingFingerprints: (accountId, fingerprints) => {
      if (fingerprints.length === 0) {
        return new Set<string>()
      }

      const rows = databaseClient.db
        .select({ fingerprint: transactionsTable.fingerprint })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.accountId, accountId),
            inArray(transactionsTable.fingerprint, fingerprints)
          )
        )
        .all()

      return new Set(rows.map((row) => row.fingerprint))
    },

    insertTransactions: (transactions) => {
      let insertedCount = 0
      let skippedDuplicateCount = 0

      transactions.forEach((transaction) => {
        const transactionId = `${transaction.uploadId}:${transaction.fingerprint}`

        const result = databaseClient.db
          .insert(transactionsTable)
          .values({
            id: transactionId,
            accountId: transaction.accountId,
            uploadId: transaction.uploadId,
            transactionDate: transaction.transactionDate,
            description: transaction.description,
            normalizedDescription: transaction.normalizedDescription,
            amount: transaction.amount,
            currency: transaction.currency,
            categoryId: transaction.categoryId,
            subcategoryId: transaction.subcategoryId,
            outflowClassification: transaction.outflowClassification,
            fingerprint: transaction.fingerprint,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .onConflictDoNothing({
            target: [transactionsTable.accountId, transactionsTable.fingerprint]
          })
          .run()

        if (result.changes > 0) {
          insertedCount += 1
        } else {
          skippedDuplicateCount += 1
        }
      })

      return {
        insertedCount,
        skippedDuplicateCount
      }
    }
  }
}
