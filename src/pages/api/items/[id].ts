// src/pages/api/items/[id].ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import { items as ItemsTable, user as UserTable, updateItemSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const auth = createAuth(locals.runtime.env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) return new Response('Unauthorized', { status: 401 });

  const itemId = params.id;
  if (!itemId) return new Response('ID Required', { status: 400 });

  const body = await request.json();
  const parseResult = updateItemSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);
  const updates = parseResult.data;

  const dbUser = await db.select().from(UserTable).where(eq(UserTable.id, session.user.id)).get();
  if (!dbUser?.activeFamilyId) return new Response('Forbidden', { status: 403 });

  if (updates.type) {
    const targetItem = await db
      .select()
      .from(ItemsTable)
      .where(eq(ItemsTable.id, itemId))
      .get();

    if (!targetItem) return new Response('Item not found', { status: 404 });

    if (targetItem.createdById !== session.user.id) {
      return new Response('Only the creator can change visibility', { status: 403 });
    }
  }

  const updated = await db
    .update(ItemsTable)
    .set(parseResult.data)
    .where(
      and(
        eq(ItemsTable.id, itemId),
        eq(ItemsTable.familyId, dbUser.activeFamilyId),
        or(eq(ItemsTable.type, 'family'), eq(ItemsTable.createdById, dbUser.id))
      )
    )
    .returning();

  if (updated.length === 0) {
    return new Response('Item not found or access denied', { status: 404 });
  }

  return new Response(JSON.stringify(updated[0]));
};

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const auth = createAuth(locals.runtime.env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) return new Response('Unauthorized', { status: 401 });

  const itemId = params.id;
  if (!itemId) return new Response('ID Required', { status: 400 });

  const db = drizzle(locals.runtime.env.DB);

  const dbUser = await db.select().from(UserTable).where(eq(UserTable.id, session.user.id)).get();
  if (!dbUser?.activeFamilyId) return new Response('Forbidden', { status: 403 });

  const deleted = await db
    .delete(ItemsTable)
    .where(
      and(
        eq(ItemsTable.id, itemId),
        eq(ItemsTable.familyId, dbUser.activeFamilyId),
        or(eq(ItemsTable.type, 'family'), eq(ItemsTable.createdById, dbUser.id))
      )
    )
    .returning();

  if (deleted.length === 0) {
    return new Response('Item not found or access denied', { status: 404 });
  }

  return new Response(null, { status: 204 });
};
