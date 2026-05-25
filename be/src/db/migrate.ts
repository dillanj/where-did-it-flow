import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getEnvironment } from '../config/env'
import {
  createDatabaseClient,
  type DatabaseClient
} from './connection'

export const runDatabaseMigrations = (databaseClient: DatabaseClient) => {
  const migrationsFolder = resolve(process.cwd(), 'drizzle')

  migrate(databaseClient.db, {
    migrationsFolder
  })
}

const runMigrationsFromEnvironment = () => {
  const environment = getEnvironment()
  const databaseClient = createDatabaseClient(environment.databaseUrl)

  try {
    runDatabaseMigrations(databaseClient)
  } finally {
    databaseClient.sqlite.close()
  }
}

const currentFilePath = fileURLToPath(import.meta.url)
const isRunDirectly = process.argv[1] === currentFilePath

if (isRunDirectly) {
  runMigrationsFromEnvironment()
}
