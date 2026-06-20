import { derive, type DerivedSignal } from '@tcn/state'
import type { AppDomain } from '../domain/app-domain'
import { AccountsPresenter } from '../accounts/presenter/accounts-presenter'
import { CsvImportPresenter } from '../csv-import/presenter/csv-import-presenter'
import type { AccountType } from '../accounts/domain/domain-model'
import type { ColumnMapping } from '../csv-import/domain/domain-model'

const isPending = (status: string) => {
  return status === 'PENDING'
}

export class AppPresenter {
  private readonly _domain: AppDomain
  private _initializePromise: Promise<void> | null = null

  readonly accountsPresenter: AccountsPresenter
  readonly csvImportPresenter: CsvImportPresenter

  private readonly _isInitializing: DerivedSignal<boolean>
  private readonly _errorMessage: DerivedSignal<string | null>

  constructor(input: { domain: AppDomain }) {
    this._domain = input.domain
    this.accountsPresenter = new AccountsPresenter({
      domain: this._domain.accountsDomain
    })
    this.csvImportPresenter = new CsvImportPresenter({
      domain: this._domain.csvImportDomain,
      accountsPresenter: this.accountsPresenter,
      commands: {
        createAccount: this.createAccount,
        selectAccount: this.selectAccount,
        uploadCsv: this.uploadCsv,
        updateMapping: this.updateMapping,
        previewSelectedUpload: this.previewSelectedUpload,
        importSelectedUpload: this.importSelectedUpload
      }
    })

    this._isInitializing = derive(this._domain.initializeRunner.stateBroadcast, (runnerState) => {
      return isPending(runnerState.status)
    })

    this._errorMessage = derive(this._domain.initializeRunner.stateBroadcast, (runnerState) => {
      return runnerState.error?.message ?? null
    })
  }

  get broadcasts() {
    return {
      hasInitialized: this._domain.hasInitialized.broadcast,
      isInitializing: this._isInitializing.broadcast,
      errorMessage: this._errorMessage.broadcast,
      initializeRunnerState: this._domain.initializeRunner.stateBroadcast
    }
  }

  initialize = async () => {
    if (!this._initializePromise) {
      this._initializePromise = this._domain.initialize().catch((error: unknown) => {
        this._initializePromise = null
        throw error
      })
    }

    try {
      await this._initializePromise
    } catch {
      return
    }
  }

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this._domain.createAccount(input)
  }

  selectAccount = async (accountId: string) => {
    try {
      await this._domain.selectAccount(accountId)
    } catch {
      return
    }
  }

  uploadCsv = async (file: File) => {
    try {
      await this._domain.uploadCsv(file)
    } catch {
      return
    }
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this._domain.updateMapping(field, value)
  }

  previewSelectedUpload = async () => {
    try {
      await this._domain.previewSelectedUpload()
    } catch {
      return
    }
  }

  importSelectedUpload = async () => {
    try {
      await this._domain.importSelectedUpload()
    } catch {
      return
    }
  }

  dispose = () => {
    this._isInitializing.dispose()
    this._errorMessage.dispose()
    this.csvImportPresenter.dispose()
    this.accountsPresenter.dispose()
  }
}
