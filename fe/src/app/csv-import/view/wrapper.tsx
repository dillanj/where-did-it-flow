import { useEffect, useMemo } from 'react'
import { useSignalValue } from '@tcn/state'
import { createCsvImportApiAdapter } from '../adapter/csv-import-api-adapter'
import { CsvImportDomain } from '../domain/csv-import-domain'
import { CsvImportPresenter } from '../presenter/csv-import-presenter'
import { CsvImportScreen } from './components/csv-import-screen'

const resolveApiBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL

  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue
  }

  return 'http://127.0.0.1:4000'
}

export const CsvImportWrapper = () => {
  const runtime = useMemo(() => {
    const api = createCsvImportApiAdapter({
      apiBaseUrl: resolveApiBaseUrl()
    })

    const domain = new CsvImportDomain({
      api
    })

    const presenter = new CsvImportPresenter({
      domain
    })

    return {
      presenter,
      domain,
      dispose: () => {
        presenter.dispose()
        domain.dispose()
      }
    }
  }, [])

  useEffect(() => {
    void runtime.presenter.initialize()

    return () => {
      runtime.dispose()
    }
  }, [runtime])

  const viewModel = useSignalValue(runtime.presenter.viewModel)

  return (
    <CsvImportScreen
      viewModel={viewModel}
      onCreateAccount={runtime.presenter.createAccount}
      onSelectAccount={runtime.presenter.selectAccount}
      onUploadCsv={runtime.presenter.uploadCsv}
      onSelectUpload={runtime.presenter.selectUpload}
      onUpdateMapping={runtime.presenter.updateMapping}
      onPreviewUpload={runtime.presenter.previewSelectedUpload}
      onImportUpload={runtime.presenter.importSelectedUpload}
    />
  )
}
