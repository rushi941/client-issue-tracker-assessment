# Test Plan

## Scope

Functional testing of Client Issue Tracker per [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) and [docs/MASTER_CONTEXT.md](docs/MASTER_CONTEXT.md).

## Environment

- Node 20+, local PostgreSQL 14+ (no Docker)
- Database: `ai_tracker` on `localhost:5432`
- Seed: `npm run db:seed`
- App: `npm run dev`

## Test cases

### TC-AUTH

| ID     | Steps                        | Expected               |
| ------ | ---------------------------- | ---------------------- |
| TC-A01 | Login as client@demo.com     | Redirect to /dashboard |
| TC-A02 | Login as manager@demo.com    | Redirect to /manager   |
| TC-A03 | Invalid password             | Error message          |
| TC-A04 | Access /dashboard as manager | Redirect away          |
| TC-A05 | Logout                       | Redirect to login      |

### TC-WEB

| ID     | Steps                  | Expected                                    |
| ------ | ---------------------- | ------------------------------------------- |
| TC-W01 | Client views dashboard | 3 websites with status badges               |
| TC-W02 | Verify columns         | name, URL, status, last checked, open count |

### TC-ISSUE-CLIENT

| ID      | Steps                 | Expected                    |
| ------- | --------------------- | --------------------------- |
| TC-IC01 | Create issue via form | Appears in /issues          |
| TC-IC02 | AI Suggest on form    | Category/severity populated |
| TC-IC03 | View issue detail     | Timeline shows CREATED      |
| TC-IC04 | Add comment           | Comment + timeline event    |

### TC-ISSUE-MANAGER

| ID      | Steps                     | Expected                       |
| ------- | ------------------------- | ------------------------------ |
| TC-IM01 | View all issues           | Seeded issues visible          |
| TC-IM02 | Update status to RESOLVED | Timeline + client notification |
| TC-IM03 | Assign to manager         | Assignment activity logged     |
| TC-IM04 | AI suggest response       | Text populated in textarea     |
| TC-IM05 | Change severity           | Timeline SEVERITY_CHANGED      |

### TC-NOTIFY

| ID     | Steps                    | Expected                 |
| ------ | ------------------------ | ------------------------ |
| TC-N01 | Resolve issue as manager | Client bell shows unread |
| TC-N02 | Mark read                | Unread count decreases   |

### TC-ANALYTICS

| ID      | Steps                    | Expected           |
| ------- | ------------------------ | ------------------ |
| TC-AN01 | Manager /manager page    | Stats cards render |
| TC-AN02 | By status/severity lists | Match seeded data  |

### TC-AI

| ID      | Steps                | Expected                    |
| ------- | -------------------- | --------------------------- |
| TC-AI01 | POST /api/ai/suggest | Returns category + severity |
| TC-AI02 | GET summary          | Returns summary string      |

## Regression

Re-run TC-AUTH, TC-IM02, TC-N01 after auth or issue service changes.

## Acceptance gate

All P0 cases pass before submission. Capture screenshots for login, dashboard, create issue, timeline, manager resolve, notification.
