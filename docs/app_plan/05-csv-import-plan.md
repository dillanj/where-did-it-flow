# CSV Import Plan

## Goals
- Support arbitrary CSV formats.
- Let the user map CSV columns to canonical transaction fields.
- Store raw uploads.
- Preview transactions before import.
- Deduplicate transactions.
- Apply category rules automatically.

## Import Flow
1. User selects an account.
2. User uploads a CSV file.
3. Backend stores raw CSV file.
4. Backend parses headers and sample rows.
5. Frontend shows column mapping UI.
6. User maps columns.
7. Backend validates mapping.
8. Backend previews normalized transactions.
9. Backend applies existing category rules.
10. User edits categories/classifications if needed.
11. User confirms import.
12. Backend persists transactions.
13. Dashboard updates.

## Canonical Required Fields
At minimum, the user must map:
- date
- description
- amount, or debit + credit

Optional fields:
- category
- notes
- transaction id

## Amount Parsing
Support two formats:

### Signed Amount Column
```txt
Date, Description, Amount
2026-01-01, Paycheck, 2500.00
2026-01-02, Rent, -1850.00
```

### Debit/Credit Columns
```txt
Date, Description, Debit, Credit
2026-01-01, Paycheck, , 2500.00
2026-01-02, Rent, 1850.00,
```

Normalize to integer cents.

## Date Parsing
MVP should support:
- ISO: `2026-01-31`
- US: `01/31/2026`
- US short year: `01/31/26`

If parsing is ambiguous, ask user to select the date format during mapping.

## Header Detection
Use the first row as headers for MVP.

Later, add support for CSVs with leading metadata rows.

## Upload Preview
Preview response should include:
- parsed row count
- invalid row count
- duplicate row count
- sample parsed transactions
- inflow total
- outflow total
- applied category count
- unmapped transaction count

## Deduplication
Generate fingerprint from:

```txt
accountId | transactionDate | normalizedDescription | amountInCents
```

A transaction is duplicate if `(accountId, fingerprint)` already exists.

During preview, show duplicates but mark them as skipped.

During import, skip duplicates by default.

## Bad Data Management
User can delete:
- an entire upload
- a selected month for an account

This makes it safe to recover from wrong mappings or bad CSVs.

## Mapping Persistence
Column mappings are saved per account because different banks may export different formats.

Category rules are global by default so they carry across accounts.

## Category Rule Auto-Apply
On preview and import:
1. Normalize description.
2. Sort enabled rules by priority ascending.
3. Apply first matching rule.
4. Assign category/subcategory/classification.
5. Stop unless multi-rule behavior is added later.

## Rule Match Types
MVP:
- contains
- equals

Later:
- starts with
- ends with
- regex

## Positive Outflow Handling
If transaction amount is negative, user can classify it as:
- negative outflow
- positive outflow

This classification does not change the amount. It only changes dashboard aggregation when the relevant toggle is enabled.
