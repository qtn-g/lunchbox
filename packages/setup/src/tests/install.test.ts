import { describe, expect, it } from 'vitest';
import {
  detectPackageManager,
  findScriptConflicts,
  getGlobalInstallCommand,
  getProjectInstallCommand,
  getScriptCommand,
  getSkillsCommand,
} from '../install';

describe('detectPackageManager', () => {
  it.each([
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['package-lock.json', 'npm'],
  ])('reads %s as %s', (lockfile, manager) => {
    expect(detectPackageManager((file) => file === lockfile)).toBe(manager);
  });

  it('defaults to npm', () => {
    expect(detectPackageManager(() => false)).toBe('npm');
  });
});

describe('getProjectInstallCommand', () => {
  it.each([
    ['npm', 'npm install -D @lunchbox-tools/commit'],
    ['pnpm', 'pnpm add -D @lunchbox-tools/commit'],
    ['yarn', 'yarn add -D @lunchbox-tools/commit'],
    ['bun', 'bun add -d @lunchbox-tools/commit'],
  ] as const)('uses %s', (manager, command) => {
    expect(getProjectInstallCommand({ isWorkspaceRoot: false, manager, tools: ['commit'] })).toBe(command);
  });

  it('targets the root of a pnpm workspace', () => {
    expect(getProjectInstallCommand({ isWorkspaceRoot: true, manager: 'pnpm', tools: ['branch', 'commit'] })).toBe(
      'pnpm add -D -w @lunchbox-tools/branch @lunchbox-tools/commit'
    );
  });
});

describe('commands', () => {
  it('installs tools globally with npm', () => {
    expect(getGlobalInstallCommand(['branch'])).toBe('npm install -g @lunchbox-tools/branch');
  });

  it('adds a script running the tool', () => {
    expect(getScriptCommand('commit')).toBe('npm pkg set scripts.commit=lunchbox-commit');
  });

  it('installs skills in the project', () => {
    expect(getSkillsCommand({ scope: 'project', skills: ['lunchbox-branch', 'coding-style'] })).toBe(
      'npx skills add qtn-g/lunchbox --skill lunchbox-branch --skill coding-style'
    );
  });

  it('installs skills globally', () => {
    expect(getSkillsCommand({ scope: 'global', skills: ['lunchbox-commit'] })).toBe(
      'npx skills add qtn-g/lunchbox --skill lunchbox-commit -g'
    );
  });
});

describe('findScriptConflicts', () => {
  it('finds a script used by something else', () => {
    const packageJson = JSON.stringify({ scripts: { branch: 'lunchbox-branch', commit: 'cz' } });

    expect(findScriptConflicts(packageJson, ['branch', 'commit'])).toEqual(['commit']);
  });

  it('finds nothing without scripts', () => {
    expect(findScriptConflicts('{}', ['commit'])).toEqual([]);
  });

  it('finds nothing in an unreadable file', () => {
    expect(findScriptConflicts('{', ['commit'])).toEqual([]);
  });
});
