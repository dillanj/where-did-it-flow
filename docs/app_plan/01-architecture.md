# Architecture Plan

## Architectural Style
Use hexagonal architecture with domains, ports, adapters, presenters, and views.

The app should be split into frontend and backend directories, but both sides should follow the same principle: business logic lives in domains and communicates through ports.

## Frontend Architecture
Frontend code should use the work-style pattern:

```txt
fe/src/app/
  feature-name/
    domain/
      tests/
      feature-domain.ts
      domain-model.ts
      domain-ports.ts
    adapter/
      feature-api-adapter.ts
      packers.ts
      unpackers.ts
    presenter/
      feature-presenter.ts
    view/
      wrapper.tsx
      component-name.tsx
    utils/
```

### Frontend Domain Responsibilities
- Own feature state.
- Expose state through `@tcn/state` signals/broadcasts.
- Contain business decisions.
- Coordinate async operations through runners where useful.
- Depend on ports, not concrete adapters.

### Frontend Presenter Responsibilities
- Subscribe to domain broadcasts/signals.
- Expose UI-ready state to React.
- Translate UI events into domain calls.
- Do small display transformations only.
- Avoid business rules.

### Frontend View Responsibilities
- Render UI.
- Use `useSignalValue` and `useRunnerValue` to observe presenter state.
- Contain minimal logic.
- Delegate events to presenter methods.

### Frontend Adapter Responsibilities
- Implement domain ports.
- Make HTTP calls.
- Pack frontend models into API payloads.
- Unpack API responses into domain models.

## Backend Architecture
Backend should also use hexagonal architecture.

```txt
be/src/app/
  feature-name/
    domain/
      tests/
      feature-domain.ts
      domain-model.ts
      domain-ports.ts
    adapter/
      http/
        feature-routes.ts
        packers.ts
        unpackers.ts
      sqlite/
        feature-repository.ts
        schema.ts
    service/
      feature-service.ts
    utils/
```

## Backend Domain Responsibilities
- CSV parsing decisions after raw file input is provided.
- Column mapping validation.
- Transaction fingerprint generation.
- Transaction classification logic.
- Rule matching and category assignment.
- Aggregation logic when not better handled by SQL.

## Backend Adapter Responsibilities
- Fastify routes receive HTTP requests.
- SQLite repositories persist and query records.
- File storage adapter stores raw CSV files.
- Adapters translate external payloads into domain models.

## Dependency Direction
Allowed:

```txt
view -> presenter -> domain -> ports
adapter -> ports
routes -> service/domain
repository -> db
```

Not allowed:

```txt
domain -> React
domain -> Fastify
domain -> SQLite
domain -> fetch
domain -> localStorage
presenter -> SQLite
view -> API directly
```

## Design Patterns to Use
### Ports and Adapters
Use for API clients, repositories, file storage, CSV parser, and chart data providers.

### Strategy
Use for CSV column normalization and dashboard aggregation options.

### Specification
Use for category rule matching, especially when rules grow from simple `contains` to richer predicates.

### Repository
Use for SQLite persistence adapters.

### Factory
Use for building domain entities from raw parsed CSV rows.

### Command
Use for import confirmation, delete upload, delete month, and rule application flows if they become multi-step.

## Clean Code Rules
- Small files.
- Small functions.
- Descriptive names.
- Avoid clever abstractions.
- Prefer explicit domain language.
- Keep conditionals close to business concepts.
- Tests should read like behavior specs.
- Avoid leaking backend DTO names into frontend domains.

## Boundary Rule
A model can exist in multiple layers, but names should make the boundary clear:
- `Transaction` in domain
- `TransactionRecord` in SQLite adapter
- `TransactionResponse` in HTTP adapter
- `TransactionViewModel` in presenter
