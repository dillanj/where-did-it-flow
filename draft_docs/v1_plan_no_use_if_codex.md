# Cash Flow Chart Generator - Implementation Plan

## Goal

Build a client-side app that:
- Uploads CSV financial data
- Processes transactions
- Applies labeling rules
- Generates cash flow charts
- Exports SVG / PNG / HTML

---

## Phase 1: Setup

- Initialize Vite + React + TypeScript
- Install:
  - papaparse
  - d3 (or recharts)
- Create folder structure:
  - src/feature-cashflow/{domain,presenters,adapters,components}

---

## Phase 2: Domain Models

Create:

- Transaction
- CashFlowDataset
- LabelRule
- CategorizedTransaction

---

## Phase 3: CSV Adapter

- Parse CSV using papaparse
- Normalize rows → Transaction[]
- Handle:
  - Dates
  - Amounts (+/-)
  - Descriptions

---

## Phase 4: Labeling Engine

- Apply LabelRule[] to transactions
- Matching:
  - contains
  - startsWith
  - regex

Output:
- Transactions with labels

---

## Phase 5: Aggregation

- Group by:
  - Month
  - Label
- Calculate:
  - Total inflow
  - Total outflow

---

## Phase 6: Presenter

- Manage:
  - Uploaded file
  - Parsed data
  - Label rules
  - Aggregated data

Expose:
- uploadCSV(file)
- addRule(rule)
- removeRule(id)
- getChartData()

---

## Phase 7: UI Components

- FileUpload
- RuleBuilder
- RuleList
- ChartView
- ExportButtons

---

## Phase 8: Chart

- Render SVG chart
- Options:
  - Bar chart (monthly inflow/outflow)
  - Stacked by label

---

## Phase 9: Export

- SVG download
- Convert SVG → PNG
- Generate downloadable index.html with embedded SVG

---

## Phase 10: UX Improvements

- Rule preview (match count + sum)
- Editable rules
- Instant reprocessing

---

## Stretch Ideas

- Save/load rules locally
- Drag-and-drop CSV
- Multi-account support
- AI auto-labeling (future)

---

## Success Criteria

- No backend required
- No data persisted
- Clean architecture maintained
- Fast processing in browser
