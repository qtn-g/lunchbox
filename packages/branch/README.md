# @lunchbox/branch

Interactive CLI for generating standardised git branch names. Built with [@clack/prompts](https://github.com/bombshell-dev/clack) for a beautiful terminal UI.

## Install

```sh
# npm
npm install --save-dev @lunchbox/branch

# pnpm
pnpm add -D @lunchbox/branch

# yarn
yarn add --dev @lunchbox/branch
```

## Usage

Create an entry file in your project:

```js
// scripts/branch.mjs
import { initPrompt } from '@lunchbox/branch';

initPrompt().run();
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "branch": "node ./scripts/branch.mjs"
  }
}
```

Then run it:

```sh
pnpm branch
```

The CLI will walk you through:

1. **Source branch** — autocomplete selection of the branch to create from
2. **Type** — select the branch type (e.g. `feature`, `bugfix`, `release`)
3. **Description** — short description converted to kebab-case
4. **Confirmation** — preview the branch name before creating it

The resulting branch follows the pattern `<type>/<kebab-description>` and is checked out automatically.

## Configuration

Pass a partial config to `initPrompt` to override the defaults:

```js
// scripts/branch.mjs
import { initPrompt } from '@lunchbox/branch';

initPrompt({
  branchTypes: [
    { label: 'feature  — New feature development', value: 'feature' },
    { label: 'bugfix   — A bug fix', value: 'bugfix' },
    { label: 'hotfix   — Critical production fix', value: 'hotfix' },
    { label: 'chore    — Routine task', value: 'chore' },
  ],
}).run();
```

### Config options

| Option        | Type            | Default    | Description                          |
| ------------- | --------------- | ---------- | ------------------------------------ |
| `branchTypes` | `BranchType[]`  | see below  | List of selectable branch type prefixes |

#### Default branch types

| Value     | Description                 |
| --------- | --------------------------- |
| `feature` | New feature development     |
| `bugfix`  | A bug fix                   |
| `release` | Release preparation         |
| `spike`   | Experimental work           |

## License

ISC
