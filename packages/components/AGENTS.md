# Components Agent Guide: Atiesh Codex Web Components

This document provides specialized guidelines, architectural patterns, and development conventions for AI agents and developers working on the **Web Components Library & Storybook** (`components/`) for Atiesh Codex (Fan-made project for World of Warcraft Forever).

---

## 1. Application Overview & Architecture

The components package is a framework-agnostic, standalone **Web Components design system and UI library** built with **Lit 3**, **TypeScript 5**, **Vite 6**, **Storybook 8**, and **Vitest**. It serves as the single foundation for design tokens, styles, and reusable custom elements that can be seamlessly consumed by the React SPA (`client/`) or any standard web runtime without tight coupling.

```text
packages/components/
├── .storybook/               # Storybook configuration & decorators
│   ├── main.ts               # Storybook Vite & addon configuration
│   └── preview.ts            # Global decorators, controls, theme preview
├── src/
│   ├── components/           # Reusable Web Component modules (e.g. src/components/<name>/)
│   ├── styles/               # Design tokens, CSS variables, and theme definitions
│   │   ├── theme.css         # Global CSS custom properties & color tokens
│   │   ├── tokens.ts         # Strongly-typed JavaScript/TypeScript design tokens
│   │   ├── tokens.test.ts    # Unit tests for token scales
│   │   └── tokens.stories.ts # Storybook visual token showcase
│   ├── test/                 # Jest test setup and test helpers
│   │   └── setup.ts          # @testing-library/jest-dom matchers setup
│   ├── types/                # Global type definitions
│   │   └── jsx.d.ts          # React JSX intrinsic elements declarations
│   └── index.ts              # Package barrel entrypoint exporting components, tokens & types
├── jest.config.cjs           # SWC Jest configuration
├── AGENTS.md                 # Dedicated components guide
├── README.md                 # Package overview and developer quickstart
├── package.json              # Package manifest, dependencies, and component scripts
├── tsconfig.json             # Strict TypeScript compiler configuration (extends @atiesh/tsconfig/base)
└── vite.config.ts            # Vite library bundler configuration
```

---

## 2. Directory & Layer Responsibilities

### `src/components/` (Reusable Component Modules)

When adding new Web Components to the design system, isolate each component into its own dedicated folder under `src/components/<component-name>/`:

- **Component Implementation (`<name>.ts`)**: Lit-based Custom Element definition with encapsulated Shadow DOM styles, reactive properties, accessibility attributes, and custom event dispatches.
- **Unit Tests (`<name>.test.ts`)**: Vitest test suite validating rendering, property reflections, slot behavior, user interaction, and event dispatching.
- **Storybook Stories (`<name>.stories.ts`)**: Interactive documentation with controls, variations, and themes.
- **Barrel Export (`index.ts`)**: Exports the component class and associated types.

### `src/styles/` (Design Tokens & Theming)

- **`theme.css`**: Defines standardized CSS custom properties for Atiesh Codex colors (Gold, Arcane Blue, Crimson Red, dark surfaces), border radiuses, typography, and transitions.
- **`tokens.ts`**: Provides strongly-typed constants for design tokens for programmatic access in TypeScript.
- **`tokens.stories.ts`**: Storybook story providing visual documentation and swatches of the design tokens.

### `src/types/` (TypeScript & Framework Contracts)

- **`jsx.d.ts`**: Declares `JSX.IntrinsicElements` typings for custom element tags, allowing React SPA components to typecheck custom elements natively.

---

## 3. Design Principles & Coding Conventions

### 1. Web Components with Lit

- Build components extending `LitElement`.
- Use `static properties = { ... }` for reactive properties and `declare` syntax for instance variables (with constructor initialization) to prevent class field shadowing in modern TypeScript/ES2022.
- Define styles inside `static styles = css\`...\``to benefit from Shadow DOM style encapsulation and reference design token CSS variables (e.g.,`var(--atiesh-color-gold)`).
- Auto-register custom elements using `customElements.define('atiesh-<name>', Atiesh<Name>)` guarded by `!customElements.get('atiesh-<name>')`.

### 2. Custom Events

- Dispatch native `CustomEvent` instances with `{ bubbles: true, composed: true }` so events cross the Shadow DOM boundary cleanly.
- Prefix custom event names with `atiesh-` (e.g., `atiesh-change`, `atiesh-select`).

### 3. Slots & Composition

- Leverage standard Web Component `<slot>` elements for flexible content projection (e.g., default slot, `prefix`, `suffix`, `header`, `footer`).
- Style projected content using `::slotted()` selectors.

### 4. React 19 Integration

