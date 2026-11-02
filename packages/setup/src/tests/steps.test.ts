import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecFileSync, mockExecSync, mockLog } = vi.hoisted(() => ({
  mockExecFileSync: vi.fn(),
  mockExecSync: vi.fn(),
  mockLog: { error: vi.fn(), step: vi.fn() },
}));

vi.mock('@clack/prompts', () => ({ log: mockLog }));
vi.mock('node:child_process', () => ({ execFileSync: mockExecFileSync, execSync: mockExecSync }));

import { buildSetupSteps, runSetupSteps } from '../steps';
import type { SetupPlan } from '../types/prompt.types';

const NO_ALIASES = { added: [], conflicting: [] };
const SWEEP = { command: '!f() { echo "$1"; }; f', description: 'sweep', name: 'sweep' };

const labels = (plan: SetupPlan): Array<string> => buildSetupSteps(plan).map(({ label }) => label);

describe('buildSetupSteps', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('builds nothing for an empty plan', () => {
    expect(labels({ aliases: NO_ALIASES, skills: undefined, tools: undefined })).toEqual([]);
  });

  it('installs tools globally', () => {
    const tools = { scope: 'global', tools: ['commit'] } as const;

    expect(labels({ aliases: NO_ALIASES, skills: undefined, tools })).toEqual(['Run npm install -g @lunchbox-tools/commit']);
  });

  it('installs tools in the project with their scripts, keeping a script already in use', () => {
    const tools = {
      isWorkspaceRoot: false,
      manager: 'pnpm',
      packageJson: JSON.stringify({ scripts: { commit: 'cz' } }),
      scope: 'project',
      tools: ['branch', 'commit'],
    } as const;

    expect(labels({ aliases: NO_ALIASES, skills: undefined, tools })).toEqual([
      'Run pnpm add -D @lunchbox-tools/branch @lunchbox-tools/commit',
      'Run npm pkg set scripts.branch=lunchbox-branch',
      'Keep your existing "commit" script (run lunchbox-commit directly)',
    ]);
  });

  it('installs skills and aliases', () => {
    const plan: SetupPlan = {
      aliases: { added: [SWEEP], conflicting: [] },
      skills: { scope: 'global', skills: ['coding-style'] },
      tools: undefined,
    };

    expect(labels(plan)).toEqual([
      'Run npx skills add qtn-g/lunchbox --skill coding-style -g',
      'Set the global git alias "sweep"',
    ]);
  });

  it('writes aliases without a shell so their quotes survive', () => {
    const [step] = buildSetupSteps({ aliases: { added: [SWEEP], conflicting: [] }, skills: undefined, tools: undefined });

    step?.run();

    expect(mockExecFileSync).toHaveBeenCalledWith('git', ['config', '--global', 'alias.sweep', SWEEP.command], expect.anything());
  });
});

describe('runSetupSteps', () => {
  it('runs every step and counts the failures', () => {
    const last = vi.fn(() => ({ ok: true as const, value: '' }));

    const failures = runSetupSteps([
      { label: 'fails', run: () => ({ error: 'boom', ok: false }) },
      { label: 'works', run: last },
    ]);

    expect(failures).toBe(1);
    expect(last).toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenCalledWith('boom');
  });
});
