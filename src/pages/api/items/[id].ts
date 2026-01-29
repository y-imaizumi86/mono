// src/pages/api/items/[id].ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { items, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 削除 (DELETE)
export const DELETE: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: context.request.headers });

  if (!session) return new Response('Unauthorized', { status: 401 });

  const id = Number(context.params.id);
  const db = drizzle(env.DB);

  // 実行者の家族IDを取得
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();
  if (!dbUser?.activeFamilyId) return new Response('Forbidden', { status: 403 });

  await db.delete(items).where(
    and(
      eq(items.id, id),
      eq(items.familyId, dbUser.activeFamilyId)
    )
  );

  return new Response(null, { status: 204 });
};

// 更新 (PATCH) - 完了状態の切り替えなど
export const PATCH: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: context.request.headers });

  if (!session) return new Response('Unauthorized', { status: 401 });

  const id = Number(context.params.id);
  const body = (await context.request.json()) as { isCompleted: boolean };
  const db = drizzle(env.DB);

  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();
  if (!dbUser?.activeFamilyId) return new Response('Forbidden', { status: 403 });

  // 家族チェックを通して更新
  const updated = await db
    .update(items)
    .set({ isCompleted: body.isCompleted })
    .where(
      and(
        eq(items.id, id),
        eq(items.familyId, dbUser.activeFamilyId)
      )
    )
    .returning();

  return new Response(JSON.stringify(updated[0]));
};
