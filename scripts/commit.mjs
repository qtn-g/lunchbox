#!/usr/bin/env node

import { setupCommitPrompt } from '../packages/commit/dist/index.mjs';

const commitPrompt = setupCommitPrompt({
  commitScopes: [
    { label: 'commit   — Commit package', value: 'commit' },
    { label: 'branch   — Branch package', value: 'branch' },
    { label: 'ci       — Continuous Integration', value: 'ci' },
    { label: 'deps     — Dependency updates', value: 'deps' },
    { label: 'core     — Core business logic', value: 'core' }
  ],
  noVerify: false
});
commitPrompt.run();
