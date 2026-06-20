import { Runner, Signal } from '@tcn/state'
import { AccountsDomain } from '../accounts/domain/accounts-domain'
import type { AccountType } from '../accounts/domain/domain-model'
import { CsvImportDomain } from '../csv-import/domain/csv-import-domain'
import type { ColumnMapping } from '../csv-import/domain/domain-model'
import { AppError } from '../shared/errors/app-error'
import type { AppApiPort } from './domain-ports'

export class AppDomain {
  readonly accountsDomain: AccountsDomain
  readonly csvImportDomain: CsvImportDomain

  readonly hasInitialized = new Signal(false)
  readonly initializeRunner = new Runner<void>(undefined)

  constructor(input: { api: AppApiPort }) {
    this.accountsDomain = new AccountsDomain({
      api: input.api.accountsApi
    })

    this.csvImportDomain = new CsvImportDomain({
      api: input.api.csvImportApi
    })
  }

  initialize = async () => {
    if (this.hasInitialized.get()) {
      return
    }

    await this.initializeRunner.execute(async () => {
      this.hasInitialized.set(false)
      await this.accountsDomain.initialize()
      await this.csvImportDomain.loadByAccountId(this.accountsDomain.getSelectedAccountId())
      this.hasInitialized.set(true)
    })
  }

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this.accountsDomain.createAccount(input)
    await this.csvImportDomain.loadByAccountId(this.accountsDomain.getSelectedAccountId())
    this.csvImportDomain.clearForSelectedAccountChange()
  }

  selectAccount = async (accountId: string) => {
    this.accountsDomain.selectAccount(accountId)
    await this.csvImportDomain.loadByAccountId(accountId)
    this.csvImportDomain.clearForSelectedAccountChange()
  }

  uploadCsv = async (file: File) => {
    const selectedAccountId = this.accountsDomain.getSelectedAccountId()

    if (!selectedAccountId) {
      throw new AppError('Select an account before uploading a CSV file.')
    }

    await this.csvImportDomain.uploadCsv({
      accountId: selectedAccountId,
      file
    })
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this.csvImportDomain.updateMapping(field, value)
  }

  previewSelectedUpload = async () => {
    await this.csvImportDomain.previewSelectedUpload()
  }

  importSelectedUpload = async () => {
    await this.csvImportDomain.importSelectedUpload({
      accountId: this.accountsDomain.getSelectedAccountId()
    })
  }

  dispose = () => {
    this.csvImportDomain.dispose()
    this.accountsDomain.dispose()
    this.hasInitialized.dispose()
    this.initializeRunner.dispose()
  }
}
