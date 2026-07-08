/** biome-ignore-all lint/suspicious/noConsole: Used to display info to the user */

import { execSync } from 'node:child_process';
import { cancel, isCancel } from '@clack/prompts';
import type { ExecSyncOptionsWithStringEncoding } from 'node:child_process';

export const unwrap = <T>(value: T | symbol): T => {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return value;
};

export const runCommand = (command: string, opts?: Omit<ExecSyncOptionsWithStringEncoding, 'encoding'>): string => {
  try {
    return execSync(command, { encoding: 'utf-8', ...opts });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    } else {
      throw error;
    }
  }
};
