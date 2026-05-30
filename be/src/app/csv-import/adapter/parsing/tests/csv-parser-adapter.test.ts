import { describe, expect, it } from 'vitest'
import { createCsvParserAdapter } from '../csv-parser-adapter'

describe('createCsvParserAdapter', () => {
  it('parses a standard CSV whose first row is the header', () => {
    const parser = createCsvParserAdapter()

    const parsedCsv = parser.parse(
      [
        'Date,Description,Amount',
        '2026-01-01,Paycheck,100.00',
        '2026-01-02,Coffee,-5.00'
      ].join('\n')
    )

    expect(parsedCsv.headers).toEqual(['Date', 'Description', 'Amount'])
    expect(parsedCsv.rows).toEqual([
      {
        Date: '2026-01-01',
        Description: 'Paycheck',
        Amount: '100.00'
      },
      {
        Date: '2026-01-02',
        Description: 'Coffee',
        Amount: '-5.00'
      }
    ])
  })

  it('skips metadata rows before a bank transaction header', () => {
    const parser = createCsvParserAdapter()

    const parsedCsv = parser.parse(
      [
        '"Anytime Checking","******2353"',
        '"Balance as of 04/26/2026","249.33"',
        '"Date","Account","Account Number","Account Type","Description","Check #","Memo","Transaction Code","Credit","Debit","Daily Balance"',
        '"04/24/2026","Anytime Checking","******2353","Anytime Checking","ATM TRANSACTION FEE","","","609","","-2.50","249.33"',
        '"04/20/2026","Anytime Checking","******2353","Anytime Checking","PAYROLL","","","222","3445.92","",""'
      ].join('\n')
    )

    expect(parsedCsv.headers).toEqual([
      'Date',
      'Account',
      'Account Number',
      'Account Type',
      'Description',
      'Check #',
      'Memo',
      'Transaction Code',
      'Credit',
      'Debit',
      'Daily Balance'
    ])
    expect(parsedCsv.rows).toHaveLength(2)
    expect(parsedCsv.rows[0]).toMatchObject({
      Date: '04/24/2026',
      Description: 'ATM TRANSACTION FEE',
      Debit: '-2.50',
      'Daily Balance': '249.33'
    })
  })
})
