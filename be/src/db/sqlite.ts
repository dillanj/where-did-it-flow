import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export type DatabaseClient = ReturnType<typeof createDatabaseClient>

export const createDatabaseClient = (databaseUrl: string) => {
  const resolvedPath = resolve(process.cwd(), databaseUrl)

  mkdirSync(dirname(resolvedPath), { recursive: true })

  const sqlite = new Database(resolvedPath)
  const db = drizzle(sqlite, { schema })

  return {
    sqlite,
    db
  }
}
