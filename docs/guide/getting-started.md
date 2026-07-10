# Getting Started

Lunchbox is a collection of small CLI tools that help enforce consistent Git workflows. Each tool is published as a standalone npm package under the `@lunchbox-tools` scope.

## Available Packages

| Package | Description |
|---|---|
| [`@lunchbox-tools/commit`](/packages/commit/) | Interactive commit message generator |
| [`@lunchbox-tools/branch`](/packages/branch/) | Interactive branch name generator |

## Quick Install

Install only the tools you need:

::: code-group

```bash [npm]
npm install -D @lunchbox-tools/commit
npm install -D @lunchbox-tools/branch
```

```bash [yarn]
yarn add -D @lunchbox-tools/commit
yarn add -D @lunchbox-tools/branch
```

```bash [pnpm]
pnpm add -D @lunchbox-tools/commit
pnpm add -D @lunchbox-tools/branch
```

:::

## Usage Pattern

Each package exposes a setup function that accepts an optional configuration object and returns a prompt instance. Call `.run()` to start the interactive flow:

```ts
import { setupCommitPrompt } from '@lunchbox-tools/commit';

setupCommitPrompt().run();
```

```ts
import { setupBranchPrompt } from '@lunchbox-tools/branch';

setupBranchPrompt().run();
```

You can wire these into npm scripts, husky hooks, or any other automation entry point.
