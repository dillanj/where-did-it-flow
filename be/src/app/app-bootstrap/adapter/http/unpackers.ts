import type { BootstrapStatus } from '../../domain/domain-model'

export type HealthResponseBody = {
  status: 'ok'
  timestamp: string
}

export const unpackHealthResponseBody = (
  status: BootstrapStatus
): HealthResponseBody => {
  return {
    status: status.status,
    timestamp: status.timestamp
  }
}
