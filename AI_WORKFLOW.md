# AI Workflow

This document describes how AI-assisted development tools were used to build the Client Issue Tracker assessment project, including **proper example prompts**, reflection, and lessons learned.

---

## Tools Used

| Tool | Role in this project |
|------|----------------------|
| **Cursor** | Primary IDE — chat, inline edits, multi-file agent mode |
| **Cursor Agent (Composer)** | End-to-end features: pagination, auth guards, UI redesign, docs, test runs |
| **Cursor Rules / Agent Skills** | Structured workflows in `.cursor/skills/` (architect, PM, QA, tester, documentation) |
| **GitHub Copilot** | Inline autocomplete for repetitive TypeScript/React patterns |
| **Claude / GPT (via Cursor)** | Architecture reasoning, bug diagnosis, documentation drafting |

**Cursor** was the main tool; other tools supplemented specific tasks.

---

## How to Write Effective Prompts (Pattern Used)

Prompts that worked best followed this structure:

1. **Context** — reference file, agent, or requirement doc (`@architect-agent`, `MASTER_CONTEXT.md`, screenshot)
2. **Goal** — one clear outcome per prompt
3. **Constraints** — what *not* to change (no rewrites, keep architecture, no Docker)
4. **Acceptance criteria** — how to verify success (run E2E, update docs, generate report)

**Weak prompt:**  
`Fix the UI`

**Strong prompt:**  
`Fix stacked "Failed to fetch" toasts on the manager analytics page. Use inline QueryErrorBanner instead of global toasts. Do not change API routes. Run npm run build when done.`

---

## Example Prompts

Below are **real prompts** used during this project, rewritten in proper form with goal and outcome.

### Phase 1 — Requirements and project bootstrap

#### Prompt 1: Initial recruitment review

```
Review the recruitment Task.docx and create the files you need to start the project.
I will share the tech stack and UI guidelines next.
```

| | |
|---|---|
| **Goal** | Understand assessment scope before coding |
| **Outcome** | Agent skills, folder plan, and initial documentation structure |

---

#### Prompt 2: Tech stack and design system

```
Frontend: React (Vite + TypeScript)
Backend: Node.js + Express
Database: PostgreSQL

Use Pixel Future design system:
- Primary: #1A1247
- Secondary: #FF0F7B
- Accent: #00CFFF
- Background: #F8F9FC

Configure Tailwind with these colors and scaffold client + server monorepo.
```

| | |
|---|---|
| **Goal** | Lock stack and visual identity |
| **Outcome** | Tailwind theme, Vite client, Express server skeleton |

---

#### Prompt 3: Agent team setup

```
Create agent skills for: architect, project manager, QA lead, tester, UI designer,
and documentation. Each skill should define when to use it and expected outputs.
Store under .cursor/skills/
```

| | |
|---|---|
| **Goal** | Reusable AI workflows per role |
| **Outcome** | `.cursor/skills/*` for structured multi-agent development |

---

#### Prompt 4: Master context document

```
# Client Issue Tracker - Master Project Context

[Paste full spec: roles, features, tech stack, AI requirements, documentation deliverables]

Use this as the single source of truth for all implementation decisions.
```

| | |
|---|---|
| **Goal** | Prevent scope drift across sessions |
| **Outcome** | `docs/MASTER_CONTEXT.md` driving all feature work |

---

### Phase 2 — Infrastructure and architecture

#### Prompt 5: Remove Docker, use local PostgreSQL

```
@architect-agent

Remove Docker dependency completely. Use local PostgreSQL instead.

Database:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: Admin@123
- Database: ai_tracker

Update README.md, .env.example, Prisma config, and setup instructions.
Ensure the project runs without Docker.
```

| | |
|---|---|
| **Goal** | Match local dev environment |
| **Outcome** | Local Postgres setup, updated env and README |

---

#### Prompt 6: Backend layering

