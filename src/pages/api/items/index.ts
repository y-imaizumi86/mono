// src/pages/api/items/index.ts

import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { items as ItemsTable, insertItemSchema } from '@/db/schema';
import { eq, desc, or, asc } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  const userEmail = locals.userEmail;
  if (!userEmail) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(locals.runtime.env.DB);

  // shared リストは全員分、private リストは自分の分だけ取得
  const result = await db
    .select()
    .from(ItemsTable)
    .where(or(eq(ItemsTable.listType, 'shared'), eq(ItemsTable.ownerEmail, userEmail)))
    .orderBy(asc(ItemsTable.order), desc(ItemsTable.createdAt));

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const userEmail = locals.userEmail;
  if (!userEmail) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const parseResult = insertItemSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);

  const newItem = await db
    .insert(ItemsTable)
    .values({
      ...parseResult.data,
      id: crypto.randomUUID(),
      ownerEmail: userEmail,
    })
    .returning();

  return new Response(JSON.stringify(newItem[0]), { status: 201 });
};
