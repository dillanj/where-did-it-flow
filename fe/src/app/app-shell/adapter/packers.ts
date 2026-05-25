export type BootstrapStatusRequest = {
  includeVersion: boolean
}

export const packBootstrapStatusRequest = (request: BootstrapStatusRequest) => {
  return {
    includeVersion: request.includeVersion
  }
}
