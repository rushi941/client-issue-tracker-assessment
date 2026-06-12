# ESLint & Prettier Setup

Linting and formatting for the Client Issue Tracker monorepo (React + Express workspaces).

---

## Tools

| Tool | Purpose |
|------|---------|
| ESLint 9 (flat config) | TypeScript + React hooks linting |
| typescript-eslint | TS rules for client and server |
| eslint-config-prettier | Disables ESLint rules that conflict with Prettier |
| Prettier | Consistent formatting |

---

## Configuration files

| File | Scope |
|------|-------|
| [eslint.config.js](eslint.config.js) | Root ESLint flat config |
| [.prettierrc](.prettierrc) | Prettier options |
| [.prettierignore](.prettierignore) | Ignore dist, node_modules, migrations |

---

## Scripts (root)

```bash
npm run lint          # ESLint entire project
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier write all supported files
npm run format:check  # Prettier check without writing
```

Workspace packages also expose:

```bash
npm run lint -w client
npm run lint -w server
```

---

## What is linted

- `client/**/*.{ts,tsx}` — React 18, hooks rules, refresh plugin
- `server/**/*.ts` — Express + Prisma backend
- `scripts/**/*.mjs` — E2E and screenshot scripts

**Ignored:** `node_modules`, `dist`, Prisma migrations

---

## Prettier defaults

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## CI recommendation

```bash
npm run lint
npm run format:check
npm run test:e2e
```

---

## Status

All ESLint **errors** resolved. Run `npm run lint` — exit code 0.
