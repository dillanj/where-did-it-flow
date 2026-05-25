import { createAppBootstrapDomain } from '../domain/app-bootstrap-domain'
import type { BootstrapStatus } from '../domain/domain-model'
import type { BootstrapRepositoryPort, ClockPort } from '../domain/domain-ports'

export type AppBootstrapService = {
  getStatus: () => BootstrapStatus
}

export type CreateAppBootstrapServiceInput = {
  clock: ClockPort
  repository: BootstrapRepositoryPort
}

export const createAppBootstrapService = (
  input: CreateAppBootstrapServiceInput
): AppBootstrapService => {
  const domain = createAppBootstrapDomain(input)

  return {
    getStatus: domain.getStatus
  }
}
