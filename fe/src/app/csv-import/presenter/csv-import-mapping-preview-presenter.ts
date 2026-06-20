import { derive, type DerivedSignal } from '@tcn/state'
import type { MappingPreviewDomain } from '../domain/mapping-preview-domain'

const isPending = (status: string) => {
  return status === 'PENDING'
}

export class CsvImportMappingPreviewPresenter {
  private readonly _domain: MappingPreviewDomain

  private readonly _isPreviewing: DerivedSignal<boolean>
  private readonly _isImporting: DerivedSignal<boolean>
  private readonly _errorMessage: DerivedSignal<string | null>

  constructor(input: { domain: MappingPreviewDomain }) {
    this._domain = input.domain

    this._isPreviewing = derive(
      this._domain.previewRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._isImporting = derive(
      this._domain.importRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._errorMessage = derive(
      this._domain.previewRunner.stateBroadcast,
      this._domain.importRunner.stateBroadcast,
      (previewRunnerState, importRunnerState) => {
        return previewRunnerState.error?.message ?? importRunnerState.error?.message ?? null
      }
    )
  }

  get broadcasts() {
    return {
      contextUploadId: this._domain.contextUploadId.broadcast,
      headers: this._domain.headers.broadcast,
      sampleRows: this._domain.sampleRows.broadcast,
      mapping: this._domain.mapping.broadcast,
      preview: this._domain.preview.broadcast,
      importResult: this._domain.importResult.broadcast,
      message: this._domain.message.broadcast,
      isPreviewing: this._isPreviewing.broadcast,
      isImporting: this._isImporting.broadcast,
      errorMessage: this._errorMessage.broadcast,
      previewRunnerState: this._domain.previewRunner.stateBroadcast,
      importRunnerState: this._domain.importRunner.stateBroadcast
    }
  }

  dispose = () => {
    this._isPreviewing.dispose()
    this._isImporting.dispose()
    this._errorMessage.dispose()
  }
}
