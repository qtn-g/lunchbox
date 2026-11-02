# @lunchbox-tools/branch

Interactive CLI for generating standardised git branch names.

**For usage docs and configuration reference, see the [documentation site](https://qgirard.github.io/lunchbox/packages/branch).**

## Usage

```sh
npx @lunchbox-tools/branch              # run without installing
npm install -g @lunchbox-tools/branch   # or install the `lunchbox-branch` command
```

Options are read from the `"branch"` section of `lunchbox.config.json`, at the root of the git repository.

## Package structure

```
src/
  cli.ts         ← `lunchbox-branch` executable
  config.ts      ← config file validators
  constants.ts   ← default branch types and config
  format.ts      ← kebab-case conversion and branch name helpers
  prompt.ts      ← @clack prompt sequence
  source.ts      ← source branch listing (local + remote) helpers
  type.ts        ← TypeScript interfaces
  index.ts       ← public API (setupBranchPrompt)
  tests/
    format.test.ts
    prompt.test.ts
    source.test.ts
```

## Local development

```sh
# from the repo root
pnpm --filter @lunchbox-tools/branch run build
pnpm --filter @lunchbox-tools/branch run test
pnpm --filter @lunchbox-tools/branch run lint
```

## Public API

```ts
setupBranchPrompt(config?: Partial<BranchConfig>): { run(): Promise<void> }
```

## License

ISC
