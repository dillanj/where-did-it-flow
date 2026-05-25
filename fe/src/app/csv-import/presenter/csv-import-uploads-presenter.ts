import { derive, type DerivedSignal } from '@tcn/state'
import type { UploadsDomain } from '../domain/uploads-domain'

const isPending = (status: string) => {
  return status === 'PENDING'
}

export class CsvImportUploadsPresenter {
  private readonly _domain: UploadsDomain

  private readonly _isLoadingUploads: DerivedSignal<boolean>
  private readonly _isUploading: DerivedSignal<boolean>
  private readonly _errorMessage: DerivedSignal<string | null>

  constructor(input: { domain: UploadsDomain }) {
    this._domain = input.domain

    this._isLoadingUploads = derive(
      this._domain.loadUploadsRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._isUploading = derive(
      this._domain.uploadRunner.stateBroadcast,
      (runnerState) => {
        return isPending(runnerState.status)
      }
    )

    this._errorMessage = derive(
      this._domain.loadUploadsRunner.stateBroadcast,
      this._domain.uploadRunner.stateBroadcast,
      this._domain.selectUploadRunner.stateBroadcast,
      (loadUploadsRunnerState, uploadRunnerState, selectUploadRunnerState) => {
        return (
          loadUploadsRunnerState.error?.message ??
          uploadRunnerState.error?.message ??
          selectUploadRunnerState.error?.message ??
          null
        )
      }
    )
  }

  get broadcasts() {
    return {
      uploads: this._domain.uploads.broadcast,
      selectedUploadId: this._domain.selectedUploadId.broadcast,
      selectedUploadDetails: this._domain.selectedUploadDetails.broadcast,
      message: this._domain.message.broadcast,
      isLoadingUploads: this._isLoadingUploads.broadcast,
      isUploading: this._isUploading.broadcast,
      errorMessage: this._errorMessage.broadcast,
      loadUploadsRunnerState: this._domain.loadUploadsRunner.stateBroadcast,
      uploadRunnerState: this._domain.uploadRunner.stateBroadcast,
      selectUploadRunnerState: this._domain.selectUploadRunner.stateBroadcast
    }
  }

  loadByAccountId = async (accountId: string | null) => {
    await this._domain.loadByAccountId(accountId)
  }

  selectUpload = async (uploadId: string) => {
    await this._domain.selectUpload(uploadId)
  }

  uploadCsv = async (input: { accountId: string; file: File }) => {
    return this._domain.uploadCsv(input)
  }

  getSelectedUploadId = () => {
    return this._domain.getSelectedUploadId()
  }

  dispose = () => {
    this._isLoadingUploads.dispose()
    this._isUploading.dispose()
    this._errorMessage.dispose()
  }
}
