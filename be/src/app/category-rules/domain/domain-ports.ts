import type { Category, CategoryRule } from './domain-model'

export type CategoryRulesRepositoryPort = {
  listCategories: () => Category[]
  findCategoryById: (categoryId: string) => Category | null
  insertCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  deleteCategoryById: (categoryId: string) => void
  categoryHasChildren: (categoryId: string) => boolean
  categoryHasRules: (categoryId: string) => boolean
  categoryHasTransactions: (categoryId: string) => boolean
  listRules: () => CategoryRule[]
  listEnabledRules: () => CategoryRule[]
  findRuleById: (ruleId: string) => CategoryRule | null
  insertRule: (rule: CategoryRule) => void
  updateRule: (rule: CategoryRule) => void
  deleteRuleById: (ruleId: string) => void
}

export type ClockPort = {
  nowIso: () => string
}

export type IdGeneratorPort = {
  createId: () => string
}
