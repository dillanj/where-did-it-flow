import { parseDateToIso } from '../../../shared/dates/date-parsing'
import { parseDecimalAmountToCents } from '../../../shared/money/amount-parsing'
import type {
  CsvUpload,
  DraftCsvColumnMappingRequest,
  ParsedCsvFile,
  ParsedTransactionCandidate,
  UploadPreview,
  UploadPreviewRow
} from './domain-model'
import type { ClockPort, HashPort, IdGeneratorPort } from './domain-ports'

export type CreateCsvImportDomainInput = {
  clock: ClockPort
  idGenerator: IdGeneratorPort
  hash: HashPort
}

export class CsvImportDomain {
  private readonly _clock: ClockPort
  private readonly _idGenerator: IdGeneratorPort
  private readonly _hash: HashPort

  constructor(input: CreateCsvImportDomainInput) {
    this._clock = input.clock
    this._idGenerator = input.idGenerator
    this._hash = input.hash
  }

  createUploadRecord = (input: {
    uploadId?: string
    accountId: string
    fileName: string
    storedFilePath: string
    originalFileHash: string
  }): CsvUpload => {
    return {
      id: input.uploadId ?? this._idGenerator.createId(),
      accountId: input.accountId,
      fileName: input.fileName,
      storedFilePath: input.storedFilePath,
      originalFileHash: input.originalFileHash,
      statementYear: null,
      statementMonth: null,
      status: 'uploaded',
      createdAt: this._clock.nowIso()
    }
  }

  buildPreview = (input: {
    uploadId: string
    accountId: string
    parsedCsv: ParsedCsvFile
    columnMapping: DraftCsvColumnMappingRequest
    existingFingerprints: Set<string>
  }): UploadPreview => {
    const rows: UploadPreviewRow[] = []
    const validTransactions: ParsedTransactionCandidate[] = []
    const seenFingerprints = new Set<string>()

    let parsedRowCount = 0
    let invalidRowCount = 0
    let duplicateRowCount = 0
    let inflowTotalCents = 0
    let outflowTotalCents = 0

    input.parsedCsv.rows.forEach((row, index) => {
      const mapped = this._mapRowToTransaction({
        accountId: input.accountId,
        uploadId: input.uploadId,
        row,
        columnMapping: input.columnMapping
      })

      if (!mapped.transaction) {
        invalidRowCount += 1
        rows.push({
          rowIndex: index,
          transactionDate: null,
          description: null,
          amountCents: null,
          isDuplicate: false,
          isValid: false,
          invalidReason: mapped.invalidReason
        })

        return
      }

      parsedRowCount += 1

      const isDuplicate =
        input.existingFingerprints.has(mapped.transaction.fingerprint) ||
        seenFingerprints.has(mapped.transaction.fingerprint)

      seenFingerprints.add(mapped.transaction.fingerprint)

      if (isDuplicate) {
        duplicateRowCount += 1
      } else {
        validTransactions.push(mapped.transaction)

        if (mapped.transaction.amount >= 0) {
          inflowTotalCents += mapped.transaction.amount
        } else {
          outflowTotalCents += Math.abs(mapped.transaction.amount)
        }
      }

      rows.push({
        rowIndex: index,
        transactionDate: mapped.transaction.transactionDate,
        description: mapped.transaction.description,
        amountCents: mapped.transaction.amount,
        isDuplicate,
        isValid: true,
        invalidReason: null
      })
    })

    return {
      uploadId: input.uploadId,
      parsedRowCount,
      invalidRowCount,
      duplicateRowCount,
      inflowTotalCents,
      outflowTotalCents,
      appliedCategoryCount: 0,
      unmappedTransactionCount: validTransactions.length,
      rows,
      validTransactions
    }
  }

  private _mapRowToTransaction = (input: {
    accountId: string
    uploadId: string
    row: Record<string, string>
    columnMapping: DraftCsvColumnMappingRequest
  }): {
    transaction: ParsedTransactionCandidate | null
    invalidReason: string | null
  } => {
    const dateText = input.row[input.columnMapping.dateColumn] ?? ''
    const descriptionText = input.row[input.columnMapping.descriptionColumn] ?? ''

    const transactionDate = parseDateToIso(dateText)

    if (!transactionDate) {
      return {
        transaction: null,
        invalidReason: 'invalid_date'
      }
    }

    const description = descriptionText.trim()

    if (!description) {
      return {
        transaction: null,
        invalidReason: 'missing_description'
      }
    }

    const amount = this._resolveAmountInCents({
      row: input.row,
      columnMapping: input.columnMapping
    })

    if (amount === null) {
      return {
        transaction: null,
        invalidReason: 'invalid_amount'
      }
    }

    const normalizedDescription = this._normalizeDescription(description)
    const fingerprint = this._hash.sha256(
      [input.accountId, transactionDate, normalizedDescription, String(amount)].join('|')
    )

    return {
      transaction: {
        uploadId: input.uploadId,
        accountId: input.accountId,
        transactionDate,
        description,
        normalizedDescription,
        amount,
        currency: 'USD',
        categoryId: null,
        subcategoryId: null,
        outflowClassification: amount < 0 ? 'negative_outflow' : null,
        fingerprint
      },
      invalidReason: null
    }
  }

  private _resolveAmountInCents = (input: {
    row: Record<string, string>
    columnMapping: DraftCsvColumnMappingRequest
  }): number | null => {
    const amountColumn = input.columnMapping.amountColumn ?? null

    if (amountColumn) {
      const rawAmount = input.row[amountColumn] ?? ''

      return parseDecimalAmountToCents(rawAmount)
    }

    const debitColumn = input.columnMapping.debitColumn ?? null
    const creditColumn = input.columnMapping.creditColumn ?? null

    if (!debitColumn && !creditColumn) {
      return null
    }

    const debitAmount = debitColumn
      ? parseDecimalAmountToCents(input.row[debitColumn] ?? '')
      : null

    const creditAmount = creditColumn
      ? parseDecimalAmountToCents(input.row[creditColumn] ?? '')
      : null

    if (debitAmount === null && creditAmount === null) {
      return null
    }

    const debitCents = debitAmount ? -Math.abs(debitAmount) : 0
    const creditCents = creditAmount ?? 0

    return debitCents + creditCents
  }

  private _normalizeDescription = (description: string) => {
    return description.trim().toLowerCase().replace(/\s+/g, ' ')
  }
}
