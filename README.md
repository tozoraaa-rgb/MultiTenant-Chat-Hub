# MultiTenant Chat Hub — Monorepo, Transformation Summary, and Complete Run Guide

This repository evolved from a single frontend/backend project into a **workspace-based monorepo** with a deployable backend service, reusable widget packages, and integration demos.

This README serves two goals:

1. **Complete transformation resume** from commit `feat: initialize monorepo foundation with workspaces and turbo` to `fix demo startup reliability on windows environments`.
2. **Practical operations guide** (dependencies, install, run backend, run demos, troubleshoot).

---

## 1) Executive summary of the transformation

### Before
- Project was organized as a more traditional app setup (admin/frontend + backend), without full workspace packaging for reusable deliverables.
- Widget reuse across heterogeneous hosts was not yet formalized as productized packages.

### After
- Repository is now a **monorepo** using **npm workspaces** + **Turborepo** orchestration.
- Architecture was split into clear deliverables:
  - `apps/backend-service`: deployable API service.
  - `apps/admin-app`: admin UI.
  - `packages/widget-core`: UI-agnostic runtime logic (network policy, errors, sendMessage flow).
  - `packages/widget-react`: React adapter/UI package.
  - `packages/widget-web-component`: universal `<chatbot-widget>` integration package.
  - `packages/shared-types`: shared runtime contracts between backend and frontend packages.
- Added operational support:
  - Docker Compose stack for backend + MySQL.
  - Demo host apps for React and plain HTML integration.
  - Windows reliability fixes for optional native dependency resolution.

---

## 2) Current monorepo structure

```text
.
├─ apps/
│  ├─ admin-app/              # Admin dashboard app
│  ├─ backend-service/        # Deployable backend API service
│  ├─ demo-react-host/        # React integration target demo
│  └─ demo-html-host/         # Plain HTML/Web Component demo
├─ packages/
│  ├─ shared-types/           # Shared API/runtime contracts
│  ├─ widget-core/            # Runtime logic (agnostic)
│  ├─ widget-react/           # React adapter and components
│  ├─ widget-web-component/   # Custom element wrapper
│  ├─ eslint-config/          # Shared lint config
│  └─ tsconfig-base/          # Shared TS configs
├─ scripts/
│  └─ ensure-windows-optional-deps.mjs
├─ docker-compose.yml
├─ turbo.json
└─ package.json
```

---

## 3) Complete commit-by-commit resume (requested range)

> Range covered: from `5ccfeb9` to `ec0c854`.

### 3.1 `5ccfeb9` — feat: initialize monorepo foundation with workspaces and turbo
**Why it changed**
- Established the base transformation into a workspace monorepo orchestrated by Turborepo.
- Imported/organized admin app and backend app under `apps/`.

**Primary files changed**
- Root setup: `package.json`, `turbo.json`, root `README.md`, `.gitignore`.
- App foundations: `apps/admin-app/**`, `apps/backend-service/**`.

---

### 3.2 `5c8ae39` — Add mainClassName prop to AdminLayout component
**Why it changed**
- Improved admin layout composability and styling control.

**Primary file changed**
- `apps/admin-app/src/layouts/AdminLayout.tsx`

---

### 3.3 `d1b657e` — Refactor ChatbotBuilder for type and import updates
**Why it changed**
- Cleaned/updated admin builder code after structural and typing updates.

**Primary file changed**
- `apps/admin-app/src/pages/admin/ChatbotBuilder.tsx`

---

### 3.4 `77c6068` — feat: establish shared runtime contracts and base config packages
**Why it changed**
- Introduced shared package infrastructure so backend and widget layers use common contracts/types.
- Standardized lint/TypeScript base configs as reusable packages.

**Primary files changed**
- New shared packages: `packages/shared-types/**`, `packages/eslint-config/**`, `packages/tsconfig-base/**`.
- Backend wiring for shared contracts: `apps/backend-service/src/api/v1/interfaces/ChatRuntime.ts`, config files.

---

### 3.5 `264c2eb` — feat: package backend service with health and docs endpoints
**Why it changed**
- Productized backend service with explicit operational endpoints for health and API docs.

**Primary files changed**
- Backend app/service bootstrap and docs wiring under `apps/backend-service/**`.

---

