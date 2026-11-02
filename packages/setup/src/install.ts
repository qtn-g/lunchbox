import { isRecord } from '@lunchbox-tools/utils';
import {
  INSTALL_SCOPE,
  PACKAGE_MANAGER,
  PACKAGE_MANAGER_LOCKFILES,
  SKILLS_REPOSITORY,
  TOOL_BINARY,
  TOOL_PACKAGE,
} from './install.constants';
import type { PackageManager, ProjectInstall, SkillsInstall, ToolName } from './types/install.types';

const toPackageNames = (tools: ReadonlyArray<ToolName>): string => {
  return tools.map((tool) => TOOL_PACKAGE[tool]).join(' ');
};

export const detectPackageManager = (hasFile: (file: string) => boolean): PackageManager => {
  return PACKAGE_MANAGER_LOCKFILES.find(({ lockfile }) => hasFile(lockfile))?.manager ?? PACKAGE_MANAGER.npm;
};

export const getProjectInstallCommand = ({ isWorkspaceRoot, manager, tools }: ProjectInstall): string => {
  const addCommand: Record<PackageManager, string> = {
    bun: 'bun add -d',
    npm: 'npm install -D',
    // pnpm refuses to add a dependency to the root of a workspace without `-w`.
    pnpm: isWorkspaceRoot ? 'pnpm add -D -w' : 'pnpm add -D',
    yarn: 'yarn add -D',
  };
  return `${addCommand[manager]} ${toPackageNames(tools)}`;
};

export const getGlobalInstallCommand = (tools: ReadonlyArray<ToolName>): string => {
  return `npm install -g ${toPackageNames(tools)}`;
};

export const getScriptCommand = (tool: ToolName): string => {
  return `npm pkg set scripts.${tool}=${TOOL_BINARY[tool]}`;
};

/**
 * Finds the tools whose package.json script is already used by something else, so it is left alone.
 * Contents that cannot be read as a package.json have no known scripts.
 */
export const findScriptConflicts = (packageJson: string, tools: ReadonlyArray<ToolName>): Array<ToolName> => {
  const scripts = parseScripts(packageJson);
  return tools.filter((tool) => scripts[tool] !== undefined && scripts[tool] !== TOOL_BINARY[tool]);
};

const parseScripts = (packageJson: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(packageJson);
    return isRecord(parsed) && isRecord(parsed.scripts) ? parsed.scripts : {};
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {};
    }
    throw error;
  }
};

export const getSkillsCommand = ({ scope, skills }: SkillsInstall): string => {
  const skillFlags = skills.map((skill) => `--skill ${skill}`).join(' ');
  const scopeFlag = scope === INSTALL_SCOPE.global ? ' -g' : '';
  return `npx skills add ${SKILLS_REPOSITORY} ${skillFlags}${scopeFlag}`;
};
