import type { Category, CategoryRule } from '../../domain/domain-model'

export const unpackCategory = (category: Category) => {
  return {
    id: category.id,
    parentCategoryId: category.parentCategoryId,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }
}

export const unpackRule = (rule: CategoryRule) => {
  return {
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
  }
}
