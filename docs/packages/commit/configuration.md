# Configuration

`setupCommitPrompt` accepts a partial `CommitConfig` object. Any fields you provide override the defaults.

## CommitConfig

```ts
interface CommitConfig {
  commitTypes: Array<CommitType>;
  commitScopes: Array<CommitScope>;
  noVerify: boolean;
  maximumSubjectLength: number;
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
