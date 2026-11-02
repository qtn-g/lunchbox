import type { INSTALL_SCOPES, PACKAGE_MANAGERS, SKILL_NAMES, TOOL_NAMES } from '../install.constants';

export type InstallScope = (typeof INSTALL_SCOPES)[number];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
export type SkillName = (typeof SKILL_NAMES)[number];
export type ToolName = (typeof TOOL_NAMES)[number];

export interface ProjectInstall {
  readonly isWorkspaceRoot: boolean;
  readonly manager: PackageManager;
  readonly tools: ReadonlyArray<ToolName>;
}

export interface SkillsInstall {
  readonly scope: InstallScope;
  readonly skills: ReadonlyArray<SkillName>;
}
