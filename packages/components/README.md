# Atiesh Codex — Web Components & Design System

A modern, standalone Web Components library and design system for the **Atiesh Codex** application built with Lit, TypeScript, Vite, Storybook, and Vitest.

## Features

- **Standard Web Components**: Built with [Lit](https://lit.dev/) with native Custom Element registration and Shadow DOM encapsulation.
- **Design Tokens**: Centralized CSS custom properties and TypeScript constants for fantasy/theme styling (Gold, Arcane, Crimson, dark surfaces).
- **TypeScript First**: Strict type checks, declaration files generated via `vite-plugin-dts`, and JSX intrinsic elements declarations for React 19 SPA compatibility.
- **Storybook 8**: Interactive component explorer and design token showcase.
- **Vitest & JSDOM**: Fast automated unit testing with `@testing-library/jest-dom` matchers.

## Available Scripts

- `pnpm dev`: Launch the Storybook component explorer at `http://localhost:6006`
- `pnpm build`: Compile TypeScript and bundle the library to `dist/`
- `pnpm build:storybook`: Build static Storybook site to `Docs/storybook/`
- `pnpm test`: Run automated unit tests with Vitest
- `pnpm test:watch`: Run Vitest in watch mode
- `pnpm typecheck`: Run TypeScript compilation check (`tsc --noEmit`)
- `pnpm typewatch`: Run TypeScript check in watch mode (`tsc --noEmit --watch`)
- `pnpm clean`: Remove build artifacts (`dist`, `dist-storybook`)

## Developer & Agent Guidelines

For comprehensive Web Component development standards, Storybook conventions, design token patterns, and testing guidelines, refer to [`AGENTS.md`](./AGENTS.md).

- **Automatic Documentation Maintenance**: Any change made that affects information already documented in `components/AGENTS.md` or `components/README.md`, or introduces new conventions and patterns that belong in them, must be automatically updated as part of the same task.
