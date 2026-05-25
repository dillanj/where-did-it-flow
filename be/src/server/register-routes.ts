import type { FastifyInstance } from 'fastify'
import type { DatabaseClient } from '../db/connection'
import { createRegisterAppRoutes } from '../app/register-app-routes'

export type RegisterRoutesInput = {
  app: FastifyInstance
  databaseClient: DatabaseClient
}

export const registerRoutes = async (input: RegisterRoutesInput) => {
  await input.app.register(
    createRegisterAppRoutes({
      databaseClient: input.databaseClient
    })
  )
}
