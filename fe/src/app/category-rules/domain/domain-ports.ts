import type {
  Category,
  CategoryDraft,
  CategoryRule,
  CategoryRuleDraft
} from './domain-model'

export type CategoryRulesApiPort = {
  listCategories: () => Promise<Category[]>
  createCategory: (input: CategoryDraft) => Promise<Category>
  updateCategory: (input: CategoryDraft & { categoryId: string }) => Promise<Category>
  deleteCategory: (categoryId: string) => Promise<void>
  listRules: () => Promise<CategoryRule[]>
  createRule: (input: CategoryRuleDraft) => Promise<CategoryRule>
  updateRule: (input: CategoryRuleDraft & { ruleId: string }) => Promise<CategoryRule>
  deleteRule: (ruleId: string) => Promise<void>
}
