# Runners — Async Operation State

> **Scaffold placeholder.** Read the source files below for full implementation details. This document will be expanded with usage patterns and examples.

---

## Source Files

| File | Purpose |
|---|---|
| `src/runner.ts` | `Runner<T>` — async operation state machine |
| `src/irunner.ts` | `IRunner<T>` — writable runner interface |
| `src/irunner_broadcast.ts` | `IRunnerBroadcast<T>` — read-only runner broadcast, `Status` enum, `IRunnerState<T>` |
| `src/weak_promise.ts` | `WeakPromise<T>` — cancellable promise |
| `src/iweak_promise.ts` | `IWeakPromise<T>` — weak promise interface |

---

## Imports

```ts
// Full bundle (requires React peer)
import { Runner, Status } from '@tcn/state';

// Core only — no React, safe for services/utilities/tests
import { Runner, Status, WeakPromise } from '@tcn/state/core';
```

---

## Typing

| Interface | Use for |
|---|---|
| `IRunnerBroadcast<T>` | Component props, function params — read-only runner with status, error, progress |
| `IRunner<T>` | Inside presenters/services that own the runner — writable (extends `IRunnerBroadcast<T>` + `ISignal<T>`) |
| `IRunnerState<T>` | The shape of the runner's internal state (`value`, `status`, `error`, `feedback`, `progress`) |
| `IWeakPromise<T>` | Cancellable promise interface |

Always type consumer-facing APIs with `IRunnerBroadcast<T>`. Reserve `IRunner<T>` for internal ownership.

---

## Quick Reference

- `Runner<T>` manages the full lifecycle of async operations (fetch, submit, etc.)
- Tracks: `value`, `status` (INITIAL/PENDING/SUCCESS/ERROR), `error`, `feedback`, `progress`
- Key methods: `execute(action)`, `dispatch(action)`, `retry()`, `cancel(reason)`, `reset()`
- `execute()` returns a `Promise<T>` (await result); `dispatch()` returns `Promise<void>` (fire-and-forget)
- Multiple `execute()` calls chain automatically — each waits for the previous to complete
- `WeakPromise<T>` extends Promise with a `cancel(reason)` method for cleanup
- Always use `Runner` when state comes from an async operation — not `Signal` + manual loading flags
