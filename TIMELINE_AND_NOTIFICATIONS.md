# Timeline & Notifications — Implementation Guide

This document describes how **Issue Timeline** and **Client Notifications** are implemented in the Client Issue Tracker, per the assessment requirements.

---

## Issue Timeline

### Requirement

Both **clients** and **managers** must view a chronological history of issue activity, including:

| Event | Supported |
|-------|-----------|
| Issue creation | Yes |
| Status updates | Yes |
| Severity updates | Yes |
| Comments | Yes |
| Manager responses | Yes |
| Resolution events | Yes |

### Implementation approach

**Pattern:** Append-only **activity log** (`activity_logs` table). Every significant action writes one row at the time it occurs. The timeline is a read-only query ordered by `createdAt ASC`.

```
User action → IssueService → ActivityRepository.create() → PostgreSQL
UI poll     → GET /api/issues/:id/timeline → Timeline component
```

#### When events are recorded

| User action | Activity type | Example message |
|-------------|---------------|-----------------|
| Client creates issue | `CREATED` | Issue created: {title} |
| Client adds comment | `COMMENT` | Comment added |
| Manager sends response | `RESPONSE` | Manager responded |
| Manager changes status | `STATUS_CHANGED` or `RESOLVED` | Status changed from OPEN to IN_PROGRESS |
| Manager sets status to **Resolved** | `RESOLVED` | Status changed from … to RESOLVED |
| Manager changes severity | `SEVERITY_CHANGED` | Severity changed from MEDIUM to HIGH |
| Manager assigns / unassigns | `ASSIGNED` | Issue assigned to manager |
| Client or manager edits details | `UPDATED` | Issue details updated |

**Resolution events:** When status becomes `RESOLVED`, the activity type is `RESOLVED` (not generic `STATUS_CHANGED`), giving a distinct resolution entry in the timeline.

#### API

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/issues/:id/timeline` | Client (own issues) + Manager (all issues) |

Service layer enforces access via `getById()` before returning activities.

#### UI

| Role | Page | Component |
|------|------|-----------|
| Client | `/issues/:id` | `Timeline` — right column “Activity Timeline” |
| Manager | `/manager/issues/:id` | `Timeline` — right column “Timeline” |

The timeline shows event type badge, message, actor name/role, timestamp, and icons per event type.

#### Key files

| Layer | File |
|-------|------|
| Schema | `server/prisma/schema.prisma` |
| Service | `server/src/services/issue.service.ts` |
| Repository | `server/src/repositories/activity.repository.ts` |
| Route | `server/src/routes/index.ts` |
| UI | `client/src/components/issues/Timeline.tsx` |

---

## Notifications

### Requirement

**Clients should be notified when an issue is resolved.**

### Implementation approach

**Chosen approach: In-app notifications (database-backed).**

Email is **not** implemented; documented as future work in [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).

#### Trigger

When a **manager** sets issue status to **`RESOLVED`** via `PATCH /api/issues/:id/manage`:

1. Timeline entry with type `RESOLVED` is appended.
2. Notification row created for the issue creator:

```
type: ISSUE_RESOLVED
message: Your issue "{title}" has been resolved
userId: client who created the issue
```

Notification fires on `RESOLVED` only, not `CLOSED`.

#### Additional notifications (bonus)

| Trigger | Type | Recipient |
|---------|------|-----------|
| Manager assigns issue | `ISSUE_ASSIGNED` | Assignee |
| Manager adds response | `ISSUE_COMMENT` | Issue creator |

#### API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | List + unread count |
| PATCH | `/api/notifications/:id/read` | Mark one read |
| PATCH | `/api/notifications/read-all` | Mark all read |

#### UI

- Header notification bell with unread badge
- Dropdown with messages and “View issue” links
- Polls every 30 seconds

#### Not implemented

| Approach | Reason |
|----------|--------|
| Email | Out of assessment scope |
| WebSockets | Polling sufficient for demo |
| Mock-only (no DB) | Persistent rows enable E2E testing |

---

## Verification

```bash
npm run test:e2e
```

- **C06** — Timeline after client actions
- **C07** — Client notification on resolve
- **M08** — All timeline event types

Manual: manager resolves issue → client sees bell notification and timeline “Resolved” entry.

---

## Summary

| Feature | Status | Approach |
|---------|--------|----------|
| Timeline (client + manager) | Done | `activity_logs` + REST + shared UI |
| All required event types | Done | Service hooks on mutations |
| Notify on resolve | Done | In-app DB notification |
| Email | Not done | Future enhancement |
