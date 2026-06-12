# QA Report — Client Issue Tracker

**Reviewer role:** QA Lead Agent  
**Reference:** [docs/MASTER_CONTEXT.md](docs/MASTER_CONTEXT.md)  
**Date:** 2026-06-12  
**Codebase audit:** Full-stack monorepo (client + server) — application code present

---

## Summary

| Severity | Count |
| -------- | ----- |
| Critical | 0     |
| High     | 3     |
| Medium   | 8     |
| Low      | 7     |

**Release recommendation:** Acceptable for **assessment submission** after addressing High items. No Critical blockers found.

---

## Critical

_None identified._ Core auth, issue lifecycle, timeline, notifications, and analytics paths are implemented and typecheck successfully.

---

## High

### QA-H01 — Architecture violation: Prisma accessed from service layer

**Location:** [server/src/services/website.service.ts](server/src/services/website.service.ts) (`listAll()`)

**Finding:** `WebsiteService.listAll()` dynamically imports `prisma` and calls `prisma.website.findMany()` directly, bypassing the repository layer.

**Rule violated:** Controller → Service → **Repository** → Prisma (MASTER_CONTEXT)

**Impact:** Inconsistent architecture; harder to test and mock manager website listing.

**Fix:** Add `WebsiteRepository.findAllWithClient()` and call it from the service.

---

### QA-H02 — RBAC not enforced at route level for issue updates

**Location:** [server/src/routes/index.ts](server/src/routes/index.ts) — `PATCH /issues/:id`

**Finding:** Route allows any authenticated user. Service layer blocks clients from status/severity/assignee changes (403), but manager-only mutations should also use `requireRole("MANAGER")` or a split endpoint.

**Impact:** Clients can hit manager-intent endpoints; relies solely on service validation. Defense-in-depth missing.

**Fix:** Split routes: client `PATCH` for title/description only; manager `PATCH` with `requireRole("MANAGER")` for status/severity/assignee.

---

### QA-H03 — Attachments table defined but feature absent

**Location:** [server/prisma/schema.prisma](server/prisma/schema.prisma) — `Attachment` model

**Finding:** MASTER_CONTEXT lists `attachments` as a required database table. Schema exists but there is no repository, service, controller, route, or UI for file upload/download.

**Impact:** Feature gap vs master spec; assessors may expect at least stub implementation or documented deferral in README.

**Fix:** Implement minimal upload API + UI, or explicitly document as out-of-scope with schema reserved for future use.

---

## Medium

### QA-M01 — Client "Edit issue" not implemented in UI

**Finding:** MASTER_CONTEXT requires issue edit. Backend allows clients to update title/description/category via `PATCH /issues/:id`, but no client UI for editing.

**Fix:** Add edit form on issue detail page or dedicated edit route.

---

### QA-M02 — Analytics and AI services colocated with notifications

**Location:** [server/src/services/notification.service.ts](server/src/services/notification.service.ts)

**Finding:** `AnalyticsService` and `AiService` live in the same file as `NotificationService`. Functional but violates separation of concerns.

**Fix:** Extract to `analytics.service.ts` and `ai.service.ts`.

---

### QA-M03 — AI features are rule-based only

**Finding:** All four AI capabilities exist (categorization, severity, summary, suggested response) but use keyword heuristics, not an external LLM. `OPENAI_API_KEY` in env is unused.

**Impact:** Meets functional demo; may under-impress if assessors expect real AI integration.

**Fix:** Wire optional OpenAI call with fallback to rules; document in AI_WORKFLOW.md.

---

### QA-M04 — ESLint and Prettier not configured

**Finding:** MASTER_CONTEXT code quality rules require ESLint and Prettier. `npm run lint` references ESLint but no project-level config exists; lint will fail or no-op.

**Fix:** Add `.eslintrc.cjs` / `eslint.config.js` and `.prettierrc` for client and server.

---

### QA-M05 — No automated tests

**Finding:** TEST_PLAN.md defines manual cases only. Zero `*.test.ts` / `*.spec.ts` in project source.

**Impact:** Regression risk; weaker production-readiness story.

**Fix:** Add minimal API integration tests (auth, create issue, resolve + notification).

---

### QA-M06 — JWT secret default in `.env.example`

**Finding:** Default `JWT_SECRET="change-me-in-production..."` is fine for dev but `.env.example` should warn more prominently; weak secret if copied to production unchanged.

**Fix:** Document in README; consider failing startup in production if secret is default.

---

### QA-M07 — Issue update lacks manager-only route guard for assignee validation

**Finding:** `assigneeId` can be set to any manager ID without verifying assignee exists or is MANAGER role (Prisma FK may fail silently or error).

**Fix:** Validate assignee in `IssueService.update()` via `UserRepository`.

---

### QA-M08 — Submission screenshots missing

**Finding:** AGENTS.md deliverables tracker shows screenshots not captured. Recruitment spec lists screenshots as required submission item.

**Fix:** Capture 6+ screenshots per TEST_PLAN acceptance gate.

