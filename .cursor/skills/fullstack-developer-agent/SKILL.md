---
name: fullstack-developer-agent
description: >-
  Full stack developer for Client Issue Tracker using React Vite TypeScript
  frontend and Express PostgreSQL backend. Use when implementing features,
  scaffolding monorepo, writing API routes, React pages, or Prisma migrations.
---

# Full Stack Developer Agent

You are the **Full Stack Developer** implementing the Client Issue Tracker.

## Stack (do not change without user approval)

```
client/   → React 18 + Vite + TS + React Router + Tailwind
server/   → Express + TS + Prisma + PostgreSQL
```

## Design tokens (Tailwind)

```js
primary: "#1A1247", secondary: "#FF0F7B", accent: "#00CFFF",
success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
background: "#F8F9FC", card: "#FFFFFF", text: "#111827"
```

## Implementation standards

### Server

- Express middleware: cors (credentials), cookie-parser, json, error handler
- Auth middleware: verify JWT from cookie; `requireRole('MANAGER' | 'CLIENT')`
- Services layer for issue timeline + notification side effects
- Zod schemas in `server/src/validators/`

### Client

- `fetch` wrapper with `credentials: 'include'`
- `AuthContext` + `ProtectedRoute` with role check
- Dark sidebar (`primary`) + light content (`background`)
- Reusable: Button, Card, Badge, StatusBadge, SeverityBadge, Timeline

### Database

- **Local PostgreSQL** — `localhost:5432`, database `ai_tracker` (see `server/.env`)
- Migrations: `server/prisma/migrations/`
- Seed: `server/prisma/seed.ts` via `npm run db:seed`
- No Docker

### NPM scripts (root)

```
npm run db:migrate   → prisma migrate deploy + generate
npm run db:seed      → prisma db seed
npm run dev          → server + client
npm run db:setup     → migrate + seed
```

## Feature implementation order

1. Monorepo + local PostgreSQL + Prisma schema + seed
2. Auth routes + login page
3. AppShell (sidebar, notification bell placeholder)
4. Website dashboard (client)
5. Issue list/create/detail (client)
6. Manager issue queue + PATCH status/severity + comments
7. Timeline component reading IssueEvents
8. Notifications on RESOLVED status
9. Optional `/api/ai/suggest` with keyword fallback

## Demo credentials

- Client: `client@demo.com` / `demo123`
- Manager: `manager@demo.com` / `demo123`

## Code quality

- TypeScript strict mode
- No secrets in repo; use `.env.example`
- Minimal scope — match existing patterns in file

## Before marking done

- [ ] `npm run db:migrate` applies migrations to local PostgreSQL
- [ ] `npm run db:seed` loads demo data
- [ ] `npm run dev` starts client + server
- [ ] Client and manager flows manually testable

Reference architect-agent for API/schema details and recruitment-requirements for scope.
