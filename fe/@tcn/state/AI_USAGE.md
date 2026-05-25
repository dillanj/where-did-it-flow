# @tcn/state — AI Usage Guide

**Load this file when:** the project uses `@tcn/state` and you are working with reactive state,
async operations, presenters, or connecting state to React components.

> For source files referenced in linked docs, prefix paths with `node_modules/@tcn/state/` in app projects.

---

## Overview

`@tcn/state` provides a signal-based reactive state system for complex business logic.

| Primitive | Purpose |
|---|---|
| **Signal\<T\>** | Single-value reactive container. `get()`, `set()`, `transform()`. WeakRef-based subscriptions for automatic GC. |
| **DerivedSignal\<T\>** | Computed value from 1-5 source signals. Batched recalculation via `queueMicrotask()`. Created with the `derive()` factory. |
| **Runner\<T\>** | Async state machine (INITIAL -> PENDING -> SUCCESS / ERROR). Wraps Signal with `execute()`, `dispatch()`, `retry()`, `cancel()`. Tracks progress (0-1) and feedback messages. Uses `WeakPromise` for cancellation. |
| **Event / AsyncEvent** | Pub/sub channels. Synchronous or awaitable dispatch. Same WeakRef subscription model. |
| **PollAsync\<T\>** | Periodic polling with reactive broadcasts, generation counter to prevent stale results. |
| **WeakPromise\<T\>** | Extends native Promise with `cancel(reason)` and cleanup callback. |

React integration via hooks: `useSignalValue(broadcast)`, `useRunnerStatus(broadcast)`, `useRunnerError(broadcast)`, `useRunnerProgress(broadcast)`, `useRunnerFeedback(broadcast)`. Corresponding `*Effect` variants run side-effects without re-rendering.

---

## Decision Tree — What Are You Trying to Do?

| Task | Read |
|---|---|
| Async operations (fetch, submit, cancel, retry) | [ai-docs/runners.md](ai-docs/runners.md) |
| Reactive synchronous state | [ai-docs/signals.md](ai-docs/signals.md) |
| Presenter classes (business logic outside React) | [ai-docs/presenter-pattern.md](ai-docs/presenter-pattern.md) |
| Event pub/sub (decoupled communication) | [ai-docs/events.md](ai-docs/events.md) |
| Polling or timed operations | [ai-docs/polling.md](ai-docs/polling.md) |
| Module layout, imports, or architecture | Read `src/index.ts`, `src/core.ts`, `src/react.ts` |

Only load a topic doc when the current task matches. Do not load all docs preemptively.

---

## Critical Rules

- **Never** expose a `Signal` or `Runner` directly — always expose `.broadcast`
- **Store subscriptions** — the return value of `.subscribe()` is a `WeakRef`-backed ref;
  if not stored in a variable or property it will be garbage collected and the callback will silently stop firing
- **Cleanup subscriptions and signals** — call unsubscribe on subscriptions and dispose on signals at the end of their lifecycles
- **Prefer `transform()` over `set()`** when mutating arrays or objects in place
- **Use `@tcn/state/core`** in non-React contexts (services, Node utilities, tests)
- **Use `Runner`** any time state is the result of an async operation — not `Signal` + manual loading flags
