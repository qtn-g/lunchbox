# @lunchbox-tools/branch

Interactive CLI prompt that generates **well-formatted branch names** from a type and description.

## Installation

::: code-group

```bash [npm]
npm install -D @lunchbox-tools/branch
```

```bash [yarn]
yarn add -D @lunchbox-tools/branch
```

```bash [pnpm]
pnpm add -D @lunchbox-tools/branch
```

:::

## Usage

Create a script (e.g. `scripts/branch.mjs`) and call the setup function:

```js
#!/usr/bin/env node
import { setupBranchPrompt } from '@lunchbox-tools/branch';

setupBranchPrompt().run();
```

Then add an npm script in your `package.json`:

```json
{
  "scripts": {
    "branch": "node ./scripts/branch.mjs"
  }
}
```

Run it with:

```bash
pnpm branch
```

The prompt will guide you through:

1. **Source branch** — Autocomplete selector from local and remote branches, defaulting to the current branch
2. **Branch type** — Select the kind of branch (feature, bugfix, release, spike)
3. **Ticket** — Mandatory when `ticketProvider` is configured
4. **Description** — Free-text description of the branch purpose
5. **Preview & confirm** — Review the generated name and confirm creation

The generated branch name follows the format:

```
type/kebab-case-description
type/TICKET-kebab-case-description   # with a ticket
```

For example, selecting `feature` and typing "Add user authentication" produces:

```
feature/add-user-authentication
```

## Default Branch Types

| Value | Label |
|---|---|
| `feature` | New feature development |
| `bugfix` | A bug fix |
| `release` | Release preparation |
| `spike` | Experimental work |
