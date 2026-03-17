# MultiTenant Chat Hub Monorepo

This repository is now organized as a monorepo using **npm workspaces** and **Turborepo**.

## Structure

- `apps/backend-service` - Express + TypeScript backend service (existing product backend).
- `apps/admin-app` - React/TypeScript admin dashboard app.
- `apps/demo-react-host` - scaffold for a future React host integration demo.
- `apps/demo-html-host` - scaffold for a future plain HTML host integration demo.
- `packages/shared-types` - source of truth for shared public runtime contracts (backend + widget packages).
- `packages/widget-core` - scaffold for future UI-agnostic widget runtime.
- `packages/widget-react` - scaffold for future React widget package.
- `packages/widget-web-component` - scaffold for future Web Component wrapper.
- `packages/eslint-config` - shared ESLint config package.
- `packages/tsconfig-base` - shared TypeScript base config package.

## Install dependencies

```bash
npm install
```

## Run backend service

```bash
npm run dev --workspace @mth/backend-service
```

## Docker local stack (Feature 9)

Run the full backend demo stack (backend + MySQL):

```bash
docker compose up --build
```

or via npm helper scripts:

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

What comes online:

- Backend base URL: `http://localhost:4000`
- Health endpoint: `http://localhost:4000/health`
- OpenAPI docs page: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs.json`

Notes:

- Compose automatically boots MySQL and wires backend `DB_HOST=mysql`.
- Compose enables `DB_AUTO_SYNC=true` and `DB_AUTO_SEED=true` so schema/bootstrap seed data are applied automatically for local testing.
- If you want real LLM responses, provide `GEMINI_API_KEY` in your shell before running compose.

## Monorepo commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

These commands are orchestrated with Turborepo across workspace packages/apps.
