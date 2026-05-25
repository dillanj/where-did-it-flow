import type { FastifyPluginAsync } from 'fastify'
import { createCsvFileStorageAdapter } from './csv-import/adapter/files/csv-file-storage-adapter'
import { createCsvImportRoutes } from './csv-import/adapter/http/csv-import-routes'
import { createCsvParserAdapter } from './csv-import/adapter/parsing/csv-parser-adapter'
import { createCsvImportRepository } from './csv-import/adapter/sqlite/csv-import-repository'
import { CsvImportService } from './csv-import/service/csv-import-service'
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

    const csvImportService = new CsvImportService({
      repository: createCsvImportRepository(input.databaseClient),
      fileStorage: createCsvFileStorageAdapter(),
      csvParser: createCsvParserAdapter()
    })

    await fastify.register(
      createCsvImportRoutes({
        csvImportService
      })
    )
  }

  return registerAppRoutes
}
