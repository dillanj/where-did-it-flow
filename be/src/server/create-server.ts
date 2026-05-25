import Fastify, { type FastifyInstance } from 'fastify'
import type { DatabaseClient } from '../db/connection'
import { registerRoutes } from './register-routes'

export type CreateServerInput = {
  databaseClient: DatabaseClient
}

export const createServer = async (
  input: CreateServerInput
): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true
  })

  app.addHook('onClose', async () => {
    input.databaseClient.sqlite.close()
  })

  await registerRoutes({
    app,
    databaseClient: input.databaseClient
  })

  return app
}
