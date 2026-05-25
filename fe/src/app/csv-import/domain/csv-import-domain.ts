import { Runner, Signal } from '@tcn/state'
import { AppError } from '../../shared/errors/app-error'
import {
  createEmptyColumnMapping,
  createInitialCsvImportState,
  type Account,
  type AccountType,
  type ColumnMapping,
  type CsvImportDomainState
} from './domain-model'
import type { CsvImportApiPort } from './domain-ports'

export class CsvImportDomain {
  private readonly _api: CsvImportApiPort

  readonly state = new Signal<CsvImportDomainState>(createInitialCsvImportState())

  readonly initializeRunner = new Runner<void>(undefined)
  readonly accountRunner = new Runner<void>(undefined)
  readonly uploadRunner = new Runner<void>(undefined)
  readonly previewRunner = new Runner<void>(undefined)
  readonly importRunner = new Runner<void>(undefined)

  constructor(input: { api: CsvImportApiPort }) {
    this._api = input.api
  }

  initialize = async () => {
    await this.initializeRunner.execute(async () => {
      const accounts = await this._api.listAccounts()

      this.state.transform((current) => {
        const selectedAccountId =
          current.selectedAccountId ?? (accounts[0] ? accounts[0].id : null)

        return {
          ...current,
          accounts,
          selectedAccountId,
          message: accounts.length > 0 ? null : 'Create your first account to start importing CSV files.'
        }
      })

      await this._loadUploadsForSelectedAccount()
    })
  }

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this.accountRunner.execute(async () => {
      const account = await this._api.createAccount(input)

      this.state.transform((current) => {
        const nextAccounts = [...current.accounts, account]

        return {
          ...current,
          accounts: nextAccounts,
          selectedAccountId: account.id,
          message: `Created account: ${account.name}`
        }
      })

      await this._loadUploadsForSelectedAccount()
    })
  }

  selectAccount = async (accountId: string) => {
    this.state.transform((current) => {
      return {
        ...current,
        selectedAccountId: accountId,
        selectedUploadId: null,
        selectedUploadDetails: null,
        headers: [],
        sampleRows: [],
        mapping: createEmptyColumnMapping(),
        preview: null,
        importResult: null,
        message: null
      }
    })

    await this._loadUploadsForSelectedAccount()
  }

  selectUpload = async (uploadId: string) => {
    const uploadDetails = await this._api.getUploadById(uploadId)

    this.state.transform((current) => {
      return {
        ...current,
        selectedUploadId: uploadId,
        selectedUploadDetails: uploadDetails,
        preview: null,
        importResult: null,
        message: null
      }
    })
  }

  uploadCsv = async (file: File) => {
    const accountId = this.state.get().selectedAccountId

    if (!accountId) {
      throw new AppError('Select an account before uploading a CSV file.')
    }

    await this.uploadRunner.execute(async () => {
      const result = await this._api.uploadCsv({
        accountId,
        file
      })

      const defaultMapping = this._guessMappingFromHeaders(result.headers)

      this.state.transform((current) => {
        const uploads = [
          {
            id: result.id,
            accountId: result.accountId,
            fileName: result.fileName,
            status: result.status,
            createdAt: result.createdAt
          },
          ...current.uploads
        ]

        return {
          ...current,
          uploads,
          selectedUploadId: result.id,
          selectedUploadDetails: {
            id: result.id,
            accountId: result.accountId,
            fileName: result.fileName,
            status: result.status,
            createdAt: result.createdAt,
            statementYear: null,
            statementMonth: null
          },
          headers: result.headers,
          sampleRows: result.sampleRows,
          mapping: {
            ...current.mapping,
            ...defaultMapping
          },
          preview: null,
          importResult: null,
          message: 'CSV uploaded. Review mapping and run preview.'
        }
      })
    })
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this.state.transform((current) => {
      return {
        ...current,
        mapping: {
          ...current.mapping,
          [field]: value
        }
      }
    })
  }

  previewSelectedUpload = async () => {
    const current = this.state.get()

    if (!current.selectedUploadId) {
      throw new AppError('Select an upload before running preview.')
    }

    if (!this._isMappingReady(current.mapping)) {
      throw new AppError('Mapping requires date, description, and amount or debit/credit columns.')
    }

    await this.previewRunner.execute(async () => {
      const preview = await this._api.previewUpload({
        uploadId: current.selectedUploadId as string,
        mapping: current.mapping
      })

      this.state.transform((state) => {
        return {
          ...state,
          preview,
          importResult: null,
          message: 'Preview ready. Verify rows and totals before import.'
        }
      })
    })
  }

  importSelectedUpload = async () => {
    const current = this.state.get()

    if (!current.selectedUploadId) {
      throw new AppError('Select an upload before importing.')
    }

    if (!this._isMappingReady(current.mapping)) {
      throw new AppError('Mapping requires date, description, and amount or debit/credit columns.')
    }

    await this.importRunner.execute(async () => {
      const result = await this._api.importUpload({
        uploadId: current.selectedUploadId as string,
        mapping: current.mapping,
        skipDuplicates: true
      })

      const uploads = await this._api.listUploadsByAccountId(current.selectedAccountId as string)

      this.state.transform((state) => {
        return {
          ...state,
          uploads,
          importResult: result,
          message: 'Import complete.'
        }
      })
    })
  }

  private _loadUploadsForSelectedAccount = async () => {
    const accountId = this.state.get().selectedAccountId

    if (!accountId) {
      this.state.transform((current) => {
        return {
          ...current,
          uploads: []
        }
      })
      return
    }

    const uploads = await this._api.listUploadsByAccountId(accountId)

    this.state.transform((current) => {
      const selectedUploadId =
        current.selectedUploadId && uploads.some((upload) => upload.id === current.selectedUploadId)
          ? current.selectedUploadId
          : uploads[0]?.id ?? null

      return {
        ...current,
        uploads,
        selectedUploadId,
        selectedUploadDetails: null,
        headers: selectedUploadId ? current.headers : [],
        sampleRows: selectedUploadId ? current.sampleRows : []
      }
    })
  }

  private _isMappingReady = (mapping: ColumnMapping) => {
    if (!mapping.dateColumn || !mapping.descriptionColumn) {
      return false
    }

    if (mapping.amountColumn) {
      return true
    }

    return Boolean(mapping.debitColumn && mapping.creditColumn)
  }

  private _guessMappingFromHeaders = (headers: string[]): Partial<ColumnMapping> => {
    const findHeader = (patterns: string[]) => {
      return (
        headers.find((header) => {
          const normalized = header.toLowerCase()

          return patterns.some((pattern) => normalized.includes(pattern))
        }) ?? ''
      )
    }

    return {
      dateColumn: findHeader(['date']),
      descriptionColumn: findHeader(['description', 'memo', 'merchant']),
      amountColumn: findHeader(['amount']),
      debitColumn: findHeader(['debit', 'withdrawal']),
      creditColumn: findHeader(['credit', 'deposit'])
    }
  }

  dispose = () => {
    this.state.dispose()
    this.initializeRunner.dispose()
    this.accountRunner.dispose()
    this.uploadRunner.dispose()
    this.previewRunner.dispose()
    this.importRunner.dispose()
  }
}
