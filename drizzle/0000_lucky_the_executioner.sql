CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
