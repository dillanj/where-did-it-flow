import { AppError } from '../../../../shared/errors/app-error'

export const packCreateAccountBody = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    throw new AppError({
      code: 'invalid_request',
      message: 'request body is required',
      statusCode: 400
    })
  }

  const payload = value as Record<string, unknown>

  if (typeof payload.name !== 'string' || typeof payload.type !== 'string') {
    throw new AppError({
      code: 'invalid_request',
      message: 'name and type are required',
      statusCode: 400
    })
  }

  return {
    name: payload.name,
    type: payload.type
  }
}
