#!/usr/bin/env node

import { handleCliFlags } from '@lunchbox-tools/utils';
import { version } from '../package.json';
import { runSetup } from './setup';

const main = async (): Promise<void> => {
  const info = {
    description: 'Interactive installer for the lunchbox tools, skills and git aliases',
    name: 'lunchbox-setup',
    version,
  };
  if (!handleCliFlags(info)) {
    return;
  }
  await runSetup();
};

await main();
