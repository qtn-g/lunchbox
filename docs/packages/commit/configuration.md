# Configuration

`setupCommitPrompt` accepts a partial `CommitConfig` object. Any fields you provide override the defaults.

## CommitConfig

```ts
interface CommitConfig {
  commitTypes: Array<CommitType>;
  commitScopes: Array<CommitScope>;
  noVerify: boolean;
  maximumSubjectLength: number;
  ticketProvider: 'none' | 'jira' | 'github' | 'azure';
  ticketPrefix: string;
}
```

### `commitTypes`

Array of commit types shown in the type selector.

```ts
interface CommitType {
  label: string;   // Display text in the prompt
  section: string; // Changelog section name
  value: string;   // Value inserted into the commit message
}
```

### `commitScopes`

Array of scopes shown in the multi-select prompt.

```ts
interface CommitScope {
  label: string; // Display text in the prompt
  value: string; // Value inserted into the commit message
}
```

### `noVerify`

When `true`, appends `--no-verify` to the `git commit` command, skipping Git hooks.

- **Default:** `false`

### `maximumSubjectLength`

Maximum allowed characters for the commit subject line.

- **Default:** `80`

### `ticketProvider`

Issue tracker used to link the commit to a ticket. When different from `none`, a ticket is **mandatory**. If the current branch name contains one (e.g. `feature/PROJ-123-add-login`), it is used directly; otherwise the prompt asks for it. The ticket is added as a `Refs:` footer that the tracker uses to link the commit.

| Provider | Footer |
|---|---|
| `none` | — |
| `jira` | `Refs: PROJ-123` |
| `github` | `Refs: #123` |
| `azure` | `Refs: #123` |

```
feat(api): add login endpoint

Refs: PROJ-123
```

- **Default:** `'none'`

### `ticketPrefix`

Prepended **as-is** to a ticket typed as a bare number — nothing (no `-`) is added in between, so it works with any tracker. Full tickets (e.g. `OTHER-45`) are kept unchanged. The result must still be a valid ticket for the provider.

```ts
{ ticketPrefix: 'PROJ-', ticketProvider: 'jira' } // 123 → PROJ-123
```

- **Default:** `''`

## Example

```ts
import { setupCommitPrompt } from '@lunchbox-tools/commit';

setupCommitPrompt({
  commitTypes: [
    { label: 'feat — A new feature', section: 'Features', value: 'feat' },
    { label: 'fix  — A bug fix', section: 'Bug Fixes', value: 'fix' },
  ],
  commitScopes: [
    { label: 'api  — Public API surface', value: 'api' },
    { label: 'ui   — Components & styling', value: 'ui' },
    { label: 'core — Core business logic', value: 'core' },
  ],
  maximumSubjectLength: 72,
  noVerify: true,
  ticketProvider: 'github',
}).run();
```

## TypeScript

The `CommitConfig` type is exported for type safety:

```ts
import type { CommitConfig } from '@lunchbox-tools/commit';

const config: Partial<CommitConfig> = {
  maximumSubjectLength: 60,
};

setupCommitPrompt(config).run();
```
