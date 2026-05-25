import type { AppShellDomain } from '../domain/app-shell-domain'

export type AppShellViewModel = {
  heading: string
  text: string
}

export type AppShellPresenter = {
  getViewModel: () => AppShellViewModel
}

export const createAppShellPresenter = (
  domain: AppShellDomain
): AppShellPresenter => {
  const getViewModel = () => {
    const state = domain.getState()

    return {
      heading: state.title,
      text: state.description
    }
  }

  return {
    getViewModel
  }
}
