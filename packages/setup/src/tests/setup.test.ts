import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecFileSync, mockExecSync, mockExistsSync, mockReadFileSync } = vi.hoisted(() => ({
  mockExecFileSync: vi.fn(),
  mockExecSync: vi.fn(),
  mockExistsSync: vi.fn(),
  mockReadFileSync: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn(),
  intro: vi.fn(),
  isCancel: vi.fn(() => false),
  log: { error: vi.fn(), info: vi.fn(), message: vi.fn(), step: vi.fn() },
  multiselect: vi.fn(),
  outro: vi.fn(),
  select: vi.fn(),
}));
vi.mock('node:child_process', () => ({ execFileSync: mockExecFileSync, execSync: mockExecSync }));
vi.mock('node:fs', () => ({ default: { existsSync: mockExistsSync, readFileSync: mockReadFileSync } }));

import { box, confirm, log, multiselect, outro, select } from '@clack/prompts';
import { runSetup } from '../setup';

const shellCommands = (): Array<string> => mockExecSync.mock.calls.map(([command]) => String(command));

const aliasWrites = (): Array<unknown> => {
  return mockExecFileSync.mock.calls.filter(([, args]) => !args.includes('--get')).map(([, args]) => args[2]);
};

describe('runSetup', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockExecSync.mockReturnValue('');
    mockExecFileSync.mockImplementation(() => {
      throw new Error('not set');
    });
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('changes nothing until the plan is confirmed', async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(['commit']);
    vi.mocked(confirm).mockResolvedValue(false);

    await runSetup();

    expect(box).toHaveBeenCalledWith('Run npm install -g @lunchbox-tools/commit', 'Planned changes');
    expect(mockExecSync).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith('Setup canceled.');
  });

  it('installs globally without asking when there is no package.json', async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(['commit', 'branch']);
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(select).not.toHaveBeenCalled();
    expect(shellCommands()).toEqual(['npm install -g @lunchbox-tools/commit @lunchbox-tools/branch']);
    expect(log.info).toHaveBeenCalledWith(expect.stringContaining('lunchbox.config.json'));
  });

  it('installs in the project with the detected package manager', async () => {
    mockExistsSync.mockImplementation((file: string) => ['package.json', 'pnpm-lock.yaml'].includes(file));
    mockReadFileSync.mockReturnValue('{}');
    vi.mocked(multiselect).mockResolvedValueOnce(['commit']);
    vi.mocked(select).mockResolvedValue('project');
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(shellCommands()).toEqual(['pnpm add -D @lunchbox-tools/commit', 'npm pkg set scripts.commit=lunchbox-commit']);
  });

  it('installs the selected skills through the skills CLI', async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(['skills']).mockResolvedValueOnce(['coding-style']);
    vi.mocked(select).mockResolvedValue('global');
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(shellCommands()).toEqual(['npx skills add qtn-g/lunchbox --skill coding-style -g']);
  });

  it('writes the selected aliases', async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(['aliases']).mockResolvedValueOnce(['st']);
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(aliasWrites()).toEqual(['alias.st']);
  });

  it('keeps an alias with another value when the user refuses to replace it', async () => {
    mockExecFileSync.mockImplementation((_file: string, args: ReadonlyArray<string>) => {
      return args.includes('alias.st') && args.includes('--get') ? 'status\n' : '';
    });
    vi.mocked(multiselect).mockResolvedValueOnce(['aliases']).mockResolvedValueOnce(['st', 'co']);
    vi.mocked(confirm).mockResolvedValue(false);

    await runSetup();

    expect(aliasWrites()).toEqual([]);
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: false, message: expect.stringContaining('st') })
    );
  });

  it('replaces an alias with another value when the user agrees', async () => {
    mockExecFileSync.mockImplementation((_file: string, args: ReadonlyArray<string>) => {
      return args.includes('--get') ? 'status\n' : '';
    });
    vi.mocked(multiselect).mockResolvedValueOnce(['aliases']).mockResolvedValueOnce(['st']);
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(aliasWrites()).toEqual(['alias.st']);
  });

  it('has nothing to do when the aliases are already set', async () => {
    mockExecFileSync.mockImplementation(() => 'status -sb\n');
    vi.mocked(multiselect).mockResolvedValueOnce(['aliases']).mockResolvedValueOnce(['st']);

    await runSetup();

    expect(confirm).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith('Everything is already set up.');
  });

  it('reports failures with a non-zero exit code', async () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('network down');
    });
    vi.mocked(multiselect).mockResolvedValueOnce(['commit']);
    vi.mocked(confirm).mockResolvedValue(true);

    await runSetup();

    expect(log.error).toHaveBeenCalledWith('network down');
    expect(process.exitCode).toBe(1);
    expect(outro).toHaveBeenCalledWith('Setup finished with 1 failed step(s).');
  });
});
