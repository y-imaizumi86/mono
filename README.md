# MONO

Zero friction, Zero loading.
A minimalist shopping list application built with the modern web stack.

## Tech Stack

- **Framework:** Astro (SSR)
- **Backend:** Hono
- **Database:** Cloudflare D1 (SQLite)
- **ORM:** Drizzle ORM
- **UI:** React, Tailwind CSS v4, Shadcn/ui

## Getting Started

```bash
# Install dependencies
bun install

# Start local development server
bun run dev

# Setup local database
bun wrangler d1 execute mono-db-prod --local --file=./drizzle/0000_lucky_the_executioner.sql
```
