# Agents Guide: Atiesh Codex

This document provides essential guidelines, architectural context, and workflow instructions for AI agents and developers working on the **Atiesh Codex** application (Fan-made project for World of Warcraft Forever). Production deployment at **atieshcodex.com**.

---

## 1. Project Overview & Architecture

Atiesh Codex is a modern, modular web application structured as a monorepo managed with **pnpm workspaces** and **Turborepo** (`turbo` v2).

```text
atiesh-codex/
├── apps/
│   ├── client/             # Pure React 19 Single-Page Application (SPA)
│   │   ├── src/
│   │   │   ├── core/       # Core layout, Landing page, API clients, stores
│   │   │   ├── features/   # Modular domain feature modules
│   │   │   ├── test/       # Test setup & polyfills
│   │   │   ├── App.tsx     # Main entry component
│   │   │   └── main.tsx    # DOM bootstrap
│   │   ├── AGENTS.md       # Dedicated client agent & frontend guidelines
│   │   ├── Dockerfile      # Turbo prune multi-stage build + Nginx runtime
│   │   ├── jest.config.cjs # SWC + JSDOM Jest configuration
│   │   ├── nginx.conf      # Nginx reverse proxy / SPA fallback
│   │   ├── package.json    # Client package manifest & scripts
│   │   ├── tsconfig.json   # TypeScript configuration (extends @atiesh/tsconfig/react)
│   │   ├── typedoc.json    # TypeDoc API documentation configuration
│   │   └── vite.config.ts  # Vite build configuration
│   └── server/             # Backend NestJS REST/WS API Service
│       ├── src/
│       │   ├── common/     # Common utilities, contracts, DTOs, constants
│       │   ├── core/       # Core infrastructure, configs, filters, ping/health
│       │   ├── modules/    # Domain feature modules (auth, users, game, etc.)
│       │   ├── app.module.ts
│       │   └── main.ts     # NestJS entrypoint with Swagger & Config integration
│       ├── scripts/        # Backend scripts & contract generator
│       ├── .env.example    # Server environment variables template
│       ├── AGENTS.md       # Dedicated backend agent & NestJS guidelines
│       ├── Dockerfile      # Turbo prune multi-stage production build (Node.js)
│       ├── nest-cli.json   # Nest CLI configuration (Swagger plugin)
│       ├── package.json    # Server package manifest & scripts
│       └── tsconfig.json   # TypeScript configuration (extends @atiesh/tsconfig/node)
├── packages/
│   ├── components/         # Reusable Web Components Library & Storybook (@atiesh/components)
│   │   ├── .storybook/     # Storybook configuration & preview
│   │   ├── src/            # Reusable Lit Web Components & tokens
│   │   ├── AGENTS.md       # Components design system guidelines
│   │   ├── jest.config.cjs # SWC Jest configuration
│   │   └── package.json
│   ├── contracts/          # Auto-generated API Contracts and Schemas (@atiesh/contracts)
│   │   ├── src/            # Type-safe paths, operations, schemas
│   │   └── package.json
│   ├── eslint-config/      # Shared modular ESLint flat configs (@atiesh/eslint-config)
│   │   └── package.json
│   └── tsconfig/           # Shared TypeScript configuration base (@atiesh/tsconfig)
│       └── package.json
├── Docs/                   # Statically generated documentation portal hub
├── k8s/                    # Kubernetes manifests & Kustomize overlays
├── scripts/                # Monorepo build and documentation serving scripts
├── .changeset/             # Changeset release management
├── .env.example            # Root environment variables template
├── AGENTS.md               # Monorepo-wide agent guide and architectural reference
├── docker-compose.yml      # Local container orchestration
├── eslint.config.mjs       # Workspace-wide ESLint root configuration
├── package.json            # Root workspace configuration & orchestration scripts
├── pnpm-workspace.yaml     # pnpm workspace definition (apps/*, packages/*)
├── README.md               # Monorepo developer documentation & quickstart
├── tsconfig.json           # Root TypeScript project references
└── turbo.json              # Turborepo task pipeline & caching configuration
```

### Architectural Principles

