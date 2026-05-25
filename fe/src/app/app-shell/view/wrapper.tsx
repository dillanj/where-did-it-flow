import { useMemo } from 'react'
import { createAppShellDomain } from '../domain/app-shell-domain'
import { createAppShellPresenter } from '../presenter/app-shell-presenter'
import { BootstrapPanel } from './components/bootstrap-panel'

export const AppShellWrapper = () => {
  const presenter = useMemo(() => {
    const domain = createAppShellDomain()

    return createAppShellPresenter(domain)
  }, [])

  const viewModel = presenter.getViewModel()

  return <BootstrapPanel heading={viewModel.heading} text={viewModel.text} />
}
