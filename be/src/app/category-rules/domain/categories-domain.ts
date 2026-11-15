import { AppError } from '../../../shared/errors/app-error'
import type { ClockPort, IdGeneratorPort } from './domain-ports'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput
} from './domain-model'

export type CreateCategoriesDomainInput = {
  clock: ClockPort
  idGenerator: IdGeneratorPort
}

export class CategoriesDomain {
  private readonly _clock: ClockPort
  private readonly _idGenerator: IdGeneratorPort

  constructor(input: CreateCategoriesDomainInput) {
    this._clock = input.clock
    this._idGenerator = input.idGenerator
  }

  createCategory = (input: CreateCategoryInput): Category => {
    const nowIso = this._clock.nowIso()

    return {
      id: this._idGenerator.createId(),
      parentCategoryId: input.parentCategoryId,
      name: this._normalizeName(input.name),
      createdAt: nowIso,
      updatedAt: nowIso
    }
  }

  updateCategory = (input: {
    existingCategory: Category
    request: UpdateCategoryInput
  }): Category => {
    return {
      ...input.existingCategory,
      parentCategoryId: input.request.parentCategoryId,
      name: this._normalizeName(input.request.name),
      updatedAt: this._clock.nowIso()
    }
  }

  private _normalizeName = (name: string) => {
    const normalizedName = name.trim()

    if (!normalizedName) {
      throw new AppError({
        code: 'invalid_category',
        message: 'Category name is required',
        statusCode: 400
      })
    }

    return normalizedName
  }
}
