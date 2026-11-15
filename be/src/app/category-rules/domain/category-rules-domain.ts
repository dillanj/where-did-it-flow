import { AppError } from '../../../shared/errors/app-error'
import type { ClockPort, IdGeneratorPort } from './domain-ports'
import {
  categoryRuleMatchColumns,
  outflowClassifications,
  supportedCategoryRuleMatchTypes,
  type CategoryRule,
  type CreateCategoryRuleInput,
  type UpdateCategoryRuleInput
} from './domain-model'

export type CreateCategoryRulesDomainInput = {
  clock: ClockPort
  idGenerator: IdGeneratorPort
}

export class CategoryRulesDomain {
  private readonly _clock: ClockPort
  private readonly _idGenerator: IdGeneratorPort

  constructor(input: CreateCategoryRulesDomainInput) {
    this._clock = input.clock
    this._idGenerator = input.idGenerator
  }

  createRule = (input: CreateCategoryRuleInput): CategoryRule => {
    const nowIso = this._clock.nowIso()
    const normalizedInput = this._validateRuleInput(input)

    return {
      id: this._idGenerator.createId(),
      ...normalizedInput,
      createdAt: nowIso,
      updatedAt: nowIso
    }
  }

  updateRule = (input: {
    existingRule: CategoryRule
    request: UpdateCategoryRuleInput
  }): CategoryRule => {
    const normalizedInput = this._validateRuleInput(input.request)

    return {
      ...input.existingRule,
      ...normalizedInput,
      updatedAt: this._clock.nowIso()
    }
  }

  private _validateRuleInput = (
    input: CreateCategoryRuleInput | UpdateCategoryRuleInput
  ) => {
    const name = input.name.trim()
    const matchValue = input.matchValue.trim()

    if (!name) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule name is required',
        statusCode: 400
      })
    }

    if (!categoryRuleMatchColumns.includes(input.matchColumn)) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule match column is invalid',
        statusCode: 400
      })
    }

    if (!supportedCategoryRuleMatchTypes.includes(input.matchType)) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule match type is invalid',
        statusCode: 400
      })
    }

    if (!matchValue) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule match value is required',
        statusCode: 400
      })
    }

    if (!input.categoryId.trim()) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule category is required',
        statusCode: 400
      })
    }

    if (
      input.outflowClassification !== null &&
      !outflowClassifications.includes(input.outflowClassification)
    ) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule outflow classification is invalid',
        statusCode: 400
      })
    }

    if (!Number.isInteger(input.priority)) {
      throw new AppError({
        code: 'invalid_category_rule',
        message: 'Rule priority must be an integer',
        statusCode: 400
      })
    }

    return {
      name,
      matchColumn: input.matchColumn,
      matchType: input.matchType,
      matchValue,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      outflowClassification: input.outflowClassification,
      priority: input.priority,
      isEnabled: input.isEnabled
    }
  }
}
