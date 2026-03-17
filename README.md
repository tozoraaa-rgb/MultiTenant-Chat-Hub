# MultiTenant Chat Hub Monorepo

This repository is now organized as a monorepo using **npm workspaces** and **Turborepo**.

## Structure

- `apps/backend-service` - Express + TypeScript backend service (existing product backend).
- `apps/admin-app` - React/TypeScript admin dashboard app.
- `apps/demo-react-host` - React host integration target consuming `@mth/widget-react`.
- `apps/demo-html-host` - plain HTML host integration target consuming browser bundle from `@mth/widget-web-component`.
- `packages/shared-types` - source of truth for shared public runtime contracts (backend + widget packages).
- `packages/widget-core` - UI-agnostic widget runtime package.
- `packages/widget-react` - React widget package.
- `packages/widget-web-component` - Web Component wrapper package.
- `packages/eslint-config` - shared ESLint config package.
- `packages/tsconfig-base` - shared TypeScript base config package.

## Install dependencies

```bash
npm install
```

## Docker local backend stack (Feature 9)

Run backend + MySQL:

```bash
docker compose up --build
```

Quick URLs:

- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`
- OpenAPI docs: `http://localhost:4000/api-docs`

Compose startup bootstraps a demo chatbot domain `shop.example.com` and seeds allowed origins for host demos:

- `http://localhost:5173` (React host demo)
- `http://localhost:8080` (HTML host demo)

## Integration target demos (Feature 10)

### Demo A — React host (`apps/demo-react-host`)

```bash
npm run dev --workspace @mth/demo-react-host
```

This proves package-based React integration via `@mth/widget-react`.

### Demo B — Plain HTML host (`apps/demo-html-host`)

```bash
npm run dev --workspace @mth/demo-html-host
```

This builds a browser bundle from `@mth/widget-web-component` and serves a static page using `<chatbot-widget>`.

## Optional helper scripts

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

## Monorepo commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

These commands are orchestrated with Turborepo across workspace packages/apps.
