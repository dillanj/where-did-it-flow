import { useEffect, useMemo, useRef } from 'react'
import { createAccountsApiAdapter } from '../../accounts/adapter/accounts-api-adapter'
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
  const disposeTimeoutIdRef = useRef<number | null>(null)

  const runtime = useMemo(() => {
    const apiBaseUrl = resolveApiBaseUrl()

    const accountsApi = createAccountsApiAdapter({
      apiBaseUrl
    })

    const csvImportApi = createCsvImportApiAdapter({
      apiBaseUrl
    })

    const domain = new CsvImportDomain({
      accountsApi,
      csvImportApi
    })

    const presenter = new CsvImportPresenter(domain)

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
    if (disposeTimeoutIdRef.current !== null) {
      window.clearTimeout(disposeTimeoutIdRef.current)
      disposeTimeoutIdRef.current = null
    }

    void runtime.presenter.initialize()

    return () => {
      disposeTimeoutIdRef.current = window.setTimeout(() => {
        runtime.dispose()
        disposeTimeoutIdRef.current = null
      }, 0)
    }
  }, [runtime])

  return <CsvImportScreen presenter={runtime.presenter} />
}
