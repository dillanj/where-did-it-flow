import type { AccountsApiPort } from '../accounts/domain/domain-ports'
import type { CategoryRulesApiPort } from '../category-rules/domain/domain-ports'
import type { CsvImportApiPort } from '../csv-import/domain/domain-ports'

export type AppApiPort = {
  accountsApi: AccountsApiPort
  categoryRulesApi: CategoryRulesApiPort
  csvImportApi: CsvImportApiPort
}
