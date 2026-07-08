/** biome-ignore-all lint/suspicious/noConsole: <Used to display info to the user> */

import fs from 'node:fs';
import { box, confirm, intro, multiselect, outro, select } from '@clack/prompts';
import { runCommand, unwrap } from '@lunchbox/utils';
import { defaultConfig } from './constants';
import { formatCommitMessage } from './format';
import { getCommitMessageFile, limitedInput, optionalInput } from './utils';
import type { CommitConfig } from './type';

class CommitPrompt {
  private readonly _config: CommitConfig;

  constructor(config?: Partial<CommitConfig>) {
    this._config = { ...defaultConfig, ...config };
  }

  async run(): Promise<void> {
    intro('Commit message generator');

    const type = await this.askCommitType();
    const scopes = await this.askCommitScopes();
    const subject = await this.askSubject();
    const body = await this.askBody();
    const breakingChange = await this.askBreakingChange();

    const commitMessage = formatCommitMessage({ body, breakingChange, scopes, subject, type });

    this.previewCommitMessage(commitMessage);
    const confirmed = await this.askConfirmation();

    if (confirmed) {
      this.commit(commitMessage);
      outro('Commit created successfully!');
    } else {
      outro('Commit canceled.');
    }
  }

  private previewCommitMessage(commitMessage: string): void {
    box(commitMessage, 'Commit Message Preview');
  }

  private commit(commitMessage: string): void {
    const commitMessageFile = getCommitMessageFile();
    fs.writeFileSync(commitMessageFile, commitMessage + '\n', 'utf8');
    const noVerifyFlag = this._config.noVerify ? ' --no-verify' : '';
    runCommand(`git commit -F "${commitMessageFile}"${noVerifyFlag}`, { stdio: 'inherit' });
  }

  private askBreakingChange(): Promise<string> {
    return optionalInput('Describe the breaking change (leave empty to skip):');
  }

  private async askConfirmation(): Promise<boolean> {
    const value = await confirm({
      message: 'Do you want to proceed with this commit?',
    });
    return unwrap(value);
  }

  private askBody(): Promise<string> {
    return optionalInput('Enter a detailed description of the change (leave empty to skip):');
  }

  private askSubject(): Promise<string> {
    return limitedInput('Enter a short description of the change:', { maxLength: this._config.maximumSubjectLength });
  }

  private async askCommitType(): Promise<string> {
    const value = await select({
      message: 'Select the type of change:',
      options: this._config.commitTypes,
    });
    return unwrap(value);
  }

  private async askCommitScopes(): Promise<Array<string>> {
    const value = await multiselect({
      message: 'Select the scope of this change:',
      options: this._config.commitScopes.map((s) => ({ label: s.label, value: s.value })),
      required: true,
    });
    return unwrap(value);
  }
}

/**
 * This function merges the provided `config` with the package `defaultConfig`
 * and returns a ready-to-use `CommitPrompt`. The function itself does not run
 * the interactive flow — call `.run()` on the returned instance to start the
 * prompts and produce a commit.
 *
 * Usage notes:
 * - Pass only the options you want to override; the rest come from
 *   `defaultConfig`.
 * - The returned prompt performs side effects when `.run()` is invoked
 *   (writes the commit message file and runs `git commit` unless cancelled).
 *
 * @example
 * // create and run immediately
 * setupCommitPrompt().run();
 *
 * // create and run with custom config
 * setupCommitPrompt({ maximumSubjectLength: 72 }).run();
 *
 * @param config - Optional partial `CommitConfig` to override defaults.
 * @returns A configured `CommitPrompt` instance.
 */
export const setupCommitPrompt = (config?: Partial<CommitConfig>): CommitPrompt => {
  return new CommitPrompt(config);
};
