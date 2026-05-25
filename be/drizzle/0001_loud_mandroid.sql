CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_category_id` text,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `category_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`match_column` text NOT NULL,
	`match_type` text NOT NULL,
	`match_value` text NOT NULL,
	`category_id` text NOT NULL,
	`subcategory_id` text,
	`outflow_classification` text,
	`priority` integer NOT NULL,
	`is_enabled` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategory_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_category_rules_enabled_priority` ON `category_rules` (`is_enabled`,`priority`);--> statement-breakpoint
CREATE TABLE `csv_column_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`date_column` text NOT NULL,
	`description_column` text NOT NULL,
	`amount_column` text,
	`debit_column` text,
	`credit_column` text,
	`category_column` text,
	`notes_column` text,
	`date_format` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `csv_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`file_name` text NOT NULL,
	`stored_file_path` text NOT NULL,
	`original_file_hash` text NOT NULL,
	`statement_year` integer,
	`statement_month` integer,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_csv_uploads_account_month` ON `csv_uploads` (`account_id`,`statement_year`,`statement_month`);--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`dashboard_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`position_json` text NOT NULL,
	`settings_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dashboard_id`) REFERENCES `dashboards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dashboards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`account_id` text,
	`date_range_preset` text NOT NULL,
	`include_positive_outflows_as_income` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`upload_id` text NOT NULL,
	`transaction_date` text NOT NULL,
	`description` text NOT NULL,
	`normalized_description` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`category_id` text,
	`subcategory_id` text,
	`outflow_classification` text,
	`fingerprint` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`upload_id`) REFERENCES `csv_uploads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategory_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_transactions_account_fingerprint` ON `transactions` (`account_id`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `idx_transactions_account_date` ON `transactions` (`account_id`,`transaction_date`);--> statement-breakpoint
CREATE INDEX `idx_transactions_upload` ON `transactions` (`upload_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_category` ON `transactions` (`category_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_app_metadata`("key", "value", "updated_at") SELECT "key", "value", "updated_at" FROM `app_metadata`;--> statement-breakpoint
DROP TABLE `app_metadata`;--> statement-breakpoint
ALTER TABLE `__new_app_metadata` RENAME TO `app_metadata`;--> statement-breakpoint
PRAGMA foreign_keys=ON;