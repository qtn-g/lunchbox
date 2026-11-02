import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
import { cancel, confirm, multiselect, select, text } from '@clack/prompts';
import { setupCommitPrompt } from '../prompt';

const setupPromptMocks = (): void => {
  vi.mocked(select).mockResolvedValue('feat');
  vi.mocked(multiselect).mockResolvedValue(['api', 'ui']);
  vi.mocked(text).mockResolvedValueOnce('add new button').mockResolvedValueOnce('').mockResolvedValueOnce('');
  vi.mocked(confirm).mockResolvedValue(true);
};

const textPromptsWithoutTicket = 3;

const STAGED_FILES_COMMAND = 'git diff --cached --name-only';

const mockGit = (responses: Readonly<Record<string, string>> = {}): void => {
  const allResponses = new Map(
    Object.entries({ [STAGED_FILES_COMMAND]: 'a.txt\n', 'git rev-parse --git-dir': '.git', ...responses })
  );
  mockExecSync.mockImplementation((cmd: string) => allResponses.get(cmd) ?? '');
};

describe('CommitPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGit();
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('stops before any prompt when nothing is staged', async () => {
    mockGit({ [STAGED_FILES_COMMAND]: '' });

    await setupCommitPrompt().run();

    expect(cancel).toHaveBeenCalledWith('Nothing to commit, stage your changes with "git add" first.');
    expect(process.exitCode).toBe(1);
    expect(select).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
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
    mockGit({ 'git rev-parse --git-dir': '/home/user/project/.git' });
    setupPromptMocks();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());

    await setupCommitPrompt().run();

    expect(fs.writeFileSync).toHaveBeenCalled();

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(writeCall?.[0]).toBe('/home/user/project/.git/COMMIT_EDITMSG');

    consoleSpy.mockRestore();
  });

  it('resolves git dir with Windows path separator', async () => {
    mockGit({ 'git rev-parse --git-dir': 'C:\\Users\\user\\project\\.git' });
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
    mockGit({ 'git branch --show-current': 'feature/PROJ-123-add-button\n' });
    setupPromptMocks();

    await setupCommitPrompt({ ticketProvider: 'jira' }).run();

    expect(vi.mocked(text)).toHaveBeenCalledTimes(textPromptsWithoutTicket);
    expect(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1]).toBe('feat(api, ui): add new button\n\nRefs: PROJ-123\n');
  });

  it('asks for the ticket when the branch name has none', async () => {
    mockGit({ 'git branch --show-current': 'main\n' });
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
