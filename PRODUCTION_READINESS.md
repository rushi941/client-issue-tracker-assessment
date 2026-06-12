# Production Readiness

This document describes how the Client Issue Tracker would be prepared for a production environment. The current codebase is an **assessment prototype** — items marked **Implemented** exist today; others are **Recommended** for production.

---

## Current State vs Production

| Area | Assessment (now) | Production target |
|------|------------------|-------------------|
| Auth | JWT cookie, demo users | Short-lived tokens, refresh rotation, optional MFA |
| Data lists | Server-side pagination ✅ | Same + cursor pagination at very large scale |
| Monitoring | Mock website status | Real HTTP/TLS checks via job queue |
| Notifications | In-app only | Email + in-app + optional push |
| AI | Rule-based | External LLM with caching and rate limits |
| Attachments | Schema + 501 upload | S3-compatible storage + virus scan |
| Tests | E2E API script | Unit + integration + E2E in CI |
| Deploy | Local dev only | CI/CD to staged environments |

---

## Security

### Implemented (baseline)

- Password hashing with **bcrypt**
- **JWT** stored in **httpOnly** cookie (not localStorage)
- **RBAC** middleware (`authenticate`, `requireRole`) on protected routes
- **Zod** validation on request bodies
- **CORS** restricted to `CLIENT_URL`
- Client **route guards** (ProtectedRoute, GuestRoute, 401 session bridge)
- Service-layer scoping (clients see only their websites/issues)

### Recommended for production

| Control | Approach |
|---------|----------|
| **Transport** | HTTPS everywhere; HSTS headers |
| **Headers** | `helmet()` — CSP, X-Frame-Options, Referrer-Policy |
| **Rate limiting** | `express-rate-limit` on `/auth/login`, AI routes, and write endpoints |
| **JWT** | Short access token (15m) + rotating refresh token; revoke list for logout-all-devices |
| **Secrets** | AWS Secrets Manager / Vault; never commit `.env`; rotate `JWT_SECRET` |
| **Input sanitization** | Sanitize HTML in comment bodies (DOMPurify server-side or markdown-only) |
| **CSRF** | SameSite=Strict cookies + CSRF token for state-changing requests if cross-origin |
| **Dependency audit** | `npm audit`, Dependabot, Snyk in CI |
| **RBAC audit** | Log assignee/status changes with actor ID (activity log already supports this) |
| **File upload** | MIME validation, size limits, ClamAV scan, signed S3 URLs with expiry |

---

## Reliability

### Implemented

- Centralized **error middleware** with consistent JSON error shape
- **Health check** at `GET /health` for load balancer probes
- **Prisma migrations** for reproducible schema changes
- **Idempotent seed** for dev/demo (production would not run seed)

### Recommended

| Practice | Detail |
|----------|--------|
| **Managed PostgreSQL** | Neon, RDS, or Supabase with automated daily backups and PITR |
| **Migration gate** | Run `prisma migrate deploy` in CI before app deploy; fail deploy on migration error |
| **Connection pooling** | PgBouncer or Prisma Accelerate under load |
| **Graceful shutdown** | Handle SIGTERM; drain HTTP connections before exit |
| **Retry policy** | Transient DB errors retried with exponential backoff in workers |
| **Notification deduplication** | Unique constraint on `(userId, issueId, type, createdAt bucket)` to prevent duplicates |
| **Circuit breaker** | For external AI and email providers |

---

## Scalability

### Implemented

- **Server-side pagination** on `GET /api/issues` and `GET /api/websites`
- **Parallel count + findMany** in repositories
- **Indexed columns** on foreign keys and filter fields (`status`, `clientId`, `issueId`)

### Recommended

| Layer | Strategy |
|-------|----------|
| **API** | Horizontal scaling behind load balancer; stateless nodes (JWT in cookie or Redis session) |
| **Database** | Read replica for analytics queries; connection pool sizing per instance |
| **Caching** | Redis for session, notification unread counts, analytics aggregates (TTL 60s) |
| **Background jobs** | BullMQ / SQS for website health checks, email dispatch, AI batch jobs |
| **Static assets** | CDN (CloudFront, Cloudflare) for Vite build output |
| **Large lists** | Cursor-based pagination when offsets exceed ~10k rows |
| **File storage** | S3 + CloudFront for attachments |

---

