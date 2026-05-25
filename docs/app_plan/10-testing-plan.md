# Testing Plan

## Testing Philosophy
Test business rules heavily. Test framework wiring lightly.

Domains should have the strongest unit test coverage because they contain the important logic and should not require React, Fastify, or SQLite to test.

## Frontend Tests
Use Vitest.

### Domain Tests
Test:
- selecting accounts
- upload preview state transitions
- column mapping validation
- category rule draft behavior
- dashboard filter changes
- positive outflow toggle behavior

### Presenter Tests
Test:
- domain state converts to correct view model
- loading and error states are exposed correctly
- UI actions call domain methods

### View Tests
Only test views when useful.

Avoid snapshot-heavy tests.

## Backend Tests
Use Vitest.

### Domain Tests
Test:
- CSV row normalization
- amount parsing
- date parsing
- transaction fingerprint generation
- duplicate detection behavior
- category rule matching priority
- positive outflow aggregation
- delete upload behavior
- delete month behavior

### Repository Tests
Use test SQLite DB files or in-memory SQLite.

Test:
- insert transactions
- unique fingerprint constraint
- query by account/date range
- delete by upload
- delete by month

### Route Tests
Test critical API contracts only.

## Must-Have Test Cases
### CSV Import
- parses signed amount column
- parses debit/credit columns
- rejects missing required columns
- skips duplicate transaction fingerprints
- stores raw CSV metadata

### Category Rules
- `contains` match is case-insensitive
- first priority match wins
- disabled rules do not apply
- rule can assign category and outflow classification

### Dashboard Aggregation
- positive amounts count as inflow
- negative amounts count as outflow by default
- positive outflows stay expenses by default
- positive outflows count with income when toggle enabled
- category totals group correctly

### Deletion
- deleting upload removes its transactions
- deleting month removes account transactions for that month
- deleting one account's month does not affect another account

## Test File Placement
Frontend:

```txt
fe/src/app/feature/domain/tests/feature-domain.test.ts
fe/src/app/feature/presenter/tests/feature-presenter.test.ts
```

Backend:

```txt
be/src/app/feature/domain/tests/feature-domain.test.ts
be/src/app/feature/adapter/sqlite/tests/feature-repository.test.ts
```
