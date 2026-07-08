/** biome-ignore-all lint/suspicious/noConsole: <Used to display info to the user> */

import { autocomplete, box, confirm, intro, outro, select, text } from '@clack/prompts';
import { runCommand, unwrap } from '@lunchbox/utils';
import { defaultConfig } from './constants';
import { formatBranchName } from './format';
import type { BranchConfig } from './type';

class BranchPrompt {
  private readonly _config: BranchConfig;

  constructor(config?: Partial<BranchConfig>) {
    this._config = { ...defaultConfig, ...config };
  }

  async run(): Promise<void> {
    intro('Branch name generator');

    const sourceBranch = await this.askSourceBranch();
    const branchType = await this.askBranchType();
    const branchDescription = await this.askBranchDescription();
    const branchName = formatBranchName(branchType, branchDescription);

    this.previewBranchName(branchName);
    const confirmed = await this.askConfirmation();

    if (confirmed) {
      this.createBranch(branchName, sourceBranch);
      outro(`Branch "${branchName}" created successfully!`);
    } else {
      outro('Branch creation canceled.');
    }
  }

  private async askSourceBranch(): Promise<string> {
    const output = runCommand('git branch', { stdio: ['pipe', 'pipe', 'pipe'] });
    const branches = output
      .split('\n')
      .map((b) => b.replace(/^\*?\s*/, '').trim())
      .filter(Boolean);

    const value = await autocomplete({
      message: 'Select the source branch:',
      options: branches.map((b) => ({ label: b, value: b })),
    });
    return unwrap(value);
  }

  private previewBranchName(branchName: string): void {
    box(branchName, 'Branch Name Preview');
  }

  private createBranch(branchName: string, sourceBranch: string): void {
    runCommand(`git checkout -b "${branchName}" "${sourceBranch}"`, { stdio: 'inherit' });
  }

  private async askConfirmation(): Promise<boolean> {
    const value = await confirm({
      message: 'Do you want to create this branch?',
    });
    return unwrap(value);
  }

  private async askBranchType(): Promise<string> {
    const value = await select({
      message: 'Select the type of branch:',
      options: this._config.branchTypes,
    });
    return unwrap(value);
  }

  private async askBranchDescription(): Promise<string> {
    const value = await text({
      message: 'Describe the branch (will be converted to kebab-case):',
      placeholder: 'e.g. "Add user authentication"',
      validate: (value: string | undefined) => {
        if (!value?.trim()) {
          return 'Description cannot be empty.';
        }
      },
    });
    return unwrap(value);
  }
}

/**
 * Creates and returns a configured `BranchPrompt` instance.
 *
 * Pass only the options you want to override; the rest come from `defaultConfig`.
 * The returned prompt performs side effects when `.run()` is invoked
 * (runs `git checkout -b` unless cancelled).
 *
 * @example
 * setupBranchPrompt().run();
 *
 * // with custom branch types
 * setupBranchPrompt({ branchTypes: [{ label: 'hotfix', value: 'hotfix' }] }).run();
 *
 * @param config - Optional partial `BranchConfig` to override defaults.
 * @returns A configured `BranchPrompt` instance.
 */
export const setupBranchPrompt = (config?: Partial<BranchConfig>): BranchPrompt => {
  return new BranchPrompt(config);
};
