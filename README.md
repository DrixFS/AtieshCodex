# Atiesh Codex

> **Atiesh Codex** is an **open-source**, **fan-made web application** for the game World of Warcraft Forever, built upon an **enterprise-level monorepo engine** designed for modular scalability, rapid parallel development, and rock-solid production pipelines. Running in production at **[atieshcodex.com](https://atieshcodex.com)**.
>
> _Disclaimer: Atiesh Codex is an open-source, non-commercial fan-made project for World of Warcraft Forever and is not affiliated with, endorsed by, or associated with Blizzard Entertainment, Inc._

---

## Overview

A modern, high-performance, open-source monorepo managed with **pnpm workspaces** and orchestrated by **Turborepo** (`turbo` v2) for high-speed incremental computation caching, strict type safety, and automated contract synchronization.

## Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

- **Node.js**: v22.x or later
- **pnpm**: v12.x (or enabled via Corepack: `corepack enable`)

---

## Quick Start & Setup on New Machines

### 1. Clone the repository

```bash
git clone https://github.com/DrixFS/AtieshCodex
cd atiesh-codex
```

### 2. Install and Setup

To install all dependencies (root, backend, frontend) and build all packages in one step:

```bash
pnpm run setup
```

Alternatively, to just install all dependencies across the workspace:

```bash
pnpm install
```

To perform a completely clean re-installation:

```bash
pnpm run setup:clean
```

---

## Command Reference

All primary developer operations are orchestrated from the root workspace using `pnpm`.

> **CLI Shortcut Tips**:
>
> - In `pnpm`, the `run` keyword is optional for root scripts: you can type `pnpm build:client` instead of `pnpm run build:client`.
> - Use the `-F` shorthand for `--filter`: `pnpm -F client dev`, `pnpm -F server test`, `pnpm -F @atiesh/components dev`.
> - You can also navigate directly into any package folder (`cd apps/client`, `cd apps/server`, `cd packages/components`) and run `pnpm build`, `pnpm dev`, or `pnpm test`.

### Setup & Installation

| Command                | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies for all workspaces (`server`, `client`, `components`, root) |
| `pnpm run setup`       | Install all dependencies and build all workspace projects                        |
| `pnpm run setup:clean` | Clean build outputs, force-reinstall all dependencies, and rebuild all projects  |

### Development & Debugging

| Command                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `pnpm run dev`           | Start development servers in parallel with hot reload                |
| `pnpm run dev:server`    | Start only the NestJS backend with watch mode                        |
| `pnpm run dev:client`    | Start only the Vite frontend dev server (port 3000)                  |
| `pnpm run dev:storybook` | Start the Storybook component explorer on port `6006`                |
| `pnpm run dev:debug`     | Start the NestJS backend in debug mode with inspector on port `9229` |

### Documentation & Design System

| Command                    | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm run build:docs`      | Build unified monorepo docs hub, TypeDoc API, Storybook, and OpenAPI specs (`Docs/`) |
| `pnpm run preview:docs`    | Preview the unified documentation hub locally on port `4000`                         |
| `pnpm run build:storybook` | Build static Storybook site (`Docs/storybook/`)                                      |

### API Type Generation & Contract Synchronization

| Command                       | Description                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm run generate:api-types` | Generate TypeScript interfaces directly from server OpenAPI schema into `@atiesh/contracts` workspace |

### Testing

| Command                       | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| `pnpm run test`               | Run all test suites across server (Jest), client (Jest), components (Jest) |
| `pnpm run test:server`        | Run backend unit and integration tests                                     |
| `pnpm run test:client`        | Run frontend unit and component tests                                      |
| `pnpm run test:components`    | Run Web Components unit tests with Jest                                    |
| `pnpm run test:cov`           | Run all Jest test suites with coverage report across packages              |
| `pnpm run test:visual`        | Run Storybook visual regression tests with Playwright                      |
| `pnpm run test:visual:update` | Update Storybook baseline visual snapshots with Playwright                 |
| `pnpm run test:watch`         | Run all tests in interactive watch mode across packages                    |
| `pnpm run pre-push`           | Pre-push verification gate running circular checks                         |

### Building & Production

| Command                     | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| `pnpm run build`            | Compile TypeScript and build production bundles for all workspace packages |
| `pnpm run build:server`     | Build backend NestJS application (`apps/server/dist/`)                      |
| `pnpm run build:client`     | Build frontend static SPA bundle (`apps/client/dist/`)                      |
| `pnpm run build:components` | Build Web Components library (`packages/components/dist/`)                 |
| `pnpm run build:contracts`  | Build auto-generated API contracts workspace package                       |
| `pnpm run build:storybook`  | Build static Storybook site (`Docs/storybook/`)                            |
| `pnpm run build:docs`       | Build unified monorepo documentation hub (`Docs/`)                         |
| `pnpm run preview:docs`     | Preview the unified documentation hub locally on port `4000`               |
| `pnpm run clean`            | Remove `dist` and build output directories across all workspaces           |
| `pnpm run start`            | Start the production backend server (`node dist/main`)                     |
| `pnpm run preview:client`   | Preview the production client build locally via Vite                       |

### Code Quality & Validation

| Command                              | Description                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm run validate`                  | **Full CI pipeline**: runs format check, lint, circular check, typecheck, and tests |
| `pnpm run format`                    | Auto-format all files across workspace using Prettier                               |
| `pnpm run format:check`              | Check all files against Prettier formatting rules                                   |
| `pnpm run lint`                      | Run ESLint across all packages with zero warnings allowed (`--max-warnings 0`)      |
| `pnpm run lint:fix`                  | Automatically fix ESLint errors across all packages                                 |
| `pnpm run check:circular`            | Check circular dependencies across all workspace packages via `dpdm`                |
| `pnpm run check:circular:server`     | Check circular dependencies in backend NestJS application                           |
| `pnpm run check:circular:client`     | Check circular dependencies in frontend React application                           |
| `pnpm run check:circular:components` | Check circular dependencies in Web Components library                               |
| `pnpm run typecheck`                 | Run TypeScript type checks (`tsc --noEmit`) across all packages                     |
| `pnpm run typewatch`                 | Run TypeScript type checks in watch mode across packages                            |
| `pnpm run audit`                     | Audit production dependencies for security vulnerabilities                          |

#### Type Safety & Linting Policy

- **No `any` Typing**: The `any` type is strictly forbidden across the codebase (`@typescript-eslint/no-explicit-any: "error"` and TypeScript strict flags enabled).
- **`as` Type Assertions**: Type casting via `as Type` is strictly forbidden and generates a linter error (`@typescript-eslint/consistent-type-assertions: ["error", { "assertionStyle": "never" }]`) to encourage safe typing, type narrowing, and runtime validation.
- **Runtime Environment Validation & Templates**:
  - **Server**: Typed configuration loader and schema validation powered by `@nestjs/config` (`apps/server/src/core/config/`).
  - **Client**: Zod runtime schema parser (`apps/client/src/core/config/env.ts`) ensuring fail-fast verification of `VITE_*` variables and safe typed configuration.
  - **Templates**: Root `.env.example` provides unified full-stack orchestration defaults, while package-scoped `apps/server/.env.example` and `apps/client/.env.example` document package-specific variables.
  - **Security**: All runtime `.env` files (`.env`, `.env.local`, `.env.*.local`) are ignored in `.gitignore`.

### Docker & Containerization

| Command                 | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `pnpm run docker:build` | Build local Docker images for both server and client    |
| `pnpm run docker:up`    | Spin up server and client containers via Docker Compose |
| `pnpm run docker:down`  | Stop and tear down local Docker Compose containers      |

- **Health Checks**: Backend container is monitored with active HTTP health checks targeting `http://localhost:3001/api/ping`.
- **Client Container**: Built with self-contained multi-stage Dockerfile that compiles workspace dependencies and API contracts during container build.

### Kubernetes Deployment

| Command                              | Description                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `kubectl apply -k k8s/base`          | Deploy base Kubernetes resources (namespace, configs, services, ingress) |
| `kubectl apply -k k8s/overlays/dev`  | Deploy development overlay (single replica, dev namespace)               |
| `kubectl apply -k k8s/overlays/prod` | Deploy production overlay (3 replicas, production ingress host)          |
| `kubectl delete -k k8s/base`         | Tear down base Kubernetes resources                                      |

- **Configuration & Secrets**: Non-sensitive configs (`k8s/base/configmap.yaml`) are decoupled from sensitive credentials (`k8s/base/secret.yaml`), mounted via `configMapRef` and `secretRef`.
- **Probes**: `k8s/base/server.yaml` configures `httpGet` liveness and readiness probes on `/api/ping` port 3001.

---

## CI/CD Pipeline & Automated Releases

The repository is configured with automated GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`):

1. **Continuous Integration (PR & Branch Validation)**:
   - Full automated quality checks executed as dedicated steps:
     - OpenAPI client contract generation verification (`pnpm run generate:api-types`).
     - Prettier code style formatting check (`pnpm run format:check`).
     - ESLint linting with strict typing (0 errors and 0 warnings allowed via `--max-warnings 0`).
     - Circular dependency detection via `dpdm` (`pnpm run check:circular`).
     - TypeScript compiler type checks (`tsc --noEmit`).
     - Jest automated test suites.
   - Quality checks gate ensures all stages complete and pass before allowing production compilation.
   - If any warnings or errors are present, the workflow immediately halts and skips subsequent build, Docker, and release jobs.
   - Compiles production bundles, validates Kubernetes manifests (`kustomize`), and tests Docker Compose configuration.

2. **Automated Production Release Pipeline (On `master` / `main` push or `v*` tag)**:
   - **Docker Images**: Builds and publishes multi-tier production Docker images to GitHub Container Registry (`ghcr.io`):
     - `ghcr.io/<owner>/<repo>/server`: Backend NestJS production container.
     - `ghcr.io/<owner>/<repo>/client`: Frontend Nginx SPA production container.
     - Tagged with semantic version, git commit SHA, branch, and `latest`.
   - **Release Artifacts**: Packages deployment bundles attached to GitHub Releases:
     - `k8s-manifests.tar.gz`: Complete Kubernetes manifests bundle (including namespace, configs, secrets, services, and ingress).
     - `client-dist.tar.gz`, `server-dist.tar.gz`, `components-dist.tar.gz`, & `docs-dist.tar.gz`: Pre-compiled production application, component, and full documentation hub (`Docs/`) bundles.
     - `docker-compose.prod.yml` & `.env.production.example`: Production docker compose templates.
     - `SHA256SUMS.txt`: SHA-256 integrity checksums for all release archives.
   - **GitHub Release**: Automatically creates tagged GitHub Releases with auto-generated release notes.
   - **Automated GitHub Pages Documentation**: Deploys the pre-built `docs-dist` artifact directly to GitHub Pages (`github-pages` environment) as the final step of the release pipeline.

3. **Manual Documentation Deployment Workflow (`.github/workflows/deploy-docs.yml`)**:
   - Supports manual on-demand deployment via `workflow_dispatch` in the Actions tab.
   - Allows specifying an optional `release_tag` (e.g. `v0.1.0`) to build and deploy documentation from a specific release or tag without triggering a full CI/CD run.

---

## Documentation & Design System Hub

The monorepo features a unified, statically hostable technical documentation hub outputting to `Docs/` generated by `pnpm run build:docs`:

- **Documentation Portal Landing Hub**: `Docs/index.html` (or [http://localhost:4000](http://localhost:4000) when running `pnpm run preview:docs`).
- **Server REST API Documentation**: `Docs/api/index.html` and `Docs/api/openapi.json`.
- **Client TypeDoc & TSDoc API Reference**: `Docs/client/index.html`.
- **Components Storybook Design System**: `Docs/storybook/index.html`.

The documentation hub is completely static and hosted on **GitHub Pages**. It is automatically deployed upon each production release (`.github/workflows/ci-cd.yml`) and can also be deployed on-demand via the dedicated `.github/workflows/deploy-docs.yml` workflow. In CI/CD, the documentation is built, validated, and archived as an artifact (`docs-dist`) and release asset (`docs-dist.tar.gz`).

---

## Interactive API Documentation (OpenAPI / Swagger)

When the backend development server is running (`pnpm run dev` or `pnpm run dev:server`), Swagger UI and OpenAPI specifications are accessible at:

- **Swagger UI**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **OpenAPI JSON Spec**: [http://localhost:3001/api/docs-json](http://localhost:3001/api/docs-json)

---

## How to effectively code in this monorepo

This section outlines best practices, architectural compliance, and practical developer hints and tips for working across the monorepo workspaces.

### Client (`apps/client/`)

The frontend is a pure Single-Page Application (SPA) built with **React 19**, **TypeScript 5**, and **Vite 6**.

#### Structure & Architectural Compliance

- **Core vs. Features**:
  - Keep foundational, shared infrastructure in `src/core/` (layout, router, HTTP client, configuration, stores, query client).
  - Encapsulate domain logic, UI, and pages into dedicated feature modules under `src/features/<feature-name>/` (e.g., `src/features/auth/`, `src/features/characters/`). Each feature encapsulates its own components, hooks, API calls, and tests.
  - Never bloat `src/core/` or `App.tsx` with domain-specific UI or state.
- **Single Source of Truth for API Contracts**:
  - **Never manually declare backend API request/response types in client code**.
  - All backend models, interfaces, and endpoint response types must be imported from `@atiesh/contracts` (generated automatically via `pnpm run generate:api-types`).
- **State Management Separation & Explicit Boundaries**:
  - **Server State**: Use **TanStack React Query** (`src/core/query/`) exclusively for all asynchronous server state, remote API caching, deduplication, and mutations. Never duplicate remote server entities into MobX stores.
  - **Client State**: Use **MobX Root & Domain Stores** (`src/core/stores/`) with `StoreProvider` and `useStores()` hook strictly for client-side UI state (modals, drawers, notifications, themes) and application lifecycle (online/offline status).

#### Developer Hints & Tips

- **Consuming Web Components**:
  - Web components from `@atiesh/components` are available directly in JSX/TSX.
  - When a new web component is added in `packages/components/`, ensure its JSX typings are declared in `packages/components/src/types/jsx.d.ts` so TypeScript recognizes the custom element tag seamlessly in React.
- **API Client Integration**:
  - Use the preconfigured `apiClient` instance (`src/core/api/`) which handles baseline headers, correlation IDs, JSON serialization, and `ApiClientError` throwing.
- **Hot Reloading & Fast Feedback**:
  - Run `pnpm dev:client` (or `pnpm -F client dev`) to start Vite on port `3000`.
  - Vite is configured with automatic proxying to `http://localhost:3001` for `/api` routes during local development.
- **Strict Type Safety**:
  - Avoid `any` and avoid `as Type` type assertions (both are rejected by ESLint). Prefer type guards, discriminated unions, and safe parsing with Zod (`src/core/config/env.ts`).
- **Testing**:
  - Co-locate tests alongside components (`*.test.tsx`). Use React Testing Library and JSDOM (`pnpm test:client` or `pnpm -F client test:watch`).

---

### Server (`apps/server/`)

The backend is a modular REST/WebSocket API service built with **NestJS 11** and **TypeScript 5**.

#### Structure & Architectural Compliance

- **Modular Monolith & Bounded Contexts**:
  - Infrastructure, global configuration, exception filters, Pino logging, Redis, BullMQ, and health endpoints reside in `src/core/`.
  - Reusable DTOs, cross-cutting constants, and helpers reside in `src/common/`.
  - Business domain capabilities must be organized into isolated NestJS modules under `src/modules/<feature-name>/` (e.g., `src/modules/auth/`, `src/modules/users/`).
- **Encapsulation & Unidirectional Dependencies**:
  - Keep internal services and repositories private within their domain module.
  - Explicitly list public services in the module's `exports` array if other modules need them.
  - Avoid circular module dependencies (`AppModule` -> `Domain Modules` -> `CoreModule`/`Common`).
- **OpenAPI / Swagger Decorator Standards**:
  - Every controller must be decorated with `@ApiTags('<tag>')`.
  - Endpoints must specify `@ApiOperation()` and `@ApiResponse()` status descriptions.
  - Every DTO property must be decorated with `@ApiProperty()` or `@ApiPropertyOptional()` to guarantee accurate OpenAPI schema generation.

#### Developer Hints & Tips

- **Contract Synchronization Workflow**:
  - Whenever modifying backend endpoints, DTOs, or schema models, run `pnpm run generate:api-types` to automatically refresh frontend TypeScript contracts in `@atiesh/contracts`.
- **Structured Logging & Tracing**:
  - Inject `AppLoggerService` (from `src/core/logger/`) instead of standard `console.log`. It automatically captures distributed correlation IDs (`x-correlation-id`) via `AsyncLocalStorage` across async request pipelines.
- **Configuration & Secrets**:
  - Never access `process.env` directly in business logic. Inject `ConfigService` with strongly-typed configuration interfaces defined in `src/core/config/configuration.interface.ts`.
- **Debugging & Development**:
  - Start with watch mode: `pnpm dev:server`.
  - Start with Node.js V8 inspector on port `9229`: `pnpm dev:debug`.
  - Check live Swagger UI at `http://localhost:3001/api/docs` and OpenAPI JSON at `http://localhost:3001/api/docs-json`.
- **Testing**:
  - Place unit and integration tests alongside source files as `*.spec.ts` using `@nestjs/testing` (`pnpm test:server` or `pnpm -F server test:watch`).

---

### Components (`packages/components/`)

The design system is a standalone, framework-agnostic **Web Components library** built with **Lit 3**, **TypeScript 5**, **Vite 6**, and **Storybook 8** (`@atiesh/components`).

#### Structure & Architectural Compliance

- **Component Module Anatomy**:
  - Isolate each custom element in its own folder under `src/components/<component-name>/`:
    - `<name>.ts`: Lit component class definition extending `LitElement`.
    - `<name>.test.ts`: Jest component unit tests with JSDOM.
    - `<name>.stories.ts`: Interactive Storybook documentation and variant controls.
    - `index.ts`: Local barrel export for the component and its types.
  - Re-export the component in `src/index.ts`.
- **Lit & Shadow DOM Guidelines**:
  - Define reactive properties with `static properties = { ... }` and declare instance fields using the `declare` keyword (with constructor initialization) to prevent class field shadowing in ES2022.
  - Encapsulate styles with `static styles = css`...`` and reference design token CSS variables (e.g., `var(--atiesh-color-gold)`).
  - Ensure custom element registration is idempotent (`if (!customElements.get('atiesh-<name>')) { customElements.define('atiesh-<name>', Atiesh<Name>); }`).
- **Events & Content Projection**:
  - Dispatch native events using `CustomEvent` with `{ bubbles: true, composed: true }` so events cross the Shadow DOM boundary cleanly.
  - Prefix event names with `atiesh-` (e.g., `atiesh-change`, `atiesh-select`).
  - Use standard `<slot>` elements for flexible projection and style slotted content with `::slotted()`.

#### Developer Hints & Tips

- **Live Workspace Hot-Reloading (HMR)**:
  - `@atiesh/components` exports point directly to TypeScript source (`./src/index.ts`) and CSS (`./src/styles/theme.css`).
  - When developing in the client (`pnpm dev:client`), any edit made to components or styles in `packages/components/src/` hot-reloads instantly without needing a manual rebuild or bundling step.
- **Storybook-Driven Development**:
  - Develop UI primitives in isolation using `pnpm dev:storybook` (runs Storybook on `http://localhost:6006`).
  - Cover all component variants, sizes, and interactive states with Storybook controls.
- **React JSX Compatibility**:
  - Whenever creating a new custom element, add its tag definition and attribute types to `packages/components/src/types/jsx.d.ts` so consuming React applications have full autocomplete and type safety.
- **Testing Lit Components**:
  - Test rendering, property reflection, slots, and events in Jest (`pnpm test:components`).
  - **Important**: Always `await element.updateComplete` after modifying properties in tests before making DOM assertions to allow Lit's asynchronous render cycle to finish.

---

## Agent & Developer Documentation

For detailed architectural guidelines, coding conventions, testing standards, and module structures, refer to the specialized guides:

- **Root Monorepo Guide**: [`AGENTS.md`](./AGENTS.md) — Workspace architecture, orchestration, contracts synchronization, and CI verification protocol.
- **Backend API Guide**: [`server/AGENTS.md`](./apps/server/AGENTS.md) — NestJS 11 architecture, DTO design, Swagger metadata, scripts, and Jest testing.
- **Frontend SPA Guide**: [`client/AGENTS.md`](./apps/client/AGENTS.md) — React 19 SPA architecture, ApiClient usage, React Router, and Jest testing.
- **Components Design System Guide**: [`components/AGENTS.md`](./packages/components/AGENTS.md) — Lit Web Components architecture, design tokens, Storybook stories, and Jest component testing.

### Automatic Documentation Maintenance

- **Mandatory Self-Updating Documentation**:
  - Whenever implementing a change, refactoring, adding a feature, updating a workflow, modifying configuration/environment variables, or altering commands, developers and AI agents must automatically update the relevant documentation and `AGENTS.md` files (`AGENTS.md`, `server/AGENTS.md`, `client/AGENTS.md`, `components/AGENTS.md`, `README.md`).
  - Any change made that affects information already documented in any guide or `README.md`, or introduces new concepts, conventions, patterns, endpoints, or architectures that should be documented in them, must be reflected immediately in the documentation as part of the same task.
  - Never allow `AGENTS.md` or `README.md` documentation to become stale or outdated.
