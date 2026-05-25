import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

const accountTypes = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'other'
] as const

const csvUploadStatuses = [
  'uploaded',
  'mapped',
  'imported',
  'failed',
  'deleted'
] as const

const categoryRuleMatchColumns = ['description'] as const

const categoryRuleMatchTypes = [
  'contains',
  'equals',
  'starts_with',
  'ends_with',
  'regex'
] as const

const outflowClassifications = [
  'negative_outflow',
  'positive_outflow'
] as const

const dateRangePresets = ['month', 'year', 'all_time', 'custom'] as const

const dashboardWidgetTypes = [
  'inflow_outflow_summary',
  'monthly_cash_flow',
  'category_breakdown',
  'income_vs_expenses',
  'positive_outflow_impact',
  'top_merchants'
] as const

export const appMetadataTable = sqliteTable('app_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const accountsTable = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypes }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const csvUploadsTable = sqliteTable(
  'csv_uploads',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accountsTable.id),
    fileName: text('file_name').notNull(),
    storedFilePath: text('stored_file_path').notNull(),
    originalFileHash: text('original_file_hash').notNull(),
    statementYear: integer('statement_year'),
    statementMonth: integer('statement_month'),
    status: text('status', { enum: csvUploadStatuses }).notNull(),
    createdAt: text('created_at').notNull()
  },
  (table) => [
    index('idx_csv_uploads_account_month').on(
      table.accountId,
      table.statementYear,
      table.statementMonth
    )
  ]
)

export const csvColumnMappingsTable = sqliteTable('csv_column_mappings', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accountsTable.id),
  name: text('name').notNull(),
  dateColumn: text('date_column').notNull(),
  descriptionColumn: text('description_column').notNull(),
  amountColumn: text('amount_column'),
  debitColumn: text('debit_column'),
  creditColumn: text('credit_column'),
  categoryColumn: text('category_column'),
  notesColumn: text('notes_column'),
  dateFormat: text('date_format'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const categoriesTable = sqliteTable('categories', {
  id: text('id').primaryKey(),
  parentCategoryId: text('parent_category_id').references(
    (): AnySQLiteColumn => categoriesTable.id
  ),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const categoryRulesTable = sqliteTable(
  'category_rules',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    matchColumn: text('match_column', { enum: categoryRuleMatchColumns }).notNull(),
    matchType: text('match_type', { enum: categoryRuleMatchTypes }).notNull(),
    matchValue: text('match_value').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categoriesTable.id),
    subcategoryId: text('subcategory_id').references(() => categoriesTable.id),
    outflowClassification: text('outflow_classification', {
      enum: outflowClassifications
    }),
    priority: integer('priority').notNull(),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (table) => [
    index('idx_category_rules_enabled_priority').on(
      table.isEnabled,
      table.priority
    )
  ]
)

export const transactionsTable = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accountsTable.id),
    uploadId: text('upload_id')
      .notNull()
      .references(() => csvUploadsTable.id),
    transactionDate: text('transaction_date').notNull(),
    description: text('description').notNull(),
    normalizedDescription: text('normalized_description').notNull(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    categoryId: text('category_id').references(() => categoriesTable.id),
    subcategoryId: text('subcategory_id').references(() => categoriesTable.id),
    outflowClassification: text('outflow_classification', {
      enum: outflowClassifications
    }),
    fingerprint: text('fingerprint').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (table) => [
    uniqueIndex('uq_transactions_account_fingerprint').on(
      table.accountId,
      table.fingerprint
    ),
    index('idx_transactions_account_date').on(table.accountId, table.transactionDate),
    index('idx_transactions_upload').on(table.uploadId),
    index('idx_transactions_category').on(table.categoryId)
  ]
)

export const dashboardsTable = sqliteTable('dashboards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  accountId: text('account_id').references(() => accountsTable.id),
  dateRangePreset: text('date_range_preset', { enum: dateRangePresets }).notNull(),
  includePositiveOutflowsAsIncome: integer('include_positive_outflows_as_income', {
    mode: 'boolean'
  }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const dashboardWidgetsTable = sqliteTable('dashboard_widgets', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id')
    .notNull()
    .references(() => dashboardsTable.id),
  type: text('type', { enum: dashboardWidgetTypes }).notNull(),
  title: text('title').notNull(),
  positionJson: text('position_json').notNull(),
  settingsJson: text('settings_json').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})
