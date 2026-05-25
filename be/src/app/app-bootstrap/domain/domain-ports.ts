export type ClockPort = {
  nowIso: () => string
}

export type BootstrapRepositoryPort = {
  upsertBootstrapTimestamp: (timestampIso: string) => void
}
