# @lunchbox/commit

Interactive CLI prompt that generates **conventional commit messages** with type, scope, subject, body, and breaking change support.

## Installation

::: code-group

```bash [npm]
npm install -D @lunchbox/commit
```

```bash [yarn]
yarn add -D @lunchbox/commit
```

```bash [pnpm]
pnpm add -D @lunchbox/commit
```

:::

## Usage

Create a script (e.g. `scripts/commit.mjs`) and call the setup function:

```js
#!/usr/bin/env node
import { setupCommitPrompt } from '@lunchbox/commit';

setupCommitPrompt().run();
```

Then add an npm script in your `package.json`:

```json
{
  "scripts": {
    "commit": "node ./scripts/commit.mjs"
  }
}
```

Run it with:

```bash
pnpm commit
```

The prompt will guide you through:

1. **Type** — Select the kind of change (feat, fix, docs, refactor, etc.)
2. **Scopes** — Select one or more scopes affected by the change
3. **Subject** — Short description of the change
4. **Body** — Optional detailed description
5. **Breaking change** — Optional breaking change description

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

You can use `@lunchbox/commit` as a replacement for `git commit` by combining it with [husky](https://typicode.github.io/husky/) to enforce structured commits across your team.

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

### 3. Create a commit script

Create a script file (e.g. `scripts/commit.mjs`):

```js
#!/usr/bin/env node
import { setupCommitPrompt } from '@lunchbox/commit';

setupCommitPrompt().run();
```

### 4. Add an npm script

```json
{
  "scripts": {
    "commit": "node ./scripts/commit.mjs"
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
If you have a `commit-msg` hook that validates the message format, `@lunchbox/commit` already produces compliant messages — no extra validation needed. You can also pass `noVerify: true` in the config to skip hooks during the commit if needed.
:::
