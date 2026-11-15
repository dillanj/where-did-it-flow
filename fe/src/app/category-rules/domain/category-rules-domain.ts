import { Runner, Signal } from '@tcn/state'
import { AppError } from '../../shared/errors/app-error'
import type { CategoryRulesApiPort } from './domain-ports'
import {
  createEmptyCategoryDraft,
  createEmptyRuleDraft,
  type Category,
  type CategoryDraft,
  type CategoryRule,
  type CategoryRuleDraft
} from './domain-model'

export class CategoryRulesDomain {
  private readonly _api: CategoryRulesApiPort

  readonly categories = new Signal<Category[]>([])
  readonly rules = new Signal<CategoryRule[]>([])
  readonly categoryDraft = new Signal<CategoryDraft>(createEmptyCategoryDraft())
  readonly ruleDraft = new Signal<CategoryRuleDraft>(createEmptyRuleDraft())
  readonly editingCategoryId = new Signal<string | null>(null)
  readonly editingRuleId = new Signal<string | null>(null)
  readonly message = new Signal<string | null>(null)

  readonly loadRunner = new Runner<void>(undefined)
  readonly saveCategoryRunner = new Runner<void>(undefined)
  readonly deleteCategoryRunner = new Runner<void>(undefined)
  readonly saveRuleRunner = new Runner<void>(undefined)
  readonly deleteRuleRunner = new Runner<void>(undefined)

  constructor(input: { api: CategoryRulesApiPort }) {
    this._api = input.api
  }

  initialize = async () => {
    await this.load()
  }

  load = async () => {
    await this.loadRunner.execute(async () => {
      await this._refresh()
      this.message.set(null)
    })
  }

  updateCategoryDraft = (field: keyof CategoryDraft, value: string | null) => {
    this.categoryDraft.set({
      ...this.categoryDraft.get(),
      [field]: value
    })
  }

  startCreateCategory = () => {
    this.editingCategoryId.set(null)
    this.categoryDraft.set(createEmptyCategoryDraft())
  }

  startEditCategory = (categoryId: string) => {
    const category = this.categories.get().find((candidate) => {
      return candidate.id === categoryId
    })

    if (!category) {
      return
    }

    this.editingCategoryId.set(category.id)
    this.categoryDraft.set({
      name: category.name,
      parentCategoryId: category.parentCategoryId
    })
  }

  saveCategoryDraft = async () => {
    const draft = this.categoryDraft.get()
    const name = draft.name.trim()

    if (!name) {
      throw new AppError('Category name is required.')
    }

    await this.saveCategoryRunner.execute(async () => {
      const editingCategoryId = this.editingCategoryId.get()

      if (editingCategoryId) {
        await this._api.updateCategory({
          categoryId: editingCategoryId,
          ...draft,
          name
        })
        this.message.set('Category updated.')
      } else {
        await this._api.createCategory({
          ...draft,
          name
        })
        this.message.set('Category created.')
      }

      this.startCreateCategory()
      await this._refresh()
    })
  }

  deleteCategory = async (categoryId: string) => {
    await this.deleteCategoryRunner.execute(async () => {
      await this._api.deleteCategory(categoryId)
      this.startCreateCategory()
      await this._refresh()
      this.message.set('Category deleted.')
    })
  }

  updateRuleDraft = (
    field: keyof CategoryRuleDraft,
    value: string | number | boolean | null
  ) => {
    const currentDraft = this.ruleDraft.get()
    const nextDraft = {
      ...currentDraft,
      [field]: value
    }

    if (field === 'categoryId' && value !== currentDraft.categoryId) {
      nextDraft.subcategoryId = null
    }

    this.ruleDraft.set(nextDraft)
  }

  startCreateRule = () => {
    this.editingRuleId.set(null)
    this.ruleDraft.set(createEmptyRuleDraft(this._getNextRulePriority()))
  }

  startEditRule = (ruleId: string) => {
    const rule = this.rules.get().find((candidate) => {
      return candidate.id === ruleId
    })

    if (!rule) {
      return
    }

    this.editingRuleId.set(rule.id)
    this.ruleDraft.set({
      name: rule.name,
      matchType: rule.matchType,
      matchValue: rule.matchValue,
      categoryId: rule.categoryId,
      subcategoryId: rule.subcategoryId,
      outflowClassification: rule.outflowClassification,
      priority: rule.priority,
      isEnabled: rule.isEnabled
    })
  }

  saveRuleDraft = async () => {
    const draft = this.ruleDraft.get()
    const normalizedDraft = {
      ...draft,
      name: draft.name.trim(),
      matchValue: draft.matchValue.trim()
    }

    if (!normalizedDraft.name) {
      throw new AppError('Rule name is required.')
    }

    if (!normalizedDraft.matchValue) {
      throw new AppError('Rule match value is required.')
    }

    if (!normalizedDraft.categoryId) {
      throw new AppError('Rule category is required.')
    }

    await this.saveRuleRunner.execute(async () => {
      const editingRuleId = this.editingRuleId.get()

      if (editingRuleId) {
        await this._api.updateRule({
          ruleId: editingRuleId,
          ...normalizedDraft
        })
        this.message.set('Rule updated.')
      } else {
        await this._api.createRule(normalizedDraft)
        this.message.set('Rule created.')
      }

      await this._refresh()
      this.startCreateRule()
    })
  }

  deleteRule = async (ruleId: string) => {
    await this.deleteRuleRunner.execute(async () => {
      await this._api.deleteRule(ruleId)
      await this._refresh()
      this.startCreateRule()
      this.message.set('Rule deleted.')
    })
  }

  private _refresh = async () => {
    const [categories, rules] = await Promise.all([
      this._api.listCategories(),
      this._api.listRules()
    ])

    this.categories.set(categories)
    this.rules.set(rules)
  }

  private _getNextRulePriority = () => {
    const priorities = this.rules.get().map((rule) => {
      return rule.priority
    })

    return priorities.length > 0 ? Math.max(...priorities) + 10 : 10
  }

  dispose = () => {
    this.categories.dispose()
    this.rules.dispose()
    this.categoryDraft.dispose()
    this.ruleDraft.dispose()
    this.editingCategoryId.dispose()
    this.editingRuleId.dispose()
    this.message.dispose()
    this.loadRunner.dispose()
    this.saveCategoryRunner.dispose()
    this.deleteCategoryRunner.dispose()
    this.saveRuleRunner.dispose()
    this.deleteRuleRunner.dispose()
  }
}
