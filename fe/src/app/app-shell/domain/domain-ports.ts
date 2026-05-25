export type BootstrapStatusPort = {
  loadBootstrapStatus: () => Promise<{
    status: string
  }>
}