1. **Strict Separation of Concerns**:
   - **No Server-Side Rendering (SSR)**. Client and Server are completely decoupled standalone services.
   - Server acts solely as an API provider. Client interacts exclusively via HTTPS / secure WebSocket (WSS) APIs.
2. **Modular Architecture**:
   - Both `server` and `client` are organized by feature modules.
   - Core features (landing page, shared layout, core configs) reside in `src/core/`.
   - Domain features should be isolated into independent modular folders (`src/features/<feature-name>/` or `src/modules/<module-name>/`) on both client and server.
3. **Container-First & Cloud-Native**:
   - Fully dockerized multi-stage production builds for both backend (Node.js) and frontend (Nginx). The frontend container is self-contained and synchronizes contracts and component bundles in-container during build.
   - Container orchestration and Kubernetes deployments are configured with active HTTP health checks and probes targeting `/api/ping` (`httpGet` on port 3001) for zero-downtime rollouts, liveness, and readiness.
   - Kubernetes-ready manifests located under `k8s/` configured for zero-downtime rollouts, TLS termination, and standard ingress routing.
4. **Secure Communication (HTTPS & TLS)**:
   - All production network traffic is strictly enforced over **HTTPS and WSS**.
   - TLS termination and SSL redirection (`ssl-redirect: 'true'`, `force-ssl-redirect: 'true'`) are configured in Kubernetes Ingress (`k8s/ingress.yaml`).
   - Frontend Nginx runtime (`client/nginx.conf`) enforces HTTP Strict Transport Security (`Strict-Transport-Security` / HSTS) and modern defensive HTTP security headers.
5. **Configuration & Secrets Management**:
   - Clean separation of non-sensitive environment configuration (`k8s/configmap.yaml`, `ConfigMap`) from sensitive credentials/tokens (`k8s/secret.yaml`, `Secret` or external secret vaults).
   - Server environment variables (`APP_SECRET`, `DATABASE_URL`) are strongly typed with runtime schema validation.
6. **Single Source of Truth for API Contracts**:
   - Backend OpenAPI/Swagger DTO specifications are the single source of truth for API contracts.
   - The frontend never manually declares backend API response or request interfaces.
   - Client consumes auto-generated TypeScript contracts via `@atiesh/contracts` workspace package (`packages/contracts/`).
7. **Strict State Management Boundaries (React Query vs. MobX)**:
   - Server State (remote data, query caching, invalidations, background fetching) is exclusively managed by `@tanstack/react-query`.
   - Client & UI State (local ephemeral UI, modal state, themes, form staging, browser network state) is managed by `MobX` root and domain stores.
   - Remote data is never duplicated into MobX observable properties.

---

## 2. Tooling & Tech Stack

- **Package Manager & Monorepo Engine**: `pnpm` (v12.x) with strict workspace isolation and **Turborepo** (`turbo` v2) for pipeline orchestration and incremental computation caching.
- **Backend**: NestJS 11, TypeScript 5, Express platform, Jest (`@swc/jest` compiler).
- **Frontend**: React 19, TypeScript 5, Vite 6, Vitest, React Testing Library, JSDOM.
- **Components**: Lit 3, TypeScript 5, Vite 6, Storybook 8, Vitest, JSDOM.
- **Linting & Formatting**: ESLint (Flat Config v9), Prettier (single quotes, 2 spaces, 100 print width).
- **Testing**: Unified **Jest** (`@swc/jest`) across all packages:
  - `apps/server`: Jest (`@swc/jest`, `@nestjs/testing`). Test files match `*.spec.ts`.
  - `apps/client`: Jest (`@swc/jest`, `@testing-library/react`, `jsdom`). Test files match `*.test.tsx` or `*.test.ts`.
  - `packages/components`: Jest (`@swc/jest`, `@testing-library/jest-dom`, `jsdom`). Test files match `*.test.ts`.

---

## 3. Command Reference

All primary developer operations are orchestrated from the root using `pnpm`:

