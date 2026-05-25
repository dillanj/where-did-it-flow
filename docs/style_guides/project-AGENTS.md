# Project Codex Instructions

Follow these project rules before making changes.

## Read these docs first

- `docs/codex/domain-presenter-adapter-view.md`
- `docs/codex/new-feature-flow.md`
- `docs/codex/clean-code.md`
- `docs/codex/design-patterns.md`

## Architecture default

Use a vertical feature structure:

```text
src/app/
	feature-name/
		domain/
		presenters/
		adapters/
		views/
		components/
		tests/
```

Prefer this shape unless the existing project already uses a different convention.

## Feature boundaries

Each feature should own its:

- domain model
- use cases
- presenter/controller
- adapters
- UI/views
- tests

Avoid cross-feature imports unless the imported code is intentionally shared.

## Layer rules

### Domain

Domain code owns the core logic.

It should:

- be framework-agnostic
- be runnable headlessly
- not import React
- not import API clients directly
- not read browser globals directly
- depend on ports/interfaces instead of concrete adapters
- expose deterministic behavior that is easy to unit test

### Presenter

Presenter code adapts domain state to the UI.

It should:

- subscribe/sync to domain state
- expose view-ready data
- expose commands for views to call
- coordinate use cases
- avoid owning business rules that belong in the domain

### Adapter

Adapter code talks to the outside world.

It should:

- implement domain ports
- contain API/client/storage details
- normalize external data into domain-friendly types
- keep service-specific weirdness out of the domain

### View/component

Views render.

They should:

- stay as stateless as practical
- avoid business logic
- avoid direct API calls
- receive data and callbacks from presenters
- keep conditional rendering readable

## New feature workflow

Before implementing a new feature, create or propose:

1. a plan
2. an epic or equivalent tracking issue
3. implementation issues/tasks
4. tests and verification checklist

Use `docs/codex/new-feature-flow.md` as the workflow reference.

## Verification

Use the project’s actual scripts if available.

Common examples:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Do not claim verification passed unless the command actually ran successfully.
