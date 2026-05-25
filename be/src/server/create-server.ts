import multipart from '@fastify/multipart'
import Fastify, { type FastifyInstance } from 'fastify'
import { AppError } from '../shared/errors/app-error'
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

  app.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PATCH,DELETE,OPTIONS'
    )
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (request.method === 'OPTIONS') {
      reply.status(204).send()
    }
  })

  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024
    }
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message
      })
      return
    }

    if (error instanceof Error) {
      reply.status((error as Error & { statusCode?: number }).statusCode ?? 500).send({
        code: (error as Error & { code?: string }).code ?? 'internal_error',
        message: error.message
      })
      return
    }

    reply.status(500).send({
      code: 'internal_error',
      message: 'Internal server error'
    })
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
