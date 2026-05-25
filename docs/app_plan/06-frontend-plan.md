# Frontend Plan

## Frontend Stack
- Vite
- React
- TypeScript
- Tailwind
- Vitest
- `@tcn/state`
- `visx`

## Directory Structure
```txt
fe/src/app/
  accounts/
    domain/
    adapter/
    presenter/
    view/
  csv-import/
    domain/
    adapter/
    presenter/
    view/
  category-rules/
    domain/
    adapter/
    presenter/
    view/
  dashboard/
    domain/
    adapter/
    presenter/
    view/
  theme/
    domain/
    presenter/
    view/
  shared/
    api/
    components/
    formatting/
    layout/
```

## @tcn/state Usage Pattern
Codex should follow this pattern consistently.

### Domain
```ts
import { signal, runner } from '@tcn/state'

export type CsvImportDomainState = {
	selectedAccountId: string | null
	uploadPreview: CsvUploadPreview | null
	columnMapping: DraftCsvColumnMapping | null
}

export const createInitialCsvImportDomainState = (): CsvImportDomainState => ({
	selectedAccountId: null,
	uploadPreview: null,
	columnMapping: null,
})

export class CsvImportDomain {
	readonly state = signal<CsvImportDomainState>(createInitialCsvImportDomainState())

	readonly uploadCsvRunner = runner(async (file: File) => {
		// call port, update state
	})

	constructor(private readonly _api: CsvImportApiPort) {}

	selectAccount = (accountId: string): void => {
		this.state.set({
			...this.state.get(),
			selectedAccountId: accountId,
		})
	}
}
```

### Presenter
```ts
import { signal } from '@tcn/state'

export type CsvImportViewModel = {
	canUpload: boolean
	previewRows: CsvPreviewRowViewModel[]
}

export class CsvImportPresenter {
	readonly viewModel = signal<CsvImportViewModel>({
		canUpload: false,
		previewRows: [],
	})

	constructor(private readonly _domain: CsvImportDomain) {
		this._domain.state.subscribe(this._syncViewModel)
		this._syncViewModel(this._domain.state.get())
	}

	uploadCsv = (file: File): void => {
		void this._domain.uploadCsvRunner.run(file)
	}

	private readonly _syncViewModel = (state: CsvImportDomainState): void => {
		this.viewModel.set({
			canUpload: state.selectedAccountId !== null,
			previewRows: this._toPreviewRows(state),
		})
	}

	private readonly _toPreviewRows = (state: CsvImportDomainState): CsvPreviewRowViewModel[] => {
		return state.uploadPreview?.rows ?? []
	}
}
```

### View
```tsx
import { useSignalValue } from '@tcn/state/react'

export const CsvImportWrapper = ({ presenter }: CsvImportWrapperProps) => {
	const viewModel = useSignalValue(presenter.viewModel)

	return (
		<CsvImportView
			viewModel={viewModel}
			onUploadCsv={presenter.uploadCsv}
		/>
	)
}
```

## Feature List
### Accounts
- Create account
- Rename account
- Select account
- View account timeframes

### CSV Import
- Upload file
- Map columns
- Preview parsed transactions
- Confirm import
- Delete upload
- Delete month

### Category Rules
- Create category
- Create subcategory
- Create mapping rule
- Prioritize rules
- Enable/disable rules
- Apply rules to existing imported transactions

### Dashboard
- Select account
- Select timeframe: month, year, all-time
- Toggle positive outflows as income
- Add/remove dashboard widgets
- Save dashboard layout
- Render charts

### Theme
- Light/dark mode
- Persist preference locally through backend or local storage adapter

## Chart Components
Create reusable chart primitives:

```txt
shared/components/charts/
  cash-flow-line-chart.tsx
  category-bar-chart.tsx
  category-donut-chart.tsx
  summary-stat-card.tsx
```

Charts should receive view models, not raw transaction rows.

## UI Performance Rules
- Do not render full transaction lists unless paginated or virtualized.
- Memoize expensive chart transformations in presenters/domains, not views.
- Keep dashboard aggregation on the backend where possible.
- Use skeletons for loading states.
- Avoid unnecessary React state when presenter state already exists.
