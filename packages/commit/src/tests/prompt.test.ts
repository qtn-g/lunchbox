import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecSync } = vi.hoisted(() => ({ mockExecSync: vi.fn() }));

vi.mock('@clack/prompts', () => ({
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn().mockResolvedValue(false),
  intro: vi.fn(),
  isCancel: vi.fn(() => false),
  log: { info: vi.fn() },
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

const textPromptsWithoutTicket = 3;

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

  it('does not ask for a ticket by default', async () => {
    setupPromptMocks();

    await setupCommitPrompt().run();

    expect(vi.mocked(text)).toHaveBeenCalledTimes(textPromptsWithoutTicket);
    expect(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1]).not.toContain('Refs:');
  });

  it('uses the ticket found in the branch name without asking for it', async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd === 'git rev-parse --git-dir') {
        return '.git';
      }
      if (cmd === 'git branch --show-current') {
        return 'feature/PROJ-123-add-button\n';
      }
      return '';
    });
    setupPromptMocks();

    await setupCommitPrompt({ ticketProvider: 'jira' }).run();

    expect(vi.mocked(text)).toHaveBeenCalledTimes(textPromptsWithoutTicket);
    expect(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1]).toBe('feat(api, ui): add new button\n\nRefs: PROJ-123\n');
  });

  it('asks for the ticket when the branch name has none', async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd === 'git rev-parse --git-dir') {
        return '.git';
      }
      return cmd === 'git branch --show-current' ? 'main\n' : '';
    });
    setupPromptMocks();
    vi.mocked(text).mockResolvedValueOnce('#42');

    await setupCommitPrompt({ ticketProvider: 'github' }).run();

    expect(vi.mocked(text)).toHaveBeenCalledTimes(textPromptsWithoutTicket + 1);
    expect(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1]).toContain('Refs: #42');
  });

  it('prepends the ticket prefix to a bare number', async () => {
    setupPromptMocks();
    vi.mocked(text).mockResolvedValueOnce('123');

    await setupCommitPrompt({ ticketPrefix: 'PROJ-', ticketProvider: 'jira' }).run();

    expect(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1]).toContain('Refs: PROJ-123');
  });
});
