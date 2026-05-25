# API Contracts

## Principles
- API responses should be explicit and stable.
- Backend response models should not leak SQLite records.
- Frontend adapters unpack API responses into frontend domain models.
- Use integer cents for money in API payloads.
- Use ISO strings for dates.

## Accounts
### Create Account
```txt
POST /api/accounts
```

Request:
```ts
type CreateAccountRequest = {
	name: string
	type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'other'
}
```

Response:
```ts
type AccountResponse = {
	id: string
	name: string
	type: string
	createdAt: string
	updatedAt: string
}
```

## Upload CSV
```txt
POST /api/accounts/:accountId/uploads
```

Multipart form:
```txt
file: csv file
```

Response:
```ts
type CsvUploadResponse = {
	id: string
	accountId: string
	fileName: string
	status: string
	headers: string[]
	sampleRows: Record<string, string>[]
	createdAt: string
}
```

## Preview Upload
```txt
POST /api/uploads/:uploadId/preview
```

Request:
```ts
type PreviewUploadRequest = {
	columnMapping: DraftCsvColumnMappingRequest
}
```

Response:
```ts
type UploadPreviewResponse = {
	uploadId: string
	parsedRowCount: number
	invalidRowCount: number
	duplicateRowCount: number
	inflowTotalCents: number
	outflowTotalCents: number
	appliedCategoryCount: number
	unmappedTransactionCount: number
	rows: UploadPreviewRowResponse[]
}
```

## Confirm Import
```txt
POST /api/uploads/:uploadId/import
```

Request:
```ts
type ImportUploadRequest = {
	columnMappingId?: string
	columnMapping?: DraftCsvColumnMappingRequest
	skipDuplicates: boolean
}
```

Response:
```ts
type ImportUploadResponse = {
	uploadId: string
	insertedCount: number
	skippedDuplicateCount: number
	invalidRowCount: number
}
```

## Category Rule
```txt
POST /api/category-rules
```

Request:
```ts
type CreateCategoryRuleRequest = {
	name: string
	matchColumn: 'description'
	matchType: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex'
	matchValue: string
	categoryId: string
	subcategoryId: string | null
	outflowClassification: 'negative_outflow' | 'positive_outflow' | null
	priority: number
	isEnabled: boolean
}
```

## Dashboard Data
```txt
GET /api/dashboard-data
```

Query:
```ts
type DashboardDataQuery = {
	accountId?: string
	range: 'month' | 'year' | 'all_time'
	year?: string
	month?: string
	includePositiveOutflowsAsIncome: 'true' | 'false'
}
```

Response:
```ts
type DashboardDataResponse = {
	summary: {
		inflowTotalCents: number
		outflowTotalCents: number
		netTotalCents: number
		positiveOutflowTotalCents: number
	}
	monthlyCashFlow: {
		month: string
		inflowCents: number
		outflowCents: number
		netCents: number
	}[]
	categoryBreakdown: {
		categoryId: string
		categoryName: string
		totalCents: number
		transactionCount: number
	}[]
	topDescriptions: {
		description: string
		totalCents: number
		transactionCount: number
	}[]
}
```
