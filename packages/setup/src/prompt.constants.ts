import type { SkillName } from './types/install.types';

export const COMPONENT = {
  aliases: 'aliases',
  skills: 'skills',
} as const;

export const SKILL_HINT: Record<SkillName, string> = {
  'coding-style': 'personal coding conventions, not specific to the tools',
  'lunchbox-branch': 'lets agents name branches like lunchbox-branch',
  'lunchbox-commit': 'lets agents write commits like lunchbox-commit',
};
