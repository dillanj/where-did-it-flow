# Signals — Reactive State

> **Scaffold placeholder.** Read the source files below for full implementation details. This document will be expanded with usage patterns and examples.

---

## Source Files

| File | Purpose |
|---|---|
| `src/signal.ts` | `Signal<T>` — base reactive state container |
| `src/derived_signal.ts` | `DerivedSignal<T>` — computed state derived from one or more signals |
| `src/isignal.ts` | `ISignal<T>` — writable signal interface |
| `src/ibroadcast.ts` | `IBroadcast<T>` — read-only broadcast interface |

---

## Imports

```ts
// Full bundle (requires React peer)
import { Signal, DerivedSignal, derive } from '@tcn/state';

// Core only — no React, safe for services/utilities/tests
import { Signal, DerivedSignal, derive } from '@tcn/state/core';
```

---

## Typing

| Interface | Use for |
|---|---|
| `IBroadcast<T>` | Component props, function params — read-only access to a signal's value |
| `ISignal<T>` | Inside presenters/services that own the state — writable (extends `IBroadcast<T>`) |

Always type consumer-facing APIs with `IBroadcast<T>`. Reserve `ISignal<T>` for internal ownership.

---

## Quick Reference

- `Signal<T>` holds a single reactive value with subscriber notification
- Key methods: `get()`, `set(value)`, `transform(cb)`, `subscribe(cb)`, `wait()`, `waitFor(predicate)`, `dispose()`
- `DerivedSignal<T>` computes its value from 1-5 source signals via the `derive()` factory function
- Uses microtask batching to prevent redundant derivations in diamond dependency graphs
- Subscriptions use `WeakRef` — store the return value or the callback silently stops firing
- Always expose `.broadcast` (read-only) to consumers, never the `Signal` itself
