# Domain / Presenter / Adapter / View Pattern

Use this architecture for React/TypeScript features unless the existing project uses a stronger local convention.

## Goal

Keep core feature logic independent from the UI and external services.

A feature domain should be able to run headlessly. In other words, the business logic should not need React, the DOM, or a real API client to work.

The UI updates because presenters sync with the domain and expose view-ready state to views/components.

## Folder structure

Preferred default:

```text
src/app/
	feature-name/
		domain/
			feature-domain.ts
			feature-types.ts
			feature-events.ts
			feature-errors.ts
			ports/
				feature-repository-port.ts
				feature-service-port.ts
			use-cases/
				create-feature-item.ts
				update-feature-item.ts
			tests/
				feature-domain.test.ts

		presenters/
			feature-presenter.ts
			feature-view-model.ts
			tests/
				feature-presenter.test.ts

		adapters/
			api/
				feature-api-adapter.ts
				feature-api-mappers.ts
			storage/
				feature-storage-adapter.ts
			tests/
				feature-api-adapter.test.ts

		views/
			feature-page.tsx
			feature-route.tsx

		components/
			feature-form.tsx
			feature-table.tsx
			feature-toolbar.tsx

		index.ts
```

Smaller features can start simpler:

```text
src/app/
	feature-name/
		domain/
		presenters/
		adapters/
		views/
		components/
```

Add subfolders only when the feature needs them.

## Layer responsibilities

## Domain

Domain owns core logic.

It should contain:

- state transitions
- business rules
- validation rules
- domain errors
- use cases
- domain events
- ports/interfaces for dependencies

It should not contain:

- React
- JSX
- browser APIs
- API client implementation details
- localStorage/sessionStorage usage directly
- UI formatting rules
- component state

Good domain examples:

- `CampaignDomain`
- `CampaignDraft`
- `CreateCampaignUseCase`
- `CampaignRepositoryPort`
- `CampaignValidationError`

## Presenter

Presenter connects domain behavior to the UI.

It should contain:

- UI-facing state shape
- view models
- commands views can call
- subscriptions to domain state
- orchestration between UI events and use cases

It should not contain:

- core business rules
- API implementation details
- JSX
- complex formatting that belongs in components

Good presenter examples:

- `CampaignPresenter`
- `CampaignFormPresenter`
- `CampaignViewModel`

The presenter answers:

- What should the view display?
- What commands can the view trigger?
- How does domain state become view state?

## Adapter

Adapters implement domain ports.

They should contain:

- API calls
- SDK-specific details
- request/response mapping
- persistence details
- error normalization

They should not contain:

- business rules
- UI state
- JSX
- presenter logic

Good adapter examples:

- `CampaignApiAdapter`
- `SupabaseCampaignRepository`
- `GrpcCampaignRepository`
- `LocalStorageDraftAdapter`

## View / Component

Views and components render.

They should contain:

- JSX
- layout
- styling
- simple event wiring
- simple display formatting

They should not contain:

- business rules
- API calls
- domain state transitions
- complex orchestration

Views should depend on presenters, not adapters.

## Dependency direction

Preferred dependency flow:

```text
view/components -> presenter -> domain -> ports
adapter -> domain ports
composition root wires presenter/domain/adapters together
```

The domain defines ports. Adapters implement ports. The composition root injects adapters into the domain or use cases.

The domain should not import adapters.

## Composition root

Wire dependencies near the feature entry point, route, app setup, or provider layer.

Example responsibility:

```text
create API adapter
create domain/use cases with adapter ports
create presenter with domain/use cases
pass presenter into view
```

Keep dependency construction out of leaf components when possible.

## Testing strategy

### Domain tests

Prioritize these first.

Test:

- state transitions
- validation
- business rules
- edge cases
- error states
- use cases with fake ports

### Presenter tests

Test:

- initial view model
- commands call the right domain/use case behavior
- domain updates are reflected in view state
- loading/error/empty states

### Adapter tests

Test:

- request construction
- response mapping
- error normalization

Mock external services. Do not test the third-party SDK itself.

### View tests

Test only meaningful UI behavior.

Avoid duplicating domain tests at the component level.

## Naming conventions

Prefer descriptive names:

```text
CampaignDomain
CampaignPresenter
CampaignApiAdapter
CampaignRepositoryPort
CampaignViewModel
CreateCampaignUseCase
```

Avoid vague names:

```text
Manager
Helper
Util
Handler
Thing
Data
```

Use `Port` for interfaces owned by the domain and implemented by adapters.

Use `Adapter` for concrete implementations that talk to external systems.

## Common mistakes to avoid

- putting business logic in React components
- letting presenters become giant god objects
- importing API clients into domains
- creating abstractions before there are real variations
- mixing server response types directly into UI state
- making everything global/shared too early
- skipping domain tests and only testing through the UI
