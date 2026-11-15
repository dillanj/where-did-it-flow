export const categoryRuleMatchColumns = ['description'] as const

export const categoryRuleMatchTypes = [
  'contains',
  'equals',
  'starts_with',
  'ends_with',
  'regex'
] as const

export const supportedCategoryRuleMatchTypes = ['contains', 'equals'] as const

export const outflowClassifications = [
  'negative_outflow',
  'positive_outflow'
] as const

export type CategoryRuleMatchColumn = (typeof categoryRuleMatchColumns)[number]
export type CategoryRuleMatchType = (typeof categoryRuleMatchTypes)[number]
export type SupportedCategoryRuleMatchType =
  (typeof supportedCategoryRuleMatchTypes)[number]
export type OutflowClassification = (typeof outflowClassifications)[number]

export type Category = {
  id: string
  parentCategoryId: string | null
  name: string
  createdAt: string
  updatedAt: string
}

export type CategoryRule = {
  id: string
  name: string
  matchColumn: CategoryRuleMatchColumn
  matchType: CategoryRuleMatchType
  matchValue: string
  categoryId: string
  subcategoryId: string | null
  outflowClassification: OutflowClassification | null
  priority: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCategoryInput = {
  name: string
  parentCategoryId: string | null
}

export type UpdateCategoryInput = {
  categoryId: string
  name: string
  parentCategoryId: string | null
}

export type CreateCategoryRuleInput = {
  name: string
  matchColumn: CategoryRuleMatchColumn
  matchType: SupportedCategoryRuleMatchType
  matchValue: string
  categoryId: string
  subcategoryId: string | null
  outflowClassification: OutflowClassification | null
  priority: number
  isEnabled: boolean
}

export type UpdateCategoryRuleInput = CreateCategoryRuleInput & {
  ruleId: string
}

export type RuleApplicationTarget = {
  normalizedDescription: string
  amount: number
}

export type CategoryRuleAssignment = {
  categoryId: string
  categoryName: string
  subcategoryId: string | null
  subcategoryName: string | null
  outflowClassification: OutflowClassification | null
  appliedRuleId: string
  appliedRuleName: string
}
