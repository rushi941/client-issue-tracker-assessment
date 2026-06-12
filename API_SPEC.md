# API Specification

Base URL: `http://localhost:3001/api` (dev via Vite proxy: `/api`)

All authenticated routes require JWT cookie `auth_token`.

## Auth

| Method | Path           | Auth | Body                  | Response                    |
| ------ | -------------- | ---- | --------------------- | --------------------------- |
| POST   | `/auth/login`  | —    | `{ email, password }` | `{ user }` + cookie         |
| POST   | `/auth/logout` | —    | —                     | `{ message }`               |
| GET    | `/auth/me`     | ✓    | —                     | `{ id, email, name, role }` |

## Websites

| Method | Path        | Role                         | Response    |
| ------ | ----------- | ---------------------------- | ----------- |
| GET    | `/websites` | CLIENT (own) / MANAGER (all) | `Website[]` |

## Issues

| Method | Path                      | Role    | Notes                                                |
| ------ | ------------------------- | ------- | ---------------------------------------------------- |
| GET    | `/issues`                 | Both    | Client: own; Manager: all. Query: `?status=&search=` |
| GET    | `/issues/managers`        | MANAGER | Assignee dropdown list                               |
| POST   | `/issues`                 | CLIENT  | Create issue                                         |
| GET    | `/issues/:id`             | Both    | Detail + comments                                    |
| PATCH  | `/issues/:id`             | CLIENT  | Update title, description, category                  |
| PATCH  | `/issues/:id/manage`      | MANAGER | Update status, severity, assignment                  |
| POST   | `/issues/:id/comments`    | CLIENT  | `{ body }`                                           |
| POST   | `/issues/:id/responses`   | MANAGER | `{ body }` manager response                          |
| GET    | `/issues/:id/attachments` | Both    | List attachments (+ meta: upload not yet supported)  |
| POST   | `/issues/:id/attachments` | Both    | **501** — upload future enhancement                  |
| GET    | `/issues/:id/timeline`    | Both    | ActivityLog[]                                        |

## Notifications

| Method | Path                      | Response                         |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/notifications`          | `{ notifications, unreadCount }` |
| PATCH  | `/notifications/:id/read` | Mark one read                    |
| PATCH  | `/notifications/read-all` | Mark all read                    |

## Analytics

| Method | Path                   | Role    | Response                                                          |
| ------ | ---------------------- | ------- | ----------------------------------------------------------------- |
| GET    | `/analytics/dashboard` | MANAGER | Open/resolved/critical counts, avg resolution, by status/severity |

## AI

| Method | Path                              | Role    | Body/Params                                                    |
| ------ | --------------------------------- | ------- | -------------------------------------------------------------- |
| POST   | `/ai/suggest`                     | ✓       | `{ title, description }` → category, severity, suggestedAction |
| GET    | `/ai/issues/:id/summary`          | ✓       | Issue summary text                                             |
| GET    | `/ai/issues/:id/suggest-response` | MANAGER | Suggested manager reply                                        |

## Error format

```json
{ "error": "Human readable message" }
```

Status codes: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 500 server error
