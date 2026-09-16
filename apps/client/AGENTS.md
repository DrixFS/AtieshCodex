# Client Agent Guide: Atiesh Codex Frontend SPA

This document provides specialized guidelines, architectural patterns, and development conventions for AI agents and developers working specifically on the **React Single-Page Application (SPA)** (`apps/client/`) for Atiesh Codex (Fan-made project for World of Warcraft Forever). Production deployment at **atieshcodex.com** and official technical documentation at **[https://drixfs.github.io/AtieshCodex/](https://drixfs.github.io/AtieshCodex/)**.

---

## 1. Application Overview & Architecture

The frontend is a pure Single-Page Application (SPA) built with **React 19**, **TypeScript 5**, and **Vite 6**. It does not use Server-Side Rendering (SSR) and communicates with the backend solely via HTTPS REST APIs and secure WebSockets (WSS).

```text
apps/client/
├── src/
│   ├── core/               # Application-wide core layout, router, landing page, API client
│   │   ├── api/            # HTTP client, error handling, and baseline API clients
│   │   │   ├── api-client.ts
│   │   │   ├── api-client.test.ts
│   │   │   ├── errors.ts
│   │   │   ├── types.ts
│   │   │   ├── ping.ts
│   │   │   ├── ping.test.ts
│   │   │   └── index.ts
│   │   ├── config/         # Frontend environment configuration & typed accessors
│   │   │   ├── env.ts
│   │   │   ├── env.test.ts
│   │   │   └── index.ts
│   │   ├── layout/         # Shared layout shell components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── MainLayout.test.tsx
│   │   │   └── index.ts
│   │   ├── query/          # TanStack React Query provider & client setup
│   │   │   ├── query-client.ts
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── QueryProvider.test.tsx
│   │   │   └── index.ts
│   │   ├── stores/         # MobX root and domain stores, StoreProvider & hooks
│   │   │   ├── app.store.ts
│   │   │   ├── app.store.test.ts
│   │   │   ├── root.store.interface.ts
│   │   │   ├── root.store.ts
│   │   │   ├── root.store.test.ts
│   │   │   ├── ui.store.ts
│   │   │   ├── ui.store.test.ts
│   │   │   ├── StoreProvider.tsx
│   │   │   ├── StoreProvider.test.tsx
│   │   │   └── index.ts
│   │   ├── router/         # React Router configuration and router bootstrap
│   │   │   ├── routes.ts
│   │   │   ├── router.tsx
│   │   │   ├── router.test.tsx
│   │   │   ├── AppRouter.tsx
│   │   │   └── index.ts
│   │   ├── LandingPage.tsx # Core landing page presentation component
│   │   └── LandingPage.test.tsx
│   ├── features/           # Isolated domain feature modules (e.g., auth, characters, realm)
│   │   └── <feature>/      # Feature folder (components, hooks, api, types, tests)
│   ├── test/               # Jest test setup and test polyfills
│   │   ├── polyfills.cjs   # Web Stream, Undici, and Worker thread polyfills for Jest
│   │   ├── setup.ts        # @testing-library/jest-dom extensions
│   │   └── styleMock.cjs   # Mock for CSS and style assets in Jest
│   ├── App.tsx             # Main application component
│   ├── App.test.tsx        # Top-level application test suite
│   ├── App.css             # Component-level styles
│   ├── index.css           # Global theme, CSS variables, and layout resets
│   ├── main.tsx            # DOM bootstrap mounting React root
│   └── vite-env.d.ts       # Vite client types declarations
├── Dockerfile              # Turbo prune multi-stage production container build (Nginx)
├── index.html              # HTML entrypoint
├── jest.config.cjs         # SWC + JSDOM Jest configuration
├── nginx.conf              # Nginx reverse proxy / SPA fallback configuration
├── package.json            # Package dependencies and client-specific scripts
├── tsconfig.json           # Strict TypeScript compiler options (extends @atiesh/tsconfig/react)
├── typedoc.json            # TypeDoc API documentation generator configuration
└── vite.config.ts          # Vite bundler and dev proxy configuration
```

---

## 2. Directory & Layer Responsibilities

### `src/core/` (Core Layer)

- Houses foundational application infrastructure that is shared across the entire client:
  - **`src/core/api/`**: Reusable `ApiClient` class, HTTP error handling (`ApiClientError`), and core endpoint functions (such as `fetchPing()`).
  - **`src/core/config/`**: Runtime environment schema validation (`clientEnvSchema`, `validateClientEnv` with Zod) and strongly typed application configuration (`config`, `env`).
  - **`src/core/layout/`**: Application shell and layout wrappers (`MainLayout`).
  - **`src/core/router/`**: Route path constants (`ROUTES`), router configuration (`createBrowserRouter`), and router providers.
  - **`src/core/LandingPage.tsx`**: Default landing presentation component.

### `src/features/` (Domain Feature Modules)

- Domain-specific logic, pages, components, hooks, and API integrations should be grouped into feature folders (e.g., `src/features/auth/`, `src/features/characters/`, `src/features/realms/`).
- Each feature encapsulates its own:
  - UI components and pages
  - Custom React hooks for business logic and data fetching
  - Feature-specific API communication functions
  - Unit and component tests (`*.test.tsx`, `*.test.ts`)
- Do not bloat `src/core/` or `App.tsx` with domain-specific state or presentation.

### `@atiesh/contracts` (Auto-Generated Backend Contracts)

- Auto-generated TypeScript contracts synchronized from the NestJS backend OpenAPI schema live in `@atiesh/contracts` (`packages/contracts/`).
- Populated by running `pnpm run generate:api-types`.
- Imported directly via workspace dependency (`import type { PingResponse } from '@atiesh/contracts'`).

### `@atiesh/components` (Workspace Design System Integration)

- The client links directly to `@atiesh/components` (`workspace:*` in `apps/client/package.json`).
- Design tokens and theme CSS are imported directly (`import '@atiesh/components/theme.css'`).
- Web Components custom element types are resolved from `@atiesh/components`, enabling live Hot Module Replacement (HMR) during frontend development when editing components in `packages/components/src/`.

---

## 3. Design Principles & Coding Conventions

### 1. Component Architecture & React 19

- Use functional components with standard TypeScript typings (`React.FC` or standard function declarations with typed props).
- Keep components focused and modular. Separate presentational components from container / stateful logic when appropriate.
- Co-locate component-specific styles or use CSS variables defined in `index.css`.

### 2. API Communication & Backend Contracts

- Use the centralized `ApiClient` (`src/core/api/api-client.ts`) or instances configured with custom headers / base URLs.
- **Single Source of Truth**: Never duplicate or declare backend DTO types manually in frontend code. Always import models and DTO interfaces from `@atiesh/contracts`:
  ```typescript
  import type { PingResponseDto } from '@atiesh/contracts';
  ```
- All network requests in production flow over secure HTTPS/WSS.
- During local development, Vite proxies `/api` requests to `http://localhost:3001` (configured in `vite.config.ts`).

### 3. Asynchronous Data Fetching & Server State (TanStack Query)

- TanStack Query (`@tanstack/react-query`) is configured globally via `QueryProvider` (`src/core/query/QueryProvider.tsx`) wrapping the application root.
- **Exclusive Owner of Server State**: TanStack Query is the single source of truth for all remote server data, API responses, query caching, background polling, automatic re-validation, and server mutation side-effects.
- Use `useQuery`, `useMutation`, and custom query hooks to manage asynchronous server state:
  ```typescript
  import { useQuery } from '@tanstack/react-query';
  import { fetchPing } from '../../core/api';

  export function useServerHealth() {
    return useQuery({
      queryKey: ['server-ping'],
      queryFn: fetchPing,
    });
  }
  ```

### 4. Synchronous UI & Client State Management (MobX)

- MobX (`mobx` & `mobx-react-lite`) manages client-side synchronous domain and UI state via reactive stores located under `src/core/stores/`.
- **Exclusive Owner of Client & UI State**: MobX is strictly reserved for local ephemeral UI state, themes, active drawer/modal states, transient client-side draft forms, and client application lifecycle (network status, client-side session tokens).
- **Explicit Boundary & Anti-Patterns (React Query vs. MobX)**:
  - **Do NOT duplicate server data into MobX**: Never copy API responses from React Query into MobX observable stores.
  - **Do NOT execute remote fetch actions inside MobX**: Do not use MobX actions as an asynchronous data fetch layer; always utilize TanStack Query hooks.
  - **Keep MobX Stores Purely Client-Centric**: Use MobX when multiple distant React components require high-performance, fine-grained reactive updates for UI/interaction state that does not belong in the server cache.
- **Store Architecture**:
  - `RootStore`: Aggregates child stores (`uiStore`, `appStore`) and acts as the central state hub (implements `IRootStore`).
  - `IRootStore`: Decoupled interface contract in `src/core/stores/root.store.interface.ts` preventing circular dependencies between parent and child stores.
  - `UIStore`: Encapsulates visual/interface state (theme, sidebar open/close, active notifications).
  - `AppStore`: Encapsulates client application state (initialization status, network online/offline status, ping timestamps).
- **React Integration**:
  - `StoreProvider` wraps the application in `App.tsx` and provides React context.
  - Custom typed hooks (`useRootStore()`, `useUIStore()`, `useAppStore()`) access stores with fallback to the default root store instance.
  - Components consuming observable store properties should be wrapped in `observer`:
  ```tsx
  import { observer } from 'mobx-react-lite';
  import { useUIStore } from '../stores';

  export const MainLayout: React.FC = observer(() => {
    const uiStore = useUIStore();
    return <div className={`app-layout theme-${uiStore.theme}`}><Outlet /></div>;
  });
  ```

### 5. Error Handling & Request Correlation

- The `ApiClient` automatically attaches `x-correlation-id` to all outgoing requests and extracts server-returned correlation identifiers on responses and errors.
- Non-2xx responses throw structured `ApiClientError` instances containing `status`, `statusText`, `data`, `url`, and `correlationId`.
- Catch errors gracefully in UI components or data-fetching hooks and display user-friendly error messages accompanied by correlation IDs for traceability:
  ```typescript
  try {
    const data = await fetchPing();
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(
        `Request failed [Trace ID: ${error.correlationId}]:`,
        error.message,
        error.status,
      );
    }
  }
  ```

### 6. Routing with React Router

- Centralize all route paths in `src/core/router/routes.ts`:
  ```typescript
  export const ROUTES = {
    HOME: '/',
    // e.g. CHARACTERS: '/characters',
  } as const;
  ```
- Configure routes in `src/core/router/router.tsx` using `createBrowserRouter` to enable modern data loading and nesting capabilities.

### 7. Environment Variables & Runtime Validation

- **Vite Prefix**: Client environment variables exposed to the browser must start with `VITE_` (e.g., `VITE_API_BASE_URL`).
- **Runtime Schema Validation (Zod)**:
  - All environment variables are validated at startup via `src/core/config/env.ts` using `clientEnvSchema` and `validateClientEnv()`.
  - Halts runtime execution with a descriptive error if required environment variables are missing or misconfigured, preventing silent `undefined` endpoint failures.
- **Centralized Consumption**:
  - Always import `env` or `config` from `src/core/config` (`import { config, env } from '@/core/config'`) rather than accessing raw `import.meta.env` directly in components or services.
- **Templates & Local Configuration**:
  - Client template is defined in `apps/client/.env.example` and mirrored in the root `.env.example`.
  - When introducing a new client environment variable, define its validator in `clientEnvSchema` (`src/core/config/env.ts`) and update `.env.example` templates.
- **Security & Source Control**:
  - Never commit `.env`, `.env.local`, or `.env.*` files containing secrets or developer credentials (ignored via monorepo `.gitignore`).

### 8. TypeScript & Type Safety Standards

- **Strict Type Enforcement**:
  - `any` typing is strictly forbidden in frontend code (`@typescript-eslint/no-explicit-any: "error"` and `strict: true` in `tsconfig.json`).
  - `as` type assertions are strictly forbidden and trigger linter errors (`@typescript-eslint/consistent-type-assertions: ["error", { "assertionStyle": "never" }]`). Prefer narrowing with type predicates, pattern matching, or discriminated unions.
  - Rely on generated OpenAPI contracts from `@atiesh/contracts` for all server data models.

### 9. Design System & Web Components Integration

- The monorepo provides a standalone Web Components design system package named `@atiesh/components` in `packages/components/`.
- **Direct Workspace Integration**: The client application links directly to `@atiesh/components` via pnpm workspace (`workspace:*`).
- Theme CSS is loaded globally via `import '@atiesh/components/theme.css'` in `src/index.css`.
- Reusable UI elements built as Custom Elements can be imported and rendered in React 19 JSX seamlessly with instant hot-reloading during development.
- Refer to [`components/AGENTS.md`](../../packages/components/AGENTS.md) for full documentation on creating reusable components, design tokens, attributes, events, and Storybook usage.

### 10. Containerization & Production Build Isolation

- **Self-Contained Docker Build** (`apps/client/Dockerfile`):
  - Multi-stage build leveraging `node:22-alpine` builder and lightweight `nginx:alpine` runtime.
  - Automatically installs workspace manifests, generates API types, builds workspace packages, and compiles Vite static assets inside the container.
  - Eliminates host machine dependencies on gitignored vendor artifacts during clean checkouts and CI/CD releases.
- **Nginx Runtime (`apps/client/nginx.conf`)**:
  - Configures SPA client-side routing fallback (`try_files $uri $uri/ /index.html`).
  - Enforces immutable long-term caching for hashed static assets (`/assets/`).
  - Sets defensive HTTP headers: HSTS (`Strict-Transport-Security`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and Referrer Policy.

### 11. TypeScript API Documentation (TypeDoc & TSDoc)

- The client codebase enforces **TSDoc standards** (`/** ... */`) across all shared core infrastructure (`src/core/api/`, `src/core/stores/`, `src/core/query/`, `src/core/router/`, `src/core/config/`) and UI components.
- **Automated TypeDoc Generation**:
  - Configured via `apps/client/typedoc.json`.
  - Generates searchable, static HTML API documentation at top-level `Docs/client/`, deployed automatically to the official documentation hub at **[https://drixfs.github.io/AtieshCodex/client/](https://drixfs.github.io/AtieshCodex/client/)**.
  - Build command: `pnpm --filter client run docs` (or from root: `pnpm run build:docs`).
- **TSDoc Guidelines**:
  - Annotate all exported interfaces, types, functions, classes, and MobX stores.
  - Document method parameters with `@param`, return types with `@returns`, generic type parameters with `@typeParam`, and potential errors with `@throws`.

### 12. Automatic AGENTS.md & Documentation Maintenance

- **Mandatory Self-Updating Documentation**:
  - Whenever any change is made to the client application (such as adding/updating features, modifying routing, state management, API clients, environment variables, dependencies, or tooling), developers and AI agents must automatically update `client/AGENTS.md` (and the root `AGENTS.md` if monorepo-wide patterns are affected).
  - Any change that modifies topics already documented in `client/AGENTS.md` or introduces new conventions and architectural decisions that should be in it must be updated immediately as part of the same task.
  - Keep documentation accurate and synchronized with the actual codebase at all times.

---

## 4. Testing Standards

Every UI component, hook, and API utility must have automated tests using **Jest** (`@swc/jest`) and **React Testing Library**:

### Unit & Component Tests (`*.test.tsx`, `*.test.ts`)

- Co-locate tests alongside their corresponding files (e.g., `LandingPage.test.tsx`, `api-client.test.ts`, `MainLayout.test.tsx`).
- Test behavior from the user's perspective using `@testing-library/react` (`render`, `screen`, `userEvent`, `fireEvent`).
- Avoid testing internal implementation details.
- Use mock data matching the generated OpenAPI types from `@atiesh/contracts`.
- Assert DOM states using `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument()`, `toHaveTextContent()`).

---

## 5. Client Development Commands

All commands can be run from the root workspace or directly within `apps/client/`:

| Command (from root)               | Command (in `apps/client/`) | Description                                                          |
| :-------------------------------- | :-------------------------- | :------------------------------------------------------------------- |
| `pnpm run dev:client`             | `pnpm dev`                  | Start Vite development server on port 3000                           |
| `pnpm run build:client`           | `pnpm build`                | Run TypeScript check and bundle static assets in `dist`              |
| `pnpm run test:client`            | `pnpm test`                 | Run frontend test suite with Jest                                    |
| `pnpm --filter client test:watch` | `pnpm test:watch`           | Run Jest in interactive watch mode                                   |
| `pnpm --filter client test:cov`   | `pnpm test:cov`             | Run Jest test coverage report                                        |
| `pnpm run check:circular:client`  | `pnpm check:circular`       | Check for circular dependencies in client source files via `dpdm`    |
| `pnpm --filter client typecheck`  | `pnpm typecheck`            | Run TypeScript compiler validation (`tsc --noEmit`)                  |
| `pnpm --filter client typewatch`  | `pnpm typewatch`            | Run TypeScript check in watch mode                                   |
| `pnpm --filter client clean`      | `pnpm clean`                | Remove build output directory (`dist`)                               |
| `pnpm run preview:client`         | `pnpm preview`              | Preview the production build locally via Vite                        |
| `pnpm run build:docs`             | `pnpm docs`                 | Build HTML TypeScript API documentation via TypeDoc (`Docs/client/`) |
| `pnpm run preview:docs`           | (Run from root)             | Preview all monorepo documentation locally on port `4000`            |
| `pnpm run generate:api-types`     | (Run from root)             | Regenerate server API types directly into `@atiesh/contracts`        |
