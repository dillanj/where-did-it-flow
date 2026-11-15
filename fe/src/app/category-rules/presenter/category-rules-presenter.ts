import { derive, type DerivedSignal } from '@tcn/state'
import type { CategoryRulesDomain } from '../domain/category-rules-domain'
import type {
  Category,
  CategoryDraft,
  CategoryOption,
  CategoryRuleDraft
} from '../domain/domain-model'

const isPending = (status: string) => {
  return status === 'PENDING'
}

const buildCategoryOptions = (categories: Category[]): CategoryOption[] => {
  return categories.map((category) => {
    const parentCategory = category.parentCategoryId
      ? categories.find((candidate) => {
          return candidate.id === category.parentCategoryId
        }) ?? null
      : null

    return {
      id: category.id,
      name: category.name,
      parentCategoryId: category.parentCategoryId,
      label: parentCategory ? `${parentCategory.name} / ${category.name}` : category.name
    }
  })
}

export class CategoryRulesPresenter {
  private readonly _domain: CategoryRulesDomain

  private readonly _topLevelCategoryOptions: DerivedSignal<CategoryOption[]>
  private readonly _allCategoryOptions: DerivedSignal<CategoryOption[]>
  private readonly _subcategoryOptions: DerivedSignal<CategoryOption[]>
  private readonly _isLoading: DerivedSignal<boolean>
  private readonly _isSavingCategory: DerivedSignal<boolean>
  private readonly _isDeletingCategory: DerivedSignal<boolean>
  private readonly _isSavingRule: DerivedSignal<boolean>
  private readonly _isDeletingRule: DerivedSignal<boolean>
  private readonly _errorMessage: DerivedSignal<string | null>

  constructor(input: { domain: CategoryRulesDomain }) {
    this._domain = input.domain

    this._topLevelCategoryOptions = derive(this._domain.categories.broadcast, (categories) => {
      return buildCategoryOptions(categories).filter((category) => {
        return category.parentCategoryId === null
      })
    })

    this._allCategoryOptions = derive(this._domain.categories.broadcast, (categories) => {
      return buildCategoryOptions(categories)
    })

    this._subcategoryOptions = derive(
      this._domain.categories.broadcast,
      this._domain.ruleDraft.broadcast,
      (categories, draft) => {
        return buildCategoryOptions(categories).filter((category) => {
          return category.parentCategoryId === draft.categoryId
        })
      }
    )

    this._isLoading = derive(this._domain.loadRunner.stateBroadcast, (runnerState) => {
      return isPending(runnerState.status)
    })

    this._isSavingCategory = derive(
      this._domain.saveCategoryRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._isDeletingCategory = derive(
      this._domain.deleteCategoryRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._isSavingRule = derive(
      this._domain.saveRuleRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._isDeletingRule = derive(
      this._domain.deleteRuleRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._errorMessage = derive(
      this._domain.loadRunner.stateBroadcast,
      this._domain.saveCategoryRunner.stateBroadcast,
      this._domain.deleteCategoryRunner.stateBroadcast,
      this._domain.saveRuleRunner.stateBroadcast,
      this._domain.deleteRuleRunner.stateBroadcast,
      (
        loadRunnerState,
        saveCategoryRunnerState,
        deleteCategoryRunnerState,
        saveRuleRunnerState,
        deleteRuleRunnerState
      ) => {
        return (
          loadRunnerState.error?.message ??
          saveCategoryRunnerState.error?.message ??
          deleteCategoryRunnerState.error?.message ??
          saveRuleRunnerState.error?.message ??
          deleteRuleRunnerState.error?.message ??
          null
        )
      }
    )
  }

  get broadcasts() {
    return {
      categories: this._domain.categories.broadcast,
      rules: this._domain.rules.broadcast,
      categoryDraft: this._domain.categoryDraft.broadcast,
      ruleDraft: this._domain.ruleDraft.broadcast,
      editingCategoryId: this._domain.editingCategoryId.broadcast,
      editingRuleId: this._domain.editingRuleId.broadcast,
      message: this._domain.message.broadcast,
      topLevelCategoryOptions: this._topLevelCategoryOptions.broadcast,
      allCategoryOptions: this._allCategoryOptions.broadcast,
      subcategoryOptions: this._subcategoryOptions.broadcast,
      isLoading: this._isLoading.broadcast,
      isSavingCategory: this._isSavingCategory.broadcast,
      isDeletingCategory: this._isDeletingCategory.broadcast,
      isSavingRule: this._isSavingRule.broadcast,
      isDeletingRule: this._isDeletingRule.broadcast,
      errorMessage: this._errorMessage.broadcast
    }
  }

  updateCategoryDraft = (field: keyof CategoryDraft, value: string | null) => {
    this._domain.updateCategoryDraft(field, value)
  }

  startCreateCategory = () => {
    this._domain.startCreateCategory()
  }

  startEditCategory = (categoryId: string) => {
    this._domain.startEditCategory(categoryId)
  }

  saveCategoryDraft = async () => {
    try {
      await this._domain.saveCategoryDraft()
    } catch {
      return
    }
  }

  deleteCategory = async (categoryId: string) => {
    try {
      await this._domain.deleteCategory(categoryId)
    } catch {
      return
    }
  }

  updateRuleDraft = (
    field: keyof CategoryRuleDraft,
    value: string | number | boolean | null
  ) => {
    this._domain.updateRuleDraft(field, value)
  }

  startCreateRule = () => {
    this._domain.startCreateRule()
  }

  startEditRule = (ruleId: string) => {
    this._domain.startEditRule(ruleId)
  }

  saveRuleDraft = async () => {
    try {
      await this._domain.saveRuleDraft()
    } catch {
      return
    }
  }

  deleteRule = async (ruleId: string) => {
    try {
      await this._domain.deleteRule(ruleId)
    } catch {
      return
    }
  }

  dispose = () => {
    this._topLevelCategoryOptions.dispose()
    this._allCategoryOptions.dispose()
    this._subcategoryOptions.dispose()
    this._isLoading.dispose()
    this._isSavingCategory.dispose()
    this._isDeletingCategory.dispose()
    this._isSavingRule.dispose()
    this._isDeletingRule.dispose()
    this._errorMessage.dispose()
  }
}
