import fs from 'node:fs';
import { confirm, log, multiselect, select } from '@clack/prompts';
import { unwrap } from '@lunchbox-tools/utils';
import { classifyAliases, readGlobalAlias } from './aliases';
import { DEFAULT_ALIAS_NAMES, GIT_ALIASES } from './aliases.constants';
import { detectPackageManager } from './install';
import { INSTALL_SCOPE, PACKAGE_JSON_FILE, PNPM_WORKSPACE_FILE, SKILL_NAMES, TOOL_NAMES } from './install.constants';
import { COMPONENT, SKILL_HINT } from './prompt.constants';
import type { AliasChanges, GitAlias } from './types/aliases.types';
import type { InstallScope, SkillName, SkillsInstall, ToolName } from './types/install.types';
import type { Component, SetupPlan, ToolsPlan } from './types/prompt.types';

const isToolName = (value: Component): value is ToolName => TOOL_NAMES.some((tool) => tool === value);

const askComponents = async (): Promise<Array<Component>> => {
  const value = await multiselect<Component>({
    message: 'What do you want to set up?',
    options: [
      { hint: 'lunchbox-commit', label: 'Commit tool', value: 'commit' },
      { hint: 'lunchbox-branch', label: 'Branch tool', value: 'branch' },
      { hint: 'through the skills CLI', label: 'Agent skills', value: COMPONENT.skills },
      { hint: 'in your global git config', label: 'Git aliases', value: COMPONENT.aliases },
    ],
    required: true,
  });
  return unwrap(value);
};

const askScope = async (message: string, projectLabel: string): Promise<InstallScope> => {
  const value = await select<InstallScope>({
    message,
    options: [
      { label: projectLabel, value: INSTALL_SCOPE.project },
      { label: 'Everywhere on this machine (global)', value: INSTALL_SCOPE.global },
    ],
  });
  return unwrap(value);
};

const toProjectPlan = (tools: ReadonlyArray<ToolName>): ToolsPlan => ({
  isWorkspaceRoot: fs.existsSync(PNPM_WORKSPACE_FILE),
  manager: detectPackageManager((file) => fs.existsSync(file)),
  packageJson: fs.readFileSync(PACKAGE_JSON_FILE, 'utf8'),
  scope: INSTALL_SCOPE.project,
  tools,
});

const askToolsPlan = async (tools: ReadonlyArray<ToolName>): Promise<ToolsPlan | undefined> => {
  if (tools.length === 0) {
    return undefined;
  }
  if (!fs.existsSync(PACKAGE_JSON_FILE)) {
    log.info(`No ${PACKAGE_JSON_FILE} here, so the tools will be installed globally.`);
    return { scope: INSTALL_SCOPE.global, tools };
  }
  const scope = await askScope('Where do you want to install the tools?', 'This project (devDependency and scripts)');
  return scope === INSTALL_SCOPE.global ? { scope, tools } : toProjectPlan(tools);
};

const askSkills = async (): Promise<SkillsInstall> => {
  const skills = await multiselect<SkillName>({
    initialValues: ['lunchbox-branch', 'lunchbox-commit'],
    message: 'Which skills do you want?',
    options: SKILL_NAMES.map((skill) => ({ hint: SKILL_HINT[skill], label: skill, value: skill })),
    required: true,
  });
  const scope = await askScope('Where do you want to install the skills?', 'This project');
  return { scope, skills: unwrap(skills) };
};

const askAliases = async (): Promise<Array<GitAlias>> => {
  const names = await multiselect<string>({
    initialValues: [...DEFAULT_ALIAS_NAMES],
    message: 'Which git aliases do you want?',
    options: GIT_ALIASES.map(({ description, name }) => ({ hint: description, label: name, value: name })),
    required: true,
  });
  const selected = unwrap(names);
  return GIT_ALIASES.filter(({ name }) => selected.includes(name));
};

const askAliasChanges = async (): Promise<AliasChanges> => {
  const changes = classifyAliases(await askAliases(), readGlobalAlias);
  if (changes.conflicting.length === 0) {
    return changes;
  }
  const names = changes.conflicting.map(({ name }) => name).join(', ');
  const replace = await confirm({
    initialValue: false,
    message: `You already have different aliases named ${names}. Replace them?`,
  });
  return unwrap(replace) ? changes : { added: changes.added, conflicting: [] };
};

/**
 * Asks everything up front, so nothing is changed until the user has confirmed the whole plan.
 */
export const askSetupPlan = async (): Promise<SetupPlan> => {
  const components = await askComponents();
  const tools = await askToolsPlan(components.filter(isToolName));
  const skills = components.includes(COMPONENT.skills) ? await askSkills() : undefined;
  const aliases = components.includes(COMPONENT.aliases) ? await askAliasChanges() : { added: [], conflicting: [] };
  return { aliases, skills, tools };
};
