# Architecture

This document describes the overall system architecture, key technical decisions, database design, and application flow for the Client Issue Tracker.

See also [docs/MASTER_CONTEXT.md](docs/MASTER_CONTEXT.md) for the full assessment specification.

---

## Overall System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                              │
│  Vite :5173  ·  React Router  ·  TanStack Query  ·  Auth Context         │
│  ProtectedRoute / GuestRoute  ·  shadcn/ui components                    │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  HTTPS (dev: HTTP)
                                │  REST  /api/*
                                │  Cookie: auth_token (httpOnly JWT)
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Express API (TypeScript) :3001                      │
│  CORS · cookie-parser · JSON body · Zod validation · error middleware    │
│                                                                          │
│  Route → Controller → Service → Repository → Prisma Client               │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  SQL via Prisma
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (database: ai_tracker)                     │
│  Users · Websites · Issues · Comments · ActivityLogs · Notifications     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Monorepo layout

```
client/                 React frontend (Vite)
server/                 Express API + Prisma
  src/
    controllers/        HTTP handlers
    services/           Business logic
    repositories/       Data access
    middleware/         Auth, validation, errors
    routes/             Route registration
    validators/         Zod schemas
  prisma/
    schema.prisma       Data model
    migrations/         SQL migrations
    seed.ts             Demo data
scripts/                E2E tests, screenshot capture
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Monorepo (npm workspaces)** | Single repo for client + server; matches assessment stack requirements |
| **Layered backend** | Controllers stay thin; services hold business rules; repositories isolate Prisma |
| **JWT in httpOnly cookie** | Avoids localStorage XSS; works with same-site credentialed fetch |
| **RBAC at route + service layer** | Middleware blocks wrong roles; services scope client data to `createdById` / `clientId` |
| **Append-only activity log** | Reliable audit trail for issue timeline without overwriting history |
| **Server-side pagination** | Issues and websites lists paginate in DB (`skip`/`take`/`count`) — scales beyond demo data |
| **TanStack Query** | Caching, loading states, optimistic invalidation after mutations |
| **Rule-based AI fallback** | Assessment runs without external API keys; upgrade path via `OPENAI_API_KEY` |
| **shadcn/ui + Tailwind** | Accessible components, consistent Pixel Future branding, fast iteration |
| **Prisma ORM** | Type-safe queries, migrations, seed script for reproducible demo |

---

## Database Design Approach

### Modeling principles

1. **Normalized relational schema** — entities map to business nouns (User, Website, Issue, Comment).
2. **Explicit enums** — status, severity, category, activity type stored as PostgreSQL enums via Prisma.
3. **Foreign keys with cascade** — deleting a website cascades issues; deleting an issue cascades comments and activity logs.
4. **Indexed query paths** — indexes on `clientId`, `status`, `issueId`, `userId`, `createdAt` for list and timeline queries.
5. **Separation of concerns** — notifications are a dedicated table, not embedded in issues.

### Core entities

```
User (CLIENT | MANAGER)
  ├── Website[]          (clientId → User)
  ├── Issue[]            (createdById, assigneeId)
  ├── Comment[]
  ├── ActivityLog[]
  └── Notification[]

Website
  └── Issue[]

Issue
  ├── Comment[]
  ├── ActivityLog[]
  ├── Notification[]
  └── Attachment[]       (schema ready; upload not implemented)
```

### Activity and notifications

- **ActivityLog** — written on create, update, assign, status/severity change, comment, response, resolve. Powers the issue timeline UI.
- **Notification** — created on resolve, assign, manager response. Scoped per `userId` with optional `readAt`.

### Pagination queries

List endpoints accept:

- `page`, `pageSize` (5 | 10 | 20 | 50)
- `sortBy`, `sortOrder` (default `createdAt desc`)
- Filters: `search`, `status`, date range, issue-specific `severity`

Repositories build a shared `where` clause, run `findMany` + `count` in parallel, return `{ items, pagination }`.

---

## Application Flow

### Authentication flow

```
1. User submits login form
2. POST /api/auth/login → AuthService validates bcrypt hash
3. Server sets auth_token httpOnly cookie (JWT with userId, email, role)
4. Client AuthContext stores user; navigates to /dashboard or /manager
5. ProtectedRoute checks user + role on every protected page
6. GuestRoute redirects logged-in users away from /login
7. Logout → POST /api/auth/logout → clear cookie → navigate /login (replace)
8. API 401 → AuthSessionBridge clears session and redirects to login
```

### Client: report and track an issue

```
Dashboard (websites, paginated)
  → Report Issue (/issues/new)
  → POST /api/issues
  → ActivityLog CREATED
  → Redirect to My Issues

My Issues (paginated, filtered)
  → Issue detail (/issues/:id)
  → Add comment → POST /api/issues/:id/comments
  → ActivityLog COMMENT → auto navigate back to list
```

### Manager: triage and resolve

```
Manager Analytics (/manager)
  → All Issues (/manager/issues, paginated)
  → Issue detail (/manager/issues/:id)
  → PATCH /api/issues/:id/manage (status, severity, assignee)
  → ActivityLog STATUS_CHANGED / ASSIGNED / SEVERITY_CHANGED
  → Notification to assignee or client as applicable
  → POST /api/issues/:id/responses
  → Resolve → Notification ISSUE_RESOLVED to client
```

### Notification flow

```
Manager resolves issue
  → IssueService creates Notification (ISSUE_RESOLVED)
  → Client polls GET /api/notifications
  → NotificationBell shows unread count
  → Client clicks → navigates to issue detail
  → PATCH /api/notifications/:id/read
```

---

## Backend Layer Responsibilities

```
Route (index.ts)
  └── authenticate / requireRole / validateBody middleware
        └── Controller
              └── parse query params, call service, res.json({ data })
                    └── Service
                          └── business rules, activity logs, notifications
                                └── Repository
                                      └── Prisma queries only
```

### RBAC route map

| Route | Role | Purpose |
|-------|------|---------|
| `GET /websites` | CLIENT / MANAGER | Paginated website list |
| `GET /websites/options` | CLIENT / MANAGER | Full id/name list for dropdowns |
| `GET /issues` | CLIENT / MANAGER | Paginated issues (scoped by role) |
| `POST /issues` | CLIENT | Create issue |
| `PATCH /issues/:id` | CLIENT | Update title, description, category |
| `PATCH /issues/:id/manage` | MANAGER | Status, severity, assignment |
| `POST /issues/:id/comments` | CLIENT | Add comment |
| `POST /issues/:id/responses` | MANAGER | Manager response |
| `GET /analytics/dashboard` | MANAGER | Analytics aggregates |
| `GET /issues/managers` | MANAGER | Assignee dropdown |

---

## Frontend Architecture

### Routing

```
/login                    GuestRoute
/dashboard                ProtectedRoute (CLIENT)
/issues, /issues/new      ProtectedRoute (CLIENT)
/issues/:id               ProtectedRoute (CLIENT)
/manager                  ProtectedRoute (MANAGER)
/manager/issues           ProtectedRoute (MANAGER)
/manager/issues/:id       ProtectedRoute (MANAGER)
```

### State management

- **AuthContext** — user session, login/logout, `/auth/me` refresh
- **TanStack Query** — server state for lists, details, notifications, analytics
- **Local useState** — filter/search/pagination UI state per page
- **SidebarContext** — collapsible sidebar preference (localStorage)

### Shared list UI

Reusable components in `client/src/components/list/`:

- `ListSearchBar` — branded search with clear button
- `ListToolbar` — search + sort + filter toggle
- `ListFilterPanel` — animated collapsible filters (closed by default)
- `ActiveFilterChips` — removable filter pills
- `ListPaginationFooter` — progress bar + page controls

---

## Issue Lifecycle

```
OPEN → IN_REVIEW → IN_PROGRESS → WAITING_FOR_CLIENT → RESOLVED → CLOSED
```

Each transition (when changed via manager) appends an `ActivityLog` entry. Resolving sets `resolvedAt` and notifies the client.

---

## AI Integration

`AiService` in the notification/analytics module provides rule-based:

- Keyword matching for category and severity on `POST /ai/suggest`
- Template summaries and suggested responses

Optional `OPENAI_API_KEY` allows future swap to external LLM without changing API contracts.

---

## Testing Strategy

- **E2E (`scripts/e2e-test.mjs`)** — 20 HTTP-level tests covering client flow, manager flow, RBAC denial, health check
- **Lint/format** — ESLint + Prettier at repo root
- **Manual QA** — screenshot capture script for submission evidence

Unit/integration tests for services are documented as a production enhancement.
