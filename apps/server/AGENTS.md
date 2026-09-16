# Server Agent Guide: Atiesh Codex Backend API

This document provides specialized guidelines, architectural patterns, and development conventions for AI agents and developers working specifically on the **NestJS Backend API service** (`server/`) for Atiesh Codex (Fan-made project for World of Warcraft Forever). Production deployment at **atieshcodex.com**.

---

## 1. Service Overview & Architecture

The server is a standalone, modular REST/WebSocket API provider built with **NestJS 11** and **TypeScript 5**. It does not perform Server-Side Rendering (SSR) and communicates with frontend clients and external services solely through standard API contracts.

```text
apps/server/
├── src/
│   ├── common/             # Cross-cutting contracts, shared DTOs, constants, utilities
│   │   ├── constants/      # Shared constant definitions (e.g., service tokens, patterns)
│   │   ├── dto/            # Shared Data Transfer Objects (contracts across modules)
│   │   └── index.ts        # Barrel export for common elements
│   ├── core/               # Infrastructure, bootstrap configurations, core endpoints
│   │   ├── config/         # Typed environment configuration loader & schema
│   │   │   ├── configuration.interface.ts
│   │   │   ├── configuration.ts
│   │   │   ├── configuration.spec.ts
│   │   │   └── index.ts
│   │   ├── filters/        # Global exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── http-exception.filter.spec.ts
│   │   │   └── index.ts
│   │   ├── logger/         # Structured Pino logging and correlation ID tracing
│   │   │   ├── app-logger.module.ts
│   │   │   ├── correlation-context.service.ts
│   │   │   ├── correlation.middleware.ts
│   │   │   ├── logger.constants.ts
│   │   │   └── index.ts
│   │   ├── ping/           # Health / connectivity ping endpoint & service
│   │   │   ├── ping.controller.ts
│   │   │   ├── ping.service.ts
│   │   │   ├── ping.controller.spec.ts
│   │   │   ├── ping.service.spec.ts
│   │   │   └── ping.integration.spec.ts
│   │   ├── queue/          # BullMQ queue services and worker processors
│   │   │   ├── queue.constants.ts
│   │   │   ├── queue.module.ts
│   │   │   ├── queue.service.ts
│   │   │   ├── system-queue.processor.ts
│   │   │   └── index.ts
│   │   ├── redis/          # Redis connection provider and caching service
│   │   │   ├── redis.constants.ts
│   │   │   ├── redis.module.ts
│   │   │   ├── redis.service.ts
│   │   │   └── index.ts
│   │   └── core.module.ts  # Core module bundling infrastructure providers
│   ├── modules/            # Isolated domain feature modules (e.g., auth, users, game)
│   │   └── <feature>/      # Domain module folder
│   │       ├── dto/        # Feature-specific request/response DTOs
│   │       ├── <feature>.controller.ts
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.module.ts
│   │       └── <feature>.*.spec.ts
│   ├── app.module.spec.ts  # Root application module integration tests
│   ├── swagger.integration.spec.ts # Swagger UI & OpenAPI integration test suite
│   ├── app.module.ts       # Root application module orchestrating core & feature modules
│   └── main.ts             # Application entrypoint & global configuration
├── scripts/                # Utility and contract generator scripts
│   └── generate-api-types.ts # TypeScript interface generator into @atiesh/contracts
├── .env.example            # Environment variables template for server
├── Dockerfile              # Turbo prune multi-stage production container build
├── nest-cli.json           # NestJS CLI configuration (includes Swagger plugin)
├── package.json            # Package dependencies and server-specific scripts
├── tsconfig.build.json     # Production TypeScript compiler options (excludes scripts & tests, emits to dist/)
└── tsconfig.json           # Strict TypeScript compiler options (extends @atiesh/tsconfig/node)
```

---

## 2. Directory & Layer Responsibilities

### Modular Monolith Architecture Principles

1. **Clear Domain Boundaries**:
   - Each domain feature module in `src/modules/<feature-name>/` represents a distinct bounded context (e.g., `auth`, `users`, `characters`, `guilds`).
   - Modules encapsulate their own controllers, services, repositories/entities, DTOs, and event handlers.
2. **Strict Encapsulation & Explicit Exports**:
   - Internal implementation details of a module remain private.
   - Only explicitly declared services/providers in the module's `exports` array can be consumed by other modules.
   - Modules must never access another module's private internal files directly; all cross-module communication happens through exported interfaces/services or in-process events.
