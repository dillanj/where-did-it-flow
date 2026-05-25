import { derive, type DerivedSignal } from '@tcn/state'
import type { ColumnMapping, CsvUploadResult } from '../domain/domain-model'
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

  setUploadContext = (upload: CsvUploadResult) => {
    this._domain.setUploadContext(upload)
  }

  clearForSelectedUploadChange = () => {
    this._domain.clearForSelectedUploadChange()
  }

  clearForSelectedAccountChange = () => {
    this._domain.clearForSelectedAccountChange()
  }

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this._domain.updateMapping(field, value)
  }

  previewUpload = async (uploadId: string) => {
    await this._domain.previewUpload(uploadId)
  }

  importUpload = async (input: { uploadId: string; skipDuplicates: boolean }) => {
    await this._domain.importUpload(input)
  }

  dispose = () => {
    this._isPreviewing.dispose()
    this._isImporting.dispose()
    this._errorMessage.dispose()
  }
}
