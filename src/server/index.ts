// src/server/index.ts

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { items } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod'; // 追加
import { zValidator } from '@hono/zod-validator'; // 追加

// Cloudflare環境変数の型定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

const routes = app
  // 1. 買い物リストの全件取得 (GET)
  .get('/items', async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(items).orderBy(desc(items.createdAt)).all();
    return c.json(result);
  })

  // 2. アイテムの追加 (POST)
  .post(
    '/items',
    // ▼ バリデーション定義: { label: string } を受け取ることを明示
    zValidator(
      'json',
      z.object({
        label: z.string(),
      })
    ),
    async (c) => {
      const db = drizzle(c.env.DB);
      const body = c.req.valid('json'); // ▼ バリデーション済みのデータを取得

      const result = await db.insert(items).values({ label: body.label }).returning().get();

      return c.json(result);
    }
  )

  // 3. 完了状態の切り替え (PATCH)
  .patch(
    '/items/:id',
    // ▼ バリデーション定義: { isCompleted: boolean } を受け取ることを明示
    zValidator(
      'json',
      z.object({
        isCompleted: z.boolean(),
      })
    ),
    async (c) => {
      const db = drizzle(c.env.DB);
      const id = Number(c.req.param('id'));
      const body = c.req.valid('json'); // ▼ バリデーション済みのデータを取得

      const result = await db
        .update(items)
        .set({ isCompleted: body.isCompleted })
        .where(eq(items.id, id))
        .returning()
        .get();

      return c.json(result);
    }
  )

  // 4. 削除 (DELETE)
  .delete('/items/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = Number(c.req.param('id'));

    await db.delete(items).where(eq(items.id, id)).execute();

    return c.json({ success: true });
  });

// フロントエンドで使う型定義をエクスポート
export type AppType = typeof routes;

export default app;
