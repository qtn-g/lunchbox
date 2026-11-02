import { parseConfig } from '@lunchbox-tools/utils';
import { describe, expect, it } from 'vitest';
import { configValidators } from '../config';

const parse = (branch: unknown): ReturnType<typeof parseConfig> => {
  return parseConfig(JSON.stringify({ branch }), { section: 'branch', validators: configValidators });
};

describe('configValidators', () => {
  it('accepts every option', () => {
    const branch = {
      branchTypes: [{ label: 'hotfix — Urgent fix', value: 'hotfix' }],
      fetchRemoteBranches: false,
      ticketPrefix: 'PROJ-',
      ticketProvider: 'jira',
    };

    expect(parse(branch)).toEqual({ ok: true, value: branch });
  });

  it.each([
    ['branchTypes', [{ label: 'no value' }]],
    ['fetchRemoteBranches', 'yes'],
    ['ticketPrefix', 1],
    ['ticketProvider', 'gitlab'],
    ['commitTypes', []],
  ])('rejects an invalid %s', (option, value) => {
    expect(parse({ [option]: value })).toEqual({ error: `Unknown or invalid option "branch.${option}".`, ok: false });
  });
});
