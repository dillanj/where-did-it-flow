import type { CategoryDraft, CategoryRuleDraft } from '../domain/domain-model'

export const packCategoryDraft = (draft: CategoryDraft) => {
  return {
    name: draft.name,
    parentCategoryId: draft.parentCategoryId
  }
}

export const packRuleDraft = (draft: CategoryRuleDraft) => {
  return {
    name: draft.name,
    matchType: draft.matchType,
    matchValue: draft.matchValue,
    categoryId: draft.categoryId,
    subcategoryId: draft.subcategoryId,
    outflowClassification: draft.outflowClassification,
    priority: draft.priority,
    isEnabled: draft.isEnabled
  }
}
