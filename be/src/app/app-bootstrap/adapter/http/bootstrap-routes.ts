import type { FastifyPluginAsync } from 'fastify'
import { packHealthRequestBody } from './packers'
import { unpackHealthResponseBody } from './unpackers'
import type { AppBootstrapService } from '../../service/app-bootstrap-service'

export type CreateBootstrapRoutesInput = {
  service: AppBootstrapService
}

export const createBootstrapRoutes = (
  input: CreateBootstrapRoutesInput
): FastifyPluginAsync => {
  const bootstrapRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/health', async () => {
      const status = input.service.getStatus()

      return unpackHealthResponseBody(status)
    })

    fastify.post('/health', async (request) => {
      packHealthRequestBody(request.body)

      const status = input.service.getStatus()

      return unpackHealthResponseBody(status)
    })
  }

  return bootstrapRoutes
}
