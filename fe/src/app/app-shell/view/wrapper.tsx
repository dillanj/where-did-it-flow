import { useEffect, useMemo } from 'react'
import { useSignalValue } from '@tcn/state'
import { createAppShellDomain } from '../domain/app-shell-domain'
import { createAppShellPresenter } from '../presenter/app-shell-presenter'
import { BootstrapPanel } from './components/bootstrap-panel'

export const AppShellWrapper = () => {
  const runtime = useMemo(() => {
    const domain = createAppShellDomain()
    const presenter = createAppShellPresenter(domain)

    domain.initialize()

    return {
      presenter,
      dispose: () => {
        presenter.dispose()
        domain.dispose()
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      runtime.dispose()
    }
  }, [runtime])

  const viewModel = useSignalValue(runtime.presenter.viewModel)

  return <BootstrapPanel heading={viewModel.heading} text={viewModel.text} />
}