- React 19 provides native support for Custom Elements. Attributes, properties, and custom events can be passed directly to custom element tags.
- Update `src/types/jsx.d.ts` whenever introducing new custom elements so consumer React components typecheck cleanly.

### 5. TypeScript & Type Safety Standards

- **Strict Type Enforcement**:
  - `any` typing is strictly forbidden (`@typescript-eslint/no-explicit-any: "error"` and `strict: true` in `tsconfig.json`).
  - `as` type assertions are strictly forbidden and trigger linter errors (`@typescript-eslint/consistent-type-assertions: ["error", { "assertionStyle": "never" }]`). Use constructor instantiation or `instanceof` narrowing instead of casting.

### 6. Automatic AGENTS.md & Documentation Maintenance

- **Mandatory Self-Updating Documentation**:
  - Whenever any change is made to the components package (such as introducing new Web Components, updating design tokens/theming, altering Storybook setup, modifying dependencies, or changing build exports), developers and AI agents must automatically update `components/AGENTS.md` (and the root `AGENTS.md` if monorepo-wide patterns are affected).
  - Any change that modifies topics already documented in `components/AGENTS.md` or introduces new conventions and architectural decisions that should be in it must be updated immediately as part of the same task.
  - Keep documentation accurate and synchronized with the actual codebase at all times.

---

## 4. Testing Standards

The component library enforces automated unit testing via **Jest** and visual snapshot testing via **Playwright**:

### Unit Tests (`*.test.ts`)

- Run via **Jest** with `@swc/jest` and **JSDOM**.
- Test component lifecycle, default property states, and attribute reflection.
- Await `element.updateComplete` after property mutations before making DOM assertions.
- Test shadow DOM nodes (`element.shadowRoot?.querySelector(...)`).
- Verify event dispatching with Jest spies (`jest.fn()`).

### Visual Regression Tests (`*.visual.test.ts`)

- Run via **Playwright** against the static Storybook showcase.
- Captures automated pixel-perfect screenshots of stories and verifies them against baseline snapshots (`__snapshots__/`).
- Executed via `pnpm run test:visual` or updated via `pnpm run test:visual:update`.

---

## 5. Storybook Standards

- Co-locate stories alongside component source files (`*.stories.ts`).
- Provide controls for all configurable properties and slots.
- Include stories for all supported variants, sizes, and states.

---

## 6. Components Development Commands

Component commands can be run from the root workspace or directly within `packages/components/`:

| Command (from root)                           | Command (in `packages/components/`) | Description                                                  |
| :-------------------------------------------- | :---------------------------------- | :----------------------------------------------------------- |
| `pnpm run dev:storybook`                      | `pnpm dev`                          | Start Storybook development server on port 6006              |
| `pnpm run build:components`                   | `pnpm build`                        | Compile TypeScript and bundle library distribution in `dist` |
| `pnpm run build:storybook`                    | `pnpm build:storybook`              | Build static Storybook site in `Docs/storybook`              |
| `pnpm run test:components`                    | `pnpm test`                         | Run all component unit tests with Jest                       |
| `pnpm --filter @atiesh/components test:watch` | `pnpm test:watch`                   | Run Jest in interactive watch mode                           |
| `pnpm run test:visual`                        | `pnpm test:visual`                  | Run Storybook visual regression tests with Playwright        |
| `pnpm run test:visual:update`                 | `pnpm test:visual:update`           | Update baseline visual snapshots for Storybook stories       |
| `pnpm run check:circular:components`          | `pnpm check:circular`               | Check for circular dependencies in Web Components via `dpdm` |
| `pnpm --filter @atiesh/components typecheck`  | `pnpm typecheck`                    | Run TypeScript compiler type checking (`tsc --noEmit`)       |
| `pnpm --filter @atiesh/components clean`      | `pnpm clean`                        | Clean build output directories (`dist`, `dist-storybook`)    |

---

## 7. Workspace Integration

The `@atiesh/components` package provides direct workspace exports for both development hot-reloading and production bundling:

1. **Direct Workspace Consumption (Hot-Reloading in Dev)**:
   - Export maps in `package.json` point `.` and `./theme.css` to `./src/index.ts` and `./src/styles/theme.css`.
   - The React client imports `@atiesh/components` directly via pnpm workspace link, receiving instant HMR upon editing component source files without intermediate build or copy steps.
2. **Production Bundling (`pnpm run build:components`)**:
   - Vite compiles TypeScript, produces optimized ES module bundles (`dist/index.js`), and generates TypeScript declaration files (`dist/index.d.ts`, `dist/styles/tokens.d.ts`, `dist/types/jsx.d.ts`).
