import { parseConfig } from '@lunchbox-tools/utils';
import { describe, expect, it } from 'vitest';
import { configValidators } from '../config';

const parse = (commit: unknown): ReturnType<typeof parseConfig> => {
  return parseConfig(JSON.stringify({ commit }), { section: 'commit', validators: configValidators });
};

describe('configValidators', () => {
  it('accepts every option', () => {
    const commit = {
      commitScopes: [{ label: 'api — Public API', value: 'api' }],
      commitTypes: [{ label: 'feat — A new feature', section: 'Features', value: 'feat' }],
      maximumSubjectLength: 72,
      noVerify: true,
      ticketPrefix: 'PROJ-',
      ticketProvider: 'jira',
    };

    expect(parse(commit)).toEqual({ ok: true, value: commit });
  });

  it.each([
    ['commitScopes', []],
    ['commitTypes', [{ label: 'no section', value: 'feat' }]],
    ['maximumSubjectLength', 0],
    ['noVerify', 'yes'],
    ['ticketPrefix', 1],
    ['ticketProvider', 'gitlab'],
    ['branchTypes', []],
  ])('rejects an invalid %s', (option, value) => {
    expect(parse({ [option]: value })).toEqual({ error: `Unknown or invalid option "commit.${option}".`, ok: false });
  });
});
