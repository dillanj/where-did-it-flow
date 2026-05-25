import { createApp } from './app/create-app'
import { getEnvironment } from './config/env'

const startServer = async () => {
  const environment = getEnvironment()
  const app = createApp()

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
