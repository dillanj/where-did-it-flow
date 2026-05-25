export const accountTypes = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'other'
] as const

export type AccountType = (typeof accountTypes)[number]

export type Account = {
  id: string
  name: string
  type: AccountType
  createdAt: string
  updatedAt: string
}
