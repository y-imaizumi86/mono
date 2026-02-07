CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`list_type` text DEFAULT 'shared' NOT NULL,
	`owner_email` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
