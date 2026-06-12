# HIGH Severity Fixes — Summary

**Date:** 2026-06-12  
**Agent:** Full Stack Developer  
**Reference:** [QA_REPORT.md](QA_REPORT.md), [PROJECT_AUDIT.md](PROJECT_AUDIT.md)

---

## QA-H01 — Prisma access moved to repository

**Issue:** `WebsiteService.listAll()` called Prisma directly, violating Controller → Service → Repository → Prisma.

**Fix:**

- Added `WebsiteRepository.findAllWithClient()` in [server/src/repositories/website.repository.ts](server/src/repositories/website.repository.ts)
- `WebsiteService.listAll()` now delegates to the repository only

**Verification:** No `prisma` imports remain in `website.service.ts`.

---

## QA-H02 — Strict manager-only RBAC on issue management

**Issue:** `PATCH /issues/:id` allowed any authenticated role; manager mutations relied on service-layer checks only.

**Fix:** Split routes with `requireRole()` middleware and dedicated schemas:

| Method | Path                    | Role    | Purpose                                                 |
| ------ | ----------------------- | ------- | ------------------------------------------------------- |
| PATCH  | `/issues/:id`           | CLIENT  | `clientUpdateIssueSchema` — content fields              |
| PATCH  | `/issues/:id/manage`    | MANAGER | `managerUpdateIssueSchema` — status, severity, assignee |
| POST   | `/issues/:id/comments`  | CLIENT  | Client comments                                         |
| POST   | `/issues/:id/responses` | MANAGER | Manager responses                                       |

**Service changes:**

- `updateByClient()` / `updateByManager()` public methods
- `addClientComment()` / `addManagerResponse()` with route-aligned roles

**Client changes (minimal):**

- [client/src/pages/manager/ManagerIssueDetailPage.tsx](client/src/pages/manager/ManagerIssueDetailPage.tsx) — PATCH → `/manage`, POST → `/responses`

**Defense in depth:** Service layer still validates role-specific fields on private `update()`.

---

## QA-H03 — Attachments architecture stub

**Issue:** `attachments` table existed with no API layer.

**Fix:** Minimal stub following layered architecture:

| Layer      | File                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Repository | [server/src/repositories/attachment.repository.ts](server/src/repositories/attachment.repository.ts) |
| Service    | [server/src/services/attachment.service.ts](server/src/services/attachment.service.ts)               |
| Controller | [server/src/controllers/attachment.controller.ts](server/src/controllers/attachment.controller.ts)   |

**Endpoints:**

- `GET /api/issues/:id/attachments` — lists attachments (empty until upload exists); includes `meta.uploadSupported: false`
- `POST /api/issues/:id/attachments` — returns **501** with message documenting future enhancement

**Docs updated:** [ARCHITECTURE.md](ARCHITECTURE.md), [API_SPEC.md](API_SPEC.md)

---

## Files changed

```
server/src/repositories/website.repository.ts
server/src/repositories/attachment.repository.ts          (new)
server/src/services/website.service.ts
server/src/services/issue.service.ts
server/src/services/attachment.service.ts                   (new)
server/src/controllers/issue.controller.ts
server/src/controllers/attachment.controller.ts             (new)
server/src/routes/index.ts
server/src/validators/schemas.ts
client/src/pages/manager/ManagerIssueDetailPage.tsx
ARCHITECTURE.md
API_SPEC.md
HIGH_FIXES_SUMMARY.md                                       (new)
```

---

## Out of scope (per request)

- No UI redesign
- No new feature modules beyond attachment stub
- Medium/Low QA items not addressed

---

## Suggested verification

```bash
npm run db:migrate
npm run dev
```

1. Manager updates issue status → `PATCH /api/issues/:id/manage` (200)
2. Client cannot call `/manage` → 403
3. Manager cannot call `PATCH /issues/:id` with client-only route if not CLIENT role → 403
4. `GET /api/issues/:id/attachments` → `{ data: [], meta: { uploadSupported: false } }`
5. `POST /api/issues/:id/attachments` → 501
