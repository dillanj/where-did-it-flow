export type Environment = {
  port: number
  databaseUrl: string
}

const parsePort = (value: string | undefined) => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 4000
  }

  return parsed
}

export const getEnvironment = (): Environment => {
  return {
    port: parsePort(process.env.PORT),
    databaseUrl: process.env.DATABASE_URL ?? './data/money-flow.sqlite'
  }
}
