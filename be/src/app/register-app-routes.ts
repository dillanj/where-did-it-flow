import type { FastifyPluginAsync } from 'fastify'
import type { DatabaseClient } from '../db/connection'
import { createBootstrapRoutes } from './app-bootstrap/adapter/http/bootstrap-routes'
import { createAppBootstrapRepository } from './app-bootstrap/adapter/sqlite/app-bootstrap-repository'
import { createAppBootstrapService } from './app-bootstrap/service/app-bootstrap-service'

export type CreateRegisterAppRoutesInput = {
  databaseClient: DatabaseClient
}

export const createRegisterAppRoutes = (
  input: CreateRegisterAppRoutesInput
): FastifyPluginAsync => {
  const registerAppRoutes: FastifyPluginAsync = async (fastify) => {
    const bootstrapService = createAppBootstrapService({
      clock: {
        nowIso: () => new Date().toISOString()
      },
      repository: createAppBootstrapRepository(input.databaseClient)
    })

    await fastify.register(
      createBootstrapRoutes({
        service: bootstrapService
      })
    )
  }

  return registerAppRoutes
}
