import { describe, expect, it } from 'vitest'
import { AccountsDomain } from '../accounts-domain'

describe('AccountsDomain', () => {
  const createDomain = () => {
    return new AccountsDomain({
      clock: {
        nowIso: () => '2026-01-01T00:00:00.000Z'
      },
      idGenerator: {
        createId: () => 'acct-1'
      }
    })
  }

  it('creates an account with trimmed name', () => {
    const domain = createDomain()

    const account = domain.createAccount({
      name: '  Main Checking  ',
      type: 'checking'
    })

    expect(account.name).toBe('Main Checking')
    expect(account.type).toBe('checking')
  })

  it('throws on empty name', () => {
    const domain = createDomain()

    expect(() => {
      domain.createAccount({
        name: '   ',
        type: 'checking'
      })
    }).toThrowError('Account name is required')
  })
})
