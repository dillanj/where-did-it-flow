# Money Flow App - Agent Instructions

## Project Goal

Build a fast, local-first money flow application that allows users to upload CSVs, aggregate money flow data, create accounts, visualize finances, and persist all data locally.

Primary goals:

- speed
- clean code
- maintainability
- strong architecture
- minimal React logic

No auth unless explicitly requested.

---

# Architecture

Use hexagonal architecture.

Flow:

View → Presenter → Domain → Ports → Adapters

Business logic stays outside React and frameworks.

---

# Frontend Structure

    fe/src/app/
      feature/
        domain/
          tests/
          feature-domain.ts
          domain-model.ts
        adapter/
          feature-api-adapter.ts
          packers.ts
          unpackers.ts
        presenter/
          feature-presenter.ts
        view/
          wrapper.tsx
          components/
        utils/

Keep ownership inside features.

---

# State Management

Use @tcn/state:

- signal
- runner
- useSignalValue
- useRunnerValue

Rules:

- Domain owns state
- Presenter subscribes to domain broadcasts
- Presenter transforms for display only
- React subscribes to presenter

Avoid business logic in React.

Preferred:

`const transactions = useSignalValue(presenter.transactions)`

---

# Backend

Stack:

- TypeScript
- Node
- Fastify
- SQLite
- Drizzle

---

# Database

Persist:

- uploaded CSVs
- parsed transactions
- dashboard configs
- accounts
- mappings
- categories
- rules

Duplicate detection:

date + amount + description + account

---

# CSV Import

Support arbitrary column mapping.

Mappings persist per account and auto-apply to future uploads.

---

# Dashboard

Customizable widgets:

- inflow vs outflow
- category charts
- monthly/yearly trends
- account comparisons
- savings analysis

Dashboard state persists.

---

# UI

Required:

- light theme
- dark theme

Tailwind preferred.

---

# Style

- single quotes
- no semicolons
- TS strict
- readable naming
- small methods
- small files

---

# Testing

Vitest.

Focus on:

- aggregation
- CSV parsing
- duplicate detection
- rules
- dashboard calculations

---

# Implementation Phases

1. repo setup
2. architecture
3. database
4. CSV import
5. mapping engine
6. dashboard
7. visualizations
