import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecSync, mockSpinner } = vi.hoisted(() => ({
  mockExecSync: vi.fn(),
  mockSpinner: { error: vi.fn(), start: vi.fn(), stop: vi.fn() },
}));

vi.mock('@clack/prompts', () => ({
  autocomplete: vi.fn().mockResolvedValue(''),
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn().mockResolvedValue(false),
  intro: vi.fn(),
  isCancel: vi.fn(() => false),
  outro: vi.fn(),
  select: vi.fn().mockResolvedValue(''),
  spinner: vi.fn(() => mockSpinner),
  text: vi.fn().mockResolvedValue(''),
}));

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

import { autocomplete, confirm, select, text } from '@clack/prompts';
import { setupBranchPrompt } from '../prompt';

const BRANCH_REFS = [
  'refs/heads/main',
  'refs/heads/develop',
  'refs/heads/feature/some-work',
  'refs/remotes/origin/HEAD',
  'refs/remotes/origin/main',
  'refs/remotes/origin/release/next',
].join('\n');

const mockGit = (): void => {
  mockExecSync.mockImplementation((cmd: string) => {
    if (cmd.startsWith('git for-each-ref')) {
      return BRANCH_REFS;
    }
    if (cmd === 'git branch --show-current') {
      return 'develop\n';
    }
    return '';
  });
};

const setupPromptMocks = (): void => {
  vi.mocked(autocomplete).mockResolvedValue('main');
  vi.mocked(select).mockResolvedValue('feature');
  vi.mocked(text).mockResolvedValue('Add user authentication');
  vi.mocked(confirm).mockResolvedValue(true);
};

const checkoutCommand = (): string | undefined =>
  mockExecSync.mock.calls.map(([cmd]) => String(cmd)).find((cmd) => cmd.startsWith('git checkout'));

describe('BranchPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGit();
  });

  it('runs git checkout with correct branch name on confirmation', async () => {
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('feature/add-user-authentication'),
      expect.objectContaining({ stdio: 'inherit' })
    );
  });

  it('includes the source branch in the git checkout command', async () => {
    setupPromptMocks();
    vi.mocked(autocomplete).mockResolvedValue('develop');

    await setupBranchPrompt().run();

    expect(checkoutCommand()).toBe('git checkout -b "feature/add-user-authentication" "develop"');
  });

  it('defaults the source branch to the current one and lists it first', async () => {
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(vi.mocked(autocomplete)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: 'develop',
        options: expect.arrayContaining([{ hint: 'current', label: 'develop', value: 'develop' }]),
      })
    );
  });

  it('lists local and remote branches, without remote HEAD', async () => {
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(vi.mocked(autocomplete)).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { hint: 'current', label: 'develop', value: 'develop' },
          { hint: undefined, label: 'main', value: 'main' },
          { hint: undefined, label: 'feature/some-work', value: 'feature/some-work' },
          { hint: 'remote', label: 'origin/main', value: 'origin/main' },
          { hint: 'remote', label: 'origin/release/next', value: 'origin/release/next' },
        ],
      })
    );
  });

  it('creates the branch without tracking when the source is remote', async () => {
    setupPromptMocks();
    vi.mocked(autocomplete).mockResolvedValue('origin/main');

    await setupBranchPrompt().run();

    expect(checkoutCommand()).toBe('git checkout --no-track -b "feature/add-user-authentication" "origin/main"');
  });

  it('fetches remote branches before listing them', async () => {
    setupPromptMocks();

    await setupBranchPrompt().run();

    const commands = mockExecSync.mock.calls.map(([cmd]) => String(cmd));
    expect(commands.indexOf('git fetch --all --prune')).toBeLessThan(commands.findIndex((c) => c.startsWith('git for-each-ref')));
    expect(mockSpinner.stop).toHaveBeenCalled();
  });

  it('keeps going when the fetch fails', async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd.startsWith('git fetch')) {
        throw new Error('offline');
      }
      return cmd.startsWith('git for-each-ref') ? BRANCH_REFS : '';
    });
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(mockSpinner.error).toHaveBeenCalled();
    expect(checkoutCommand()).toContain('feature/add-user-authentication');
  });

  it('skips the fetch when disabled', async () => {
    setupPromptMocks();

    await setupBranchPrompt({ fetchRemoteBranches: false }).run();

    expect(mockExecSync).not.toHaveBeenCalledWith('git fetch --all --prune', expect.anything());
  });

  it('does not run git command when cancelled', async () => {
    setupPromptMocks();
    vi.mocked(confirm).mockResolvedValue(false);

    await setupBranchPrompt().run();

    expect(checkoutCommand()).toBeUndefined();
  });

  it('respects custom branch types config', async () => {
    setupPromptMocks();
    vi.mocked(select).mockResolvedValue('hotfix');
    vi.mocked(text).mockResolvedValue('urgent production fix');

    await setupBranchPrompt({ branchTypes: [{ label: 'hotfix — Urgent fix', value: 'hotfix' }] }).run();

    expect(checkoutCommand()).toContain('hotfix/urgent-production-fix');
  });

  it('converts description to kebab-case in the branch name', async () => {
    setupPromptMocks();
    vi.mocked(select).mockResolvedValue('bugfix');
    vi.mocked(text).mockResolvedValue('Fix Login   REDIRECT');

    await setupBranchPrompt().run();

    expect(checkoutCommand()).toContain('bugfix/fix-login-redirect');
  });

  it('does not ask for a ticket by default', async () => {
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(vi.mocked(text)).toHaveBeenCalledTimes(1);
  });

  it('inserts the Jira key in the branch name', async () => {
    setupPromptMocks();
    vi.mocked(text).mockResolvedValueOnce('proj-123').mockResolvedValueOnce('Add login');

    await setupBranchPrompt({ ticketProvider: 'jira' }).run();

    expect(checkoutCommand()).toContain('"feature/PROJ-123-add-login"');
  });

  it('inserts the GitHub issue number in the branch name', async () => {
    setupPromptMocks();
    vi.mocked(text).mockResolvedValueOnce('#42').mockResolvedValueOnce('Add login');

    await setupBranchPrompt({ ticketProvider: 'github' }).run();

    expect(checkoutCommand()).toContain('"feature/42-add-login"');
  });

  it('prepends the ticket prefix to a bare number', async () => {
    setupPromptMocks();
    vi.mocked(text).mockResolvedValueOnce('123').mockResolvedValueOnce('Add login');

    await setupBranchPrompt({ ticketPrefix: 'PROJ-', ticketProvider: 'jira' }).run();

    expect(checkoutCommand()).toContain('"feature/PROJ-123-add-login"');
  });
});
