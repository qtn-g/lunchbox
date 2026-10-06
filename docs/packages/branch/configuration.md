# Configuration

`setupBranchPrompt` accepts a partial `BranchConfig` object. Any fields you provide override the defaults.

## BranchConfig

```ts
interface BranchConfig {
  branchTypes: Array<BranchType>;
  ticketProvider: 'none' | 'jira' | 'github' | 'azure';
  ticketPrefix: string;
  fetchRemoteBranches: boolean;
}
```

### `branchTypes`

Array of branch types shown in the type selector.

```ts
interface BranchType {
  label: string; // Display text in the prompt
  value: string; // Prefix inserted into the branch name
}
```

### `ticketProvider`

Issue tracker used to link the branch to a ticket. When different from `none`, the prompt asks for a **mandatory** ticket and inserts it right after the type prefix, which is the convention each tracker uses to detect the branch.

| Provider | Input | Branch name |
|---|---|---|
| `none` | — | `feature/add-login` |
| `jira` | `PROJ-123` (case-insensitive) | `feature/PROJ-123-add-login` |
| `github` | `123` or `#123` | `feature/123-add-login` |
| `azure` | `123` or `#123` | `feature/123-add-login` |

Jira keys are kept upper-case because Jira only detects upper-case keys.

- **Default:** `'none'`

### `fetchRemoteBranches`

When `true`, runs `git fetch --all --prune` before listing source branches so remote branches are up to date. A failed fetch (e.g. offline) only shows a warning.

The source branch selector lists the current branch first (selected by default), then local branches, then remote branches (e.g. `origin/main`). A branch created from a remote branch uses `--no-track`, so it does not get the remote branch as upstream and `git push` creates its own remote branch.

- **Default:** `true`

### `ticketPrefix`

Prepended **as-is** to a ticket typed as a bare number — nothing is added in between, so it works with any tracker. Full tickets (e.g. `OTHER-45`) are kept unchanged. The result must still be a valid ticket for the provider.

```ts
{ ticketPrefix: 'PROJ-', ticketProvider: 'jira' } // 123 → PROJ-123
```

- **Default:** `''`

## Example

```ts
import { setupBranchPrompt } from '@lunchbox-tools/branch';

setupBranchPrompt({
  branchTypes: [
    { label: 'feature  — New feature development', value: 'feature' },
    { label: 'bugfix   — A bug fix', value: 'bugfix' },
    { label: 'hotfix   — Urgent production fix', value: 'hotfix' },
    { label: 'release  — Release preparation', value: 'release' },
    { label: 'spike    — Experimental work', value: 'spike' },
  ],
  ticketPrefix: 'PROJ-',
  ticketProvider: 'jira',
}).run();
```

## TypeScript

The `BranchConfig` type is exported for type safety:

```ts
import type { BranchConfig } from '@lunchbox-tools/branch';

const config: Partial<BranchConfig> = {
  branchTypes: [
    { label: 'hotfix — Urgent fix', value: 'hotfix' },
    { label: 'feature — New feature', value: 'feature' },
  ],
};

setupBranchPrompt(config).run();
```
