// src/pages/api/family/join.ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { user, family } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  // 1. ログインチェック
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. 招待コードを受け取る
  const body = (await context.request.json()) as { inviteCode: string };
  const inviteCode = body.inviteCode?.toUpperCase();

  if (!inviteCode) {
    return new Response('Invite code is required', { status: 400 });
  }

  const db = drizzle(env.DB);

  // 3. そのコードを持つ家族を探す
  const targetFamily = await db
    .select()
    .from(family)
    .where(eq(family.inviteCode, inviteCode))
    .get();

  if (!targetFamily) {
    return new Response('Invalid invite code', { status: 404 });
  }

  // 4. ユーザーをその家族に移動させる！（合流）
  await db
    .update(user)
    .set({ activeFamilyId: targetFamily.id })
    .where(eq(user.id, session.user.id));

  return new Response(
    JSON.stringify({
      success: true,
      familyName: targetFamily.name,
    })
  );
};
