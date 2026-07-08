# lunchbox

A pnpm monorepo containing CLI utilities for branch creation, commit message generation, and shared helper utilities.

## Packages

- [`@lunchbox/utils`](packages/utils/README.md) — shared utility helpers used by the other packages.
- [`@lunchbox/branch`](packages/branch/README.md) — interactive branch name generator.
- [`@lunchbox/commit`](packages/commit/README.md) — interactive Conventional Commit message generator.

## Getting started

Install dependencies:

```sh
pnpm install
```

Build the workspace:

```sh
pnpm run build
```

Run lint and tests across packages:

```sh
pnpm run lint
pnpm run test
```

## Package commands

Each package is built and tested through the root workspace scripts.

- `pnpm run build` — build all packages.
- `pnpm run dev` — run each package dev command concurrently.
- `pnpm run lint` — lint all packages.
- `pnpm run test` — run tests for all packages.
- `pnpm run commit` — run the root repository commit script.

## Notes

- Uses Node 24 and pnpm 10.
- `biome` is used for formatting and linting.
- Root scripts delegate to the package-specific scripts using `pnpm --filter`.