```
@fullstack-developer-agent

Build Express API using strict layering:
Route → Controller → Service → Repository → Prisma

Rules:
- Never call Prisma from controllers or services
- Use Zod validation on request bodies
- JWT in httpOnly cookie with RBAC middleware
- Return errors as { error: string }

Implement auth, websites, issues, notifications, analytics, and AI stub endpoints.
```

| | |
|---|---|
| **Goal** | Production-style backend structure |
| **Outcome** | Full API with repositories and RBAC |

---

#### Prompt 7: Project audit

```
@project-manager-agent

Perform a project audit. Show:
1. Current folder structure
2. Generated vs missing files
3. Whether client/ and server/ are fully scaffolded
4. Prisma schema, migrations, auth, routes status
5. Overall completion percentage

Output a gap analysis report.
```

| | |
|---|---|
| **Goal** | Objective progress check |
| **Outcome** | `PROJECT_AUDIT.md` with completion gaps |

---

#### Prompt 8: QA review

```
@qa-lead-agent

Review the entire codebase against MASTER_CONTEXT.md.

Check for:
- Architecture violations (Prisma in services)
- Missing RBAC, timeline, notifications, analytics, AI
- TypeScript and security issues

Create QA_REPORT.md with severity: Critical / High / Medium / Low
```

| | |
|---|---|
| **Goal** | Structured quality review |
| **Outcome** | `QA_REPORT.md` with prioritized fixes |

---

#### Prompt 9: Fix high-severity QA items

```
@fullstack-developer-agent

Read QA_REPORT.md and PROJECT_AUDIT.md. Implement all HIGH severity issues only.

Tasks:
1. QA-H01: Move Prisma out of website.service into WebsiteRepository
2. QA-H02: Add strict manager-only RBAC on PATCH /issues/:id/manage
3. QA-H03: Document attachments as future enhancement OR add minimal stub (501)

Constraints:
- No feature rewrites
- No UI redesign
- Keep architecture consistent

Generate HIGH_FIXES_SUMMARY.md when done.
```

| | |
|---|---|
| **Goal** | Targeted fixes without scope creep |
| **Outcome** | `HIGH_FIXES_SUMMARY.md`, repository pattern enforced |

---

### Phase 3 — Testing, lint, and submission assets

#### Prompt 10: E2E testing and screenshots

```
@tester-agent

Execute complete end-to-end testing.

Client flow: login → websites → create issue → view → comment → notifications
Manager flow: login → analytics → queue → assign → severity → status → response → resolve

Validate: timeline entries, notifications, RBAC, no API failures

Generate FINAL_TEST_REPORT.md

Also capture screenshots:
01-login-page.png through 09-notifications.png
Store in client/public/screenshots/
```

| | |
|---|---|
| **Goal** | Verifiable submission evidence |
| **Outcome** | `scripts/e2e-test.mjs`, 20 passing tests, 9 screenshots |

---

#### Prompt 11: ESLint and Prettier

```
@fullstack-developer-agent

Add ESLint and Prettier for client and server.
Include React hooks plugin. Add npm scripts: lint, lint:fix, format, format:check
Document setup in LINT_SETUP.md
```

| | |
|---|---|
| **Goal** | Code quality tooling |
| **Outcome** | Root `eslint.config.js`, Prettier, lint scripts |

---

### Phase 4 — UI/UX polish

#### Prompt 12: shadcn UI and toasts

```
Add toast notifications for all errors and successful submits.
Refactor sidebar, forms, and buttons to use shadcn/ui design.
Use Sonner for toasts. Match Pixel Future colors.
```

| | |
|---|---|
| **Goal** | Consistent modern UI |
| **Outcome** | shadcn components, `AppSidebar`, global mutation toasts |

---

#### Prompt 13: Fix Tailwind build error

```
[plugin:vite:css] The `border-border` class does not exist.

Fix Tailwind/shadcn CSS setup so the client builds.
Use tailwind.config.cjs if needed for PostCSS compatibility on Windows.
```

