// src/db/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel } from 'drizzle-orm';

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  listType: text('list_type').notNull().default('shared'), // 'shared' | 'private'
  ownerEmail: text('owner_email').notNull(),
  order: integer('order').notNull().default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const insertItemSchema = createInsertSchema(items)
  .omit({
    id: true,
    ownerEmail: true,
    createdAt: true,
    isCompleted: true,
  })
  .extend({
    text: z.string().min(1, '買い物の内容は必須です').max(100, '買い物の内容が長すぎます'),
  });

export const updateItemSchema = createInsertSchema(items)
  .pick({
    text: true,
    isCompleted: true,
    listType: true,
    order: true,
  })
  .partial();

export type Item = InferSelectModel<typeof items>;