> **CLI Shortcut Tips**:
>
> - In `pnpm`, the `run` keyword is optional for root scripts: `pnpm build:client` instead of `pnpm run build:client`.
> - Use the `-F` shorthand for `--filter`: `pnpm -F client dev`, `pnpm -F server test`, `pnpm -F @atiesh/components storybook`.
> - Direct folder navigation: `cd client && pnpm build` executes local package scripts automatically.

### Setup & Installation

| Command                | Description                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `pnpm install`         | Install all dependencies across all workspaces (root, server, client, and components)   |
| `pnpm run setup`       | Complete setup on a new machine: installs dependencies and builds all packages          |
| `pnpm run setup:clean` | Clean reinstall: cleans existing artifacts, forces reinstallation, and rebuilds project |

### Development & Debugging

| Command                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `pnpm run dev`           | Start development servers in parallel with hot reloading             |
| `pnpm run dev:server`    | Start only the NestJS backend with watch mode                        |
| `pnpm run dev:client`    | Start only the Vite frontend dev server                              |
| `pnpm run dev:storybook` | Start the Storybook component explorer on port `6006`                |
| `pnpm run dev:debug`     | Start the NestJS backend in debug mode with inspector on port `9229` |

### Documentation & Design System

| Command                    | Description                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm run build:docs`      | Build unified monorepo docs hub, TypeDoc API, Storybook, and structured REST API docs (`Docs/`) |
| `pnpm run preview:docs`    | Preview the unified documentation hub locally on port `4000`                                    |
| `pnpm run build:storybook` | Build static Storybook site (`Docs/storybook/`)                                                 |

### API Type Generation & Contract Synchronization

| Command                       | Description                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm run generate:api-types` | Generate TypeScript interfaces directly from server OpenAPI schema into `@atiesh/contracts` workspace |
| `pnpm run changeset`          | Create a changeset for versioning and release management                                              |
| `pnpm run version-packages`   | Bump package versions and update changelogs based on changesets                                       |

### Testing

| Command                       | Description                                                               |
| ----------------------------- | ------------------------------------------------------------------------- |
| `pnpm run test`               | Run all Jest test suites across server, client, and components workspaces |
| `pnpm run test:server`        | Run backend unit and integration tests (Jest)                             |
| `pnpm run test:client`        | Run frontend unit and component tests (Jest)                              |
| `pnpm run test:components`    | Run Web Components unit tests (Jest)                                      |
| `pnpm run test:visual`        | Run Storybook visual regression tests with Playwright                     |
| `pnpm run test:visual:update` | Update Storybook baseline visual snapshots with Playwright                |
| `pnpm run test:watch`         | Run all tests in interactive watch mode across packages                   |
| `pnpm run pre-push`           | Pre-push verification gate running circular checks                        |

### Building & Running Production

