import { AppError } from '../../../../shared/errors/app-error'
import {
  outflowClassifications,
  supportedCategoryRuleMatchTypes,
  type CategoryRuleMatchColumn,
  type OutflowClassification,
  type SupportedCategoryRuleMatchType
} from '../../domain/domain-model'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object'
}

const requireString = (payload: Record<string, unknown>, field: string) => {
  const value = payload[field]

  if (typeof value !== 'string') {
    throw new AppError({
      code: 'invalid_request',
      message: `${field} is required`,
      statusCode: 400
    })
  }

  return value
}

const nullableString = (value: unknown) => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== 'string') {
    throw new AppError({
      code: 'invalid_request',
      message: 'Nullable field must be a string or null',
      statusCode: 400
    })
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

const requireBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError({
      code: 'invalid_request',
      message: 'request body is required',
      statusCode: 400
    })
  }

  return body
}

const packPriority = (value: unknown) => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new AppError({
      code: 'invalid_request',
      message: 'priority must be an integer',
      statusCode: 400
    })
  }

  return value
}

const packIsEnabled = (value: unknown) => {
  if (typeof value !== 'boolean') {
    throw new AppError({
      code: 'invalid_request',
      message: 'isEnabled must be a boolean',
      statusCode: 400
    })
  }

  return value
}

const packMatchType = (value: unknown): SupportedCategoryRuleMatchType => {
  if (
    typeof value !== 'string' ||
    !supportedCategoryRuleMatchTypes.includes(
      value as SupportedCategoryRuleMatchType
    )
  ) {
    throw new AppError({
      code: 'invalid_request',
      message: 'matchType is invalid',
      statusCode: 400
    })
  }

  return value as SupportedCategoryRuleMatchType
}

const packOutflowClassification = (
  value: unknown
): OutflowClassification | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (
    typeof value !== 'string' ||
    !outflowClassifications.includes(value as OutflowClassification)
  ) {
    throw new AppError({
      code: 'invalid_request',
      message: 'outflowClassification is invalid',
      statusCode: 400
    })
  }

  return value as OutflowClassification
}

export const packCreateCategoryBody = (body: unknown) => {
  const payload = requireBody(body)

  return {
    name: requireString(payload, 'name'),
    parentCategoryId: nullableString(payload.parentCategoryId)
  }
}

export const packUpdateCategoryBody = (input: {
  categoryId: string
  body: unknown
}) => {
  const payload = requireBody(input.body)

  return {
    categoryId: input.categoryId,
    name: requireString(payload, 'name'),
    parentCategoryId: nullableString(payload.parentCategoryId)
  }
}

export const packCreateRuleBody = (body: unknown) => {
  const payload = requireBody(body)

  return {
    name: requireString(payload, 'name'),
    matchColumn: 'description' as CategoryRuleMatchColumn,
    matchType: packMatchType(payload.matchType),
    matchValue: requireString(payload, 'matchValue'),
    categoryId: requireString(payload, 'categoryId'),
    subcategoryId: nullableString(payload.subcategoryId),
    outflowClassification: packOutflowClassification(payload.outflowClassification),
    priority: packPriority(payload.priority),
    isEnabled: packIsEnabled(payload.isEnabled)
  }
}

export const packUpdateRuleBody = (input: {
  ruleId: string
  body: unknown
}) => {
  const body = packCreateRuleBody(input.body)

  return {
    ruleId: input.ruleId,
    ...body
  }
}
