// src/pages/api/items/reorder.ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { items as ItemsTable, user as UserTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const reorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = createAuth(locals.runtime.env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const parseResult = reorderSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response('Invalid data', { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);

  const dbUser = await db.select().from(UserTable).where(eq(UserTable.id, session.user.id)).get();
  if (!dbUser?.activeFamilyId) return new Response('Forbidden', { status: 403 });

  const { updates } = parseResult.data;

  try {
    const batchQueries = updates.map((update) => {
      return db
        .update(ItemsTable)
        .set({ order: update.order })
        .where(
          and(
            eq(ItemsTable.id, update.id),
            eq(ItemsTable.familyId, dbUser.activeFamilyId!)
          )
        );
    });

    await db.batch(batchQueries as any);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('Failed to reorder', { status: 500 });
  }
};