| Command                     | Description                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm run build`            | Compile TypeScript and build production bundles for server, client, and components |
| `pnpm run build:server`     | Build backend NestJS application (`server/dist/`)                                  |
| `pnpm run build:client`     | Build frontend static SPA bundle (`client/dist/`)                                  |
| `pnpm run build:components` | Build Web Components library (`components/dist/`)                                  |
| `pnpm run build:storybook`  | Build static Storybook site (`Docs/storybook/`)                                    |
| `pnpm run clean`            | Remove `dist` and build output directories across all workspaces                   |
| `pnpm run start`            | Start the production backend server (`node dist/main`)                             |
| `pnpm run preview:client`   | Preview the production client build locally via Vite                               |

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

### Docker & Kubernetes

| Command                              | Description                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `pnpm run docker:build`              | Build local Docker images for both server and client                     |
| `pnpm run docker:up`                 | Spin up server and client containers via Docker Compose                  |
| `pnpm run docker:down`               | Stop and tear down local Docker Compose containers                       |
| `kubectl apply -k k8s/base`          | Deploy the base application resources to Kubernetes                      |
| `kubectl apply -k k8s/overlays/dev`  | Deploy development overlay (single replica, dev namespace) to Kubernetes |
| `kubectl apply -k k8s/overlays/prod` | Deploy production overlay (3 replicas, production ingress) to Kubernetes |

---

## 4. Agent Rules & Development Workflow

When implementing new features, refactoring, or fixing bugs in this repository, agents must adhere to the following workflow:

### 1. Package Management Rules

- **Always use `pnpm`**. Never execute `npm install` or `yarn`.
- To add a package to server: `pnpm --filter server add <pkg>` (or `-D` for dev dependencies).
- To add a package to client: `pnpm --filter client add <pkg>`.
- To add a root-level dev dependency: `pnpm add -w -D <pkg>`.

### 2. Code Organization & Modularity

- Do not create monoliths. Split logic into dedicated feature modules.
- **Server**: Group related controllers, services, and DTOs into NestJS modules (`@Module()`) and import them into `AppModule` or domain aggregators.
- **Client**: Group related components, hooks, and API clients by feature. Avoid placing feature-specific state or UI directly inside `App.tsx` or `src/core/`.

### 3. Testing Requirements

- Every new feature, endpoint, or significant UI component must include automated tests:
  - Server tests go alongside source files as `*.spec.ts`.
  - Client tests go alongside components as `*.test.tsx` or `*.test.ts`.
- Ensure all tests pass before completing tasks.

### 4. Configuration & Environment Variables

- **Environment Architecture & Templates**:
  - **Root `.env.example`**: Monorepo-wide orchestration template for full-stack local development and Docker Compose.
  - **`server/.env.example`**: Backend-scoped template documenting server ports, database connection strings, Redis, BullMQ, and secret placeholders.
  - **`client/.env.example`**: Frontend-scoped template documenting public `VITE_*` browser environment variables.
- **Security & `.gitignore`**:
  - **Never commit `.env`, `.env.local`, or any `.env.*` files containing secrets or real environment keys.**
  - Standard `.gitignore` rules strictly ignore all environment runtime files while allowing `.env.example` templates.
- **Backend Environment Handling**:
  - Managed via `@nestjs/config` in `src/core/core.module.ts` and loaded via `src/core/config/configuration.ts`.
  - Supports loading `.env.local` and `.env` whether executing from workspace root or inside `server/`.
- **Frontend Environment Handling**:
  - Validated at runtime with Zod in `src/core/config/env.ts` (`clientEnvSchema` and `validateClientEnv`), ensuring fail-fast runtime protection against missing or invalid variables.
- **Production & Kubernetes**:
  - Maintain clean separation between non-sensitive configs (`k8s/configmap.yaml`) and sensitive credentials (`k8s/secret.yaml`), mounted using `configMapRef` and `secretRef`.

### 5. API Documentation (OpenAPI / Swagger)

- The backend provides live interactive Swagger documentation powered by `@nestjs/swagger`.
- When running the server (`pnpm run dev` or `pnpm run dev:server`), Swagger UI is accessible at:
  - **Swagger UI**: `http://localhost:3001/api/docs`
  - **OpenAPI JSON Spec**: `http://localhost:3001/api/docs-json`
- Every new controller must be decorated with `@ApiTags()`.
- Every new endpoint method should be decorated with `@ApiOperation()` and `@ApiResponse()`.
- Every DTO property must be decorated with `@ApiProperty()` or `@ApiPropertyOptional()` to maintain accurate schema specifications.
- NestJS CLI is configured with the `@nestjs/swagger` compiler plugin in `server/nest-cli.json` to automatically extract metadata during compilation.

### 6. API Contracts & Type Generation Workflow

- Backend OpenAPI DTOs serve as the single source of truth for all API request and response data contracts.
- **Industry Standard Tooling (`openapi-typescript`)**: TypeScript interfaces are generated directly from the server OpenAPI 3.0 specification using `openapi-typescript` (`server/scripts/generate-api-types.ts`), producing type-safe `paths`, `operations`, and `components['schemas']` definitions alongside convenient schema aliases in `@atiesh/contracts` (`packages/contracts/`).
- **Client Independence**: Frontend code must **never** manually duplicate or declare server API interfaces. All server models and contracts must be imported from the workspace package (`@atiesh/contracts`).
- Whenever adding, refactoring, or extending backend endpoints and DTOs:
  1. Ensure the module is registered in `AppModule`.
  2. Decorate DTOs and endpoints with NestJS Swagger annotations.
  3. Run `pnpm run generate:api-types` to regenerate server contracts directly into `@atiesh/contracts`.
