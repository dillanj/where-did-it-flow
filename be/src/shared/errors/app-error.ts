export class AppError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(input: { message: string; statusCode: number; code: string }) {
    super(input.message)
    this.name = 'AppError'
    this.statusCode = input.statusCode
    this.code = input.code
  }
}
