// src/db/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel } from 'drizzle-orm';

export const family = sqliteTable('family', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('invite_code'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  activeFamilyId: text('active_family_id').references(() => family.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  type: text('type').notNull().default('family'),
  order: integer('order').notNull().default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  familyId: text('family_id')
    .notNull()
    .references(() => family.id, { onDelete: 'cascade' }),
  createdById: text('created_by_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const insertItemSchema = createInsertSchema(items)
  .omit({
    id: true,
    familyId: true,
    createdById: true,
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
    type: true,
    order: true,
  })
  .partial();

export type User = InferSelectModel<typeof user>;
export type Item = InferSelectModel<typeof items>;