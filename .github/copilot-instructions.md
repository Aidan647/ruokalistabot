# Copilot Instructions for ruokalistabot

## Project Overview
- **ruokalistabot** is a Bun-based TypeScript project, initialized with `bun init` (Bun v1.2.20).
- The entry point is `src/index.ts`. The current codebase is minimal, but all logic should be placed in the `src/` directory.
- Bun is used for running and managing dependencies. See [Bun documentation](https://bun.com) for runtime specifics.

## Developer Workflows
- **Install dependencies:**
  ```bash
  bun install
  ```
- **Run the project:**
  ```bash
  bun run index.ts
  ```
- **TypeScript:**
  - Configured for ESNext features and strict type checking (see `tsconfig.json`).
  - Uses bundler-style module resolution and supports JSX (React), though no React code is present yet.

## Patterns & Conventions
- All source code should reside in `src/`.
- Entry point is always `src/index.ts` (see `package.json`).
- Use modern TypeScript features and strict mode as enforced by `tsconfig.json`.
- No test or build scripts are present; add them in `package.json` if needed.
- No custom linting or formatting rules are defined; follow standard TypeScript and Bun conventions.

## Integration Points
- Peer dependency on TypeScript (`^5`).
- Dev dependency on `@types/bun` for Bun type definitions.
- Puppeteer

## Example: Minimal Main File
```typescript
// src/index.ts
console.log("Hello via Bun!");
```

## How to Extend
- Add new features by creating additional `.ts` files in `src/` and importing them in `index.ts`.
- For more complex apps, organize code into subdirectories under `src/` (e.g., `src/services/`, `src/routes/`).
- Update `package.json` and `tsconfig.json` as needed for new dependencies or build options.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
