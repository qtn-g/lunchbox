export interface BranchType {
  label: string;
  value: string;
}

/**
 * Configuration for the branch prompt behaviour.
 */
export interface BranchConfig {
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
}
