import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecSync } = vi.hoisted(() => ({ mockExecSync: vi.fn().mockReturnValue('  main\n* develop\n') }));

vi.mock('@clack/prompts', () => ({
  autocomplete: vi.fn().mockResolvedValue(''),
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn().mockResolvedValue(false),
  intro: vi.fn(),
  isCancel: vi.fn(() => false),
  outro: vi.fn(),
  select: vi.fn().mockResolvedValue(''),
  text: vi.fn().mockResolvedValue(''),
}));

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

import { autocomplete, confirm, select, text } from '@clack/prompts';
import { setupBranchPrompt } from '../prompt';

const setupPromptMocks = (): void => {
  vi.mocked(autocomplete).mockResolvedValue('main');
  vi.mocked(select).mockResolvedValue('feature');
  vi.mocked(text).mockResolvedValue('Add user authentication');
  vi.mocked(confirm).mockResolvedValue(true);
};

describe('BranchPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecSync.mockReturnValue('  main\n* develop\n  feature/some-work\n');
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
    vi.mocked(autocomplete).mockResolvedValue('develop');
    vi.mocked(select).mockResolvedValue('feature');
    vi.mocked(text).mockResolvedValue('new thing');
    vi.mocked(confirm).mockResolvedValue(true);

    await setupBranchPrompt().run();

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('"develop"'),
      expect.objectContaining({ stdio: 'inherit' })
    );
  });

  it('passes available branches as autocomplete options for source branch', async () => {
    mockExecSync.mockReturnValue('  main\n* develop\n  feature/some-work\n');
    setupPromptMocks();

    await setupBranchPrompt().run();

    expect(vi.mocked(autocomplete)).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          { label: 'main', value: 'main' },
          { label: 'develop', value: 'develop' },
          { label: 'feature/some-work', value: 'feature/some-work' },
        ]),
      })
    );
  });

  it('does not run git command when cancelled', async () => {
    vi.mocked(autocomplete).mockResolvedValue('main');
    vi.mocked(select).mockResolvedValue('feature');
    vi.mocked(text).mockResolvedValue('add feature');
    vi.mocked(confirm).mockResolvedValue(false);

    await setupBranchPrompt().run();

    expect(mockExecSync).not.toHaveBeenCalledWith(expect.stringContaining('git checkout'), expect.anything());
  });

  it('respects custom branch types config', async () => {
    vi.mocked(select).mockResolvedValue('hotfix');
    vi.mocked(text).mockResolvedValue('urgent production fix');
    vi.mocked(confirm).mockResolvedValue(true);

    await setupBranchPrompt({ branchTypes: [{ label: 'hotfix — Urgent fix', value: 'hotfix' }] }).run();

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('hotfix/urgent-production-fix'),
      expect.objectContaining({ stdio: 'inherit' })
    );
  });

  it('converts description to kebab-case in the branch name', async () => {
    vi.mocked(select).mockResolvedValue('bugfix');
    vi.mocked(text).mockResolvedValue('Fix Login   REDIRECT');
    vi.mocked(confirm).mockResolvedValue(true);

    await setupBranchPrompt().run();

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('bugfix/fix-login-redirect'),
      expect.objectContaining({ stdio: 'inherit' })
    );
  });
});
