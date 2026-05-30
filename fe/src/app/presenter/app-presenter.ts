import { derive, type DerivedSignal } from '@tcn/state'
import type { AppDomain } from '../domain/app-domain'
import { CsvImportPresenter } from '../csv-import/presenter/csv-import-presenter'

const isPending = (status: string) => {
  return status === 'PENDING'
}

export class AppPresenter {
  private readonly _domain: AppDomain
  private _initializePromise: Promise<void> | null = null

  readonly csvImportPresenter: CsvImportPresenter

  private readonly _isInitializing: DerivedSignal<boolean>
  private readonly _errorMessage: DerivedSignal<string | null>

  constructor(input: { domain: AppDomain }) {
    this._domain = input.domain
    this.csvImportPresenter = new CsvImportPresenter(this._domain.csvImportDomain)

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

  dispose = () => {
    this._isInitializing.dispose()
    this._errorMessage.dispose()
    this.csvImportPresenter.dispose()
  }
}
