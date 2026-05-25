# Database Plan

## Database Choice
Use SQLite with Drizzle ORM and `better-sqlite3`.

Store the SQLite file at:

```txt
be/data/money-flow.sqlite
```

Raw CSV files should be stored at:

```txt
be/data/uploads/{accountId}/{uploadId}.csv
```

## Tables
### accounts
```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### csv_uploads
```sql
CREATE TABLE csv_uploads (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  stored_file_path TEXT NOT NULL,
  original_file_hash TEXT NOT NULL,
  statement_year INTEGER,
  statement_month INTEGER,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### csv_column_mappings
```sql
CREATE TABLE csv_column_mappings (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date_column TEXT NOT NULL,
  description_column TEXT NOT NULL,
  amount_column TEXT,
  debit_column TEXT,
  credit_column TEXT,
  category_column TEXT,
  notes_column TEXT,
  date_format TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### categories
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  parent_category_id TEXT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_category_id) REFERENCES categories(id)
);
```

### category_rules
```sql
CREATE TABLE category_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  match_column TEXT NOT NULL,
  match_type TEXT NOT NULL,
  match_value TEXT NOT NULL,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  outflow_classification TEXT,
  priority INTEGER NOT NULL,
  is_enabled INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES categories(id)
);
```

### transactions
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  description TEXT NOT NULL,
  normalized_description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  category_id TEXT,
  subcategory_id TEXT,
  outflow_classification TEXT,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (upload_id) REFERENCES csv_uploads(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES categories(id),
  UNIQUE(account_id, fingerprint)
);
```

Store money as integer cents, not floating point dollars.

### dashboards
```sql
CREATE TABLE dashboards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT,
  date_range_preset TEXT NOT NULL,
  include_positive_outflows_as_income INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### dashboard_widgets
```sql
CREATE TABLE dashboard_widgets (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  position_json TEXT NOT NULL,
  settings_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
);
```

## Indexes
```sql
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date);
CREATE INDEX idx_transactions_upload ON transactions(upload_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_csv_uploads_account_month ON csv_uploads(account_id, statement_year, statement_month);
CREATE INDEX idx_category_rules_enabled_priority ON category_rules(is_enabled, priority);
```

## Deletion Strategy
### Delete Upload
Deleting an upload should:
1. Delete transactions linked to the upload.
2. Mark the upload as deleted or remove it.
3. Keep the raw CSV only if user chooses archive behavior.

MVP should hard delete imported transactions but keep an audit path simple.

### Delete Month
Deleting a month should:
1. Find uploads for account + year + month.
2. Delete transactions in that account and month.
3. Mark affected uploads as deleted or partially deleted.

Prefer deleting by upload where possible because it is safer than deleting by date range only.

## Migration Plan
Use Drizzle migrations.

```txt
be/drizzle/
be/src/db/schema.ts
be/src/db/migrate.ts
```

Root start command should run migrations before starting the API.
