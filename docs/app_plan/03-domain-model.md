# Domain Model

## Account
Represents a bank account, credit card, savings account, or other financial source that owns uploads and transactions.

```ts
type Account = {
	id: string
	name: string
	type: AccountType
	createdAt: string
	updatedAt: string
}

type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'other'
```

## CsvUpload
Represents one uploaded CSV file.

```ts
type CsvUpload = {
	id: string
	accountId: string
	fileName: string
	storedFilePath: string
	originalFileHash: string
	statementYear: number | null
	statementMonth: number | null
	status: CsvUploadStatus
	createdAt: string
}

type CsvUploadStatus = 'uploaded' | 'mapped' | 'imported' | 'failed' | 'deleted'
```

## CsvColumnMapping
Stores how CSV columns map to canonical transaction fields.

```ts
type CsvColumnMapping = {
	id: string
	accountId: string
	name: string
	dateColumn: string
	descriptionColumn: string
	amountColumn: string | null
	debitColumn: string | null
	creditColumn: string | null
	categoryColumn: string | null
	notesColumn: string | null
	dateFormat: string | null
	createdAt: string
	updatedAt: string
}
```

A mapping can support either:
- one signed amount column
- separate debit and credit columns

## Transaction
Canonical transaction model after parsing.

```ts
type Transaction = {
	id: string
	accountId: string
	uploadId: string
	transactionDate: string
	description: string
	normalizedDescription: string
	amount: number
	currency: string
	categoryId: string | null
	subcategoryId: string | null
	outflowClassification: OutflowClassification | null
	fingerprint: string
	createdAt: string
	updatedAt: string
}

type OutflowClassification = 'negative_outflow' | 'positive_outflow'
```

## Category
Categories support optional parent/child hierarchy.

```ts
type Category = {
	id: string
	parentCategoryId: string | null
	name: string
	createdAt: string
	updatedAt: string
}
```

Examples:

```txt
Housing
  Rent
  Utilities
Food
  Groceries
  Restaurants
Savings
  Emergency Fund
```

## CategoryRule
Rules map transaction descriptions to categories.

```ts
type CategoryRule = {
	id: string
	name: string
	matchColumn: CategoryRuleMatchColumn
	matchType: CategoryRuleMatchType
	matchValue: string
	categoryId: string
	subcategoryId: string | null
	outflowClassification: OutflowClassification | null
	priority: number
	isEnabled: boolean
	createdAt: string
	updatedAt: string
}

type CategoryRuleMatchColumn = 'description'
type CategoryRuleMatchType = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex'
```

Rules are global across accounts by default. This means a rule like description contains `zelle transaction` maps to `Rent` for every account unless later account-specific overrides are added.

## Dashboard
Stores the user's dashboard layout and selected widgets.

```ts
type Dashboard = {
	id: string
	name: string
	accountId: string | null
	dateRangePreset: DateRangePreset
	includePositiveOutflowsAsIncome: boolean
	createdAt: string
	updatedAt: string
}

type DateRangePreset = 'month' | 'year' | 'all_time' | 'custom'
```

## DashboardWidget
```ts
type DashboardWidget = {
	id: string
	dashboardId: string
	type: DashboardWidgetType
	title: string
	position: DashboardWidgetPosition
	settings: Record<string, unknown>
	createdAt: string
	updatedAt: string
}

type DashboardWidgetType =
	| 'inflow_outflow_summary'
	| 'monthly_cash_flow'
	| 'category_breakdown'
	| 'income_vs_expenses'
	| 'positive_outflow_impact'
	| 'top_merchants'
```

## Transaction Fingerprint
Use a deterministic hash to dedupe imports.

Recommended fingerprint parts:

```txt
accountId | transactionDate | normalizedDescription | amount
```

Optional later additions:
- posted date
- check number
- bank-provided transaction id

## Money Flow Aggregation Rules
Default view:
- positive amounts count as inflow
- negative amounts count as outflow
- positive outflow classification still remains an outflow by default

When `includePositiveOutflowsAsIncome` is enabled:
- negative amount with `positive_outflow` counts toward the positive/income side of dashboard summaries
- raw amount remains negative in transaction detail views
