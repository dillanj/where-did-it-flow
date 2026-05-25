import '@fastify/multipart'
import type { FastifyPluginAsync } from 'fastify'
import { AppError } from '../../../../shared/errors/app-error'
import type { CsvImportService } from '../../service/csv-import-service'
import {
  packImportUploadBody,
  packPreviewUploadBody
} from './packers'
import {
  unpackImportResponse,
  unpackPreviewResponse,
  unpackUploadDetailsResponse,
  unpackUploadListResponse,
  unpackUploadResponse
} from './unpackers'

export type CreateCsvImportRoutesInput = {
  csvImportService: CsvImportService
}

export const createCsvImportRoutes = (
  input: CreateCsvImportRoutesInput
): FastifyPluginAsync => {
  const routes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/api/accounts/:accountId/uploads', async (request, reply) => {
      const params = request.params as {
        accountId: string
      }

      const file = await request.file()

      if (!file) {
        throw new AppError({
          code: 'invalid_upload',
          message: 'CSV file is required',
          statusCode: 400
        })
      }

      const fileBuffer = await file.toBuffer()

      const result = input.csvImportService.uploadCsv({
        accountId: params.accountId,
        fileName: file.filename,
        fileBuffer
      })

      reply.status(201)

      return unpackUploadResponse(result)
    })

    fastify.get('/api/accounts/:accountId/uploads', async (request) => {
      const params = request.params as {
        accountId: string
      }

      const uploads = input.csvImportService.listUploadsByAccountId(params.accountId)

      return unpackUploadListResponse(uploads)
    })

    fastify.get('/api/uploads/:uploadId', async (request) => {
      const params = request.params as {
        uploadId: string
      }

      const upload = input.csvImportService.getUploadById(params.uploadId)

      return unpackUploadDetailsResponse(upload)
    })

    fastify.post('/api/uploads/:uploadId/preview', async (request) => {
      const params = request.params as {
        uploadId: string
      }

      const body = packPreviewUploadBody(request.body)

      const preview = input.csvImportService.previewUpload({
        uploadId: params.uploadId,
        columnMapping: body.columnMapping
      })

      return unpackPreviewResponse(preview)
    })

    fastify.post('/api/uploads/:uploadId/import', async (request) => {
      const params = request.params as {
        uploadId: string
      }

      const body = packImportUploadBody(request.body)

      const result = input.csvImportService.importUpload({
        uploadId: params.uploadId,
        columnMapping: body.columnMapping,
        skipDuplicates: body.skipDuplicates
      })

      return unpackImportResponse(result)
    })

    fastify.delete('/api/uploads/:uploadId', async (request, reply) => {
      const params = request.params as {
        uploadId: string
      }

      input.csvImportService.deleteUpload(params.uploadId)

      reply.status(204)

      return null
    })

    fastify.delete('/api/accounts/:accountId/months/:year/:month', async (request, reply) => {
      const params = request.params as {
        accountId: string
        year: string
        month: string
      }

      input.csvImportService.deleteAccountMonth({
        accountId: params.accountId,
        statementYear: Number(params.year),
        statementMonth: Number(params.month)
      })

      reply.status(204)

      return null
    })
  }

  return routes
}
