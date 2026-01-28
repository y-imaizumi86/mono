// src/db/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 買い物アイテムテーブル
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(), // 商品名
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false), // 完了フラグ
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
