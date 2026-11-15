import type { Category, CategoryRule } from '../domain/domain-model'

export const unpackCategory = (value: unknown): Category => {
  const payload = value as Category

  return {
    id: payload.id,
    parentCategoryId: payload.parentCategoryId,
    name: payload.name,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt
  }
}

export const unpackRule = (value: unknown): CategoryRule => {
  const payload = value as CategoryRule

  return {
    id: payload.id,
    name: payload.name,
    matchColumn: payload.matchColumn,
    matchType: payload.matchType,
    matchValue: payload.matchValue,
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    outflowClassification: payload.outflowClassification,
    priority: payload.priority,
    isEnabled: payload.isEnabled,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt
  }
}
