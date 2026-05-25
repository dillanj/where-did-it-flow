const toIsoDate = (year: number, month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date.toISOString().slice(0, 10)
}

export const parseDateToIso = (value: string): string | null => {
  const text = value.trim()

  if (!text) {
    return null
  }

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2])
    const day = Number(isoMatch[3])

    return toIsoDate(year, month, day)
  }

  const usMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)

  if (usMatch) {
    const month = Number(usMatch[1])
    const day = Number(usMatch[2])
    const yearText = usMatch[3]

    if (!yearText) {
      return null
    }

    const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText)

    return toIsoDate(year, month, day)
  }

  return null
}
