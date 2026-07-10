# Configuration

`setupBranchPrompt` accepts a partial `BranchConfig` object. Any fields you provide override the defaults.

## BranchConfig

```ts
interface BranchConfig {
  branchTypes: Array<BranchType>;
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
