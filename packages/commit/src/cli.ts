#!/usr/bin/env node

import { runCli } from '@lunchbox-tools/utils';
import { version } from '../package.json';
import { configValidators } from './config';
import { setupCommitPrompt } from './prompt';
import type { CommitConfig } from './type';

await runCli({
  description: 'Interactive Conventional Commit message generator',
  name: 'lunchbox-commit',
  run: (config: Partial<CommitConfig>): Promise<void> => setupCommitPrompt(config).run(),
  section: 'commit',
  validators: configValidators,
  version,
});
