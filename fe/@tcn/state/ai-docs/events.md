# Events — Pub/Sub

> **Scaffold placeholder.** Read the source files below for full implementation details. This document will be expanded with usage patterns and examples.

---

## Source Files

| File | Purpose |
|---|---|
| `src/events/base_event.ts` | `BaseEvent<T>` — abstract base with subscribe, wait, dispose |
| `src/events/event.ts` | `Event<T>` — synchronous event dispatch |
| `src/events/async_event.ts` | `AsyncEvent<T>` — async event with notification strategies |

---

## Imports

```ts
// Full bundle (requires React peer)
import { Event, AsyncEvent, NotificationStrategy } from '@tcn/state';

// Core only — no React
import { Event, AsyncEvent, NotificationStrategy } from '@tcn/state/core';
```

---

## Quick Reference

- `Event<T>` fires synchronously — `notify(value)` calls each subscriber in order, swallows errors
- `AsyncEvent<T>` fires asynchronously with a `NotificationStrategy`:
  - `Sequential` (default) — awaits each callback in order
  - `Parallel` — runs all callbacks concurrently
- Both support: `subscribe(cb)`, `wait()`, `waitFor(predicate)`, `dispose()`
- Events are for decoupled communication — when the producer doesn't need to know who's listening
- Subscriptions use `WeakRef` — store the return value to keep the callback alive
