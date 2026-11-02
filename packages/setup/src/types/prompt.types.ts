import type { COMPONENT } from '../prompt.constants';
import type { AliasChanges } from './aliases.types';
import type { PackageManager, SkillsInstall, ToolName } from './install.types';

export type Component = ToolName | (typeof COMPONENT)[keyof typeof COMPONENT];

export type ToolsPlan =
  | {
      readonly isWorkspaceRoot: boolean;
      readonly manager: PackageManager;
      readonly packageJson: string;
      readonly scope: 'project';
      readonly tools: ReadonlyArray<ToolName>;
    }
  | { readonly scope: 'global'; readonly tools: ReadonlyArray<ToolName> };

export interface SetupPlan {
  readonly aliases: AliasChanges;
  readonly skills: SkillsInstall | undefined;
  readonly tools: ToolsPlan | undefined;
}
