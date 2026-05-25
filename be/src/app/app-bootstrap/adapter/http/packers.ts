export type HealthRequestBody = {
  includeVersion?: boolean
}

export const packHealthRequestBody = (
  value: unknown
): HealthRequestBody => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const includeVersion = (value as { includeVersion?: unknown }).includeVersion

  return {
    includeVersion: includeVersion === true
  }
}