| | |
|---|---|
| **Goal** | Unblock Vite build |
| **Outcome** | `tailwind.config.cjs`, direct CSS border-color fix |

---

#### Prompt 14: Sidebar dual selection bug

```
[Attach screenshot]

Both "My Websites" and "My Issues" appear selected in the sidebar at the same time.
Fix active nav logic so only the current route is highlighted.
Use longest-path-wins matching for nested routes.
```

| | |
|---|---|
| **Goal** | Correct navigation UX |
| **Outcome** | `getActiveNavPath()` in `client/src/lib/navigation.ts` |

---

#### Prompt 15: Login demo autofill and motion

```
For demo credentials on the login page:
- Click client/manager card to autofill email and password
- Add subtle motion/animation on the left marketing panel (slide-in, glow)

Do not auto-submit — user still clicks Sign in.
```

| | |
|---|---|
| **Goal** | Faster demo flow for reviewers |
| **Outcome** | Click-to-fill demo cards, CSS animations on login panel |

---

#### Prompt 16: Manager UI errors and redesign

```
[Attach screenshot]

Manager UI shows stacked "Failed to fetch" toasts.
Fix by using inline QueryErrorBanner instead of global query error toasts.

Also redesign Manager Analytics and All Issues pages to match client polish.
Add collapsible sidebar with smooth open/close animation and toggle button.
```

| | |
|---|---|
| **Goal** | Fix error UX and polish manager pages |
| **Outcome** | Inline errors, redesigned manager pages, animated sidebar |

---

### Phase 5 — Features and data

#### Prompt 17: Requirement verification

```
Verify these requirements are implemented. If missing, implement properly:

Client: login, websites, status, create/view issues, timeline
Manager: login, all issues, respond, severity, status, timeline
Website dashboard: name, URL, status, last checked, open issues
Issue categories: Bug, Feedback, Suggestion, Improvement
Issue severities: Low, Medium, High, Critical
Issue statuses: Open, In Review, In Progress, Waiting for Client, Resolved, Closed
```

| | |
|---|---|
| **Goal** | Gap-fill against assessment rubric |
| **Outcome** | Verified flows; dashboard labels and badges aligned |

---

#### Prompt 18: Timeline and notifications documentation

```
Document how Issue Timeline and Notifications are implemented.
Timeline must show: created, status, severity, comments, responses, resolved.
Notifications: client notified on resolve (in-app; email as future work).
Create TIMELINE_AND_NOTIFICATIONS.md
```

| | |
|---|---|
| **Goal** | Document design for reviewers |
| **Outcome** | `TIMELINE_AND_NOTIFICATIONS.md` |

---

#### Prompt 19: My Issues sorting and filters

```
On My Issues page add:
- Sort dropdown (newest created, oldest, recently updated, title A–Z, severity)
- Filters: status, severity, created date range
- Show created/updated dates on issue cards
Make it look professional with shadcn components.
```

| | |
|---|---|
| **Goal** | Rich list UX for clients |
| **Outcome** | Client-side filters first; later moved server-side with pagination |

---

#### Prompt 20: Server-side pagination and loader

```
Add server-side pagination on GET /api/issues with default sort createdAt desc.
Add loader component while data is fetching.
Update My Issues and Manager issue queue to use paginated API.
Run npm run build and npm run test:e2e when done.
```

| | |
|---|---|
| **Goal** | Scalable list API |
| **Outcome** | Paginated `{ items, pagination }` response, `Loader` component |

---

#### Prompt 21: Page size options

```
For pagination use 5 items per page by default.
Add UI to select page size: 5, 10, 20, 50.
Apply on both client and server. Reset to page 1 when page size changes.
```

| | |
|---|---|
| **Goal** | Configurable page sizes |
| **Outcome** | `PAGE_SIZE_OPTIONS`, validated server-side |

---

#### Prompt 22: Pagination placement and shadcn design

