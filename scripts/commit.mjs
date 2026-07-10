#!/usr/bin/env node

import { setupCommitPrompt } from '../packages/commit/dist/index.mjs';

const commitPrompt = setupCommitPrompt({
  commitScopes: [
    { label: 'commit   — Commit package', value: 'commit' },
    { label: 'branch   — Branch package', value: 'branch' },
    { label: 'config   — Configuration files', value: 'config' },
    { label: 'ci       — Continuous Integration', value: 'ci' },
    { label: 'core     — Core business logic', value: 'core' },
    { label: 'doc     — Documentation', value: 'doc' },
  ],
});
commitPrompt.run();
