# @lunchbox/branch

Interactive CLI for generating standardised git branch names.

**For usage docs and configuration reference, see the [documentation site](https://qgirard.github.io/lunchbox/packages/branch).**

## Package structure

```
src/
  constants.ts   ← default branch types and config
  format.ts      ← kebab-case conversion helpers
  prompt.ts      ← @clack prompt sequence
  type.ts        ← TypeScript interfaces
  index.ts       ← public API (setupBranchPrompt)
  tests/
    format.test.ts
    prompt.test.ts
```

## Local development

```sh
# from the repo root
pnpm --filter @lunchbox/branch run build
pnpm --filter @lunchbox/branch run test
pnpm --filter @lunchbox/branch run lint
```

## Public API

```ts
setupBranchPrompt(config?: Partial<BranchConfig>): { run(): Promise<void> }
```

## License

ISC
