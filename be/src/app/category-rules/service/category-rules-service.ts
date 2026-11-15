import { createId } from '../../../shared/ids/create-id'
import { AppError } from '../../../shared/errors/app-error'
import { CategoriesDomain } from '../domain/categories-domain'
import { CategoryRulesDomain } from '../domain/category-rules-domain'
import type { CategoryRulesRepositoryPort } from '../domain/domain-ports'
import type {
  Category,
  CategoryRule,
  CreateCategoryInput,
  CreateCategoryRuleInput,
  UpdateCategoryInput,
  UpdateCategoryRuleInput
} from '../domain/domain-model'

export type CreateCategoryRulesServiceInput = {
  repository: CategoryRulesRepositoryPort
}

export class CategoryRulesService {
  private readonly _repository: CategoryRulesRepositoryPort
  private readonly _categoriesDomain: CategoriesDomain
  private readonly _categoryRulesDomain: CategoryRulesDomain

  constructor(input: CreateCategoryRulesServiceInput) {
    this._repository = input.repository
    const domainPorts = {
      clock: {
        nowIso: () => new Date().toISOString()
      },
      idGenerator: {
        createId
      }
    }

    this._categoriesDomain = new CategoriesDomain(domainPorts)
    this._categoryRulesDomain = new CategoryRulesDomain(domainPorts)
  }

  listCategories = () => {
    return this._repository.listCategories()
  }

  createCategory = (input: CreateCategoryInput) => {
    this._assertParentCategoryIsValid(input.parentCategoryId, null)

    const category = this._categoriesDomain.createCategory(input)

    this._repository.insertCategory(category)

    return category
  }

  updateCategory = (input: UpdateCategoryInput) => {
    const existingCategory = this._findCategoryOrThrow(input.categoryId)

    this._assertParentCategoryIsValid(input.parentCategoryId, input.categoryId)

    const category = this._categoriesDomain.updateCategory({
      existingCategory,
      request: input
    })

    this._repository.updateCategory(category)

    return category
  }

  deleteCategory = (categoryId: string) => {
    this._findCategoryOrThrow(categoryId)

    if (
      this._repository.categoryHasChildren(categoryId) ||
      this._repository.categoryHasRules(categoryId) ||
      this._repository.categoryHasTransactions(categoryId)
    ) {
      throw new AppError({
        code: 'category_in_use',
        message: 'Category is in use and cannot be deleted',
        statusCode: 409
      })
    }

    this._repository.deleteCategoryById(categoryId)
  }

  listRules = () => {
    return this._repository.listRules()
  }

  listEnabledRules = () => {
    return this._repository.listEnabledRules()
  }

  createRule = (input: CreateCategoryRuleInput) => {
    this._assertRuleReferencesAreValid(input)

    const rule = this._categoryRulesDomain.createRule(input)

    this._repository.insertRule(rule)

    return rule
  }

  updateRule = (input: UpdateCategoryRuleInput) => {
    const existingRule = this._findRuleOrThrow(input.ruleId)

    this._assertRuleReferencesAreValid(input)

    const rule = this._categoryRulesDomain.updateRule({
      existingRule,
      request: input
    })

    this._repository.updateRule(rule)

    return rule
  }

  deleteRule = (ruleId: string) => {
    this._findRuleOrThrow(ruleId)
    this._repository.deleteRuleById(ruleId)
  }

  private _findCategoryOrThrow = (categoryId: string): Category => {
    const category = this._repository.findCategoryById(categoryId)

    if (!category) {
      throw new AppError({
        code: 'category_not_found',
        message: 'Category was not found',
        statusCode: 404
      })
    }

    return category
  }

  private _findRuleOrThrow = (ruleId: string): CategoryRule => {
    const rule = this._repository.findRuleById(ruleId)

    if (!rule) {
      throw new AppError({
        code: 'category_rule_not_found',
        message: 'Category rule was not found',
        statusCode: 404
      })
    }

    return rule
  }

  private _assertParentCategoryIsValid = (
    parentCategoryId: string | null,
    categoryId: string | null
  ) => {
    if (!parentCategoryId) {
      return
    }

    if (parentCategoryId === categoryId) {
      throw new AppError({
        code: 'invalid_category',
        message: 'Category cannot be its own parent',
        statusCode: 400
      })
    }

    this._findCategoryOrThrow(parentCategoryId)

    if (categoryId) {
      this._assertParentDoesNotCreateCycle({
        categoryId,
        parentCategoryId
      })
    }
  }

  private _assertParentDoesNotCreateCycle = (input: {
    categoryId: string
    parentCategoryId: string
  }) => {
    const categories = this._repository.listCategories()
    let currentParentId: string | null = input.parentCategoryId

    while (currentParentId) {
      if (currentParentId === input.categoryId) {
        throw new AppError({
          code: 'invalid_category',
          message: 'Category parent would create a cycle',
          statusCode: 400
        })
      }

      currentParentId =
        categories.find((category) => {
          return category.id === currentParentId
        })?.parentCategoryId ?? null
    }
  }

  private _assertRuleReferencesAreValid = (
    input: CreateCategoryRuleInput | UpdateCategoryRuleInput
  ) => {
    const category = this._findCategoryOrThrow(input.categoryId)

    if (category.parentCategoryId) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule category must be a top-level category',
        statusCode: 400
      })
    }

    if (!input.subcategoryId) {
      return
    }

    const subcategory = this._findCategoryOrThrow(input.subcategoryId)

    if (subcategory.parentCategoryId !== input.categoryId) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule subcategory must belong to the selected category',
        statusCode: 400
      })
    }
  }
}
