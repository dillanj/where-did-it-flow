import { AppError } from '../../shared/errors/app-error'
import type { AccountsApiPort } from '../domain/domain-ports'
import type { Account, AccountType } from '../domain/domain-model'

export type CreateAccountsApiAdapterInput = {
  apiBaseUrl: string
}

const parseErrorMessage = async (response: Response) => {
  try {
    const json = (await response.json()) as {
      message?: string
    }

    return json.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

const expectOk = async (response: Response) => {
  if (response.ok) {
    return
  }

  throw new AppError(await parseErrorMessage(response))
}

const unpackAccount = (value: unknown): Account => {
  const payload = value as Account & {
    created_at?: string
    updated_at?: string
  }
  const createdAt = payload.createdAt ?? payload.created_at ?? ''
  const updatedAt = payload.updatedAt ?? payload.updated_at ?? createdAt

  return {
    id: payload.id,
    name: payload.name,
    type: payload.type,
    createdAt,
    updatedAt
  }
}

export const createAccountsApiAdapter = (
  input: CreateAccountsApiAdapterInput
): AccountsApiPort => {
  const listAccounts = async (): Promise<Account[]> => {
    const response = await fetch(`${input.apiBaseUrl}/api/accounts`)

    await expectOk(response)

    const payload = (await response.json()) as unknown[]

    return payload.map(unpackAccount)
  }

  const createAccount = async (payload: {
    name: string
    type: AccountType
  }): Promise<Account> => {
    const response = await fetch(`${input.apiBaseUrl}/api/accounts`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    await expectOk(response)

    return unpackAccount(await response.json())
  }

  return {
    listAccounts,
    createAccount
  }
}
