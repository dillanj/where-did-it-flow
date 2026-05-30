import { useMemo, useState } from 'react'
import { useSignalValue } from '@tcn/state'
import { accountTypes } from '../../../accounts/domain/domain-model'
import type { ColumnMapping } from '../../domain/domain-model'
import type { CsvImportPresenter } from '../../presenter/csv-import-presenter'

export type CsvImportScreenProps = {
  presenter: CsvImportPresenter
}

const formatCurrency = (amountCents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amountCents / 100)
}

export const CsvImportScreen = ({ presenter }: CsvImportScreenProps) => {
  const broadcasts = presenter.broadcasts

  const accounts = useSignalValue(broadcasts.accounts)
  const selectedAccountId = useSignalValue(broadcasts.selectedAccountId)
  const uploads = useSignalValue(broadcasts.uploads)
  const selectedUploadId = useSignalValue(broadcasts.selectedUploadId)
  const headers = useSignalValue(broadcasts.headers)
  const mapping = useSignalValue(broadcasts.mapping)
  const preview = useSignalValue(broadcasts.preview)
  const importResult = useSignalValue(broadcasts.importResult)
  const message = useSignalValue(broadcasts.message)
  const errorMessage = useSignalValue(broadcasts.errorMessage)
  const isManagingAccount = useSignalValue(broadcasts.isManagingAccount)
  const isUploading = useSignalValue(broadcasts.isUploading)
  const isPreviewing = useSignalValue(broadcasts.isPreviewing)
  const isImporting = useSignalValue(broadcasts.isImporting)

  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState<(typeof accountTypes)[number]>('checking')

  const previewRows = useMemo(() => {
    return preview?.rows.slice(0, 12) ?? []
  }, [preview])

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      return
    }

    try {
      await presenter.createAccount({
        name: accountName,
        type: accountType
      })

      setAccountName('')
    } catch {
      return
    }
  }

  return (
    <main className='import-page'>
      <section className='import-hero'>
        <div>
          <p className='eyebrow'>Phase 3 · CSV Import</p>
          <h1>Import Bank CSVs Without Leaking Logic Into React</h1>
          <p>
            Upload statements, map columns, preview parsed transactions, and confirm imports with
            clean domain boundaries.
          </p>
        </div>
      </section>

      <section className='import-grid'>
        <article className='panel'>
          <header className='panel-header'>
            <h2>Accounts</h2>
            <span>{accounts.length} total</span>
          </header>

          <div className='account-create'>
            <input
              value={accountName}
              placeholder='Create account name'
              onChange={(event) => setAccountName(event.target.value)}
            />
            <select
              value={accountType}
              onChange={(event) => setAccountType(event.target.value as (typeof accountTypes)[number])}
            >
              {accountTypes.map((type) => {
                return (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              })}
            </select>
            <button onClick={handleCreateAccount} disabled={isManagingAccount}>
              {isManagingAccount ? 'Creating…' : 'Create'}
            </button>
          </div>

          <div className='chip-list'>
            {accounts.map((account) => {
              const selected = account.id === selectedAccountId

              return (
                <button
                  key={account.id}
                  className={selected ? 'chip selected' : 'chip'}
                  onClick={() => {
                    void presenter.selectAccount(account.id)
                  }}
                >
                  <span>{account.name}</span>
                  <small>{account.type}</small>
                </button>
              )
            })}
          </div>

          {accounts.length === 0 ? (
            <p className='empty-state'>No accounts yet. Create one to start importing.</p>
          ) : null}

          {errorMessage ? <p className='status error'>{errorMessage}</p> : null}
          {message ? <p className='status'>{message}</p> : null}
        </article>

        <article className='panel'>
          <header className='panel-header'>
            <h2>Upload</h2>
            <span>{selectedAccountId ? 'Account selected' : 'Choose account first'}</span>
          </header>

          <label className='file-picker'>
            <input
              type='file'
              accept='.csv,text/csv'
              disabled={!selectedAccountId || isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0]

                if (!file) {
                  return
                }

                void presenter.uploadCsv(file)
              }}
            />
            <span>{isUploading ? 'Uploading…' : 'Choose CSV file'}</span>
          </label>

          <div className='upload-list'>
            {uploads.map((upload) => {
              const selected = upload.id === selectedUploadId

              return (
                <button
                  key={upload.id}
                  className={selected ? 'upload-row selected' : 'upload-row'}
                  onClick={() => {
                    void presenter.selectUpload(upload.id)
                  }}
                >
                  <strong>{upload.fileName}</strong>
                  <span>{upload.status}</span>
                </button>
              )
            })}
          </div>
        </article>

        <article className='panel wide'>
          <header className='panel-header'>
            <h2>Mapping</h2>
            <span>{headers.length} headers detected</span>
          </header>

          <div className='mapping-grid'>
            {[
              ['dateColumn', 'Date column'],
              ['descriptionColumn', 'Description column'],
              ['amountColumn', 'Amount column'],
              ['debitColumn', 'Debit column'],
              ['creditColumn', 'Credit column']
            ].map(([field, label]) => {
              const key = field as keyof ColumnMapping

              return (
                <label key={field}>
                  <span>{label}</span>
                  <select
                    value={mapping[key] ?? ''}
                    onChange={(event) => presenter.updateMapping(key, event.target.value)}
                  >
                    <option value=''>Not mapped</option>
                    {headers.map((header) => {
                      return (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      )
                    })}
                  </select>
                </label>
              )
            })}
          </div>

          <div className='actions'>
            <button
              onClick={() => {
                void presenter.previewSelectedUpload()
              }}
              disabled={!selectedUploadId || isPreviewing}
            >
              {isPreviewing ? 'Previewing…' : 'Run Preview'}
            </button>
            <button
              className='accent'
              onClick={() => {
                void presenter.importSelectedUpload()
              }}
              disabled={!preview || isImporting}
            >
              {isImporting ? 'Importing…' : 'Confirm Import'}
            </button>
          </div>
        </article>

        <article className='panel wide'>
          <header className='panel-header'>
            <h2>Preview</h2>
            <span>{preview ? `${preview.parsedRowCount} parsed rows` : 'No preview yet'}</span>
          </header>

          {preview ? (
            <>
              <div className='stat-grid'>
                <div>
                  <p>Inflow</p>
                  <strong>{formatCurrency(preview.inflowTotalCents)}</strong>
                </div>
                <div>
                  <p>Outflow</p>
                  <strong>{formatCurrency(preview.outflowTotalCents)}</strong>
                </div>
                <div>
                  <p>Duplicates</p>
                  <strong>{preview.duplicateRowCount}</strong>
                </div>
                <div>
                  <p>Invalid</p>
                  <strong>{preview.invalidRowCount}</strong>
                </div>
              </div>

              <div className='preview-table'>
                <table>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => {
                      return (
                        <tr key={`${row.rowIndex}-${row.description}`}>
                          <td>{row.rowIndex + 1}</td>
                          <td>{row.transactionDate ?? '—'}</td>
                          <td>{row.description ?? '—'}</td>
                          <td>{row.amountCents !== null ? formatCurrency(row.amountCents) : '—'}</td>
                          <td>
                            {row.isDuplicate ? 'duplicate' : ''}
                            {row.isValid ? '' : ' invalid'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className='empty-state'>Upload a CSV and run preview to inspect parsed rows.</p>
          )}

          {importResult ? (
            <div className='import-result'>
              <h3>Import Result</h3>
              <p>Inserted: {importResult.insertedCount}</p>
              <p>Skipped duplicates: {importResult.skippedDuplicateCount}</p>
              <p>Invalid rows: {importResult.invalidRowCount}</p>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}
