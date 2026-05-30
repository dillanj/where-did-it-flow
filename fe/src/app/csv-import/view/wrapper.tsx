import { useEffect, useMemo, useRef } from 'react'
import { useSignalValue } from '@tcn/state'
import type { AppDomain } from '../../domain/app-domain'
import { AppPresenter } from '../../presenter/app-presenter'
import { CsvImportScreen } from './components/csv-import-screen'

export type CsvImportWrapperProps = {
  appDomain: AppDomain
}

export const CsvImportWrapper = ({ appDomain }: CsvImportWrapperProps) => {
  const disposeTimeoutIdRef = useRef<number | null>(null)

  const runtime = useMemo(() => {
    const presenter = new AppPresenter({
      domain: appDomain
    })

    return {
      presenter,
      dispose: () => {
        presenter.dispose()
      }
    }
  }, [appDomain])

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
    return <CsvImportScreen presenter={runtime.presenter.csvImportPresenter} />
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
