import { getEnvironment } from '../config/env'
import { createDatabaseClient } from '../db/connection'
import { runDatabaseMigrations } from '../db/migrate'
import { createServer } from './create-server'

const startServer = async () => {
  const environment = getEnvironment()
  const databaseClient = createDatabaseClient(environment.databaseUrl)

  runDatabaseMigrations(databaseClient)

  const app = await createServer({
    databaseClient
  })

  try {
    await app.listen({
      port: environment.port,
      host: '0.0.0.0'
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void startServer()
