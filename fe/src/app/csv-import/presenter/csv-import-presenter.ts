import { derive, type DerivedSignal } from '@tcn/state'
import type { AccountType } from '../../accounts/domain/domain-model'
import type { AccountsPresenter } from '../../accounts/presenter/accounts-presenter'
import type { ColumnMapping } from '../domain/domain-model'
import type { CsvImportDomain } from '../domain/csv-import-domain'
import { CsvImportMappingPreviewPresenter } from './csv-import-mapping-preview-presenter'
import { CsvImportUploadsPresenter } from './csv-import-uploads-presenter'

export type CsvImportPresenterCommands = {
  createAccount: (input: { name: string; type: AccountType }) => Promise<void>
  selectAccount: (accountId: string) => Promise<void>
  uploadCsv: (file: File) => Promise<void>
  updateMapping: (field: keyof ColumnMapping, value: string) => void
  previewSelectedUpload: () => Promise<void>
  importSelectedUpload: () => Promise<void>
}

export class CsvImportPresenter {
  private readonly _domain: CsvImportDomain
  private readonly _commands: CsvImportPresenterCommands

  readonly accountsPresenter: AccountsPresenter
  readonly uploadsPresenter: CsvImportUploadsPresenter
  readonly mappingPreviewPresenter: CsvImportMappingPreviewPresenter

  private readonly _message: DerivedSignal<string | null>
  private readonly _errorMessage: DerivedSignal<string | null>
  private readonly _isInitializing: DerivedSignal<boolean>

  constructor(input: {
    domain: CsvImportDomain
    accountsPresenter: AccountsPresenter
    commands: CsvImportPresenterCommands
  }) {
    this._domain = input.domain
    this._commands = input.commands

    this.accountsPresenter = input.accountsPresenter

    this.uploadsPresenter = new CsvImportUploadsPresenter({
      domain: this._domain.uploadsDomain
    })

    this.mappingPreviewPresenter = new CsvImportMappingPreviewPresenter({
      domain: this._domain.mappingPreviewDomain
    })

    this._message = derive(
      this.accountsPresenter.broadcasts.message,
      this.uploadsPresenter.broadcasts.message,
      this.mappingPreviewPresenter.broadcasts.message,
      (accountsMessage, uploadsMessage, mappingPreviewMessage) => {
        return mappingPreviewMessage ?? uploadsMessage ?? accountsMessage ?? null
      }
    )

    this._errorMessage = derive(
      this.accountsPresenter.broadcasts.errorMessage,
      this.uploadsPresenter.broadcasts.errorMessage,
      this.mappingPreviewPresenter.broadcasts.errorMessage,
      (accountsErrorMessage, uploadsErrorMessage, mappingPreviewErrorMessage) => {
        return mappingPreviewErrorMessage ?? uploadsErrorMessage ?? accountsErrorMessage ?? null
      }
    )

    this._isInitializing = derive(
      this.accountsPresenter.broadcasts.isInitializing,
      this.uploadsPresenter.broadcasts.isLoadingUploads,
      (isAccountsInitializing, isUploadsInitializing) => {
        return isAccountsInitializing || isUploadsInitializing
      }
    )
  }

  get broadcasts() {
    return {
      ...this.accountsPresenter.broadcasts,
      ...this.uploadsPresenter.broadcasts,
      ...this.mappingPreviewPresenter.broadcasts,
      message: this._message.broadcast,
      errorMessage: this._errorMessage.broadcast,
      isInitializing: this._isInitializing.broadcast
    }
  }

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this._commands.createAccount(input)
  }

  selectAccount = async (accountId: string) => {
    await this._commands.selectAccount(accountId)
  }

  selectUpload = async (uploadId: string) => {
    try {
      await this._domain.selectUpload(uploadId)
    } catch {
      return
    }
  }

  uploadCsv = async (file: File) => {
    await this._commands.uploadCsv(file)
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this._commands.updateMapping(field, value)
  }

  previewSelectedUpload = async () => {
    await this._commands.previewSelectedUpload()
  }

  importSelectedUpload = async () => {
    await this._commands.importSelectedUpload()
  }

  dispose = () => {
    this._message.dispose()
    this._errorMessage.dispose()
    this._isInitializing.dispose()
    this.mappingPreviewPresenter.dispose()
    this.uploadsPresenter.dispose()
  }
}