```
[Attach screenshot]

Move pagination to the END of the list only (not inside filter card).
Remove duplicate "Showing X of Y" text.
Use proper shadcn pagination components (Card, PaginationPrevious/Next, Select).
```

| | |
|---|---|
| **Goal** | Clean list layout |
| **Outcome** | `pagination.tsx`, bottom `ListPaginationFooter` |

---

#### Prompt 23: Branded search, filter, pagination

```
Add uniqueness to search, filter, and pagination on My Issues and My Websites:
- Gradient search bar with clear button
- Filter panel closed by default; badge count on Filters button
- Active filter chips (removable)
- Pagination progress bar and page number pills
Extract shared components under components/list/
```

| | |
|---|---|
| **Goal** | Distinctive Pixel Future list UI |
| **Outcome** | `ListSearchBar`, `ListToolbar`, `ListFilterPanel`, `ActiveFilterChips` |

---

#### Prompt 24: Filter panel closed on load

```
Filter panel should be CLOSED on page load.
User opens it only by clicking the Filters button.
Keep active filter chips visible when filters are applied.
```

| | |
|---|---|
| **Goal** | Less visual clutter on first load |
| **Outcome** | `showFilters` default `false` on Dashboard and Issues pages |

---

#### Prompt 25: Back button and auto-navigate after submit

```
[Attach screenshot]

Add Back button above issue detail content.
After submitting a comment (client) or manager response, automatically navigate
back to the previous page (issue list).
Do not navigate away when manager changes status/severity in dropdowns.
```

| | |
|---|---|
| **Goal** | Better detail page flow |
| **Outcome** | `BackButton`, `useGoBack`, auto-back on comment/response success |

---

#### Prompt 26: More seed data for pagination testing

```
Add 50 more websites to prisma/seed.ts for the demo client.
Keep original 4 Acme sites for sample issues.
Run npm run db:seed after updating.
```

| | |
|---|---|
| **Goal** | Test pagination with realistic volume |
| **Outcome** | 54 total websites; `GET /websites/options` for dropdowns |

---

#### Prompt 27: Website pagination (same as issues)

```
Add server-side pagination and sorting to websites (My Websites dashboard)
same as My Issues: default createdAt desc, page sizes 5/10/20/50, search, filters, loader.
Add GET /websites/options for New Issue dropdown.
```

| | |
|---|---|
| **Goal** | Consistent list experience |
| **Outcome** | Paginated websites API + shared list UI components |

---

#### Prompt 28: Auth route guards

```
Add proper routing guards:
- Logged-out users cannot access protected routes
- Logged-in users redirected from /login
- After logout, user cannot browser-back into protected pages
- Clear React Query cache on logout
- Handle API 401 by redirecting to login

Use standard patterns: ProtectedRoute, GuestRoute, useLogout hook.
```

| | |
|---|---|
| **Goal** | Secure SPA navigation |
| **Outcome** | `GuestRoute`, `AuthSessionBridge`, `usePreventAuthBackNavigation` |

---

#### Prompt 29: AI integration advice

```
For AI features (categorization, severity, summary, response suggestions):
Should we use DeepSeek API or Cursor Pro?

Recommend approach for assessment demo without requiring paid API keys.
```

| | |
|---|---|
| **Goal** | Choose practical AI strategy |
| **Outcome** | Rule-based `AiService` with optional `OPENAI_API_KEY` upgrade path |

---

### Phase 6 — Documentation deliverables

#### Prompt 30: Full documentation pack

```
Create/update these files for assessment submission:

README.md — overview, setup, run instructions, assumptions
ARCHITECTURE.md — system architecture, technical decisions, database design, app flow
AI_WORKFLOW.md — tools used, proper example prompts, reflection
PRODUCTION_READINESS.md — security, reliability, scalability, deployment, monitoring

Base content on the actual implemented codebase, not generic templates.
```

