import type { AppShellState } from './domain-model'

export type AppShellDomain = {
  getState: () => AppShellState
}

export const createAppShellDomain = (): AppShellDomain => {
  const state: AppShellState = {
    title: 'Money Flow',
    description: 'Scaffold ready. Features are intentionally not implemented yet.'
  }

  return {
    getState: () => state
  }
}