3. **Zero Circular Dependencies**:
   - Dependency flow must be unidirectional: `AppModule` -> `Domain Feature Modules` (`src/modules/`) -> `CoreModule` / `Common` (`src/core/`, `src/common/`).
   - Feature modules must never create circular imports between each other.
   - Enforced automatically via `dpdm` circular dependency check (`pnpm check:circular` / `pnpm run check:circular:server`).
4. **Shared Infrastructure vs Domain Logic**:
   - `src/core/` houses shared infrastructure (logging, queues, Redis, database connections, global filters, config).
   - `src/modules/` houses business domain logic and user-facing REST/WS endpoints.

### `src/core/` (Core Infrastructure Layer)

- Houses application-wide infrastructure, global configuration, filters, interceptors, guards, and baseline health checks.
- `src/core/config/`: Contains type-safe configuration loaders (`configuration.ts`), TypeScript configuration contracts (`configuration.interface.ts`), and unit test specifications.
- `src/core/logger/`: Structured JSON logging (Pino) and distributed correlation ID context propagation (`AsyncLocalStorage`).
- `src/core/redis/` & `src/core/queue/`: Redis caching/connection infrastructure and BullMQ background task processing.
- `CoreModule` encapsulates foundational services, global configuration (`ConfigModule.forRoot`), and controllers (such as `/api/ping`).
- Registered directly in `AppModule`.

### `src/common/` (Common Contracts & Utilities)

- Shared across all modules. Contains:
  - **Shared DTOs** (`src/common/dto/`): Reusable response shapes and cross-module contracts.
  - **Constants** (`src/common/constants/`): Application-wide tokens, event names, and configuration keys.
  - **Utilities & Decorators**: Custom parameter decorators, helpers, and base classes.

### `src/modules/` (Domain Feature Modules)

- Every domain concept (e.g., `auth`, `characters`, `guilds`, `chat`) must be organized as a self-contained module in `src/modules/<feature-name>/`.
- Each feature module encapsulates its own controllers, services, repositories/entities, and feature-specific DTOs (`dto/`).
- Feature modules export only necessary public services and are registered in `AppModule`.

---

## 3. Design Principles & Coding Conventions

### 1. REST API Routing & Controllers

- All REST endpoints are prefixed globally with `/api` (configured in `main.ts`).
- Controllers handle HTTP routing, request parsing, and status code mapping. Business logic must stay in Services.
- Use declarative NestJS HTTP decorators (`@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`, `@HttpCode()`, `@Param()`, `@Body()`, `@Query()`).
- All communication in production environments is served strictly over secure transport (**HTTPS / WSS**), with TLS termination and SSL redirects handled by the reverse proxy and Ingress layer.

### 2. Data Transfer Objects (DTOs) & Validation

- **Request DTOs**: Define classes for input payloads (body/query/params). When adding validation, use `class-validator` and `class-transformer` decorators.
- **Response DTOs**: Define TypeScript interfaces or classes for typed output contracts to ensure consistent API schemas.
- **Separation**: Never expose internal database entities or raw third-party models directly through the API; map them to response DTOs.

### 3. Dependency Injection & Service Layer

- Decorate business logic classes with `@Injectable()`.
- Use constructor injection for dependencies.
- Keep services stateless and deterministic where possible.

### 4. Error Handling & Exceptions

- Leverage standard NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `InternalServerErrorException`).
- `GlobalHttpExceptionFilter` (registered globally in `CoreModule`) catches all HTTP and unhandled exceptions, maps them to structured JSON payloads (`ErrorResponsePayload`), and injects `correlationId` into the response body and `x-correlation-id` response header.

### 5. Structured Logging & Distributed Correlation Tracing

- **Pino Structured Logger**: Integrated via `nestjs-pino` (`AppLoggerModule`). Outputs machine-readable structured JSON in production and colorized `pino-pretty` logs in local development.
- **Correlation ID Middleware (`CorrelationMiddleware`)**: Intercepts every incoming request, captures `x-correlation-id` or `x-request-id` headers (or generates a `crypto.randomUUID()`), and binds the identifier to Node's `AsyncLocalStorage` via `CorrelationContextService`.
- **Response Headers**: Automatically mirrors `x-correlation-id` back in the HTTP response headers for client-side observability.
- **Queue & Async Job Tracing**: `QueueService` and `SystemQueueProcessor` propagate the active `correlationId` in BullMQ job payloads so worker log statements remain tied to the originating request trace.

