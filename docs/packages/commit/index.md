# @lunchbox-tools/commit

Interactive CLI prompt that generates **conventional commit messages** with type, scope, subject, body, and breaking change support.

## Usage

Run it without installing anything, from anywhere inside a git repository:

::: code-group

```bash [npm]
npx @lunchbox-tools/commit
```

```bash [yarn]
yarn dlx @lunchbox-tools/commit
```

```bash [pnpm]
pnpm dlx @lunchbox-tools/commit
```

:::

### Installation

Install it globally to get the `lunchbox-commit` command everywhere:

```bash
npm install -g @lunchbox-tools/commit
lunchbox-commit
```

Or add it to a project, to pin the version for the whole team:

::: code-group

```bash [npm]
npm install -D @lunchbox-tools/commit
```

```bash [yarn]
yarn add -D @lunchbox-tools/commit
```

```bash [pnpm]
pnpm add -D @lunchbox-tools/commit
```

:::

Then add an npm script in your `package.json`:

```json
{
  "scripts": {
    "commit": "lunchbox-commit"
  }
}
```

Run it with:

```bash
pnpm commit
```

Options are read from [`lunchbox.config.json`](./configuration#config-file). The default scopes are generic, so you will most likely want to set your own `commitScopes` there.

### Use it from a script

You can also call it from your own script, for instance to compute the configuration:

```js
#!/usr/bin/env node
import { setupCommitPrompt } from '@lunchbox-tools/commit';

setupCommitPrompt().run();
```

## Prompts

The prompt will guide you through:

1. **Type** — Select the kind of change (feat, fix, docs, refactor, etc.)
2. **Scopes** — Select one or more scopes affected by the change
3. **Subject** — Short description of the change
4. **Body** — Optional detailed description
5. **Breaking change** — Optional breaking change description
6. **Ticket** — Mandatory when `ticketProvider` is configured; skipped when the branch name already contains it

The generated message follows the format:

```
type(scope1, scope2)!: subject

body

BREAKING CHANGE: description
```

## Default Commit Types

| Value | Label | Changelog Section |
|---|---|---|
| `feat` | A new feature | Features |
| `fix` | A bug fix | Bug Fixes |
| `docs` | Documentation only changes | Documentation |
| `refactor` | Code change that neither fixes a bug nor adds a feature | Refactor |
| `build` | Build system or bundler configuration changes | Build |
| `test` | Adding missing tests | Tests |
| `ci` | Changes to CI/CD pipeline configuration | CI |
| `release` | Version bumps and changelog updates | Release |

## Default Commit Scopes

| Value | Label |
|---|---|
| `deps` | Dependency version changes |
| `workspace` | Root-level monorepo concerns |

## Husky Integration

You can use `@lunchbox-tools/commit` as a replacement for `git commit` by combining it with [husky](https://typicode.github.io/husky/) to enforce structured commits across your team.

### 1. Install husky

::: code-group

```bash [pnpm]
pnpm add -D husky
```

```bash [npm]
npm install -D husky
```

```bash [yarn]
yarn add -D husky
```

:::

### 2. Initialize husky

```bash
npx husky init
```

This creates a `.husky/` directory in your project root.

### 3. Install the commit tool

::: code-group

```bash [pnpm]
pnpm add -D @lunchbox-tools/commit
```

```bash [npm]
npm install -D @lunchbox-tools/commit
```

```bash [yarn]
yarn add -D @lunchbox-tools/commit
```

:::

### 4. Add an npm script

```json
{
  "scripts": {
    "commit": "lunchbox-commit"
  }
}
```

### 5. Use it

Instead of running `git commit` directly, run:

```bash
pnpm commit
```

This launches the interactive prompt, generates the message, and commits for you.

::: tip
If you have a `commit-msg` hook that validates the message format, `@lunchbox-tools/commit` already produces compliant messages — no extra validation needed. You can also pass `noVerify: true` in the config to skip hooks during the commit if needed.
:::
