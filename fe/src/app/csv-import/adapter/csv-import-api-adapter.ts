import { AppError } from '../../shared/errors/app-error'
import { packColumnMapping } from './packers'
import {
  unpackUpload,
  unpackUploadDetails,
  unpackUploadImportResult,
  unpackUploadPreview,
  unpackUploadResult
} from './unpackers'
import type {
  ColumnMapping,
  CsvUpload,
  CsvUploadDetails,
  CsvUploadResult,
  UploadImportResult,
  UploadPreview
} from '../domain/domain-model'
import type { CsvImportApiPort } from '../domain/domain-ports'

export type CreateCsvImportApiAdapterInput = {
  apiBaseUrl: string
}

const parseErrorMessage = async (response: Response) => {
  try {
    const json = (await response.json()) as {
      message?: string
    }

    return json.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

const expectOk = async (response: Response) => {
  if (response.ok) {
    return
  }

  throw new AppError(await parseErrorMessage(response))
}

export const createCsvImportApiAdapter = (
  input: CreateCsvImportApiAdapterInput
): CsvImportApiPort => {
  const uploadCsv = async (payload: {
    accountId: string
    file: File
  }): Promise<CsvUploadResult> => {
    const formData = new FormData()

    formData.set('file', payload.file)

    const response = await fetch(
      `${input.apiBaseUrl}/api/accounts/${payload.accountId}/uploads`,
      {
        method: 'POST',
        body: formData
      }
    )

    await expectOk(response)

    return unpackUploadResult(await response.json())
  }

  const listUploadsByAccountId = async (accountId: string): Promise<CsvUpload[]> => {
    const response = await fetch(`${input.apiBaseUrl}/api/accounts/${accountId}/uploads`)

    await expectOk(response)

    const payload = (await response.json()) as unknown[]

    return payload.map(unpackUpload)
  }

  const getUploadById = async (uploadId: string): Promise<CsvUploadDetails> => {
    const response = await fetch(`${input.apiBaseUrl}/api/uploads/${uploadId}`)

    await expectOk(response)

    return unpackUploadDetails(await response.json())
  }

  const previewUpload = async (payload: {
    uploadId: string
    mapping: ColumnMapping
  }): Promise<UploadPreview> => {
    const response = await fetch(
      `${input.apiBaseUrl}/api/uploads/${payload.uploadId}/preview`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          columnMapping: packColumnMapping(payload.mapping)
        })
      }
    )

    await expectOk(response)

    return unpackUploadPreview(await response.json())
  }

  const importUpload = async (payload: {
    uploadId: string
    mapping: ColumnMapping
    skipDuplicates: boolean
  }): Promise<UploadImportResult> => {
    const response = await fetch(
      `${input.apiBaseUrl}/api/uploads/${payload.uploadId}/import`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          skipDuplicates: payload.skipDuplicates,
          columnMapping: packColumnMapping(payload.mapping)
        })
      }
    )

    await expectOk(response)

    return unpackUploadImportResult(await response.json())
  }

  return {
    uploadCsv,
    listUploadsByAccountId,
    getUploadById,
    previewUpload,
    importUpload
  }
}
