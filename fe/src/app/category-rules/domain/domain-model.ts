export const categoryRuleMatchTypes = ['contains', 'equals'] as const

export const outflowClassifications = [
  'negative_outflow',
  'positive_outflow'
] as const

export type CategoryRuleMatchType = (typeof categoryRuleMatchTypes)[number]
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
  matchColumn: 'description'
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

export type CategoryDraft = {
  name: string
  parentCategoryId: string | null
}

export type CategoryRuleDraft = {
  name: string
  matchType: CategoryRuleMatchType
  matchValue: string
  categoryId: string
  subcategoryId: string | null
  outflowClassification: OutflowClassification | null
  priority: number
  isEnabled: boolean
}

export type CategoryOption = {
  id: string
  name: string
  parentCategoryId: string | null
  label: string
}

export const createEmptyCategoryDraft = (): CategoryDraft => {
  return {
    name: '',
    parentCategoryId: null
  }
}

export const createEmptyRuleDraft = (priority = 10): CategoryRuleDraft => {
  return {
    name: '',
    matchType: 'contains',
    matchValue: '',
    categoryId: '',
    subcategoryId: null,
    outflowClassification: null,
    priority,
    isEnabled: true
  }
}
