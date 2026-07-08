# @lunchbox/commit

Interactive CLI for generating [Conventional Commits](https://www.conventionalcommits.org/) messages. Built with [@clack/prompts](https://github.com/bombshell-dev/clack) for a beautiful terminal UI.

## Install

```sh
# npm
npm install --save-dev @lunchbox/commit

# pnpm
pnpm add -D @lunchbox/commit

# yarn
yarn add --dev @lunchbox/commit
```

## Usage

Create an entry file in your project:

```js
// scripts/commit.mjs
import { initPrompt } from '@lunchbox/commit';

initPrompt().run();
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "commit": "node ./scripts/commit.mjs"
  }
}
```

Then run it after staging your changes:

```sh
git add .
pnpm commit
```

The CLI will walk you through four steps:

1. **Type** — select the type of change (e.g. `feat`, `fix`, `refactor`)
2. **Scope** — multi-select one or more affected areas
3. **Subject** — short description (80 characters max by default)
4. **Body** — optional detailed description
5. **Breaking change** — optional breaking change description

A preview of the final message is shown before confirming. The commit is run with `--no-verify` by default.

## Configuration

Pass a partial config to `initPrompt` to override the defaults:

```js
// scripts/commit.mjs
import { initPrompt } from '@lunchbox/commit';

initPrompt({
  commitScopes: [
    { label: 'frontend — React app', value: 'frontend' },
    { label: 'backend  — API server', value: 'backend' },
    { label: 'infra    — Infrastructure', value: 'infra' },
  ],
  maximumSubjectLength: 72,
  noVerify: false,
}).run();
```

### Config options

| Option                 | Type                    | Default | Description                                   |
| ---------------------- | ----------------------- | ------- | --------------------------------------------- |
| `commitTypes`          | `CommitType[]`          | see below | List of selectable commit types             |
| `commitScopes`         | `CommitScope[]`         | see below | List of selectable scopes                   |
| `maximumSubjectLength` | `number`                | `80`    | Character limit for the subject line          |
| `noVerify`             | `boolean`               | `true`  | Pass `--no-verify` to skip git hooks          |

#### Default commit types

| Value      | Section       | Description                                         |
| ---------- | ------------- | --------------------------------------------------- |
| `feat`     | Features      | A new feature                                       |
| `fix`      | Bug Fixes     | A bug fix                                           |
| `perf`     | Performance   | A code change that improves performance             |
| `revert`   | Reverts       | Reverts a previous commit                           |
| `docs`     | Documentation | Documentation only changes                          |
| `style`    | Styles        | Formatting, missing semi colons, etc                |
| `refactor` | Refactor      | A code change that neither fixes a bug nor a feature|
| `test`     | Tests         | Adding missing tests                                |
| `build`    | Build         | Changes to build system or dependencies             |
| `ci`       | CI            | Changes to CI/CD pipeline configuration             |
| `chore`    | Chores        | Other changes that don't modify src or test files   |

#### Default commit scopes

| Value    | Description                   |
| -------- | ----------------------------- |
| `api`    | Public API surface            |
| `ui`     | Components & styling          |
| `auth`   | Authentication & authorization|
| `config` | Configuration files           |
| `deps`   | Dependency updates            |
| `core`   | Core business logic           |

## Using with Husky

Install and initialise Husky:

```sh
pnpm add -D husky
npx husky init
```

### Pre-commit checks

Run linting or formatting on staged files before the prompt opens. Because `noVerify` defaults to `true`, the inner `git commit` made by `@lunchbox/commit` skips all hooks. To let pre-commit hooks run, set `noVerify: false` in your config.

```js
// scripts/commit.mjs
import { initPrompt } from '@lunchbox/commit';

initPrompt({ noVerify: false }).run();
```

```sh
# .husky/pre-commit — runs on the git commit triggered by initPrompt
pnpm lint-staged
```

### Commit message validation

If you want to validate the generated message with [commitlint](https://commitlint.io), `noVerify` must also be `false` so the `commit-msg` hook fires:

```sh
pnpm add -D @commitlint/cli @commitlint/config-conventional
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

```js
// commitlint.config.mjs
export default { extends: ['@commitlint/config-conventional'] };
```

## License

ISC
