const sanitizeAmountText = (value: string) => {
  return value
    .trim()
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
}

export const parseDecimalAmountToCents = (value: string): number | null => {
  const normalized = sanitizeAmountText(value)

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.round(parsed * 100)
}
