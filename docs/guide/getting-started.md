# Getting Started

Lunchbox is a collection of small CLI tools that help enforce consistent Git workflows. Each tool is published as a standalone npm package under the `@lunchbox-tools` scope.

## Available Packages

| Package | Description |
|---|---|
| [`@lunchbox-tools/commit`](/packages/commit/) | Interactive commit message generator |
| [`@lunchbox-tools/branch`](/packages/branch/) | Interactive branch name generator |

## Interactive Setup

Choose what you want and review the changes before anything is applied:

```bash
npx @lunchbox-tools/setup
```

It can install the commit and branch tools (in the project with your package manager, or globally), install the [agent skills](#agent-skills) through the skills CLI, and add git aliases such as `git sweep` to your global git config. It asks before replacing an alias with a different value, and leaves an existing `commit` or `branch` script alone.

## Quick Start

Run a tool without installing anything, from anywhere inside a git repository:

::: code-group

```bash [npm]
npx @lunchbox-tools/commit
npx @lunchbox-tools/branch
```

```bash [yarn]
yarn dlx @lunchbox-tools/commit
yarn dlx @lunchbox-tools/branch
```

```bash [pnpm]
pnpm dlx @lunchbox-tools/commit
pnpm dlx @lunchbox-tools/branch
```

:::

## Install

Install globally to get the `lunchbox-commit` and `lunchbox-branch` commands everywhere:

```bash
npm install -g @lunchbox-tools/commit @lunchbox-tools/branch
```

Or add only the tools you need to a project, to pin their version for the whole team:

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

## Configuration

Commit `lunchbox.config.json` at the root of your repository to share options with your team. Each tool reads its own section:

```json
{
  "branch": { "ticketPrefix": "PROJ-", "ticketProvider": "jira" },
  "commit": {
    "commitScopes": [{ "label": "api — Public API surface", "value": "api" }],
    "ticketPrefix": "PROJ-",
    "ticketProvider": "jira"
  }
}
```

See the [branch](/packages/branch/configuration) and [commit](/packages/commit/configuration) options.

## Agent Skills

The tools are interactive, so a coding agent cannot drive them. The [skills](https://github.com/qtn-g/lunchbox/tree/master/plugins/lunchbox/skills) teach it to create the same branches and commits with plain git, following your configuration:

```bash
npx skills add qtn-g/lunchbox
```

In Claude Code, you can install them as a plugin instead, which also lets you update them with `claude plugin update`:

```
/plugin install lunchbox --marketplace qtn-g/lunchbox
```

The repository also holds `coding-style`, the coding conventions lunchbox itself follows. It has nothing to do with the tools, so install it only if you want those conventions in your project. The Claude Code plugin always includes it and applies it to all code, so use the skills CLI to install the branch and commit skills alone.

## Use From a Script

Each package also exposes a setup function that accepts an optional configuration object and returns a prompt instance. Call `.run()` to start the interactive flow:

```ts
import { setupCommitPrompt } from '@lunchbox-tools/commit';

setupCommitPrompt().run();
```

```ts
import { setupBranchPrompt } from '@lunchbox-tools/branch';

setupBranchPrompt().run();
```

You can wire these into npm scripts, husky hooks, or any other automation entry point.
