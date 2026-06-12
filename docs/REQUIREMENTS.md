# Client Issue Tracker — Recruitment Requirements

> AI Full Stack Engineer Take-Home Assessment  
> Source: Task.docx

## Overview

Build a **Client Issue Tracker** platform used by clients to monitor websites, report issues, track progress, and communicate with support teams. Managers review, manage, and resolve issues with full lifecycle visibility.

The assessment is intentionally open-ended. Evaluators look at architecture, implementation, UX, AI-assisted development, and production readiness.

**Recommended effort:** 6–8 hours (not expected to be production-complete).

---

## Scenario

A client owns one or more websites requiring monitoring and maintenance.

### Client needs

- View status of their websites
- Report issues and requests
- Track progress of reported items
- View communication history
- Receive updates when issues are resolved

### Manager needs

- Review all reported issues
- Respond to clients
- Prioritize work
- Manage issue lifecycle
- Track historical changes and activity

---

## Technology Requirements

### Frontend (choose one)

- React
- Next.js
- Angular

**Confirmed for this project:** React.js (Vite + TypeScript)

### Backend

Any JavaScript-based backend framework.

**Confirmed for this project:** Node.js + Express

Examples from spec: Express, NestJS, Next.js API Routes, Fastify

### Database (choose one)

- PostgreSQL
- MySQL
- SQLite
- Supabase

**Confirmed for this project:** PostgreSQL

---

## Design Requirements

Visual inspiration: [https://pixel-future.com](https://pixel-future.com)

Goal: modern, professional SaaS-style product aligned with Pixel Future design quality (not a pixel-perfect clone).

### Confirmed design tokens

| Token            | Hex       | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| Primary (Dark)   | `#1A1247` | Sidebar, headings, primary buttons |
| Secondary (Pink) | `#FF0F7B` | CTAs, highlights, active states    |
| Accent (Cyan)    | `#00CFFF` | Links, info, timeline accents      |
| Background       | `#F8F9FC` | Page background                    |
| Card             | `#FFFFFF` | Card surfaces                      |
| Text             | `#111827` | Body text                          |
| Success          | `#22C55E` | Online status                      |
| Warning          | `#F59E0B` | Degraded status                    |
| Danger           | `#EF4444` | Down / critical                    |

---

## Functional Requirements

### Authentication

Two roles: **Client** and **Manager**. Mock authentication is acceptable if documented.

#### Client

- Login
- View assigned websites
- View website status
- Create issues
- View issue details
- Track issue progress
- View issue timelines

#### Manager

- Login
- View all issues
- Review issue details
- Respond to issues
- Update issue severity
- Update issue status
- View issue timelines

---

### Website Dashboard

Display websites with:

- Website Name
- URL
- Current Status
- Last Checked Time
- Open Issues Count

**Suggested statuses:** Online, Down, Degraded, Unknown

Monitoring may use mock data or a real approach (document choice).

---

### Issue Reporting

Clients create issues.

**Categories:** Bug, Feedback, Suggestion, Improvement

**Required fields:**

- Title
- Description
- Associated Website
- Severity

**Suggested severity:** Low, Medium, High, Critical

Optional additions at your discretion.

---

### Issue Management

Managers can:

- View issue details
- Add responses
- Update issue status
- Update issue severity

**Suggested statuses:** Open, In Review, In Progress, Waiting for Client, Resolved, Closed

---

### Issue Timeline

Both clients and managers view activity history:

- Issue creation
- Status updates
- Severity updates
- Comments
- Responses
- Resolution events

---

### Notifications

Clients notified when an issue is resolved.

Implementation options:

- In-app notifications
- Email notifications
- Mock notification workflows

Document the approach.

---

### AI Integration (encouraged, not mandatory)

AI may assist with:

- Issue categorisation
- Severity recommendations
- Suggested actions
- Response generation
- Issue summarisation

Any AI provider allowed. If not implemented, document reasoning.

---

## Required Deliverables

GitHub repository containing:

1. Source Code
2. `README.md` — overview, setup, run instructions, assumptions
3. `ARCHITECTURE.md` — system architecture, decisions, DB design, app flow
4. `AI_WORKFLOW.md` — AI tools used, example prompts, reflection
5. `PRODUCTION_READINESS.md` — security, reliability, scalability, deployment, monitoring

### Submission

- GitHub Repository URL
- Screenshots of key workflows
- Optional: demo video, deployed URL

---

## Evaluation Criteria

- Engineering judgement
- Architecture decisions
- Product thinking
- User experience
- AI-assisted development workflow
- Code quality
- Documentation quality
- Production readiness mindset

Document assumptions clearly where required.
