# Client Issue Tracker

Production-quality SaaS platform for clients to monitor assigned websites, report issues, and track resolution — with manager workflows for assignment, analytics, and support responses.

Built as an **AI Full Stack Engineer** technical assessment for Pixel Future.

---

## Project Overview

A role-based issue tracking application with two primary personas:

| Role | Capabilities |
|------|----------------|
| **Client** | View assigned websites, report issues, comment on tickets, receive notifications, browse activity timelines |
| **Manager** | View analytics, manage the full issue queue, assign work, update status/severity, respond to clients, resolve issues |

The application demonstrates:

- Layered backend architecture (Controller → Service → Repository → Prisma)
- Role-based access control (RBAC) on API and UI routes
- Server-side pagination, sorting, and filtering on websites and issues
- Pixel Future–inspired UI (shadcn/ui + Tailwind)
- Activity timeline and in-app notifications
- Rule-based AI endpoints (optional OpenAI integration)
- E2E API tests, ESLint/Prettier, and production-readiness documentation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, React Router |
| UI | shadcn/ui, Tailwind CSS, Lucide icons, Sonner toasts |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (local), Prisma ORM |
| Auth | JWT in httpOnly cookie, RBAC middleware |

**No Docker required.** Uses local PostgreSQL only.

---

## Setup Instructions

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ running locally
- **npm** 9+ (workspaces enabled)

### 1. Clone and install

```bash
git clone <repository-url>
cd client-issue-tracker
npm install
```

### 2. Environment configuration

Copy the example env file and adjust credentials if needed:

```bash
cp .env.example server/.env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`) |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |
| `OPENAI_API_KEY` | Optional — not required for demo |

### 3. Database setup

Create the database if it does not exist:

```sql
CREATE DATABASE ai_tracker;
```

Apply migrations and seed demo data:

```bash
npm run db:migrate
npm run db:seed
```

Or in one step:

```bash
npm run db:setup
```

The seed creates demo users, **54 websites**, sample issues, comments, activity logs, and notifications.

### 4. Verify (optional)

```bash
npm run test:e2e    # 20 API end-to-end checks
npm run lint        # ESLint
npm run build       # TypeScript build (client + server)
```

---

## Run Instructions

### Development (recommended)

Starts the API on port **3001** and the Vite dev server on port **5173**:

```bash
npm run dev
```

Open **http://localhost:5173**

The Vite dev server proxies `/api` requests to the Express backend.

### Production build

```bash
npm run build
npm run start -w server          # API from server/dist
# Serve client/dist via static host (nginx, Vercel, etc.)
```

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Client | `client@demo.com` | `demo123` |
| Manager | `manager@demo.com` | `demo123` |

Additional manager account: `manager2@demo.com` / `demo123`

### Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + UI concurrently |
| `npm run build` | Build server and client |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Reload demo data |
| `npm run db:setup` | Migrate + seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test:e2e` | Run API E2E test suite |
| `npm run screenshots` | Capture UI screenshots (dev server required) |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` | Prettier format |

---

## Features

### Client

- Login / logout with route guards (protected + guest routes)
- **My Websites** dashboard — paginated list with search, sort, filters, status badges
- **My Issues** — server-side pagination, sorting, filtering by status/severity/dates
- Report new issues (website dropdown, AI category/severity suggest)
- Issue detail — comments, AI summary, activity timeline, back navigation
- In-app notifications (unread count, mark read)

### Manager

- Analytics dashboard (open/resolved/critical counts, resolution time, breakdowns)
- **All Issues** queue — search + pagination
- Assign issues, update status/severity
- Manager responses with AI suggest
- Resolve issues (triggers client notification + timeline entry)

### AI (rule-based by default)

| Feature | Endpoint |
|---------|----------|
| Category + severity suggestion | `POST /api/ai/suggest` |
| Issue summary | `GET /api/ai/issues/:id/summary` |
| Suggested manager response | `GET /api/ai/issues/:id/suggest-response` |

---

## Assumptions Made

1. **Website monitoring is mock data** — statuses (Online, Down, Degraded, Unknown) are seeded, not live HTTP health checks.
2. **JWT cookie authentication** — demo users only; no OAuth, SSO, or MFA in this prototype.
3. **In-app notifications only** — email/SMS/push are documented as future work.
4. **Attachment upload is stubbed** — database schema and list API exist; `POST` upload returns `501 Not Implemented`.
5. **AI is rule-based by default** — works without external API keys; `OPENAI_API_KEY` is optional for future LLM integration.
6. **Single-tenant demo** — one client user owns all seeded websites; managers see all issues globally.
7. **Local PostgreSQL** — no Docker Compose; developers run Postgres natively on `localhost:5432`.
8. **English-only UI** — no i18n in scope for the assessment.
9. **Pagination defaults** — 5 items per page; page sizes 5, 10, 20, 50 supported on list endpoints.
10. **Browser back after logout** — login page traps history to prevent returning to protected routes without re-authentication.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, flows, database approach |
| [AI_WORKFLOW.md](AI_WORKFLOW.md) | AI-assisted development process |
| [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) | Path to production deployment |
| [API_SPEC.md](API_SPEC.md) | REST API reference |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Prisma schema details |
| [TIMELINE_AND_NOTIFICATIONS.md](TIMELINE_AND_NOTIFICATIONS.md) | Timeline + notification design |

---

## License

Assessment project — internal use.
