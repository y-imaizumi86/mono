// src/pages/api/family/index.ts

import type { APIRoute } from "astro";
import { createAuth } from "@/lib/auth";
import { drizzle } from "drizzle-orm/d1";
import { user, family } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const db = drizzle(env.DB);

  // ユーザーの現在の家族IDを取得
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();

  if (!dbUser?.activeFamilyId) {
    return new Response("Family not found", { status: 404 });
  }

  // 家族の詳細（招待コードなど）を取得
  const myFamily = await db.select().from(family).where(eq(family.id, dbUser.activeFamilyId)).get();

  return new Response(JSON.stringify(myFamily));
};