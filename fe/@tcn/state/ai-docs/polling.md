# Polling — Timed Operations

> **Scaffold placeholder.** Read the source files below for full implementation details. This document will be expanded with usage patterns and examples.

---

## Source Files

| File | Purpose |
|---|---|
| `src/poll_async.ts` | `PollAsync<T>` — periodic polling of an async action |
| `src/delay.ts` | `delay(time)` — cancellable delay utility |

---

## Imports

```ts
// Full bundle (requires React peer)
import { PollAsync, delay } from '@tcn/state';

// Core only — no React
import { PollAsync, delay } from '@tcn/state/core';
```

---

## Quick Reference

- `PollAsync<T>` periodically executes an async action and stores the result
- Composes `Runner<T>` internally for state tracking
- Key methods: `start()`, `stop()`, `poll()` (single immediate poll), `setDelay(ms)`, `dispose()`
- Options: `startImmediately` (default `true`), `delayFirstTick` (default `false`)
- Uses a generation counter to prevent stale results after `stop()`
- `delay(time)` returns an `IWeakPromise<void>` that resolves after the given milliseconds — cancellable via `.cancel()`
