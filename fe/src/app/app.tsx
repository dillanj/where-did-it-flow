import { useEffect, useMemo, useRef } from 'react'
import { createAppApiAdapter } from './adapter/app-api-adapter'
import { CsvImportWrapper } from './csv-import/view/wrapper'
import { AppDomain } from './domain/app-domain'

const resolveApiBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL

  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue
  }

  return 'http://127.0.0.1:4000'
}

export const App = () => {
  const disposeTimeoutIdRef = useRef<number | null>(null)

  const appDomain = useMemo(() => {
    const api = createAppApiAdapter({
      apiBaseUrl: resolveApiBaseUrl()
    })

    return new AppDomain({
      api
    })
  }, [])

  useEffect(() => {
    if (disposeTimeoutIdRef.current !== null) {
      window.clearTimeout(disposeTimeoutIdRef.current)
      disposeTimeoutIdRef.current = null
    }

    return () => {
      disposeTimeoutIdRef.current = window.setTimeout(() => {
        appDomain.dispose()
        disposeTimeoutIdRef.current = null
      }, 0)
    }
  }, [appDomain])

  return <CsvImportWrapper appDomain={appDomain} />
}
