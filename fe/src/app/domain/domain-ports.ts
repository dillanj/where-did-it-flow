import type { AccountsApiPort } from '../accounts/domain/domain-ports'
import type { CsvImportApiPort } from '../csv-import/domain/domain-ports'

export type AppApiPort = {
  accountsApi: AccountsApiPort
  csvImportApi: CsvImportApiPort
}
