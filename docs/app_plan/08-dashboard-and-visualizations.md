# Dashboard and Visualization Plan

## Dashboard Goals
The dashboard should make money flow understandable quickly.

The user should be able to answer:
- How much came in?
- How much went out?
- Where did money go?
- How did this month compare to other months?
- How much of my outgoing money was actually positive/savings movement?

## Dashboard Filters
- Account
- Timeframe
  - month
  - year
  - all-time
  - custom later
- Include positive outflows as income toggle

## MVP Widgets
### Inflow vs Outflow Summary
Cards:
- total inflow
- total outflow
- net flow
- positive outflow total

### Monthly Cash Flow
Line or bar chart showing:
- inflow
- outflow
- net

### Category Breakdown
Bar chart or donut chart showing spending by category.

### Positive Outflow Impact
Shows how dashboard numbers change when positive outflows are treated as income/savings movement.

### Top Descriptions / Merchants
Top normalized descriptions by total spend.

## Charting Recommendation
Use `visx` first.

Reasoning:
- It gives lower-level control for a polished custom dashboard.
- It avoids fighting a prebuilt chart library.
- It is modular.
- It fits React and TypeScript well.

Use `uPlot` later only if a chart needs extremely high-performance time-series rendering.

## Dashboard Data API
Use backend aggregation endpoint:

```txt
GET /api/dashboard-data?accountId=...&range=year&year=2026&includePositiveOutflowsAsIncome=false
```

Response shape:

```ts
type DashboardDataResponse = {
	summary: MoneyFlowSummaryResponse
	monthlyCashFlow: MonthlyCashFlowPointResponse[]
	categoryBreakdown: CategoryBreakdownItemResponse[]
	positiveOutflowImpact: PositiveOutflowImpactResponse
	topDescriptions: TopDescriptionResponse[]
}
```

## Aggregation Rules
### Default
```txt
amount > 0 => inflow
amount < 0 => outflow
```

### Include Positive Outflows as Income
```txt
amount < 0 && outflowClassification === 'positive_outflow' => positive side
amount < 0 && outflowClassification !== 'positive_outflow' => expense side
```

The raw transaction amount never changes.

## Dashboard Customization
Store widgets and layout in DB.

MVP customization:
- show/hide widget
- reorder widgets
- save dashboard name

Later:
- drag and resize grid
- per-widget settings
- multiple dashboards

## Visual Design Direction
- Clean stat cards.
- Strong whitespace.
- Subtle grid lines.
- Good dark mode contrast.
- Minimal animation.
- No chart junk.

## Performance Rules
- Backend returns aggregated chart data, not raw full transaction sets.
- Frontend chart components should be pure renderers.
- Presenter prepares display labels and formatted values.
- Avoid recalculating chart data in React render.