### 6. Middleware, Compression & Security

- **Response Compression**: Gzip/Deflate compression is enabled globally via `compression()` middleware in `src/main.ts` to optimize payload sizes across REST endpoints.
- **CORS**: Cross-Origin Resource Sharing is configured via `app.enableCors()` adhering to `app.corsOrigin` config.

### 7. Configuration, Secrets & Environment Variables

- Environment configuration is managed globally via `@nestjs/config` and registered in `src/core/core.module.ts`.
- All config values must be typed in `src/core/config/configuration.interface.ts` (`AppConfig` with `port`, `nodeEnv`, `swagger`, `appSecret`, `databaseUrl`) and initialized with sensible defaults in `src/core/config/configuration.ts`.
- Files loaded: `.env.local`, `.env`, `../.env.local`, and `../.env` to ensure seamless resolution from both the root workspace and the `server/` directory.
- Use `ConfigService` for accessing configuration properties:
  ```typescript
  @Injectable()
  export class ExampleService {
    constructor(private readonly configService: ConfigService) {}

    getSettings(): void {
      const port = this.configService.get<number>('app.port', 3001);
      const secret = this.configService.get<string>('app.appSecret');
    }
  }
  ```
- In production / Kubernetes environments, sensitive variables (`APP_SECRET`, `DATABASE_URL`) are isolated in `k8s/secret.yaml` and injected via `secretRef: name: atiesh-codex-secrets`, while non-sensitive configs are managed in `k8s/configmap.yaml`.
- Any new environment variable must be documented in `server/.env.example` and root `.env.example`.
- **Never commit `.env`, `.env.local`, or any `.env.*` files containing secrets to source control.** All runtime `.env` files are ignored in `.gitignore`.

### 8. Health Checks & Kubernetes Probes

- The server provides a lightweight health probe endpoint `/api/ping` via `PingController` and `PingService`.
- **Docker Compose**: Container health checks query `wget --no-verbose --tries=1 --spider http://localhost:3001/api/ping || exit 1`.
- **Kubernetes**: Both liveness and readiness probes in `k8s/server.yaml` use `httpGet` targeting `/api/ping` on port 3001 to ensure the NestJS event loop and HTTP handlers are actively serving traffic.

### 9. OpenAPI & Swagger API Documentation Standards

- Swagger is integrated via `@nestjs/swagger` and initialized in `server/src/main.ts`.
- When the server is running, the interactive documentation is available at:
  - **Swagger UI**: `http://localhost:<PORT>/api/docs` (default: `http://localhost:3001/api/docs`)
  - **OpenAPI JSON Spec**: `http://localhost:<PORT>/api/docs-json`
- **Compiler Plugin**: `server/nest-cli.json` has `"plugins": ["@nestjs/swagger"]` enabled, automatically extracting property types, comments, and DTO metadata during compilation (`nest build`).
- **Controller Conventions**:
  - Add `@ApiTags('<Feature/Domain>')` on every controller class.
  - Add `@ApiOperation({ summary: '...', description: '...' })` on endpoint methods.
  - Add `@ApiResponse({ status: HttpStatus.OK, description: '...', type: ResponseDto })` for expected responses.
- **DTO Conventions**:
  - Decorate DTO class properties with `@ApiProperty()` (or `@ApiPropertyOptional()`) with descriptive `description`, `example`, and type metadata.
  - Export response DTO classes rather than pure interfaces to preserve runtime schema metadata for OpenAPI.

### 10. TypeScript & Type Safety Standards

- **Strict Type Enforcement**:
  - `any` typing is strictly forbidden in backend code (`@typescript-eslint/no-explicit-any: "error"` and `noImplicitAny: true` in `tsconfig.json`).
  - `as` type assertions are strictly forbidden and trigger linter errors (`@typescript-eslint/consistent-type-assertions: ["error", { "assertionStyle": "never" }]`). Prefer runtime validation (e.g. `class-validator`, type predicates/guards) over unsafe type casting.
  - NestJS services, controllers, and modules must use strongly typed DTOs and configuration interfaces.

### 11. Client API Type Generation & Contract Synchronization