| | |
|---|---|
| **Goal** | Complete documentation deliverables |
| **Outcome** | All four docs aligned with current project state |

---

## Prompt Tips That Worked Best

| Tip | Example |
|-----|---------|
| **Tag agents** | `@tester-agent`, `@fullstack-developer-agent` |
| **Attach screenshots** | UI bugs with image + describe expected behavior |
| **Limit scope** | "HIGH severity only", "no UI redesign" |
| **Name files to update** | "Update ARCHITECTURE.md if routes change" |
| **Require verification** | "Run npm run test:e2e and npm run build" |
| **One feature per prompt** | Pagination separate from auth guards |
| **Paste requirements verbatim** | Assessment rubric as checklist prompts |

---

## In-App AI Features (Product, Not Dev Tool)

The application exposes rule-based AI endpoints (no external API required for demo):

| Feature | Endpoint | Implementation |
|---------|----------|----------------|
| Category + severity suggestion | `POST /api/ai/suggest` | Keyword rules in `AiService` |
| Issue summary | `GET /api/ai/issues/:id/summary` | Title + description excerpt |
| Suggested manager response | `GET /api/ai/issues/:id/suggest-response` | Template from issue context |

Optional: set `OPENAI_API_KEY` in `server/.env` for future LLM integration.

---

## Reflection

### How AI assisted the workflow

1. **Rapid scaffolding** — Monorepo, Prisma schema, Express layers, React pages, TanStack Query
2. **Consistent patterns** — Same repository pattern across issues, websites, notifications
3. **UI iteration** — shadcn, sidebar, login motion, list toolbar — tight screenshot feedback loops
4. **Debugging** — Tailwind errors, dual nav highlight, pagination API shape, 401 redirect loops
5. **Documentation** — README, architecture, QA reports, test reports generated and updated
6. **Verification** — Agent ran build, E2E, and seed scripts after major changes

### Where manual intervention was required

| Area | Why human review was needed |
|------|----------------------------|
| Route ordering | `/issues/managers` before `/issues/:id` |
| Prisma relations | `assigneeId` → `connect`/`disconnect` |
| Auth 401 handler | Exclude `/auth/me` to prevent redirect loops |
| Logout + browser back | `GuestRoute` + history trap on login |
| Pagination migration | Separate `/websites/options` for New Issue dropdown |
| TypeScript | Page size unions, Prisma enum arrays |
| UX decisions | Filters closed by default, 5 per page, auto-back after submit |

### Changes made to AI-generated outputs

- Rule-based AI instead of live API calls (reliable demo without keys)
- Inline `QueryErrorBanner` instead of stacked global toasts
- Shared `components/list/` for search/filter/pagination
- Server-side filters when pagination was added (removed client `useMemo` filtering)
- `tailwind.config.cjs` for Windows PostCSS compatibility
- Logout always clears session in `finally` block

### Key learnings

1. **Layered architecture** survives feature additions (pagination touched repo + controller + UI only)
2. **Master context doc** reduces AI drift across long sessions
3. **Run E2E after API shape changes** — catches breaking consumers immediately
4. **Scope AI to patterns; review auth and Prisma manually**
5. **Proper prompts save rework** — constraints and acceptance criteria prevent unwanted refactors
6. **Shared UI primitives** keep My Issues and My Websites consistent

---

## Recommended Workflow for Similar Projects

1. Paste master spec → scaffold architecture → implement vertically (auth → CRUD → UI)
2. Use agent mode for multi-file features; chat for single-file fixes
3. Run `npm run build` + `npm run test:e2e` after routing or API changes
4. Attach screenshots for UI prompts; tag agent role for audits and tests
5. Document assumptions as you make scope decisions
6. Review auth, RBAC, and logout flows manually even when AI-generated

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) — Production deployment path
- [AGENTS.md](AGENTS.md) — Multi-agent team workflow
- [FINAL_TEST_REPORT.md](FINAL_TEST_REPORT.md) — E2E test results
