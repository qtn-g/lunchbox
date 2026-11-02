#!/usr/bin/env node

import { runCli } from '@lunchbox-tools/utils';
import { version } from '../package.json';
import { configValidators } from './config';
import { setupBranchPrompt } from './prompt';
import type { BranchConfig } from './type';

await runCli({
  description: 'Interactive branch name generator',
  name: 'lunchbox-branch',
  run: (config: Partial<BranchConfig>): Promise<void> => setupBranchPrompt(config).run(),
  section: 'branch',
  validators: configValidators,
  version,
});
