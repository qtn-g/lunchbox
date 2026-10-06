import type { TicketSettings } from '@lunchbox-tools/utils';

export interface CommitType {
  label: string;
  section: string;
  value: string;
}

export interface CommitScope {
  label: string;
  value: string;
}

/**
 * Configuration for the commit prompt behaviour.
 *
 * @example
 * const commitConfig: CommitConfig = {
 *   commitTypes: [
 *     { label: 'feat — A new feature', section: 'Features', value: 'feat' },
 *     { label: 'fix  — A bug fix', section: 'Bug Fixes', value: 'fix' },
 *   ],
 *   commitScopes: [
 *     { label: 'api — Public API surface', value: 'api' },
 *     { label: 'ui  — Components & styling', value: 'ui' },
 *   ],
 *   noVerify: false,
 *   maximumSubjectLength: 72,
 *   ticketPrefix: 'PROJ-',
 *   ticketProvider: 'jira',
 * };
 */
export interface CommitConfig extends TicketSettings {
  /**
   * @example
   * const commitConfig: CommitConfig = {
   *   commitTypes: [
   *     { label: 'feat — A new feature', section: 'Features', value: 'feat' },
   *     { label: 'fix  — A bug fix', section: 'Bug Fixes', value: 'fix' },
   *   ],
   * }
   */
  commitTypes: Array<CommitType>;
  /**
   * @example
   * const commitConfig: CommitConfig = {
   *   commitScopes: [
   *     { label: 'api — Public API surface', value: 'api' },
   *     { label: 'ui  — Components & styling', value: 'ui' },
   *   ],
   * }
   */
  commitScopes: Array<CommitScope>;
  /** When true, append `--no-verify` to the created `git commit` command. */
  noVerify: boolean;
  /** Maximum allowed length for the commit subject line. */
  maximumSubjectLength: number;
}
