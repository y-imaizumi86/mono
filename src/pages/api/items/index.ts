// src/pages/api/items/index.ts

import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/d1';
import {
  items as ItemsTable,
  family as FamilyTable,
  user as UserTable,
  insertItemSchema,
} from '@/db/schema';
import { eq, desc, and, or, asc } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const auth = createAuth(locals.runtime.env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(locals.runtime.env.DB);

  const dbUser = await db.select().from(UserTable).where(eq(UserTable.id, session.user.id)).get();

  if (!dbUser) {
    return new Response('User not found', { status: 404 });
  }

  let currentFamilyId = dbUser.activeFamilyId;

  if (!currentFamilyId) {
    const newFamilyId = crypto.randomUUID();

    await db.insert(FamilyTable).values({
      id: newFamilyId,
      name: `${dbUser.name}家`,
      inviteCode: crypto.randomUUID().slice(0, 6).toUpperCase(),
      createdAt: new Date(),
    });

    await db
      .update(UserTable)
      .set({ activeFamilyId: newFamilyId })
      .where(eq(UserTable.id, dbUser.id));

    currentFamilyId = newFamilyId;
  }

  const result = await db
    .select()
    .from(ItemsTable)
    .where(
      and(
        eq(ItemsTable.familyId, currentFamilyId),
        or(eq(ItemsTable.type, 'family'), eq(ItemsTable.createdById, dbUser.id))
      )
    )
    .orderBy(asc(ItemsTable.order), desc(ItemsTable.createdAt));

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = createAuth(locals.runtime.env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const parseResult = insertItemSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);

  const dbUser = await db.select().from(UserTable).where(eq(UserTable.id, session.user.id)).get();

  if (!dbUser || !dbUser.activeFamilyId) {
    return new Response('Family not found', { status: 400 });
  }

  const newItem = await db
    .insert(ItemsTable)
    .values({
      ...parseResult.data,
      id: crypto.randomUUID(),
      familyId: dbUser.activeFamilyId,
      createdById: dbUser.id,
    })
    .returning();

  return new Response(JSON.stringify(newItem[0]), { status: 201 });
};
