// src/pages/api/family/leave.ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  if (!session) return new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB);

  await db.update(user).set({ activeFamilyId: null }).where(eq(user.id, session.user.id));

  return new Response(JSON.stringify({ success: true }));
};
