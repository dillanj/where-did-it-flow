import type { FastifyPluginAsync } from 'fastify'
import { createDatabaseClient } from '../../../../db/sqlite'
import { getEnvironment } from '../../../../config/env'
import { createAppBootstrapRepository } from '../sqlite/app-bootstrap-repository'
import { packHealthRequestBody } from './packers'
import { unpackHealthResponseBody } from './unpackers'
import { createAppBootstrapService } from '../../service/app-bootstrap-service'

export const bootstrapRoutes: FastifyPluginAsync = async (fastify) => {
  const environment = getEnvironment()
  const databaseClient = createDatabaseClient(environment.databaseUrl)

  fastify.addHook('onClose', async () => {
    databaseClient.sqlite.close()
  })

  const service = createAppBootstrapService({
    clock: {
      nowIso: () => new Date().toISOString()
    },
    repository: createAppBootstrapRepository(databaseClient)
  })

  fastify.get('/health', async () => {
    const status = service.getStatus()

    return unpackHealthResponseBody(status)
  })

  fastify.post('/health', async (request) => {
    packHealthRequestBody(request.body)

    const status = service.getStatus()

    return unpackHealthResponseBody(status)
  })
}