- **Single Source of Truth**: The server's OpenAPI metadata and DTO schemas serve as the contract definition for the frontend client. The client does not declare duplicate backend interfaces.
- **Generator Script** (`server/scripts/generate-api-types.ts` / `pnpm run generate:api-types`):
  - Programmatically initializes NestJS `AppModule` using server-scoped `ts-node` to build the complete OpenAPI 3.0 document.
  - Leverages industry-standard **`openapi-typescript`** to convert OpenAPI paths, operations, parameters, and component schemas into strictly typed TypeScript interfaces.
  - Generates full OpenAPI `paths`, `components`, `operations`, and convenient schema helper aliases (`PingResponseDto`, `PingResponse`, `Schema<T>`).
  - Clears destination and writes directly to `packages/contracts/src/index.ts` formatted with Prettier.
  - Emits OpenAPI 3.0 JSON specification (`Docs/api/openapi.json`) and interactive documentation (`Docs/api/index.html`) using modern Scalar API reference rendering.
- **Modular Scalability**: Any newly added feature module in `src/modules/` that is registered in `AppModule` and decorated with Swagger annotations will automatically have its DTOs discovered and generated into `@atiesh/contracts` upon running `pnpm run generate:api-types`.

### 12. Automatic AGENTS.md & Documentation Maintenance

- **Mandatory Self-Updating Documentation**:
  - Whenever any change is made to the server backend (such as adding/modifying modules, endpoints, DTOs, services, filters, middleware, configuration, dependencies, or tooling), developers and AI agents must automatically update `server/AGENTS.md` (and the root `AGENTS.md` if monorepo-wide patterns are affected).
  - Any change that modifies topics already documented in `server/AGENTS.md` or introduces new conventions and architectural decisions that should be in it must be updated immediately as part of the same task.
  - Keep documentation accurate and synchronized with the actual codebase at all times.

---

## 4. Testing Standards

Every feature, endpoint, and core service must be accompanied by automated tests. Tests execute via **Jest** accelerated with **`@swc/jest`** for rapid TypeScript and decorator compilation:

### Unit Tests (`*.spec.ts`)

- Co-locate unit tests alongside their respective classes (e.g., `ping.service.spec.ts`, `ping.controller.spec.ts`, `configuration.spec.ts`).
- Use `@nestjs/testing` `Test.createTestingModule()` for compiling mock contexts.
- Mock external service calls and dependencies using Jest spies (`jest.spyOn()`) or mock providers.
- Configuration testing: verify default environment fallback values as well as custom environment variable overrides.

### Integration / E2E Tests (`*.integration.spec.ts`)

- Verify complete HTTP request/response lifecycles.
- Bootstrap a test Nest application instance using `app = moduleFixture.createNestApplication()` with `app.setGlobalPrefix('api')`.
- Use `supertest` to execute assertions on real HTTP endpoints and OpenAPI documentation endpoints (e.g., `swagger.integration.spec.ts` verifying `/api/docs/` and `/api/docs-json`).

---

## 5. Server Development Commands

Server commands can be run directly from the root workspace or within `server/`:

| Command (from root)               | Command (in `server/`)    | Description                                                                           |
| :-------------------------------- | :------------------------ | :------------------------------------------------------------------------------------ |
| `pnpm run dev:server`             | `pnpm dev`                | Start NestJS development server with watch mode                                       |
| `pnpm run dev:debug`              | `pnpm dev:debug`          | Start NestJS with inspector debugger enabled on port 9229                             |
| `pnpm run generate:api-types`     | `pnpm generate:api-types` | Generate TypeScript interfaces from OpenAPI schemas directly into `@atiesh/contracts` |
| `pnpm run build:server`           | `pnpm build`              | Compile TypeScript and build production bundle in `dist/`                             |
| `pnpm run test:server`            | `pnpm test`               | Run all Jest unit and integration tests                                               |
| `pnpm --filter server test:watch` | `pnpm test:watch`         | Run Jest tests in interactive watch mode                                              |
| `pnpm --filter server test:cov`   | `pnpm test:cov`           | Generate Jest test coverage report                                                    |
| `pnpm run check:circular:server`  | `pnpm check:circular`     | Check for circular dependencies in server source files via `dpdm`                     |
| `pnpm run start`                  | `pnpm start`              | Run production build (`node dist/main.js`)                                            |
