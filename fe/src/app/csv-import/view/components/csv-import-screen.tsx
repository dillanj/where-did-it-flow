import { useMemo, useState } from 'react'
import { accountTypes, type ColumnMapping } from '../../domain/domain-model'
import type { CsvImportViewModel } from '../../presenter/csv-import-presenter'

export type CsvImportScreenProps = {
  viewModel: CsvImportViewModel
  onCreateAccount: (input: {
    name: string
    type: (typeof accountTypes)[number]
  }) => Promise<void>
  onSelectAccount: (accountId: string) => Promise<void>
  onUploadCsv: (file: File) => Promise<void>
  onSelectUpload: (uploadId: string) => Promise<void>
  onUpdateMapping: (field: keyof ColumnMapping, value: string) => void
  onPreviewUpload: () => Promise<void>
  onImportUpload: () => Promise<void>
}

const formatCurrency = (amountCents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amountCents / 100)
}

export const CsvImportScreen = ({
  viewModel,
  onCreateAccount,
  onSelectAccount,
  onUploadCsv,
  onSelectUpload,
  onUpdateMapping,
  onPreviewUpload,
  onImportUpload
}: CsvImportScreenProps) => {
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState<(typeof accountTypes)[number]>('checking')

  const previewRows = useMemo(() => {
    return viewModel.preview?.rows.slice(0, 12) ?? []
  }, [viewModel.preview])

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      return
    }

    await onCreateAccount({
      name: accountName,
      type: accountType
    })

    setAccountName('')
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
            <span>{viewModel.accounts.length} total</span>
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
            <button onClick={handleCreateAccount} disabled={viewModel.isManagingAccount}>
              {viewModel.isManagingAccount ? 'Creating…' : 'Create'}
            </button>
          </div>

          <div className='chip-list'>
            {viewModel.accounts.map((account) => {
              const selected = account.id === viewModel.selectedAccountId

              return (
                <button
                  key={account.id}
                  className={selected ? 'chip selected' : 'chip'}
                  onClick={() => {
                    void onSelectAccount(account.id)
                  }}
                >
                  <span>{account.name}</span>
                  <small>{account.type}</small>
                </button>
              )
            })}
          </div>
        </article>

        <article className='panel'>
          <header className='panel-header'>
            <h2>Upload</h2>
            <span>{viewModel.selectedAccountId ? 'Account selected' : 'Choose account first'}</span>
          </header>

          <label className='file-picker'>
            <input
              type='file'
              accept='.csv,text/csv'
              disabled={!viewModel.selectedAccountId || viewModel.isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0]

                if (!file) {
                  return
                }

                void onUploadCsv(file)
              }}
            />
            <span>{viewModel.isUploading ? 'Uploading…' : 'Choose CSV file'}</span>
          </label>

          <div className='upload-list'>
            {viewModel.uploads.map((upload) => {
              const selected = upload.id === viewModel.selectedUploadId

              return (
                <button
                  key={upload.id}
                  className={selected ? 'upload-row selected' : 'upload-row'}
                  onClick={() => {
                    void onSelectUpload(upload.id)
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
            <span>{viewModel.headers.length} headers detected</span>
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
                    value={viewModel.mapping[key] ?? ''}
                    onChange={(event) => onUpdateMapping(key, event.target.value)}
                  >
                    <option value=''>Not mapped</option>
                    {viewModel.headers.map((header) => {
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
                void onPreviewUpload()
              }}
              disabled={!viewModel.selectedUploadId || viewModel.isPreviewing}
            >
              {viewModel.isPreviewing ? 'Previewing…' : 'Run Preview'}
            </button>
            <button
              className='accent'
              onClick={() => {
                void onImportUpload()
              }}
              disabled={!viewModel.preview || viewModel.isImporting}
            >
              {viewModel.isImporting ? 'Importing…' : 'Confirm Import'}
            </button>
          </div>

          {viewModel.errorMessage ? <p className='status error'>{viewModel.errorMessage}</p> : null}
          {viewModel.message ? <p className='status'>{viewModel.message}</p> : null}
        </article>

        <article className='panel wide'>
          <header className='panel-header'>
            <h2>Preview</h2>
            <span>{viewModel.preview ? `${viewModel.preview.parsedRowCount} parsed rows` : 'No preview yet'}</span>
          </header>

          {viewModel.preview ? (
            <>
              <div className='stat-grid'>
                <div>
                  <p>Inflow</p>
                  <strong>{formatCurrency(viewModel.preview.inflowTotalCents)}</strong>
                </div>
                <div>
                  <p>Outflow</p>
                  <strong>{formatCurrency(viewModel.preview.outflowTotalCents)}</strong>
                </div>
                <div>
                  <p>Duplicates</p>
                  <strong>{viewModel.preview.duplicateRowCount}</strong>
                </div>
                <div>
                  <p>Invalid</p>
                  <strong>{viewModel.preview.invalidRowCount}</strong>
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

          {viewModel.importResult ? (
            <div className='import-result'>
              <h3>Import Result</h3>
              <p>Inserted: {viewModel.importResult.insertedCount}</p>
              <p>Skipped duplicates: {viewModel.importResult.skippedDuplicateCount}</p>
              <p>Invalid rows: {viewModel.importResult.invalidRowCount}</p>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}
