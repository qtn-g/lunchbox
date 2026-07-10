# lunchbox

A pnpm monorepo containing CLI utilities for branch creation and Conventional Commit message generation.

**For usage documentation, see the [documentation site](https://qgirard.github.io/lunchbox/).**

## Packages

| Package | Description |
| --- | --- |
| [`@lunchbox-tools/branch`](packages/branch/README.md) | Interactive branch name generator |
| [`@lunchbox-tools/commit`](packages/commit/README.md) | Interactive Conventional Commit message generator |
| [`@lunchbox-tools/utils`](packages/utils/README.md) | Shared internal utilities (private, not published) |

## Development setup

```sh
pnpm install
pnpm run build
```

## Workspace scripts

| Script | Description |
| --- | --- |
| `pnpm run build` | Build all packages |
| `pnpm run dev` | Watch all packages concurrently |
| `pnpm run lint` | Lint all packages with Biome |
| `pnpm run test` | Run tests across all packages |
| `pnpm run docs:dev` | Start VitePress dev server |
| `pnpm run docs:build` | Build the documentation site |
| `pnpm run commit` | Run the repo commit script |

## Adding a new package

1. Create `packages/<name>/` following the structure of an existing package.
2. Set `"name": "@lunchbox-tools/<name>"` in `package.json`.
3. Mirror the `exports` / `publishConfig` pattern from an existing package.
4. Use `catalog:` for `typescript` and `tsdown` in `devDependencies`.
5. Do not add ESLint or Prettier — Biome handles everything.

## Releasing

This monorepo uses [Changesets](https://github.com/changesets/changesets).

```sh
# 1. Create a changeset for your changes
pnpm changeset

# 2. When ready to release, bump versions and update changelogs
pnpm changeset version

# 3. Commit, tag, and push
git add .
git commit -m "release: v<x.y.z>"
git tag v<x.y.z>
git push && git push --tags
```

Pushing a `v*` tag triggers the release workflow which builds, tests, and publishes to npm.

### Required secrets

| Secret | Description |
| --- | --- |
| `NPM_TOKEN` | npm access token with publish permissions |