---

## Low

### QA-L01 — `server/.env` committed risk

**Finding:** `.gitignore` excludes `.env`, but local `server/.env` exists with credentials. Ensure never committed.

---

### QA-L02 — Responsive / accessibility polish

**Finding:** Desktop-first sidebar layout; limited ARIA on notification dropdown and forms. MASTER_CONTEXT asks for accessible UI.

**Fix:** Add aria-expanded, focus trap on notification panel; test mobile sidebar.

---

### QA-L03 — No client-side error toasts

**Finding:** API errors on mutations often fail silently (e.g. login shows error; other forms minimal feedback).

**Fix:** Global error boundary or toast component.

---

### QA-L04 — Website monitoring is static seed data

**Finding:** Acceptable per README assumptions; `lastCheckedAt` never updates at runtime.

**Fix:** Optional cron/endpoint to refresh timestamps (documented mock).

---

### QA-L05 — `notification.service.ts` naming collision

**Finding:** File exports three unrelated service classes; imports in controllers use mixed paths.

**Fix:** File split (see QA-M02).

---

### QA-L06 — Missing `public/screenshots/` directory

**Finding:** README references screenshot paths but folder not created.

**Fix:** Add `client/public/screenshots/` with captured images.

---

### QA-L07 — Prisma config deprecation warning

**Finding:** `package.json#prisma` seed config deprecated in Prisma 7.

**Fix:** Migrate to `prisma.config.ts` when upgrading Prisma major version.

---

## Feature compliance matrix (MASTER_CONTEXT)

| Feature                    | Backend | Frontend | Notes                            |
| -------------------------- | ------- | -------- | -------------------------------- |
| Login / Logout             | ✅      | ✅       |                                  |
| Protected routes           | ✅      | ✅       |                                  |
| RBAC                       | ⚠️      | ✅       | Route-level gaps (QA-H02)        |
| Website dashboard          | ✅      | ✅       | Status, open count, last checked |
| Create issue               | ✅      | ✅       |                                  |
| Edit issue                 | ⚠️      | ❌       | API partial (QA-M01)             |
| Update severity/status     | ✅      | ✅       | Manager only                     |
| Assignment                 | ✅      | ✅       | Manager dropdown                 |
| Timeline (all event types) | ✅      | ✅       | activity_logs                    |
| Comments / responses       | ✅      | ✅       |                                  |
| Notifications              | ✅      | ✅       | In-app, unread, mark read        |
| Analytics dashboard        | ✅      | ✅       | All 6 metrics                    |
| AI categorization          | ✅      | ✅       | Rule-based                       |
| AI severity suggest        | ✅      | ✅       | Rule-based                       |
| AI summary                 | ✅      | ✅       |                                  |
| AI suggested response      | ✅      | ✅       | Manager page                     |
| Attachments                | ❌      | ❌       | Schema only (QA-H03)             |
| ESLint / Prettier          | ❌      | ❌       | (QA-M04)                         |

---

## Architecture compliance

| Rule                        | Status                          |
| --------------------------- | ------------------------------- |
| Controllers → Services only | ✅                              |
| Services → Repositories     | ⚠️ Exception in website.service |
| Repositories → Prisma       | ✅                              |
| Business logic in services  | ✅                              |
| Zod validation              | ✅                              |
| Error middleware            | ✅                              |
| No Docker                   | ✅ Local PostgreSQL             |

---

## Security review

| Check                                | Status             |
| ------------------------------------ | ------------------ |
| Password hashing (bcrypt)            | ✅                 |
| JWT httpOnly cookie                  | ✅                 |
| CORS restricted to CLIENT_URL        | ✅                 |
| SQL injection (Prisma parameterized) | ✅                 |
| Rate limiting                        | ❌ Not implemented |
| Helmet security headers              | ❌ Not implemented |
| Input length limits (Zod)            | ✅                 |
| Role isolation client/manager data   | ✅ (service layer) |

---

## TypeScript status

| Workspace | `tsc --noEmit`                |
| --------- | ----------------------------- |
| server    | ✅ Passes (after prior fixes) |
| client    | ✅ Passes                     |

No blocking TS errors at audit time.

---

## Recommended fix order

1. **QA-H01** — Move manager website query to repository
2. **QA-H02** — Harden RBAC on issue PATCH routes
3. **QA-M08** — Capture submission screenshots
4. **QA-M01** — Client edit issue UI
5. **QA-M04** — ESLint + Prettier setup
6. **QA-H03** — Attachments stub or documented deferral

---

## Sign-off

| Area                          | Verdict                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| Core assessment flows         | **Pass**                                                    |
| Architecture                  | **Pass with exceptions**                                    |
| MASTER_CONTEXT feature parity | **Pass with gaps** (attachments, edit UI)                   |
| Submission readiness          | **Conditional pass** — add screenshots + address High items |

**Next agent:** `@fullstack-developer-agent` for High/Medium remediation — **not** full re-scaffold (codebase already exists).
