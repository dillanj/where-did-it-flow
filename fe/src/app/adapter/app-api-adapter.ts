import { createAccountsApiAdapter } from '../accounts/adapter/accounts-api-adapter'
import { createCategoryRulesApiAdapter } from '../category-rules/adapter/category-rules-api-adapter'
import { createCsvImportApiAdapter } from '../csv-import/adapter/csv-import-api-adapter'
import type { AppApiPort } from '../domain/domain-ports'

export type CreateAppApiAdapterInput = {
  apiBaseUrl: string
}

export const createAppApiAdapter = (input: CreateAppApiAdapterInput): AppApiPort => {
  return {
    accountsApi: createAccountsApiAdapter({
      apiBaseUrl: input.apiBaseUrl
    }),
    categoryRulesApi: createCategoryRulesApiAdapter({
      apiBaseUrl: input.apiBaseUrl
    }),
    csvImportApi: createCsvImportApiAdapter({
      apiBaseUrl: input.apiBaseUrl
    })
  }
}
