# Getting Started

Lunchbox is a collection of small CLI tools that help enforce consistent Git workflows. Each tool is published as a standalone npm package under the `@lunchbox` scope.

## Available Packages

| Package | Description |
|---|---|
| [`@lunchbox/commit`](/packages/commit/) | Interactive commit message generator |
| [`@lunchbox/branch`](/packages/branch/) | Interactive branch name generator |

## Quick Install

Install only the tools you need:

::: code-group

```bash [npm]
npm install -D @lunchbox/commit
npm install -D @lunchbox/branch
```

```bash [yarn]
yarn add -D @lunchbox/commit
yarn add -D @lunchbox/branch
```

```bash [pnpm]
pnpm add -D @lunchbox/commit
pnpm add -D @lunchbox/branch
```

:::

## Usage Pattern

Each package exposes a setup function that accepts an optional configuration object and returns a prompt instance. Call `.run()` to start the interactive flow:

```ts
import { setupCommitPrompt } from '@lunchbox/commit';

setupCommitPrompt().run();
```

```ts
import { setupBranchPrompt } from '@lunchbox/branch';

setupBranchPrompt().run();
```

You can wire these into npm scripts, husky hooks, or any other automation entry point.
