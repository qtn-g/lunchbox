import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecSync, mockExistsSync, mockReadFileSync } = vi.hoisted(() => ({
  mockExecSync: vi.fn(),
  mockExistsSync: vi.fn(),
  mockReadFileSync: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  text: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

vi.mock('node:fs', () => ({
  default: { existsSync: mockExistsSync, readFileSync: mockReadFileSync },
}));

import { isOptionList, isPositiveInteger, isString, loadConfig, parseConfig, ticketValidators } from '../config';
import type { ConfigSource, ConfigValidators } from '../config';

interface ToolConfig {
  name: string;
  ticketPrefix: string;
  ticketProvider: string;
}

const validators: ConfigValidators<ToolConfig> = { name: isString, ...ticketValidators };
const source: ConfigSource<ToolConfig> = { section: 'tool', validators };

const INTEGER = 72;
const DECIMAL = 1.5;

describe('parseConfig', () => {
  it('returns the options of the section', () => {
    const contents = JSON.stringify({ other: { ignored: true }, tool: { name: 'a', ticketProvider: 'jira' } });

    expect(parseConfig(contents, source)).toEqual({ ok: true, value: { name: 'a', ticketProvider: 'jira' } });
  });

  it('returns an empty config when the section is missing', () => {
    expect(parseConfig('{}', source)).toEqual({ ok: true, value: {} });
  });

  it('rejects invalid JSON', () => {
    expect(parseConfig('{', source).ok).toBe(false);
  });

  it.each(['[]', '1', 'null'])('rejects %s as file contents', (contents) => {
    expect(parseConfig(contents, source)).toEqual({ error: 'The config file must contain a JSON object.', ok: false });
  });

  it('rejects a section that is not an object', () => {
    expect(parseConfig('{"tool":[]}', source)).toEqual({ error: '"tool" must be an object.', ok: false });
  });

  it('names an unknown option', () => {
    expect(parseConfig('{"tool":{"nam":"a"}}', source)).toEqual({
      error: 'Unknown or invalid option "tool.nam".',
      ok: false,
    });
  });

  it('names an option with an invalid value', () => {
    expect(parseConfig('{"tool":{"ticketProvider":"gitlab"}}', source)).toEqual({
      error: 'Unknown or invalid option "tool.ticketProvider".',
      ok: false,
    });
  });
});

describe('field validators', () => {
  it('isOptionList accepts complete options only', () => {
    const isValid = isOptionList(['label', 'value']);

    expect(isValid([{ label: 'a', value: 'b' }])).toBe(true);
    expect(isValid([{ label: 'a' }])).toBe(false);
    expect(isValid([{ label: 'a', value: 1 }])).toBe(false);
    expect(isValid(['a'])).toBe(false);
    expect(isValid('a')).toBe(false);
  });

  it('isOptionList rejects an empty list', () => {
    expect(isOptionList(['value'])([])).toBe(false);
  });

  it('isPositiveInteger rejects anything but positive integers', () => {
    expect(isPositiveInteger(INTEGER)).toBe(true);
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(DECIMAL)).toBe(false);
    expect(isPositiveInteger('72')).toBe(false);
  });

  it.each(['none', 'jira', 'github', 'azure'])('ticketProvider accepts %s', (provider) => {
    expect(ticketValidators.ticketProvider(provider)).toBe(true);
  });

  it.each(['toString', 'gitlab', 1])('ticketProvider rejects %s', (provider) => {
    expect(ticketValidators.ticketProvider(provider)).toBe(false);
  });
});

describe('loadConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockExecSync.mockReturnValue('/repo\n');
  });

  it('reads the file at the root of the git repository', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('{"tool":{"name":"a"}}');

    expect(loadConfig(source)).toEqual({ ok: true, value: { name: 'a' } });
    expect(mockReadFileSync).toHaveBeenCalledWith('/repo/lunchbox.config.json', 'utf8');
  });

  it('falls back to the working directory outside of a git repository', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    mockExistsSync.mockReturnValue(false);

    loadConfig(source);

    expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining(process.cwd()));
  });

  it('returns an empty config when the file does not exist', () => {
    mockExistsSync.mockReturnValue(false);

    expect(loadConfig(source)).toEqual({ ok: true, value: {} });
    expect(mockReadFileSync).not.toHaveBeenCalled();
  });

  it('reports the path of an invalid file', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('[]');

    expect(loadConfig(source)).toEqual({
      error: 'Invalid /repo/lunchbox.config.json: The config file must contain a JSON object.',
      ok: false,
    });
  });

  it('reports the path of an unreadable file', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(loadConfig(source)).toEqual({ error: 'Could not read /repo/lunchbox.config.json: EACCES', ok: false });
  });
});
