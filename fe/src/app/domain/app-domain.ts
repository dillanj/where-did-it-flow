import { Runner, Signal } from '@tcn/state'
import { AccountsDomain } from '../accounts/domain/accounts-domain'
import { CsvImportDomain } from '../csv-import/domain/csv-import-domain'
import { MappingPreviewDomain } from '../csv-import/domain/mapping-preview-domain'
import { UploadsDomain } from '../csv-import/domain/uploads-domain'
import type { AppApiPort } from './domain-ports'

export class AppDomain {
  readonly accountsDomain: AccountsDomain
  readonly uploadsDomain: UploadsDomain
  readonly mappingPreviewDomain: MappingPreviewDomain
  readonly csvImportDomain: CsvImportDomain

  readonly hasInitialized = new Signal(false)
  readonly initializeRunner = new Runner<void>(undefined)

  constructor(input: { api: AppApiPort }) {
    this.accountsDomain = new AccountsDomain({
      api: input.api.accountsApi
    })

    this.uploadsDomain = new UploadsDomain({
      api: input.api.csvImportApi
    })

    this.mappingPreviewDomain = new MappingPreviewDomain({
      api: input.api.csvImportApi
    })

    this.csvImportDomain = new CsvImportDomain({
      accountsDomain: this.accountsDomain,
      uploadsDomain: this.uploadsDomain,
      mappingPreviewDomain: this.mappingPreviewDomain
    })
  }

  initialize = async () => {
    if (this.hasInitialized.get()) {
      return
    }

    await this.initializeRunner.execute(async () => {
      this.hasInitialized.set(false)
      await this.csvImportDomain.initialize()
      this.hasInitialized.set(true)
    })
  }

  dispose = () => {
    this.csvImportDomain.dispose()
    this.hasInitialized.dispose()
    this.initializeRunner.dispose()
  }
}
