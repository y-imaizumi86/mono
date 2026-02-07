// src/pages/api/items/[id].ts

import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { items as ItemsTable, updateItemSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const userEmail = locals.userEmail;
  if (!userEmail) return new Response('Unauthorized', { status: 401 });

  const itemId = params.id;
  if (!itemId) return new Response('ID Required', { status: 400 });

  const body = await request.json();
  const parseResult = updateItemSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);

  // listType の変更は作成者のみ許可
  if (parseResult.data.listType) {
    const targetItem = await db.select().from(ItemsTable).where(eq(ItemsTable.id, itemId)).get();

    if (!targetItem) return new Response('Item not found', { status: 404 });

    if (targetItem.ownerEmail !== userEmail) {
      return new Response('Only the creator can change visibility', { status: 403 });
    }
  }

  // shared アイテムは誰でも更新可、private は作成者のみ更新可
  const updated = await db
    .update(ItemsTable)
    .set(parseResult.data)
    .where(
      and(
        eq(ItemsTable.id, itemId),
        or(eq(ItemsTable.listType, 'shared'), eq(ItemsTable.ownerEmail, userEmail))
      )
    )
    .returning();

  if (updated.length === 0) {
    return new Response('Item not found or access denied', { status: 404 });
  }

  return new Response(JSON.stringify(updated[0]));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const userEmail = locals.userEmail;
  if (!userEmail) return new Response('Unauthorized', { status: 401 });

  const itemId = params.id;
  if (!itemId) return new Response('ID Required', { status: 400 });

  const db = drizzle(locals.runtime.env.DB);

  // shared アイテムは誰でも削除可、private は作成者のみ削除可
  const deleted = await db
    .delete(ItemsTable)
    .where(
      and(
        eq(ItemsTable.id, itemId),
        or(eq(ItemsTable.listType, 'shared'), eq(ItemsTable.ownerEmail, userEmail))
      )
    )
    .returning();

  if (deleted.length === 0) {
    return new Response('Item not found or access denied', { status: 404 });
  }

  return new Response(null, { status: 204 });
};