### 3.6 `aca87f2` — feat: stabilize public chat runtime v1 contract surface
**Why it changed**
- Locked down runtime v1 request/response shape and behavior.

**Primary files changed**
- `packages/shared-types/src/chat.ts`
- Backend runtime service/controller/validation areas under `apps/backend-service/src/api/v1/**`.

---

### 3.7 `fe51a64` — feat(widget-core): implement runtime client, sendMessage, and policy
**Why it changed**
- Added the core widget runtime package responsible for API calling policy, timeout/retry behavior, and consistent error handling.

**Primary files changed**
- `packages/widget-core/**` (runtime client, errors, tests, exports)

---

### 3.8 `09d58ef` — feat(widget-react): implement Feature 5 React widget adapter
**Why it changed**
- Added reusable React widget UI and hooks, consuming `widget-core` instead of duplicating runtime logic.

**Primary files changed**
- `packages/widget-react/src/components/*`
- `packages/widget-react/src/hooks/useChatbotWidget.ts`
- `packages/widget-react/tests/*`

---

### 3.9 `128765c` — feat(widget-web-component): implement Feature 6 custom element wrapper
**Why it changed**
- Added universal browser integration path via custom element wrapper around the React widget.
- Enabled host-agnostic embedding with `<chatbot-widget ...>`.

**Primary files changed**
- `packages/widget-web-component/src/ChatbotWidgetElement.ts`
- `packages/widget-web-component/src/attributes.ts`
- `packages/widget-web-component/src/events.ts`
- `packages/widget-web-component/src/mountReactWidget.tsx`
- tests and package config.

---

### 3.10 `5aa1aa0` — feat(widget-web-component): add shadow style isolation strategy
**Why it changed**
- Implemented style encapsulation strategy inside Shadow DOM so widget CSS is isolated from host page CSS.

**Primary files changed**
- `packages/widget-web-component/src/injectStyles.ts`
- `packages/widget-web-component/src/widgetStyles.ts`
- updates to element registration and tests.

---

### 3.11 `4b661e4` — feat(backend): harden public runtime origin security model
**Why it changed**
- Added origin allowlist enforcement model for multi-tenant public chat runtime calls.
- Introduced backend structures for allowed origins per chatbot and related validations/tests.

**Primary files changed**
- Controllers/services/models/validation for allowed origins in `apps/backend-service/src/api/v1/**`.
- Security tests in `apps/backend-service/tests/chat-runtime/*`.
- Shared runtime typing update in `packages/shared-types/src/chat.ts`.

---

### 3.12 `f94e1d9` — fix widget origin error handling and add wildcard toggles
**Why it changed**
- Refined origin enforcement behavior, wildcard controls, and frontend error handling alignment.

**Primary files changed**
- Backend security service/validation/tests in `apps/backend-service/**`.
- Widget runtime/react error mapping handling in `packages/widget-core/**`, `packages/widget-react/**`.
- Widget config typing in `packages/shared-types/src/widget.ts`.

---

### 3.13 `6f5aa27` — feat: add backend docker compose stack with mysql bootstrap
**Why it changed**
- Made local evaluation much easier by shipping a launchable backend+DB stack via Docker Compose.

**Primary files changed**
- `docker-compose.yml`
- `apps/backend-service/Dockerfile`
- env/docs updates in backend + root.

---

### 3.14 `4b0281e` — feat: add integration target demos for react and html hosts
**Why it changed**
- Added concrete demo hosts showing both integration modes:
  - React package integration.
  - Plain HTML + browser bundle + custom element integration.

**Primary files changed**
- `apps/demo-react-host/**`
- `apps/demo-html-host/**`
- `packages/widget-web-component/src/browser.ts`
- bootstrap/seed support in backend docs and services.

---

### 3.15 `9eddaa4` — fix demo setup docs and cross-platform bootstrap scripts
**Why it changed**
- Improved demo onboarding quality and cross-platform setup reliability.

**Primary files changed**
- Demo docs in both demo apps.
- HTML demo build script: `apps/demo-html-host/scripts/build-widget-bundle.mjs`
- Backend seed script/docs refinements.

---

### 3.16 `ec0c854` — fix demo startup reliability on windows environments
**Why it changed**
- Resolved Windows startup instability tied to optional native dependency issues.