- Scripts:
  - `pnpm run generate:api-types`: Generates TypeScript types directly into `@atiesh/contracts` (`packages/contracts/src/`).

### 7. Web Components & Workspace Integration Workflow

- The `components/` package is named `@atiesh/components`, a standalone Web Components design system library and the single source of truth for UI primitives, custom elements, and design tokens.
- **Direct Workspace Dependency & Hot Reloading**:
  - The client application links directly to `@atiesh/components` via pnpm workspace (`"@atiesh/components": "workspace:*"`).
  - Its `package.json` exports map points directly to TypeScript source (`./src/index.ts`) and CSS (`./src/styles/theme.css`), enabling instant hot-reloading (HMR) across workspace boundaries in Vite development mode without requiring manual rebuilds or file-copying steps.
  - When editing components in `components/`, changes take effect immediately in the client dev server.
- Individual scripts:
  - `pnpm run build:components`: Compiles and bundles components to `components/dist/`.
  - `pnpm run build:storybook`: Compiles the static Storybook showcase to `Docs/storybook/`.

### 8. TypeScript & Type Safety Standards

- **No `any` Typing**:
  - The `any` type is strictly forbidden across all workspaces (`@typescript-eslint/no-explicit-any: "error"` and `noImplicitAny: true`).
  - Use strongly typed interfaces, DTOs, generics, or `unknown` with runtime type guards / narrowing instead of `any`.
- **`as` Type Assertions (Forbidden)**:
  - Explicit type assertions via `as Type` are strictly forbidden and flagged as a linter error (`@typescript-eslint/consistent-type-assertions: ["error", { "assertionStyle": "never" }]`).
  - Prefer safe structural typing, discriminated unions, type guards, and proper schema validation rather than forcing types with `as`.
- **Strict Compilation**:
  - Both `server` and `client` compile with `strict: true`, `noImplicitAny: true`, and strict null checks.

### 9. Verification Protocol

Before finishing any task, run the full validation pipeline:

```bash
pnpm run validate
```

This ensures:

1. `Prettier` code style compliance.
2. `ESLint` passing with 0 errors and 0 warnings (enforced by `--max-warnings 0`, including 0 `any` usage and zero unresolved warnings).
3. Zero circular dependencies detected across all workspace packages via `dpdm` (`pnpm run check:circular`).
4. `TypeScript` strict compilation with 0 type errors.
5. All `Jest` unit/integration test suites and `Playwright` visual regression suites pass.
6. Husky git hooks enforce code formatting on `pre-commit` and circular dependency checks on `pre-push`.
7. Production builds for `server` and `client` succeed.
8. CI/CD will fail and halt all builds and releases if any warning or error is detected.

### 10. Automatic AGENTS.md & Documentation Maintenance

- **Mandatory Self-Updating Documentation**:
  - Whenever implementing a change, refactoring, adding a feature, updating a workflow, modifying configuration/environment variables, or altering commands, developers and AI agents must automatically update the relevant `AGENTS.md` file(s) (`AGENTS.md`, `server/AGENTS.md`, `client/AGENTS.md`, `components/AGENTS.md`).
  - Any change made that affects information already documented in any `AGENTS.md` file, or introduces new concepts, conventions, patterns, endpoints, or architectures that should be documented in them, must be reflected immediately in the documentation as part of the same task.
  - Never allow `AGENTS.md` documentation to become stale or outdated.

### 11. Specialized Guidelines

In addition to this root guide, domain-specific guides are available in their respective workspace packages:

- **Server Backend Guide**: [`server/AGENTS.md`](./apps/server/AGENTS.md) — NestJS architecture, controller/service conventions, configuration, Swagger/OpenAPI setup, and testing.
- **Client Frontend Guide**: [`client/AGENTS.md`](./apps/client/AGENTS.md) — React 19 SPA architecture, component guidelines, ApiClient integration, React Router, and Vitest testing.
- **Components Design System Guide**: [`components/AGENTS.md`](./packages/components/AGENTS.md) — Lit Web Components architecture, design tokens, Storybook stories, and Vitest component testing.
