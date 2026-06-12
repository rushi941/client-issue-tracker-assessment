# Client Issue Tracker - Master Project Context

## Project Goal

Build a production-quality Client Issue Tracker SaaS platform for a technical assessment.

The application allows clients to monitor websites, create issues, track progress, and communicate with support teams.

Managers can review, prioritize, respond to, assign, and resolve issues.

The goal is to demonstrate:

- Architecture decisions
- Product thinking
- UI/UX quality
- AI-assisted development
- Production readiness
- Documentation quality

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- JWT
- Role Based Access Control (RBAC)

---

## User Roles

### Client

Can:

- Login
- View assigned websites
- View website status
- Create issues
- Add comments
- Track issue progress
- View timeline
- View notifications

### Manager

Can:

- Login
- View all issues
- Assign issues
- Update status
- Update severity
- Add responses
- View analytics
- Resolve issues

---

## Architecture Rules

Follow:

Controller → Service → Repository → Prisma → PostgreSQL

Never access Prisma directly from controllers.

Use dependency separation.

All business logic belongs in services.

---

## Required Modules

### Authentication

- Login
- Logout
- Protected routes
- RBAC middleware

### Website Dashboard

- Website status
- Open issue count
- Last checked time

### Issue Management

- Create issue
- Edit issue
- Update severity
- Update status
- Assignment system

### Timeline

Track:

- Created
- Updated
- Assigned
- Status changes
- Severity changes
- Comments
- Responses
- Resolved

### Notifications

- In-app notifications
- Unread count
- Mark as read

### Analytics

Manager Dashboard:

- Open Issues
- Resolved Issues
- Critical Issues
- Average Resolution Time
- Issues by Status
- Issues by Severity

### AI Features

- Issue Categorization
- Severity Recommendation
- Issue Summary
- Suggested Manager Response

---

## UI Design System

Inspired by Pixel Future.

### Colors

| Token      | Hex       |
| ---------- | --------- |
| Primary    | `#1A1247` |
| Secondary  | `#FF0F7B` |
| Accent     | `#00CFFF` |
| Success    | `#22C55E` |
| Warning    | `#F59E0B` |
| Danger     | `#EF4444` |
| Background | `#F8F9FC` |
| Card       | `#FFFFFF` |
| Text       | `#111827` |

### Layout

- Dark sidebar
- Light content area
- White cards
- Rounded corners
- Modern SaaS design

### Typography

- Inter font

---

## Database Tables

- users
- websites
- issues
- comments
- activity_logs
- notifications
- attachments

---

## Code Quality Rules

- Strict TypeScript
- ESLint
- Prettier
- Zod validation
- Error handling middleware
- Reusable components
- Responsive design
- Accessible UI

---

## Deliverables

- README.md
- ARCHITECTURE.md
- AI_WORKFLOW.md
- PRODUCTION_READINESS.md
- API_SPEC.md
- DATABASE_SCHEMA.md
- TEST_PLAN.md