**Primary files changed**
- `scripts/ensure-windows-optional-deps.mjs`
- package scripts in `apps/demo-react-host/package.json` and `packages/widget-web-component/package.json`
- docs updates in root and demo READMEs.

---

## 4) Mapping to the target architecture vision

The implemented transformation aligns with the architectural direction of:

- **Independent backend service** (deployable API + docs/health + Docker stack).
- **Reusable widget with dual integration modes**:
  - React package (`packages/widget-react`)
  - Universal custom element (`packages/widget-web-component`)
- **Shared contracts** to avoid frontend/backend drift (`packages/shared-types`).
- **Runtime core isolation** (`packages/widget-core`) to keep networking policy and UI concerns separate.
- **Demo-first validation path** (`apps/demo-react-host`, `apps/demo-html-host`) so supervisors/integrators can test quickly.

---

## 5) Prerequisites

- **Node.js** 18+ recommended (Node 20 LTS suggested).
- **npm** 9+.
- **Docker + Docker Compose plugin** (for containerized backend stack).
- Optional: **Gemini API key** if you want real LLM responses.

---

## 6) Install dependencies

From repository root:

```bash
npm install
```

---

## 7) Run options

## Option A — Full backend stack with Docker (recommended)

```bash
docker compose up --build
```

Services:
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`
- API docs: `http://localhost:4000/api-docs`
- MySQL: `localhost:3306`

The compose setup includes seed/bootstrap behavior for demo evaluation (for example demo chatbot domain and permissive local demo origin defaults).

Helper commands:

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

---

## Option B — Run backend service locally (without Docker)

1. Create backend env file:

```bash
cp apps/backend-service/.env.example apps/backend-service/.env
```

2. Ensure your local MySQL is running and env values match.

3. Start backend in dev mode:

```bash
npm run dev --workspace @mth/backend-service
```

4. Build/start production-style backend:

```bash
npm run build --workspace @mth/backend-service
npm run start --workspace @mth/backend-service
```

---

## 8) Run demos

### 8.1 React host demo

```bash
npm run dev --workspace @mth/demo-react-host
```

Open: `http://localhost:5173`

What it proves:
- React-side integration through the package API (`@mth/widget-react`).

### 8.2 HTML host demo

```bash
npm run dev --workspace @mth/demo-html-host
```

Open: `http://localhost:8080`

What it proves:
- Universal host integration via browser bundle + `<chatbot-widget>`.

---

## 9) Workspace-level commands (Turborepo)

From repo root:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run clean
```

Notes:
- `dev` is persistent and uncached (as defined in `turbo.json`).
- `build` and `test` follow task dependencies across packages.

---

## 10) API, runtime, and multi-tenant notes

- Public runtime is versioned under `/api/v1/...`.
- Backend includes security model improvements around origin verification and allowed origins per chatbot.
- Widget layers consume standardized contracts from `@mth/shared-types` to keep backend/frontend behavior aligned.

Practical production guidance:
- Prefer explicit allowed origins per tenant/chatbot.
- Keep CORS and runtime origin checks aligned.
- Treat frontend-sent identifiers as non-secret; enforce trust decisions on backend.

---

## 11) Windows troubleshooting

If optional native packages are missing (common with Vite/esbuild/rollup on some Windows setups), run:

```powershell
npm i -D @rollup/rollup-win32-x64-msvc @esbuild/win32-x64 --no-save
```

If reinstall is needed (PowerShell syntax):

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

Also note:
- This repo now includes bootstrap logic in scripts (`scripts/ensure-windows-optional-deps.mjs`) and demo/package scripts to reduce startup failures in Windows environments.

---

## 12) Suggested evaluation flow for reviewers/supervisors

1. Start backend stack:
   - `docker compose up --build`
2. Verify health/docs:
   - `http://localhost:4000/health`
   - `http://localhost:4000/api-docs`
3. Run React demo and test widget:
   - `npm run dev --workspace @mth/demo-react-host`
4. Run HTML demo and test web component:
   - `npm run dev --workspace @mth/demo-html-host`
5. Confirm both hosts can call public runtime and return responses.

This demonstrates the intended platform model: **single deployable backend + reusable widget packages + host-agnostic integration paths**.
