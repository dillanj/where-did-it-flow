import type { BootstrapStatus } from './domain-model'
import type { BootstrapRepositoryPort, ClockPort } from './domain-ports'

export type AppBootstrapDomain = {
  getStatus: () => BootstrapStatus
}

export type CreateAppBootstrapDomainInput = {
  clock: ClockPort
  repository: BootstrapRepositoryPort
}

export const createAppBootstrapDomain = (
  input: CreateAppBootstrapDomainInput
): AppBootstrapDomain => {
  const getStatus = () => {
    const timestamp = input.clock.nowIso()

    input.repository.upsertBootstrapTimestamp(timestamp)

    return {
      status: 'ok' as const,
      timestamp
    }
  }

  return {
    getStatus
  }
}
