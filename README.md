# The Human Reconnection Journey

A transformational, cinematic 6-level web experience that guides users through themes of disconnection, awareness, healing, and human reconnection. Built with TanStack Start on Cloudflare Workers, backed by Supabase.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Build & Deploy](#build--deploy)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Authentication Flow](#authentication-flow)
- [Configuration Reference](#configuration-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start 1.167 (SSR React) |
| Routing | TanStack Router (file-based) |
| Runtime / Deploy | Cloudflare Workers |
| Build Tool | Vite 7 + `@cloudflare/vite-plugin` |
| Database / Backend | Supabase (PostgreSQL, service role) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Package Manager | Bun |
| SMS / OTP Delivery | n8n webhook |

---

## Prerequisites

- **Node.js** ≥ 22 (or **Bun** ≥ 1.x)
- A **Supabase** project (free tier is fine)
- A **Cloudflare** account (for deployment)
- (Optional) An **n8n** instance for SMS OTP delivery

---

## Environment Variables

Create a `.env` file in the project root (never commit it). Cloudflare Workers reads these via `wrangler.jsonc` secrets or `.dev.vars` for local dev.

### `.dev.vars` (Cloudflare Workers local dev)

```ini
# Supabase — public values (safe to expose to the browser via VITE_ prefix)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# Supabase — server-side values (never exposed to the browser)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
MY_SUPABASE_URL=https://<your-project-ref>.supabase.co
MY_SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

> **Tip:** `MY_SUPABASE_SERVICE_ROLE_KEY` bypasses Supabase Row Level Security on the server. Treat it like a root password — never expose it to the client.

### Cloudflare Production Secrets

Set each server-side variable as a Worker secret:

```bash
wrangler secret put MY_SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

`VITE_*` variables are baked into the client bundle at build time — pass them as build-time environment variables or add them to `wrangler.jsonc` under `[vars]`.

---

## Local Development

```bash
# 1. Install dependencies
bun install          # or: npm install

# 2. Create local environment file (see above)
cp .dev.vars.example .dev.vars   # then fill in your values

# 3. Start the dev server
bun run dev          # or: npm run dev
```

The app will be available at **http://localhost:5173** with hot module replacement.

---

## Build & Deploy

```bash
# Production build (output to dist/)
bun run build

# Development build (includes source maps, useful for debugging Workers)
bun run build:dev

# Preview the production build locally
bun run preview

# Deploy to Cloudflare Workers
wrangler deploy
```

### Lint & Format

```bash
bun run lint         # ESLint check
bun run format       # Prettier auto-format
```

---

## Project Structure

```
├── src/
│   ├── routes/                  # File-based pages (TanStack Router)
│   │   ├── index.tsx            # / — Public landing page
│   │   ├── auth.tsx             # /auth — Phone + OTP login
│   │   ├── onboarding.tsx       # /onboarding — First-run profile setup
│   │   ├── _authenticated.tsx   # Layout guard (redirects if not logged in)
│   │   ├── _authenticated.dashboard.tsx  # /dashboard — Video level hub
│   │   ├── _authenticated.watch.$id.tsx  # /watch/:id — Level player
│   │   ├── _authenticated.journey.tsx    # /journey — Level 1 opener
│   │   ├── _authenticated.progress.tsx   # /progress — Progress metrics
│   │   └── admin.tsx            # /admin — Admin user dashboard
│   ├── lib/
│   │   ├── auth.functions.ts    # sendOtp, verifyOtp, signOut server fns
│   │   ├── session.server.ts    # Session cookie create/read/destroy
│   │   └── admin.functions.ts   # Admin data queries
│   ├── integrations/
│   │   ├── supabase/            # Public Supabase client + auth middleware
│   │   └── my-supabase/         # Service-role admin client (server only)
│   ├── components/              # Shared UI components + shadcn/ui
│   └── server.ts                # Cloudflare Worker entry point
├── supabase/
│   ├── config.toml              # Supabase project config
│   └── migrations/              # SQL migration files (apply in order)
├── schema.sql                   # Full reference schema
├── wrangler.jsonc               # Cloudflare Workers config
├── vite.config.ts               # Vite + TanStack + Cloudflare plugins
└── components.json              # shadcn/ui config
```

---

## Database Setup

### Option A — Supabase Migrations (recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

### Option B — Manual SQL

Run the files in `supabase/migrations/` against your database **in chronological order** (sorted by the timestamp prefix), then run `schema.sql` for reference.

### Tables

| Table | Purpose |
|---|---|
| `journey_users` | User profiles (name, phone, demographics, onboarding flag) |
| `otp_verifications` | 4-digit OTP codes, 5-min expiry, max 5 attempts |
| `user_sessions` | Long-lived session tokens (60-day httpOnly cookies) |
| `journey_progress` | Per-user level, watch time, completion percentage |

All tables use **server-only Row Level Security** — no direct access from the browser. All reads/writes go through server functions using the service role key.

---

## Authentication Flow

1. **Enter name + phone** → `/auth`
2. Server upserts user, generates a 4-digit OTP, stores its SHA-256 hash, fires the n8n webhook for SMS delivery
3. **Enter OTP** → server validates hash, marks code used, creates a 60-day session token stored as a SHA-256 hash in `user_sessions`
4. `Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=5184000`
5. On every request the token is re-hashed, looked up, and **auto-refreshed** if fewer than 30 days remain
6. **First login** redirects to `/onboarding` to collect date of birth, gender, lifestyle, and consent
7. Subsequent logins go straight to `/dashboard`

---

## Configuration Reference

### `wrangler.jsonc` — Cloudflare Workers

| Field | Default | Description |
|---|---|---|
| `name` | `rzijtxdgzdfajraztqma` | Worker name / Cloudflare project ID |
| `main` | `src/server.ts` | Worker entry point |
| `compatibility_date` | `2025-09-24` | Cloudflare runtime version pin |
| `compatibility_flags` | `["nodejs_compat"]` | Enables Node.js APIs inside Workers |

To rename the project, update `name` here and re-run `wrangler deploy`.

### `vite.config.ts`

Uses `@lovable.dev/vite-tanstack-config` which bundles the TanStack Start plugin, Tailwind CSS, and the Cloudflare Vite plugin. The `customConfig` override points the server entry to `src/server.ts`.

### `components.json` — shadcn/ui

| Field | Value | Change when... |
|---|---|---|
| `style` | `new-york` | You want a different shadcn theme |
| `baseColor` | `slate` | You want a different base Tailwind color |
| `aliases.components` | `@/components` | You reorganize the components folder |

To add a new shadcn component:
```bash
npx shadcn@latest add <component-name>
```

### `bunfig.toml` — Supply-Chain Security

Packages must be at least **24 hours old** before Bun will install them. This guards against dependency-confusion attacks. The only exception is `@lovable.dev/vite-tanstack-config`. To add another exception:

```toml
[install.scopes]
"@your-trusted-scope" = { minAge = 0 }
```

### OTP / SMS Webhook

The n8n webhook URL is currently hardcoded in [src/lib/auth.functions.ts](src/lib/auth.functions.ts). To change it, update the `N8N_WEBHOOK_URL` constant or move it to an environment variable:

```ts
// src/lib/auth.functions.ts
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? "https://your-n8n-instance/webhook/sent-otp";
```

### Video Content (Cloudinary)

Level video URLs are defined in [src/routes/_authenticated.dashboard.tsx](src/routes/_authenticated.dashboard.tsx). Each level entry has the shape:

```ts
{
  id: 1,
  title: "Level Title",
  description: "Short description",
  videoUrl: "https://res.cloudinary.com/...",
  duration: "MM:SS",
  locked: false,
}
```

Update `videoUrl` with your own Cloudinary (or other CDN) URLs to swap video content.

### Session Duration

In [src/lib/session.server.ts](src/lib/session.server.ts), two constants control session lifetime:

```ts
const SESSION_DURATION_DAYS = 60;   // Cookie max-age
const SESSION_REFRESH_DAYS  = 30;   // Slide window: renew if less than this remains
```

---

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| Blank page / 500 after login | Missing `MY_SUPABASE_SERVICE_ROLE_KEY` env var |
| OTP never arrives | n8n webhook URL unreachable or incorrect |
| `Cannot find table` errors | Migrations not applied — run `supabase db push` |
| Type errors after adding a route | Run `bun run dev` once to regenerate `routeTree.gen.ts` |
| Cloudflare deploy fails | `compatibility_date` in `wrangler.jsonc` needs updating |
