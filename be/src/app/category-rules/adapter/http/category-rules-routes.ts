import type { FastifyPluginAsync } from 'fastify'
import type { CategoryRulesService } from '../../service/category-rules-service'
import {
  packCreateCategoryBody,
  packCreateRuleBody,
  packUpdateCategoryBody,
  packUpdateRuleBody
} from './packers'
import { unpackCategory, unpackRule } from './unpackers'

export type CreateCategoryRulesRoutesInput = {
  service: CategoryRulesService
}

export const createCategoryRulesRoutes = (
  input: CreateCategoryRulesRoutesInput
): FastifyPluginAsync => {
  const routes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/api/categories', async () => {
      return input.service.listCategories().map(unpackCategory)
    })

    fastify.post('/api/categories', async (request, reply) => {
      const body = packCreateCategoryBody(request.body)
      const category = input.service.createCategory(body)

      reply.status(201)

      return unpackCategory(category)
    })

    fastify.patch('/api/categories/:categoryId', async (request) => {
      const params = request.params as {
        categoryId: string
      }
      const body = packUpdateCategoryBody({
        categoryId: params.categoryId,
        body: request.body
      })
      const category = input.service.updateCategory(body)

      return unpackCategory(category)
    })

    fastify.delete('/api/categories/:categoryId', async (request, reply) => {
      const params = request.params as {
        categoryId: string
      }

      input.service.deleteCategory(params.categoryId)

      reply.status(204)

      return null
    })

    fastify.get('/api/category-rules', async () => {
      return input.service.listRules().map(unpackRule)
    })

    fastify.post('/api/category-rules', async (request, reply) => {
      const body = packCreateRuleBody(request.body)
      const rule = input.service.createRule(body)

      reply.status(201)

      return unpackRule(rule)
    })

    fastify.patch('/api/category-rules/:ruleId', async (request) => {
      const params = request.params as {
        ruleId: string
      }
      const body = packUpdateRuleBody({
        ruleId: params.ruleId,
        body: request.body
      })
      const rule = input.service.updateRule(body)

      return unpackRule(rule)
    })

    fastify.delete('/api/category-rules/:ruleId', async (request, reply) => {
      const params = request.params as {
        ruleId: string
      }

      input.service.deleteRule(params.ruleId)

      reply.status(204)

      return null
    })
  }

  return routes
}
