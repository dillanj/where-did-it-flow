import type { ColumnMapping } from '../domain/domain-model'

const toNullableField = (value: string | null) => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

export const packColumnMapping = (mapping: ColumnMapping) => {
  return {
    dateColumn: mapping.dateColumn,
    descriptionColumn: mapping.descriptionColumn,
    amountColumn: toNullableField(mapping.amountColumn),
    debitColumn: toNullableField(mapping.debitColumn),
    creditColumn: toNullableField(mapping.creditColumn),
    categoryColumn: toNullableField(mapping.categoryColumn),
    notesColumn: toNullableField(mapping.notesColumn),
    dateFormat: toNullableField(mapping.dateFormat)
  }
}
