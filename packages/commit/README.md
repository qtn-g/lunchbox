# @lunchbox-tools/commit

Interactive CLI for generating [Conventional Commits](https://www.conventionalcommits.org/) messages.

**For usage docs and configuration reference, see the [documentation site](https://qgirard.github.io/lunchbox/packages/commit).**

## Package structure

```
src/
  constants.ts   ← default commit types, scopes, and limits
  format.ts      ← Conventional Commit message assembly
  prompt.ts      ← @clack prompt sequence
  type.ts        ← TypeScript interfaces
  utils.ts       ← internal helpers
  index.ts       ← public API (setupCommitPrompt)
  tests/
    format.test.ts
    prompt.test.ts
```

## Local development

```sh
# from the repo root
pnpm --filter @lunchbox-tools/commit run build
pnpm --filter @lunchbox-tools/commit run test
pnpm --filter @lunchbox-tools/commit run lint
```

## Public API

```ts
setupCommitPrompt(config?: Partial<CommitConfig>): { run(): Promise<void> }
```
