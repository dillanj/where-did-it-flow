import { Signal } from '@tcn/state'
import type { CsvImportDomain } from '../domain/csv-import-domain'
import type {
  Account,
  AccountType,
  ColumnMapping,
  CsvUpload,
  CsvUploadDetails,
  UploadImportResult,
  UploadPreview
} from '../domain/domain-model'

export type CsvImportViewModel = {
  accounts: Account[]
  selectedAccountId: string | null
  uploads: CsvUpload[]
  selectedUploadId: string | null
  selectedUploadDetails: CsvUploadDetails | null
  headers: string[]
  sampleRows: Record<string, string>[]
  mapping: ColumnMapping
  preview: UploadPreview | null
  importResult: UploadImportResult | null
  message: string | null
  errorMessage: string | null
  isInitializing: boolean
  isManagingAccount: boolean
  isUploading: boolean
  isPreviewing: boolean
  isImporting: boolean
}

const isPending = (status: string) => {
  return status === 'PENDING'
}

export class CsvImportPresenter {
  private readonly _domain: CsvImportDomain

  readonly viewModel = new Signal<CsvImportViewModel>({
    accounts: [],
    selectedAccountId: null,
    uploads: [],
    selectedUploadId: null,
    selectedUploadDetails: null,
    headers: [],
    sampleRows: [],
    mapping: {
      dateColumn: '',
      descriptionColumn: '',
      amountColumn: '',
      debitColumn: '',
      creditColumn: '',
      categoryColumn: '',
      notesColumn: '',
      dateFormat: ''
    },
    preview: null,
    importResult: null,
    message: null,
    errorMessage: null,
    isInitializing: false,
    isManagingAccount: false,
    isUploading: false,
    isPreviewing: false,
    isImporting: false
  })

  private readonly _subscriptions: Array<{ unsubscribe: () => void }> = []

  constructor(input: { domain: CsvImportDomain }) {
    this._domain = input.domain

    this._subscriptions.push(
      this._domain.state.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._subscriptions.push(
      this._domain.initializeRunner.stateBroadcast.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._subscriptions.push(
      this._domain.accountRunner.stateBroadcast.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._subscriptions.push(
      this._domain.uploadRunner.stateBroadcast.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._subscriptions.push(
      this._domain.previewRunner.stateBroadcast.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._subscriptions.push(
      this._domain.importRunner.stateBroadcast.subscribe(() => {
        this._syncViewModel()
      })
    )

    this._syncViewModel()
  }

  initialize = async () => {
    try {
      await this._domain.initialize()
    } catch {
      return
    }
  }

  createAccount = async (input: {
    name: string
    type: AccountType
  }) => {
    try {
      await this._domain.createAccount(input)
    } catch {
      return
    }
  }

  selectAccount = async (accountId: string) => {
    try {
      await this._domain.selectAccount(accountId)
    } catch {
      return
    }
  }

  selectUpload = async (uploadId: string) => {
    try {
      await this._domain.selectUpload(uploadId)
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

  private _syncViewModel = () => {
    const state = this._domain.state.get()
    const errorMessage =
      this._domain.initializeRunner.error?.message ??
      this._domain.accountRunner.error?.message ??
      this._domain.uploadRunner.error?.message ??
      this._domain.previewRunner.error?.message ??
      this._domain.importRunner.error?.message ??
      null

    this.viewModel.set({
      ...state,
      errorMessage,
      isInitializing: isPending(this._domain.initializeRunner.status),
      isManagingAccount: isPending(this._domain.accountRunner.status),
      isUploading: isPending(this._domain.uploadRunner.status),
      isPreviewing: isPending(this._domain.previewRunner.status),
      isImporting: isPending(this._domain.importRunner.status)
    })
  }

  dispose = () => {
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })

    this.viewModel.dispose()
  }
}
