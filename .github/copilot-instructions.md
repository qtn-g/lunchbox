# Lunchbox — Repository Guidelines

## What This Repo Is

**lunchbox** is a pnpm monorepo of CLI/utility tools for committing, branching, and releasing packages. Each tool lives under `packages/<name>` and is published independently as `@lunchbox/<name>`.

## Monorepo Structure

```
packages/
  <tool>/
    src/
      index.ts      ← public entry point
      tests/        ← vitest test files
    tsdown.config.ts
    package.json
    tsconfig.json
```

- All packages are listed in `pnpm-workspace.yaml` under `packages/*`.
- Shared dependency versions are pinned in the `catalog:` block of `pnpm-workspace.yaml`; always use `catalog:` for shared deps instead of hardcoding versions.
- Run workspace-wide scripts with `pnpm --filter @lunchbox/<name> run <script>`.

## Toolchain

| Tool | Purpose |
|---|---|
| **pnpm 10** | Package manager; use `pnpm` for all installs and script runs |
| **TypeScript 6** | Language; `module: preserve`, `moduleResolution: bundler`, target `esnext` |
| **tsdown** | Bundler; produces ESM-only output (`.mjs` + `.d.mts`) in `dist/` |
| **Biome** | Linter + formatter; replaces ESLint and Prettier — never add either |
| **Node 24** | Runtime; `engineStrict: true` is set — do not use APIs not available in Node 24 |
| **vitest** | Test runner; use `catalog:` for both `vitest` and `@vitest/coverage-v8` |

## Building Packages

Each package uses tsdown. The standard config is minimal:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
});
```

- Output is always ESM (`.mjs`). Do not add CJS output unless explicitly requested.
- Type declarations emit as `.d.mts` alongside the bundle.
- `src/index.ts` is the sole entry point per package; keep the public API surface explicit.

## Package Exports Convention

During development, `exports["."]` points to `./src/index.ts` directly. On publish, `publishConfig.exports` overrides it to the built `dist/` artefacts:

```json
"exports": { ".": "./src/index.ts" },
"publishConfig": {
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  }
}
```

Never change this pattern — it allows consumers and the dev server to resolve source without a build step.

## Adding a New Package

1. Create `packages/<name>/` with the structure above.
2. Set `"name": "@lunchbox/<name>"` in `package.json`.
3. Mirror the `exports` / `publishConfig` pattern from an existing package.
4. Use `catalog:` for `typescript` and `tsdown` in `devDependencies`.
5. Do not add a separate ESLint or Prettier config — Biome handles everything.

## Testing

- Use **vitest** as the test runner. Add `vitest` and `@vitest/coverage-v8` via `catalog:` in `devDependencies`.
- Test files live inside `src/tests/` alongside the source they test.
- Standard test scripts:
  ```json
  "test": "vitest run --coverage",
  "test:verbose": "vitest run --reporter verbose"
  ```
- Extract pure logic (formatting, validation, transformation) into dedicated modules so it can be tested without mocking I/O.
- Mock `@inquirer/prompts` with `vi.mock` for prompt integration tests; mock `node:child_process` and `node:fs` for git layer tests.
- Do not test third-party library behaviour — only test your own logic.

## Code Style

- All TypeScript rules are in `.github/instructions/typescript.instructions.md` (applied automatically to `**/*.ts` files).
- Run `pnpm lint` before committing to check Biome compliance.
