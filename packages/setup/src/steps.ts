import { log } from '@clack/prompts';
import { tryRunCommand } from '@lunchbox-tools/utils';
import { writeGlobalAlias } from './aliases';
import {
  findScriptConflicts,
  getGlobalInstallCommand,
  getProjectInstallCommand,
  getScriptCommand,
  getSkillsCommand,
} from './install';
import { INSTALL_SCOPE, TOOL_BINARY } from './install.constants';
import type { CommandResult } from '@lunchbox-tools/utils';
import type { ToolName } from './types/install.types';
import type { SetupPlan, ToolsPlan } from './types/prompt.types';
import type { SetupStep } from './types/steps.types';

const toShellStep = (command: string): SetupStep => ({
  label: `Run ${command}`,
  // The output stays visible, and the skills CLI asks which agents to install for.
  run: (): CommandResult => tryRunCommand(command, { stdio: 'inherit' }),
});

const toSkippedScriptStep = (tool: ToolName): SetupStep => ({
  label: `Keep your existing "${tool}" script (run ${TOOL_BINARY[tool]} directly)`,
  run: (): CommandResult => ({ ok: true, value: '' }),
});

const toScriptSteps = (tools: ReadonlyArray<ToolName>, packageJson: string): Array<SetupStep> => {
  const conflicts = findScriptConflicts(packageJson, tools);
  return tools.map((tool) => (conflicts.includes(tool) ? toSkippedScriptStep(tool) : toShellStep(getScriptCommand(tool))));
};

const toToolSteps = (plan: ToolsPlan | undefined): Array<SetupStep> => {
  if (!plan) {
    return [];
  }
  if (plan.scope === INSTALL_SCOPE.global) {
    return [toShellStep(getGlobalInstallCommand(plan.tools))];
  }
  return [toShellStep(getProjectInstallCommand(plan)), ...toScriptSteps(plan.tools, plan.packageJson)];
};

export const buildSetupSteps = ({ aliases, skills, tools }: SetupPlan): Array<SetupStep> => {
  return [
    ...toToolSteps(tools),
    ...(skills ? [toShellStep(getSkillsCommand(skills))] : []),
    ...[...aliases.added, ...aliases.conflicting].map((alias) => ({
      label: `Set the global git alias "${alias.name}"`,
      run: (): CommandResult => writeGlobalAlias(alias),
    })),
  ];
};

const runStep = ({ label, run }: SetupStep): CommandResult => {
  log.step(label);
  const result = run();
  if (!result.ok) {
    log.error(result.error);
  }
  return result;
};

/**
 * Runs every step even when one fails, since they are independent. Returns how many failed.
 */
export const runSetupSteps = (steps: ReadonlyArray<SetupStep>): number => {
  return steps.map(runStep).filter((result) => !result.ok).length;
};
