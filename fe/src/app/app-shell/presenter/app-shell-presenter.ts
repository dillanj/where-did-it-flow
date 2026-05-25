import { Signal } from '@tcn/state'
import type { AppShellDomain } from '../domain/app-shell-domain'

export type AppShellViewModel = {
  heading: string
  text: string
}

export type AppShellPresenter = {
  viewModel: Signal<AppShellViewModel>['broadcast']
  dispose: () => void
}

export const createAppShellPresenter = (
  domain: AppShellDomain
): AppShellPresenter => {
  const mapStateToViewModel = () => {
    const state = domain.state.get()

    return {
      heading: state.title,
      text: state.description
    }
  }

  const viewModelSignal = new Signal<AppShellViewModel>(mapStateToViewModel())

  const subscription = domain.state.subscribe(() => {
    viewModelSignal.set(mapStateToViewModel())
  })

  return {
    viewModel: viewModelSignal.broadcast,
    dispose: () => {
      subscription.unsubscribe()
      viewModelSignal.dispose()
    }
  }
}
