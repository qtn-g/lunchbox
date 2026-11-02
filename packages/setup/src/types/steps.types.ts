import type { CommandResult } from '@lunchbox-tools/utils';

/** One change to the machine or the project, performed once the plan is confirmed. */
export interface SetupStep {
  readonly label: string;
  readonly run: () => CommandResult;
}
