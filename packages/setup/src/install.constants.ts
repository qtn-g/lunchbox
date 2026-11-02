export const TOOL_NAMES = ['branch', 'commit'] as const;

export const TOOL_BINARY = {
  branch: 'lunchbox-branch',
  commit: 'lunchbox-commit',
} as const;

export const TOOL_PACKAGE = {
  branch: '@lunchbox-tools/branch',
  commit: '@lunchbox-tools/commit',
} as const;

export const INSTALL_SCOPES = ['project', 'global'] as const;

export const INSTALL_SCOPE = {
  global: 'global',
  project: 'project',
} as const;

export const PACKAGE_MANAGERS = ['bun', 'npm', 'pnpm', 'yarn'] as const;

export const PACKAGE_MANAGER = {
  bun: 'bun',
  npm: 'npm',
  pnpm: 'pnpm',
  yarn: 'yarn',
} as const;

/** Checked in order, the first lockfile found decides the package manager. */
export const PACKAGE_MANAGER_LOCKFILES = [
  { lockfile: 'pnpm-lock.yaml', manager: PACKAGE_MANAGER.pnpm },
  { lockfile: 'yarn.lock', manager: PACKAGE_MANAGER.yarn },
  { lockfile: 'bun.lock', manager: PACKAGE_MANAGER.bun },
  { lockfile: 'bun.lockb', manager: PACKAGE_MANAGER.bun },
  { lockfile: 'package-lock.json', manager: PACKAGE_MANAGER.npm },
] as const;

export const PACKAGE_JSON_FILE = 'package.json';
export const PNPM_WORKSPACE_FILE = 'pnpm-workspace.yaml';

export const SKILLS_REPOSITORY = 'qtn-g/lunchbox';

export const SKILL_NAMES = ['lunchbox-branch', 'lunchbox-commit', 'coding-style'] as const;
