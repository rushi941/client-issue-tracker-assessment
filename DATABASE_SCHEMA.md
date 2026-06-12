# Database Schema

ORM: Prisma. Source: [server/prisma/schema.prisma](server/prisma/schema.prisma)

## Local connection (no Docker)

| Setting  | Value        |
| -------- | ------------ |
| Host     | `localhost`  |
| Port     | `5432`       |
| Username | `postgres`   |
| Password | `Admin@123`  |
| Database | `ai_tracker` |

`DATABASE_URL` in `server/.env`:

```
postgresql://postgres:Admin%40123@localhost:5432/ai_tracker?schema=public
```

Create database: `psql -U postgres -h localhost -c "CREATE DATABASE ai_tracker;"`

## Entity relationship

```
User 1──* Website (clientId)
User 1──* Issue (createdById)
User 1──* Issue (assigneeId, optional)
Website 1──* Issue
Issue 1──* Comment
Issue 1──* ActivityLog
Issue 1──* Notification
Issue 1──* Attachment
User 1──* Notification
```

## Tables

### users

| Column       | Type   | Notes           |
| ------------ | ------ | --------------- |
| id           | cuid   | PK              |
| email        | string | unique          |
| name         | string |                 |
| passwordHash | string | bcrypt          |
| role         | enum   | CLIENT, MANAGER |

### websites

| Column        | Type       | Notes                           |
| ------------- | ---------- | ------------------------------- |
| id            | cuid       | PK                              |
| name          | string     |                                 |
| url           | string     |                                 |
| status        | enum       | ONLINE, DOWN, DEGRADED, UNKNOWN |
| lastCheckedAt | datetime   | mock monitoring                 |
| clientId      | FK → users |                                 |

### issues

| Column      | Type      | Notes                                  |
| ----------- | --------- | -------------------------------------- |
| id          | cuid      | PK                                     |
| title       | string    |                                        |
| description | text      |                                        |
| category    | enum      | BUG, FEEDBACK, SUGGESTION, IMPROVEMENT |
| severity    | enum      | LOW–CRITICAL                           |
| status      | enum      | OPEN → CLOSED                          |
| websiteId   | FK        |                                        |
| createdById | FK        |                                        |
| assigneeId  | FK?       | manager assignment                     |
| resolvedAt  | datetime? | set on RESOLVED/CLOSED                 |

### comments

| Column            | Type    | Notes |
| ----------------- | ------- | ----- |
| id                | cuid    | PK    |
| body              | text    |       |
| isManagerResponse | boolean |       |
| issueId           | FK      |       |
| authorId          | FK      |       |

### activity_logs

| Column   | Type   | Notes                                            |
| -------- | ------ | ------------------------------------------------ |
| id       | cuid   | PK                                               |
| type     | enum   | CREATED, UPDATED, ASSIGNED, STATUS_CHANGED, etc. |
| message  | string | display text                                     |
| metadata | json?  | old/new values                                   |
| issueId  | FK     |                                                  |
| actorId  | FK     |                                                  |

### notifications

| Column  | Type      | Notes                                |
| ------- | --------- | ------------------------------------ |
| id      | cuid      | PK                                   |
| type    | enum      | ISSUE_RESOLVED, ISSUE_ASSIGNED, etc. |
| message | string    |                                      |
| readAt  | datetime? |                                      |
| userId  | FK        |                                      |
| issueId | FK?       |                                      |

### attachments

| Column       | Type   | Notes            |
| ------------ | ------ | ---------------- |
| id           | cuid   | PK               |
| filename     | string |                  |
| mimeType     | string |                  |
| size         | int    |                  |
| url          | string | storage path/URL |
| issueId      | FK     |                  |
| uploadedById | FK     |                  |

## Seed data

- `client@demo.com`, `manager@demo.com`, `manager2@demo.com` (password: demo123)
- 3 websites for demo client
- 2 sample issues with activity and comments

Run: `npm run db:seed`
