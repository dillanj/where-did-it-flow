import Fastify from 'fastify'
import { bootstrapRoutes } from './app-bootstrap/adapter/http/bootstrap-routes'

export const createApp = () => {
  const app = Fastify({
    logger: true
  })

  app.register(bootstrapRoutes)

  return app
}
