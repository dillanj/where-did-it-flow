import { and, asc, eq, or } from 'drizzle-orm'
import type { DatabaseClient } from '../../../../db/connection'
import type { CategoryRulesRepositoryPort } from '../../domain/domain-ports'
import type { Category, CategoryRule } from '../../domain/domain-model'
import {
  categoriesTable,
  categoryRulesTable,
  transactionsTable
} from './schema'

const toCategory = (row: typeof categoriesTable.$inferSelect): Category => {
  return {
    id: row.id,
    parentCategoryId: row.parentCategoryId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const toCategoryRule = (
  row: typeof categoryRulesTable.$inferSelect
): CategoryRule => {
  return {
    id: row.id,
    name: row.name,
    matchColumn: row.matchColumn,
    matchType: row.matchType,
    matchValue: row.matchValue,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    outflowClassification: row.outflowClassification,
    priority: row.priority,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export const createCategoryRulesRepository = (
  databaseClient: DatabaseClient
): CategoryRulesRepositoryPort => {
  return {
    listCategories: () => {
      const rows = databaseClient.db
        .select()
        .from(categoriesTable)
        .orderBy(asc(categoriesTable.parentCategoryId), asc(categoriesTable.name))
        .all()

      return rows.map(toCategory)
    },

    findCategoryById: (categoryId) => {
      const row = databaseClient.db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .get()

      return row ? toCategory(row) : null
    },

    insertCategory: (category) => {
      databaseClient.db
        .insert(categoriesTable)
        .values({
          id: category.id,
          parentCategoryId: category.parentCategoryId,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        })
        .run()
    },

    updateCategory: (category) => {
      databaseClient.db
        .update(categoriesTable)
        .set({
          parentCategoryId: category.parentCategoryId,
          name: category.name,
          updatedAt: category.updatedAt
        })
        .where(eq(categoriesTable.id, category.id))
        .run()
    },

    deleteCategoryById: (categoryId) => {
      databaseClient.db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .run()
    },

    categoryHasChildren: (categoryId) => {
      const row = databaseClient.db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(eq(categoriesTable.parentCategoryId, categoryId))
        .limit(1)
        .get()

      return Boolean(row)
    },

    categoryHasRules: (categoryId) => {
      const row = databaseClient.db
        .select({ id: categoryRulesTable.id })
        .from(categoryRulesTable)
        .where(
          or(
            eq(categoryRulesTable.categoryId, categoryId),
            eq(categoryRulesTable.subcategoryId, categoryId)
          )
        )
        .limit(1)
        .get()

      return Boolean(row)
    },

    categoryHasTransactions: (categoryId) => {
      const row = databaseClient.db
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(
          or(
            eq(transactionsTable.categoryId, categoryId),
            eq(transactionsTable.subcategoryId, categoryId)
          )
        )
        .limit(1)
        .get()

      return Boolean(row)
    },

    listRules: () => {
      const rows = databaseClient.db
        .select()
        .from(categoryRulesTable)
        .orderBy(
          asc(categoryRulesTable.priority),
          asc(categoryRulesTable.createdAt),
          asc(categoryRulesTable.id)
        )
        .all()

      return rows.map(toCategoryRule)
    },

    listEnabledRules: () => {
      const rows = databaseClient.db
        .select()
        .from(categoryRulesTable)
        .where(eq(categoryRulesTable.isEnabled, true))
        .orderBy(
          asc(categoryRulesTable.priority),
          asc(categoryRulesTable.createdAt),
          asc(categoryRulesTable.id)
        )
        .all()

      return rows.map(toCategoryRule)
    },

    findRuleById: (ruleId) => {
      const row = databaseClient.db
        .select()
        .from(categoryRulesTable)
        .where(eq(categoryRulesTable.id, ruleId))
        .get()

      return row ? toCategoryRule(row) : null
    },

    insertRule: (rule) => {
      databaseClient.db
        .insert(categoryRulesTable)
        .values({
          id: rule.id,
          name: rule.name,
          matchColumn: rule.matchColumn,
          matchType: rule.matchType,
          matchValue: rule.matchValue,
          categoryId: rule.categoryId,
          subcategoryId: rule.subcategoryId,
          outflowClassification: rule.outflowClassification,
          priority: rule.priority,
          isEnabled: rule.isEnabled,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt
        })
        .run()
    },

    updateRule: (rule) => {
      databaseClient.db
        .update(categoryRulesTable)
        .set({
          name: rule.name,
          matchColumn: rule.matchColumn,
          matchType: rule.matchType,
          matchValue: rule.matchValue,
          categoryId: rule.categoryId,
          subcategoryId: rule.subcategoryId,
          outflowClassification: rule.outflowClassification,
          priority: rule.priority,
          isEnabled: rule.isEnabled,
          updatedAt: rule.updatedAt
        })
        .where(eq(categoryRulesTable.id, rule.id))
        .run()
    },

    deleteRuleById: (ruleId) => {
      databaseClient.db
        .delete(categoryRulesTable)
        .where(eq(categoryRulesTable.id, ruleId))
        .run()
    }
  }
}
