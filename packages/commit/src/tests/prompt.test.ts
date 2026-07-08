import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecSync } = vi.hoisted(() => ({ mockExecSync: vi.fn() }));

vi.mock('@clack/prompts', () => ({
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn().mockResolvedValue(false),
  intro: vi.fn(),
  isCancel: vi.fn(() => false),
  multiselect: vi.fn().mockResolvedValue([]),
  outro: vi.fn(),
  select: vi.fn().mockResolvedValue(''),
  text: vi.fn().mockResolvedValue(''),
}));

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));
vi.mock('node:fs', () => ({
  default: { writeFileSync: vi.fn() },
  writeFileSync: vi.fn(),
}));

import fs from 'node:fs';
import { confirm, multiselect, select, text } from '@clack/prompts';
import { setupCommitPrompt } from '../prompt';

const setupPromptMocks = (): void => {
  vi.mocked(select).mockResolvedValue('feat');
  vi.mocked(multiselect).mockResolvedValue(['api', 'ui']);
  vi.mocked(text).mockResolvedValueOnce('add new button').mockResolvedValueOnce('').mockResolvedValueOnce('');
  vi.mocked(confirm).mockResolvedValue(true);
};

describe('CommitPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd === 'git rev-parse --git-dir') {
        return '.git';
      }
      return '';
    });
  });

  it('builds correct commit message and writes to file on confirmation', async () => {
    setupPromptMocks();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());

    await setupCommitPrompt().run();

    expect(fs.writeFileSync).toHaveBeenCalled();

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(writeCall?.[1]).toContain('feat(api, ui): add new button');

    consoleSpy.mockRestore();
  });

  it('resolves git dir with Unix path separator', async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd === 'git rev-parse --git-dir') {
        return '/home/user/project/.git';
      }
      return '';
    });
    setupPromptMocks();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());

    await setupCommitPrompt().run();

    expect(fs.writeFileSync).toHaveBeenCalled();

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(writeCall?.[0]).toBe('/home/user/project/.git/COMMIT_EDITMSG');

    consoleSpy.mockRestore();
  });

  it('resolves git dir with Windows path separator', async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd === 'git rev-parse --git-dir') {
        return 'C:\\Users\\user\\project\\.git';
      }
      return '';
    });
    await setupPromptMocks();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());

    await setupCommitPrompt().run();

    expect(fs.writeFileSync).toHaveBeenCalled();

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(writeCall?.[0]).toContain('COMMIT_EDITMSG');
    expect(writeCall?.[0]).toContain('.git');

    consoleSpy.mockRestore();
  });

  it('does not commit when user cancels confirmation', async () => {
    vi.mocked(select).mockResolvedValue('fix');
    vi.mocked(multiselect).mockResolvedValue(['core']);
    vi.mocked(text).mockResolvedValueOnce('patch bug').mockResolvedValueOnce('').mockResolvedValueOnce('');
    vi.mocked(confirm).mockResolvedValue(false);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());

    await setupCommitPrompt().run();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
