import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { resolveFromWorkspace } from '../../../../shared/files/path-utils'
import type { CsvFileStoragePort } from '../../domain/domain-ports'

const sanitizeFileName = (fileName: string) => {
  const extension = extname(fileName)

  if (extension.toLowerCase() === '.csv') {
    return fileName
  }

  return `${fileName}.csv`
}

export const createCsvFileStorageAdapter = (): CsvFileStoragePort => {
  return {
    store: (input) => {
      const safeFileName = sanitizeFileName(input.fileName)
      const relativePath = join('data', 'uploads', input.accountId, `${input.uploadId}-${safeFileName}`)
      const absolutePath = resolveFromWorkspace(relativePath)

      mkdirSync(dirname(absolutePath), { recursive: true })
      writeFileSync(absolutePath, input.fileBuffer)

      return {
        storedFilePath: relativePath
      }
    },
    read: (storedFilePath) => {
      const absolutePath = resolveFromWorkspace(storedFilePath)
      const buffer = readFileSync(absolutePath)

      return buffer.toString('utf8')
    },
    delete: (storedFilePath) => {
      const absolutePath = resolveFromWorkspace(storedFilePath)

      try {
        unlinkSync(absolutePath)
      } catch {
        return
      }
    }
  }
}
