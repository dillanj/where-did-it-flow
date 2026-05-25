import { and, desc, eq, inArray } from 'drizzle-orm'
import type { DatabaseClient } from '../../../../db/connection'
import type { CsvUploadRepositoryPort } from '../../domain/domain-ports'
import type { CsvColumnMapping, CsvUpload } from '../../domain/domain-model'
import {
  accountsTable,
  csvColumnMappingsTable,
  csvUploadsTable,
  transactionsTable
} from './schema'

const toCsvUpload = (
  row: typeof csvUploadsTable.$inferSelect
): CsvUpload => {
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
}

const toCsvColumnMapping = (
  row: typeof csvColumnMappingsTable.$inferSelect
): CsvColumnMapping => {
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    dateColumn: row.dateColumn,
    descriptionColumn: row.descriptionColumn,
    amountColumn: row.amountColumn,
    debitColumn: row.debitColumn,
    creditColumn: row.creditColumn,
    categoryColumn: row.categoryColumn,
    notesColumn: row.notesColumn,
    dateFormat: row.dateFormat,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

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
      databaseClient.db
        .insert(csvUploadsTable)
        .values({
          id: upload.id,
          accountId: upload.accountId,
          fileName: upload.fileName,
          storedFilePath: upload.storedFilePath,
          originalFileHash: upload.originalFileHash,
          statementYear: upload.statementYear,
          statementMonth: upload.statementMonth,
          status: upload.status,
          createdAt: upload.createdAt
        })
        .run()
    },

    listUploadsByAccountId: (accountId) => {
      const rows = databaseClient.db
        .select()
        .from(csvUploadsTable)
        .where(eq(csvUploadsTable.accountId, accountId))
        .all()

      return rows.map(toCsvUpload)
    },

    findUploadById: (uploadId) => {
      const row = databaseClient.db
        .select()
        .from(csvUploadsTable)
        .where(eq(csvUploadsTable.id, uploadId))
        .get()

      return row ? toCsvUpload(row) : null
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
    },

    insertColumnMapping: (mapping) => {
      databaseClient.db
        .insert(csvColumnMappingsTable)
        .values({
          id: mapping.id,
          accountId: mapping.accountId,
          name: mapping.name,
          dateColumn: mapping.dateColumn,
          descriptionColumn: mapping.descriptionColumn,
          amountColumn: mapping.amountColumn,
          debitColumn: mapping.debitColumn,
          creditColumn: mapping.creditColumn,
          categoryColumn: mapping.categoryColumn,
          notesColumn: mapping.notesColumn,
          dateFormat: mapping.dateFormat,
          createdAt: mapping.createdAt,
          updatedAt: mapping.updatedAt
        })
        .run()
    },

    listColumnMappingsByAccountId: (accountId) => {
      const rows = databaseClient.db
        .select()
        .from(csvColumnMappingsTable)
        .where(eq(csvColumnMappingsTable.accountId, accountId))
        .orderBy(desc(csvColumnMappingsTable.updatedAt))
        .all()

      return rows.map(toCsvColumnMapping)
    },

    findColumnMappingById: (mappingId) => {
      const row = databaseClient.db
        .select()
        .from(csvColumnMappingsTable)
        .where(eq(csvColumnMappingsTable.id, mappingId))
        .get()

      return row ? toCsvColumnMapping(row) : null
    },

    updateColumnMapping: (mapping) => {
      databaseClient.db
        .update(csvColumnMappingsTable)
        .set({
          name: mapping.name,
          dateColumn: mapping.dateColumn,
          descriptionColumn: mapping.descriptionColumn,
          amountColumn: mapping.amountColumn,
          debitColumn: mapping.debitColumn,
          creditColumn: mapping.creditColumn,
          categoryColumn: mapping.categoryColumn,
          notesColumn: mapping.notesColumn,
          dateFormat: mapping.dateFormat,
          updatedAt: mapping.updatedAt
        })
        .where(eq(csvColumnMappingsTable.id, mapping.id))
        .run()
    },

    deleteColumnMappingById: (mappingId) => {
      databaseClient.db
        .delete(csvColumnMappingsTable)
        .where(eq(csvColumnMappingsTable.id, mappingId))
        .run()
    },

    findLatestColumnMappingByAccountId: (accountId) => {
      const row = databaseClient.db
        .select()
        .from(csvColumnMappingsTable)
        .where(eq(csvColumnMappingsTable.accountId, accountId))
        .orderBy(desc(csvColumnMappingsTable.updatedAt))
        .limit(1)
        .get()

      return row ? toCsvColumnMapping(row) : null
    }
  }
}
