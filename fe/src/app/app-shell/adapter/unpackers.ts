export type BootstrapStatusResponse = {
  status: string
}

export const unpackBootstrapStatusResponse = (response: BootstrapStatusResponse) => {
  return {
    status: response.status
  }
}
