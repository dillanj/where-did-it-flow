# Presenter Pattern

## Source Files

| File | Purpose |
|---|---|
| `src/signal.ts` | `Signal<T>` — state container used inside presenters |
| `src/runner.ts` | `Runner<T>` — async state used inside presenters |
| `src/hooks/use_signal_value.ts` | `useSignalValue` — subscribe to a broadcast in React |
| `src/hooks/use_runner_status.ts` | `useRunnerStatus` — read runner status in React |

---

## Imports

```ts
// Presenter internals — use core (no React dependency)
import { Signal, Runner } from '@tcn/state/core';

// React hooks for connecting presenters to components
import { useSignalValue, useRunnerStatus } from '@tcn/state/react';
```

---

## Core Concept

Presenters are plain TypeScript classes that own Signals internally and expose read-only broadcasts. They encapsulate all state logic — validation, transformations, derived computations — keeping it out of React components.

### Structure

1. **Private signals** for mutable state (`_state: Signal<T>`)
2. **Public broadcasts** via getters (`get stateBroadcast()`)
3. **Public methods** for mutations (`setValue()`, `validate()`, etc.)
4. **Dispose** for cleanup

```ts
class MyPresenter {
  private _value: Signal<string>;
  private _state: Signal<MyState>;

  get valueBroadcast() { return this._value.broadcast; }
  get stateBroadcast() { return this._state.broadcast; }

  setValue(v: string) { this._value.set(v); }

  dispose() {
    this._value.dispose();
    this._state.dispose();
  }
}
```

In React — create with `useMemo`, tear down with `useEffect` cleanup:

```tsx
const presenter = useMemo(() => new MyPresenter(), []);
useEffect(() => () => presenter.dispose(), [presenter]);

const data = useSignalValue(presenter.dataBroadcast);
const status = useRunnerStatus(presenter.fetchRunnerBroadcast);
```

---

## Presenter-Component Duals

Every stateful component in application code has a dedicated presenter. They come as a pair — the presenter owns the state, the component renders it. The component always receives its presenter as a **required** prop, injected from above.

### Top-Down Injection

Parent presenters create and own child presenters. The component tree mirrors this hierarchy — parent components pass child presenters down as props to child components.

### Composite Pattern with Signals

When a child presenter is dynamic (may or may not exist), the parent presenter wraps it in a `Signal<ChildPresenter | null>`. The UI subscribes to that signal — when `null`, nothing renders; when a presenter appears, the component renders and receives it as a prop. This gives the parent presenter full lifecycle control.

### Presenters Are Not Optional Props

In application code, presenters are always required props. The exception is `@tcn/ui` field components (e.g., `FieldPresenter`), which accept an optional presenter so developers can compose field components visually before wiring up state. This is not the normal practice.

### Hoisting

Presenters live next to the component that uses them. The only exception is when multiple components share a presenter — hoist to the common ancestor folder.

---

## File Colocation

A component's view, styles, and presenter live side-by-side:

```
feature/
  feature_view.tsx
  feature_view.module.css
  feature_presenter.ts
```

The folder hierarchy should reflect the UI navigation path — how the user gets to that screen or feature.

---

## Key Rules

- **Never** expose a `Signal` or `Runner` directly — always expose `.broadcast`
- **Store subscriptions** — `WeakRef`-backed; if not stored, the callback silently stops firing
- **Cleanup** — call `dispose()` on signals/runners at end of lifecycle
- **Permanent vs dynamic presenters** — use readonly properties for always-needed presenters, `Signal<Presenter | null>` for optional/toggleable ones
