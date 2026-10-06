import type { TicketSettings } from '@lunchbox-tools/utils';

export interface BranchType {
  label: string;
  value: string;
}

/**
 * Configuration for the branch prompt behaviour.
 */
export interface BranchConfig extends TicketSettings {
  /**
   * Available branch types shown in the `type` selector.
   * Each item controls the label displayed in the prompt and the prefix
   * inserted into the branch name.
   * @example
   * [
   *   { label: 'feature — New feature development', value: 'feature' }
   *   { label: 'chore — Routine task', value: 'chore' }
   * ]
   */
  branchTypes: Array<BranchType>;
  /**
   * When true, runs `git fetch --all --prune` before listing source branches so
   * remote branches are up to date. Failures (e.g. offline) only emit a warning.
   * @default true
   */
  fetchRemoteBranches: boolean;
}

/**
 * Branch the new branch can be created from.
 * Remote branches are referenced as `<remote>/<branch>` (e.g. `origin/main`).
 */
export interface SourceBranch {
  location: 'local' | 'remote';
  name: string;
}
