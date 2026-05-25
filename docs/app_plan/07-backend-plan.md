# Backend Plan

## Backend Stack
- Node.js
- TypeScript
- Fastify
- Drizzle ORM
- SQLite
- better-sqlite3
- Vitest

## Directory Structure
```txt
be/src/
  app/
    accounts/
    csv-import/
    category-rules/
    dashboard/
    transactions/
  db/
    schema.ts
    migrate.ts
    connection.ts
  server/
    create-server.ts
    register-routes.ts
  shared/
    errors/
    ids/
    dates/
    money/
    files/
```

## Server Startup
Root command should:
1. Install deps if needed.
2. Run DB migrations.
3. Start Fastify API.
4. Start Vite frontend.

Backend dev script:

```json
{
  "scripts": {
    "dev": "tsx watch src/server/main.ts",
    "db:migrate": "tsx src/db/migrate.ts",
    "test": "vitest"
  }
}
```

## API Route Groups
### Accounts
```txt
GET    /api/accounts
POST   /api/accounts
PATCH  /api/accounts/:accountId
DELETE /api/accounts/:accountId
```

### CSV Import
```txt
POST   /api/accounts/:accountId/uploads
GET    /api/accounts/:accountId/uploads
GET    /api/uploads/:uploadId
POST   /api/uploads/:uploadId/preview
POST   /api/uploads/:uploadId/import
DELETE /api/uploads/:uploadId
DELETE /api/accounts/:accountId/months/:year/:month
```

### Column Mappings
```txt
GET    /api/accounts/:accountId/column-mappings
POST   /api/accounts/:accountId/column-mappings
PATCH  /api/column-mappings/:mappingId
DELETE /api/column-mappings/:mappingId
```

### Categories and Rules
```txt
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:categoryId
DELETE /api/categories/:categoryId

GET    /api/category-rules
POST   /api/category-rules
PATCH  /api/category-rules/:ruleId
DELETE /api/category-rules/:ruleId
POST   /api/category-rules/apply
```

### Dashboard
```txt
GET    /api/dashboards
POST   /api/dashboards
PATCH  /api/dashboards/:dashboardId
DELETE /api/dashboards/:dashboardId
GET    /api/dashboard-data
```

## Backend Ports
### TransactionRepositoryPort
```ts
export type TransactionRepositoryPort = {
	insertMany: (transactions: Transaction[]) => Promise<ImportResult>
	findByAccountAndDateRange: (input: DateRangeQuery) => Promise<Transaction[]>
	deleteByUploadId: (uploadId: string) => Promise<void>
	deleteByAccountMonth: (input: DeleteAccountMonthInput) => Promise<void>
}
```

### CsvFileStoragePort
```ts
export type CsvFileStoragePort = {
	store: (input: StoreCsvFileInput) => Promise<StoredCsvFile>
	read: (storedFilePath: string) => Promise<string>
	delete: (storedFilePath: string) => Promise<void>
}
```

### CsvParserPort
```ts
export type CsvParserPort = {
	parse: (csvText: string) => Promise<ParsedCsvFile>
}
```

## Backend Services
Services coordinate use cases and ports. Keep them thin.

```txt
CsvUploadService
CsvPreviewService
CsvImportService
CategoryRuleService
DashboardAggregationService
```

## Error Handling
Use typed domain errors and translate them at the HTTP boundary.

```ts
type AppErrorCode =
	| 'account_not_found'
	| 'upload_not_found'
	| 'invalid_csv_mapping'
	| 'csv_parse_failed'
	| 'duplicate_upload'
	| 'import_failed'
```

Routes should never leak raw stack traces to frontend responses.

## Money Handling
Store money as integer cents.

Formatting dollars belongs in frontend formatting utilities, not backend domain logic.

## Validation
Use route schema validation for request payloads.

Domain validation still belongs in domains so it is testable outside Fastify.
