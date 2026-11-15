export const normalizeTransactionDescription = (description: string) => {
  return description.trim().toLowerCase().replace(/\s+/g, ' ')
}
