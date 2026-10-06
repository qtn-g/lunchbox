/** biome-ignore-all lint/suspicious/noConsole: <Used to display info to the user> */

import { autocomplete, box, confirm, intro, outro, select, spinner, text } from '@clack/prompts';
import { askTicket, runCommand, tryRunCommand, unwrap } from '@lunchbox-tools/utils';
import { defaultConfig } from './constants';
import { formatBranchName } from './format';
import { getSourceBranchHint, LIST_BRANCHES_COMMAND, parseBranchRefs, sortSourceBranches } from './source';
import type { BranchConfig, SourceBranch } from './type';

const PIPED_STDIO: ['pipe', 'pipe', 'pipe'] = ['pipe', 'pipe', 'pipe'];

class BranchPrompt {
  private readonly _config: BranchConfig;

  constructor(config?: Partial<BranchConfig>) {
    this._config = { ...defaultConfig, ...config };
  }

  async run(): Promise<void> {
    intro('Branch name generator');

    const sourceBranch = await this.askSourceBranch();
    const branchType = await this.askBranchType();
    const ticket = await askTicket(this._config);
    const branchDescription = await this.askBranchDescription();
    const branchName = formatBranchName({ description: branchDescription, ticket, type: branchType });

    this.previewBranchName(branchName);
    const confirmed = await this.askConfirmation();

    if (confirmed) {
      this.createBranch(branchName, sourceBranch);
      outro(`Branch "${branchName}" created successfully!`);
    } else {
      outro('Branch creation canceled.');
    }
  }

  private async askSourceBranch(): Promise<SourceBranch> {
    this.fetchRemoteBranches();
    const currentBranch = runCommand('git branch --show-current', { stdio: PIPED_STDIO }).trim();
    const branches = sortSourceBranches(
      parseBranchRefs(runCommand(LIST_BRANCHES_COMMAND, { stdio: PIPED_STDIO })),
      currentBranch
    );

    const value = await autocomplete({
      initialValue: currentBranch || undefined,
      message: 'Select the source branch:',
      options: branches.map((b) => ({
        hint: getSourceBranchHint(b, currentBranch),
        label: b.name,
        value: b.name,
      })),
    });
    const name = unwrap(value);
    return branches.find((b) => b.name === name) ?? { location: 'local', name };
  }

  private fetchRemoteBranches(): void {
    if (!this._config.fetchRemoteBranches) {
      return;
    }
    const s = spinner();
    s.start('Fetching remote branches');
    // GIT_TERMINAL_PROMPT=0 prevents git from hanging on a credential prompt hidden behind the spinner.
    const result = tryRunCommand('git fetch --all --prune', {
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      stdio: PIPED_STDIO,
    });
    if (result.ok) {
      s.stop('Remote branches fetched');
      return;
    }
    s.error('Could not fetch remote branches, they may be outdated');
  }

  private previewBranchName(branchName: string): void {
    box(branchName, 'Branch Name Preview');
  }

  private createBranch(branchName: string, sourceBranch: SourceBranch): void {
    // Branching from a remote ref would otherwise set it as upstream (e.g. origin/main),
    // making `git push` target the wrong branch.
    const noTrackFlag = sourceBranch.location === 'remote' ? ' --no-track' : '';
    runCommand(`git checkout${noTrackFlag} -b "${branchName}" "${sourceBranch.name}"`, { stdio: 'inherit' });
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
 * (runs `git fetch` when `fetchRemoteBranches` is enabled, then `git checkout -b` unless cancelled).
 *
 * @example
 * setupBranchPrompt().run();
 *
 * // with custom branch types
 * setupBranchPrompt({ branchTypes: [{ label: 'hotfix', value: 'hotfix' }] }).run();
 *
 * // with Jira tickets in branch names (typing `123` produces `PROJ-123`, the prefix is used as-is)
 * setupBranchPrompt({ ticketPrefix: 'PROJ-', ticketProvider: 'jira' }).run();
 *
 * @param config - Optional partial `BranchConfig` to override defaults.
 * @returns A configured `BranchPrompt` instance.
 */
export const setupBranchPrompt = (config?: Partial<BranchConfig>): BranchPrompt => {
  return new BranchPrompt(config);
};
