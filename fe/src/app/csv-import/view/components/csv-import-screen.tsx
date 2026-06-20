import { useMemo, useState } from 'react'
import { useSignalValue } from '@tcn/state'
import { accountTypes } from '../../../accounts/domain/domain-model'
import type { ColumnMapping, UploadRowPreview } from '../../domain/domain-model'
import type { CsvImportPresenter } from '../../presenter/csv-import-presenter'

type PreviewFilter = 'all' | 'inflow' | 'outflow' | 'duplicates' | 'invalid'

export type CsvImportScreenProps = {
  presenter: CsvImportPresenter
}

const formatCurrency = (amountCents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amountCents / 100)
}

const getAmountClassName = (amountCents: number | null) => {
  if (amountCents === null || amountCents === 0) {
    return undefined
  }

  return amountCents > 0 ? 'amount-positive' : 'amount-negative'
}

const getStatTileClassName = (filter: PreviewFilter, activeFilter: PreviewFilter) => {
  return filter === activeFilter ? 'selected' : ''
}

const filterPreviewRow = (row: UploadRowPreview, filter: PreviewFilter) => {
  if (filter === 'all') {
    return true
  }

  if (filter === 'inflow') {
    return row.isValid && !row.isDuplicate && row.amountCents !== null && row.amountCents >= 0
  }

  if (filter === 'outflow') {
    return row.isValid && !row.isDuplicate && row.amountCents !== null && row.amountCents < 0
  }

  if (filter === 'duplicates') {
    return row.isDuplicate
  }

  return !row.isValid
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
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>('all')

  const previewRows = useMemo(() => {
    return preview?.rows.filter((row) => filterPreviewRow(row, previewFilter)) ?? []
  }, [preview, previewFilter])

  const selectPreviewFilter = (filter: PreviewFilter) => {
    setPreviewFilter((activeFilter) => {
      return activeFilter === filter ? 'all' : filter
    })
  }

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
                <button
                  className={getStatTileClassName('inflow', previewFilter)}
                  type='button'
                  aria-pressed={previewFilter === 'inflow'}
                  onClick={() => {
                    selectPreviewFilter('inflow')
                  }}
                >
                  <p>Inflow</p>
                  <strong>{formatCurrency(preview.inflowTotalCents)}</strong>
                </button>
                <button
                  className={getStatTileClassName('outflow', previewFilter)}
                  type='button'
                  aria-pressed={previewFilter === 'outflow'}
                  onClick={() => {
                    selectPreviewFilter('outflow')
                  }}
                >
                  <p>Outflow</p>
                  <strong>{formatCurrency(preview.outflowTotalCents)}</strong>
                </button>
                <button
                  className={getStatTileClassName('duplicates', previewFilter)}
                  type='button'
                  aria-pressed={previewFilter === 'duplicates'}
                  onClick={() => {
                    selectPreviewFilter('duplicates')
                  }}
                >
                  <p>Duplicates</p>
                  <strong>{preview.duplicateRowCount}</strong>
                </button>
                <button
                  className={getStatTileClassName('invalid', previewFilter)}
                  type='button'
                  aria-pressed={previewFilter === 'invalid'}
                  onClick={() => {
                    selectPreviewFilter('invalid')
                  }}
                >
                  <p>Invalid</p>
                  <strong>{preview.invalidRowCount}</strong>
                </button>
              </div>

              <div className='preview-table'>
                <table className='preview-table-header'>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Flags</th>
                    </tr>
                  </thead>
                </table>
                <div className='preview-table-rows'>
                  <table aria-label='Preview rows'>
                    <tbody>
                      {previewRows.length > 0 ? (
                        previewRows.map((row) => {
                          return (
                            <tr key={`${row.rowIndex}-${row.description}`}>
                              <td>{row.rowIndex + 1}</td>
                              <td>{row.transactionDate ?? '—'}</td>
                              <td>{row.description ?? '—'}</td>
                              <td className={getAmountClassName(row.amountCents)}>
                                {row.amountCents !== null ? formatCurrency(row.amountCents) : '—'}
                              </td>
                              <td>
                                {row.isDuplicate ? 'duplicate' : ''}
                                {row.isValid ? '' : ' invalid'}
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td className='table-empty' colSpan={5}>
                            No rows in this selection.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
