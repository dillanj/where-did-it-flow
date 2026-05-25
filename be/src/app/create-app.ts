import type { DatabaseClient } from '../db/connection'
import { createServer } from '../server/create-server'

export const createApp = (databaseClient: DatabaseClient) => {
  return createServer({ databaseClient })
}
