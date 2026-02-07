// src/pages/api/items/reorder.ts

import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { items as ItemsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
  const userEmail = locals.userEmail;
  if (!userEmail) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const parseResult = reorderSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response('Invalid data', { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);
  const { updates } = parseResult.data;

  try {
    const batchQueries = updates.map((update) => {
      return db.update(ItemsTable).set({ order: update.order }).where(eq(ItemsTable.id, update.id));
    });

    await db.batch(batchQueries as any);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('Failed to reorder', { status: 500 });
  }
};
