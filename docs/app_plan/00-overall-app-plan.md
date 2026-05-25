# Money Flow App - Overall App Plan

## Purpose
Build a local-first web application that lets a user upload arbitrary bank CSV statements, map the columns and transaction descriptions into meaningful categories, and visualize money flow across accounts, months, years, and all-time ranges.

The MVP is a local web app only. It should not include authentication, hosted deployment, or multi-user concerns yet. The architecture should still make those future changes easy by keeping business logic isolated from frameworks, storage, and HTTP details.

## Product Goals
- Upload CSV files from any bank by mapping CSV columns into the app's transaction model.
- Persist uploaded CSV files, parsed transactions, mappings, categories, and dashboard configuration locally.
- Let users create accounts and attach uploads to a specific account.
- Support monthly, annual, and all-time views per account.
- Deduplicate transactions across uploads.
- Allow deletion of data from a bad upload or a specific month.
- Auto-apply user-created mapping rules to future uploads.
- Show fast, clean dashboards with customizable charts.
- Support light and dark themes from the beginning.

## Recommended Tech Stack
### Frontend
- Vite
- React
- TypeScript
- Tailwind
- Vitest
- `@tcn/state` for domain/presenter state broadcasting
- `visx` for primary dashboard charts

### Backend
- Node.js
- TypeScript
- Fastify
- Vitest
- Drizzle ORM
- SQLite using `better-sqlite3`

### Repo Shape
```txt
money-flow/
  fe/
  be/
  package.json
  docs/
```

## Key Architecture Decision
Use hexagonal architecture on both FE and BE.

Business rules belong in domains. Domains should not know about React, HTTP, SQLite, Fastify, filesystems, chart libraries, or browser APIs. Adapters translate external concerns into domain-friendly ports.

## MVP User Flow
1. User creates an account.
2. User uploads a CSV file for that account.
3. App stores the raw CSV upload.
4. User maps CSV columns into canonical transaction fields.
5. App previews parsed transactions and upload summary.
6. App applies existing mapping rules.
7. User creates or edits category mapping rules.
8. User confirms import.
9. App persists parsed transactions and links them to the upload.
10. Dashboard updates from stored transaction data.
11. User can delete a bad upload or month of imported data.

## Core Domain Concepts
- Account
- CsvUpload
- CsvColumnMapping
- Transaction
- TransactionFingerprint
- Category
- CategoryRule
- MoneyFlowClassification
- Dashboard
- DashboardWidget
- DateRange

## Important Classification Rule
Raw transaction amount must stay unchanged. A negative amount from the bank remains negative.

Separately, the user can classify an outflow as either:
- `negative_outflow`: default expense behavior
- `positive_outflow`: money leaving the account but optionally counted toward income/savings view

Dashboards should support a toggle that decides whether positive outflows are counted with income or expenses.

## Implementation Phases
1. Repo setup and shared conventions
2. Backend SQLite schema and local migrations
3. CSV upload storage and parsing
4. Account management
5. Column mapping workflow
6. Transaction dedupe and import confirmation
7. Category and rule engine
8. Dashboard aggregation API
9. Frontend dashboard widgets
10. Dashboard customization and persistence
11. Theme polish and performance pass
12. Testing and Codex handoff hardening

## Non-Goals for MVP
- Auth
- Cloud sync
- Bank API integration
- Multi-user support
- Budgeting workflows
- Forecasting
- Export/report generation
- Mobile app

## Success Criteria
- One local start command runs FE, BE, and DB setup.
- Previously uploaded data persists between restarts.
- Arbitrary CSV formats can be mapped.
- Duplicate uploads do not create duplicate transactions.
- Mapping rules carry forward to future uploads.
- Dashboard loads quickly and feels responsive.
- Code is readable, testable, and framework boundaries are clean.
