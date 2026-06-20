import { useEffect, useMemo, useRef } from 'react'
import { useSignalValue } from '@tcn/state'
import { createAppApiAdapter } from './adapter/app-api-adapter'
import { CsvImportWrapper } from './csv-import/view/wrapper'
import { AppDomain } from './domain/app-domain'
import { AppPresenter } from './presenter/app-presenter'

const resolveApiBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL

  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue
  }

  return 'http://127.0.0.1:4000'
}

const createAppRuntime = () => {
  const api = createAppApiAdapter({
    apiBaseUrl: resolveApiBaseUrl()
  })

  const domain = new AppDomain({
    api
  })

  const presenter = new AppPresenter({
    domain
  })

  return {
    domain,
    presenter,
    dispose: () => {
      presenter.dispose()
      domain.dispose()
    }
  }
}

export const App = () => {
  const disposeTimeoutIdRef = useRef<number | null>(null)

  const runtime = useMemo(() => {
    return createAppRuntime()
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

  const broadcasts = runtime.presenter.broadcasts
  const hasInitialized = useSignalValue(broadcasts.hasInitialized)
  const isInitializing = useSignalValue(broadcasts.isInitializing)
  const errorMessage = useSignalValue(broadcasts.errorMessage)

  if (hasInitialized) {
    return <CsvImportWrapper presenter={runtime.presenter.csvImportPresenter} />
  }

  return (
    <main className='import-page'>
      <section className='panel app-loading-panel'>
        <header className='panel-header'>
          <h2>{isInitializing ? 'Loading app' : 'App loading paused'}</h2>
          <span>Root presenter</span>
        </header>
        {errorMessage ? (
          <p className='status error'>{errorMessage}</p>
        ) : (
          <p className='status'>Preparing accounts and import workspace.</p>
        )}
      </section>
    </main>
  )
}