## Deployment

### Suggested architecture

```
                    ┌─────────────┐
   Users ──────────►│   CDN       │  client static (Vite dist)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Load       │
                    │  Balancer   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         API Node 1   API Node 2   API Node N   (Express containers)
              │            │            │
              └────────────┼────────────┘
                           ▼
                    ┌─────────────┐
                    │ PostgreSQL  │  managed (Neon / RDS)
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Redis       │  cache + job queue
                    └─────────────┘
```

### Component mapping

| Component | Suggested platform |
|-----------|-------------------|
| **Frontend** | Vercel, Netlify, or S3 + CloudFront |
| **API** | Railway, Render, Fly.io, or AWS ECS/Fargate |
| **Database** | Neon PostgreSQL, Supabase, or Amazon RDS |
| **Files** | Amazon S3 or Cloudflare R2 |
| **Secrets** | Platform env vars or AWS Parameter Store |

### CI/CD pipeline (GitHub Actions example)

```yaml
# On pull request:
#   - npm ci
#   - npm run lint
#   - npm run build
#   - npm run test:e2e (against ephemeral DB)

# On merge to main:
#   - prisma migrate deploy
#   - deploy API container
#   - deploy client static assets
#   - smoke test /health
```

### Environment strategy

- **Development** — local Postgres, hot reload
- **Staging** — production-like config, anonymized data, preview URLs
- **Production** — strict secrets, no seed script, minimal error detail in responses

---

## Monitoring

### Recommended stack

| Concern | Tool |
|---------|------|
| **Errors** | Sentry (frontend + backend) |
| **Logs** | Structured JSON (pino) → Datadog / CloudWatch |
| **Metrics** | Prometheus + Grafana or Datadog APM |
| **Uptime** | Pingdom / UptimeRobot on `/health` |
| **DB** | Query latency, connection count, slow query log |

### Key metrics to track

- API request latency (p50, p95, p99) by route
- Error rate (4xx vs 5xx)
- Authentication failures and rate-limit hits
- Issue creation rate, mean time to resolve
- Notification delivery success (when email added)
- Website health check failure rate (when monitoring added)
- Database connection pool utilization

### Alerting thresholds (examples)

- 5xx rate > 1% for 5 minutes → page on-call
- `/health` failing 2 consecutive checks → page
- DB connections > 80% pool → warn
- Disk usage > 85% → warn

---

## Maintenance

### Ongoing operations

| Task | Frequency |
|------|-----------|
| Dependency updates (Dependabot PRs) | Weekly review |
| Security patch deploy | Within 48h of critical CVE |
| Database backup restore test | Monthly |
| Prisma migration review | Every release |
| Access audit (manager accounts) | Quarterly |
| Activity log retention policy | Define + archive after N months |
| Load test before major releases | Per release |

### Data retention

- **Activity logs** — archive to cold storage after 12–24 months
- **Resolved issues** — soft-delete or archive per client contract
- **Notifications** — purge read notifications older than 90 days

### Runbooks

Document procedures for:

1. Database failover
2. Rolling back a bad deploy
3. Rotating JWT secret without mass logout (dual-key validation window)
4. Incident response for data breach

---

## Production Checklist

Before go-live:

- [ ] Replace demo seed with real admin bootstrap script
- [ ] Set strong `JWT_SECRET` and database credentials
- [ ] Enable HTTPS and security headers
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up managed PostgreSQL with backups
- [ ] Deploy CI/CD with migration step
- [ ] Configure Sentry and structured logging
- [ ] Load test paginated list endpoints
- [ ] Penetration test or OWASP ZAP scan
- [ ] Document on-call and rollback procedures
- [ ] Implement email notifications (if required)
- [ ] Implement attachment upload with storage + scan (if required)

---

## Assessment Gaps (Intentionally Deferred)

These are documented as future work, not blockers for the assessment demo:

- Live website HTTP monitoring
- Email / push notifications
- Attachment upload UI and storage
- External LLM integration (OpenAI)
- Redis caching and WebSockets
- Comprehensive unit/integration test suite
- Multi-tenant organization model

See [README.md](README.md#assumptions-made) for full assumptions list.

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design and flows
- [AI_WORKFLOW.md](AI_WORKFLOW.md) — Development process
- [API_SPEC.md](API_SPEC.md) — REST API reference
