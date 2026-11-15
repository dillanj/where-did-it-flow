import { AppError } from '../../shared/errors/app-error'
import type { CategoryRulesApiPort } from '../domain/domain-ports'
import type {
  Category,
  CategoryDraft,
  CategoryRule,
  CategoryRuleDraft
} from '../domain/domain-model'
import { packCategoryDraft, packRuleDraft } from './packers'
import { unpackCategory, unpackRule } from './unpackers'

export type CreateCategoryRulesApiAdapterInput = {
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

export const createCategoryRulesApiAdapter = (
  input: CreateCategoryRulesApiAdapterInput
): CategoryRulesApiPort => {
  const listCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${input.apiBaseUrl}/api/categories`)

    await expectOk(response)

    const payload = (await response.json()) as unknown[]

    return payload.map(unpackCategory)
  }

  const createCategory = async (draft: CategoryDraft): Promise<Category> => {
    const response = await fetch(`${input.apiBaseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(packCategoryDraft(draft))
    })

    await expectOk(response)

    return unpackCategory(await response.json())
  }

  const updateCategory = async (
    inputDraft: CategoryDraft & { categoryId: string }
  ): Promise<Category> => {
    const response = await fetch(
      `${input.apiBaseUrl}/api/categories/${inputDraft.categoryId}`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(packCategoryDraft(inputDraft))
      }
    )

    await expectOk(response)

    return unpackCategory(await response.json())
  }

  const deleteCategory = async (categoryId: string) => {
    const response = await fetch(`${input.apiBaseUrl}/api/categories/${categoryId}`, {
      method: 'DELETE'
    })

    await expectOk(response)
  }

  const listRules = async (): Promise<CategoryRule[]> => {
    const response = await fetch(`${input.apiBaseUrl}/api/category-rules`)

    await expectOk(response)

    const payload = (await response.json()) as unknown[]

    return payload.map(unpackRule)
  }

  const createRule = async (draft: CategoryRuleDraft): Promise<CategoryRule> => {
    const response = await fetch(`${input.apiBaseUrl}/api/category-rules`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(packRuleDraft(draft))
    })

    await expectOk(response)

    return unpackRule(await response.json())
  }

  const updateRule = async (
    inputDraft: CategoryRuleDraft & { ruleId: string }
  ): Promise<CategoryRule> => {
    const response = await fetch(
      `${input.apiBaseUrl}/api/category-rules/${inputDraft.ruleId}`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(packRuleDraft(inputDraft))
      }
    )

    await expectOk(response)

    return unpackRule(await response.json())
  }

  const deleteRule = async (ruleId: string) => {
    const response = await fetch(`${input.apiBaseUrl}/api/category-rules/${ruleId}`, {
      method: 'DELETE'
    })

    await expectOk(response)
  }

  return {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    listRules,
    createRule,
    updateRule,
    deleteRule
  }
}
