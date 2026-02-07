# MONO

**Zero friction, Zero loading.**
A minimalist shopping list application built for speed and simplicity. Designed for a two-person household usage.

![MONO Demo](https://dummyimage.com/1200x630/202020/fff&text=MONO+App+Demo) _<!-- Replace with actual screenshot if available -->_

## Concept

MONO is a "User-Land" optimized application. By leveraging **Cloudflare Access** (Zero Trust) for authentication at the edge, the application itself contains **zero authentication code**.

- No login screens.
- No session management logic.
- Instant access for whitelisted users.

## Key Features

- **Edge Native**: Hosted on Cloudflare Pages, connected to D1 (SQLite) database globally.
- **Zero-Friction Auth**: Authentication is handled entirely by Cloudflare's network layer. The app receives the user identity via JWT headers.
- **Optimistic UI**: Immediate feedback for adding, checking, and deleting items using SWR key-based invalidation.
- **Mobile Optimized**:
  - Pull to refresh
  - Swipe to delete/edit
  - Drag & drop reordering (Framer Motion)
  - PWA-ready layout

## Tech Stack

### Frontend

- **Framework**: [Astro](https://astro.build) (SSR mode)
- **UI Library**: [React](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State/Fetching**: [SWR](https://swr.vercel.app)

### Backend & Infrastructure

- **Runtime**: Cloudflare Workers (via Astro Adapter)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Security**: [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) (Zero Trust)

## Getting Started

### Prerequisites

- Node.js / Bun
- Cloudflare Account (for D1 and Access)

### Local Development

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Setup local D1 database**

   ```bash
   # Create tables
   bunx wrangler d1 execute mono-db-prod --local --file=./drizzle/0000_init.sql
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```
   _Note: In local development, the app mocks Cloudflare Access authentication and defaults to a dev user._

### Deployment

This project is configured for **Cloudflare Pages**.

1. Connect your repository to Cloudflare Pages.
2. Create a D1 database named `mono-db-prod`.
3. Configure **Cloudflare Access** for the Pages domain.
   - Create an Application in Zero Trust dashboard.
   - Set Policy to allow verification via Email (OTP).
   - Add allowed email addresses.

## License

This project is open source and available under the [MIT License](LICENSE).
