import { Signal, type IBroadcast } from '@tcn/state'
import type { AppShellState } from './domain-model'

export type AppShellDomain = {
  state: IBroadcast<AppShellState>
  initialize: () => void
  dispose: () => void
}

export const createAppShellDomain = (): AppShellDomain => {
  const state = new Signal<AppShellState>({
    title: 'Money Flow',
    description: 'Scaffold ready. Features are intentionally not implemented yet.'
  })

  return {
    state: state.broadcast,
    initialize: () => {
      state.set(state.get())
    },
    dispose: () => {
      state.dispose()
    }
  }
}
