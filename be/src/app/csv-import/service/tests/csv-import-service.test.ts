import { describe, expect, it } from 'vitest'
import type { CategoryRulesRepositoryPort } from '../../../category-rules/domain/domain-ports'
import type { CsvUploadRepositoryPort } from '../../domain/domain-ports'
import type { ParsedTransactionCandidate } from '../../domain/domain-model'
import { CsvImportService } from '../csv-import-service'

describe('CsvImportService', () => {
  it('applies category rules during preview and import', () => {
    const insertedTransactions: ParsedTransactionCandidate[] = []

    const repository: CsvUploadRepositoryPort = {
      accountExists: () => true,
      insertUpload: () => undefined,
      listUploadsByAccountId: () => [],
      findUploadById: () => {
        return {
          id: 'upload-1',
          accountId: 'account-1',
          fileName: 'statement.csv',
          storedFilePath: '/tmp/statement.csv',
          originalFileHash: 'hash',
          statementYear: null,
          statementMonth: null,
          status: 'uploaded',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      },
      updateUploadStatus: () => undefined,
      deleteUploadById: () => undefined,
      listUploadIdsByAccountMonth: () => [],
      deleteTransactionsByUploadIds: () => undefined,
      findExistingFingerprints: () => new Set<string>(),
      insertTransactions: (transactions) => {
        insertedTransactions.push(...transactions)

        return {
          insertedCount: transactions.length,
          skippedDuplicateCount: 0
        }
      },
      insertColumnMapping: () => undefined,
      listColumnMappingsByAccountId: () => [],
      findColumnMappingById: () => null,
      updateColumnMapping: () => undefined,
      deleteColumnMappingById: () => undefined,
      findLatestColumnMappingByAccountId: () => null
    }

    const categoryRulesRepository: CategoryRulesRepositoryPort = {
      listCategories: () => [
        {
          id: 'category-1',
          parentCategoryId: null,
          name: 'Housing',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'subcategory-1',
          parentCategoryId: 'category-1',
          name: 'Rent',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      findCategoryById: () => null,
      insertCategory: () => undefined,
      updateCategory: () => undefined,
      deleteCategoryById: () => undefined,
      categoryHasChildren: () => false,
      categoryHasRules: () => false,
      categoryHasTransactions: () => false,
      listRules: () => [],
      listEnabledRules: () => [
        {
          id: 'rule-1',
          name: 'Rent rule',
          matchColumn: 'description',
          matchType: 'contains',
          matchValue: 'rent',
          categoryId: 'category-1',
          subcategoryId: 'subcategory-1',
          outflowClassification: 'positive_outflow',
          priority: 10,
          isEnabled: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      findRuleById: () => null,
      insertRule: () => undefined,
      updateRule: () => undefined,
      deleteRuleById: () => undefined
    }

    const service = new CsvImportService({
      repository,
      categoryRulesRepository,
      fileStorage: {
        store: () => {
          return {
            storedFilePath: '/tmp/statement.csv'
          }
        },
        read: () => 'unused',
        delete: () => undefined
      },
      csvParser: {
        parse: () => {
          return {
            headers: ['Date', 'Description', 'Amount'],
            rows: [
              {
                Date: '2026-01-01',
                Description: 'Rent payment',
                Amount: '-1000.00'
              }
            ]
          }
        }
      }
    })

    const preview = service.previewUpload({
      uploadId: 'upload-1',
      columnMapping: {
        dateColumn: 'Date',
        descriptionColumn: 'Description',
        amountColumn: 'Amount'
      }
    })

    expect(preview.appliedCategoryCount).toBe(1)
    expect(preview.unmappedTransactionCount).toBe(0)
    expect(preview.rows[0]).toMatchObject({
      categoryName: 'Housing',
      subcategoryName: 'Rent',
      outflowClassification: 'positive_outflow',
      appliedRuleName: 'Rent rule'
    })

    const result = service.importUpload({
      uploadId: 'upload-1',
      columnMapping: {
        dateColumn: 'Date',
        descriptionColumn: 'Description',
        amountColumn: 'Amount'
      },
      skipDuplicates: true
    })

    expect(result.insertedCount).toBe(1)
    expect(insertedTransactions[0]).toMatchObject({
      categoryId: 'category-1',
      subcategoryId: 'subcategory-1',
      outflowClassification: 'positive_outflow'
    })
  })
})
