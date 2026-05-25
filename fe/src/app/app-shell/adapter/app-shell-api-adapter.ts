import type { BootstrapStatusPort } from '../domain/domain-ports'
import { packBootstrapStatusRequest } from './packers'
import { unpackBootstrapStatusResponse } from './unpackers'

export type CreateAppShellApiAdapterInput = {
  apiBaseUrl: string
}

export const createAppShellApiAdapter = (
  input: CreateAppShellApiAdapterInput
): BootstrapStatusPort => {
  const loadBootstrapStatus = async () => {
    const payload = packBootstrapStatusRequest({ includeVersion: false })

    const response = await fetch(`${input.apiBaseUrl}/health`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Failed to load bootstrap status')
    }

    const parsed = (await response.json()) as {
      status: string
    }

    return unpackBootstrapStatusResponse(parsed)
  }

  return {
    loadBootstrapStatus
  }
}
