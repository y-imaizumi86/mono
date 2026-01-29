// src/pages/api/items/index.ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { family, items, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// 取得 (GET)
export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  // 1. ログインチェック
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const db = drizzle(env.DB);

  // 2. 最新のユーザー情報をDBから取得
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();

  if (!dbUser) {
    return new Response('User not found', { status: 404 });
  }

  let currentFamilyId = dbUser.activeFamilyId;

  if (!currentFamilyId) {
    // 1. 新しい家族を作成
    const newFamily = await db
      .insert(family)
      .values({
        id: crypto.randomUUID(),
        name: `${dbUser.name}家`,
        inviteCode: crypto.randomUUID().slice(0, 6).toUpperCase(),
        createdAt: new Date(),
      })
      .returning()
      .get();

    // 2. ユーザーをその家族に所属させる
    await db.update(user).set({ activeFamilyId: newFamily.id }).where(eq(user.id, dbUser.id));

    currentFamilyId = newFamily.id;
  }

  // 3. 「自分の家族」のアイテムを取得
  const familyItems = await db
    .select()
    .from(items)
    .where(eq(items.familyId, currentFamilyId))
    .orderBy(desc(items.createdAt));

  return new Response(JSON.stringify(familyItems), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// 追加 (POST)
export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  // 1. ログインチェック
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 2. リクエストボディからデータを取り出す
  const body = (await context.request.json()) as { label: string };
  const label = body.label;

  if (!label) {
    return new Response('Label is required', { status: 400 });
  }

  // 3. DBに保存（自分のIDを紐付ける）
  const db = drizzle(env.DB);

  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();

  if (!dbUser?.activeFamilyId) {
    return new Response('Family not found', { status: 400 });
  }

  const newItem = await db
    .insert(items)
    .values({
      label,
      familyId: dbUser.activeFamilyId,
      createdById: session.user.id,
    })
    .returning();

  return new Response(JSON.stringify(newItem[0]), { status: 201 });
};
