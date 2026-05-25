import type { FastifyPluginAsync } from 'fastify'
import type { AccountsService } from '../../service/accounts-service'
import { packCreateAccountBody } from './packers'
import { unpackAccount } from './unpackers'

export type CreateAccountsRoutesInput = {
  service: AccountsService
}

export const createAccountsRoutes = (
  input: CreateAccountsRoutesInput
): FastifyPluginAsync => {
  const routes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/api/accounts', async () => {
      const accounts = input.service.listAccounts()

      return accounts.map(unpackAccount)
    })

    fastify.post('/api/accounts', async (request, reply) => {
      const body = packCreateAccountBody(request.body)
      const account = input.service.createAccount(body)

      reply.status(201)

      return unpackAccount(account)
    })
  }

  return routes
}
