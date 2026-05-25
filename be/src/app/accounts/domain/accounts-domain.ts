import { AppError } from '../../../shared/errors/app-error'
import { accountTypes, type Account, type AccountType } from './domain-model'
import type { ClockPort, IdGeneratorPort } from './domain-ports'

export type CreateAccountsDomainInput = {
  clock: ClockPort
  idGenerator: IdGeneratorPort
}

export class AccountsDomain {
  private readonly _clock: ClockPort
  private readonly _idGenerator: IdGeneratorPort

  constructor(input: CreateAccountsDomainInput) {
    this._clock = input.clock
    this._idGenerator = input.idGenerator
  }

  createAccount = (input: {
    name: string
    type: string
  }): Account => {
    const name = input.name.trim()

    if (!name) {
      throw new AppError({
        code: 'invalid_account_name',
        message: 'Account name is required',
        statusCode: 400
      })
    }

    if (!accountTypes.includes(input.type as AccountType)) {
      throw new AppError({
        code: 'invalid_account_type',
        message: 'Account type is invalid',
        statusCode: 400
      })
    }

    const nowIso = this._clock.nowIso()

    return {
      id: this._idGenerator.createId(),
      name,
      type: input.type as AccountType,
      createdAt: nowIso,
      updatedAt: nowIso
    }
  }
}
