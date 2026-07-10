import type { CommitConfig, CommitScope, CommitType } from './type';

const COMMIT_TYPES: Array<CommitType> = [
  { label: 'feat     — A new feature', section: 'Features', value: 'feat' },
  { label: 'fix      — A bug fix', section: 'Bug Fixes', value: 'fix' },
  { label: 'docs     — Documentation only changes', section: 'Documentation', value: 'docs' },
  {
    label: 'refactor — A code change that neither fixes a bug nor adds a feature',
    section: 'Refactor',
    value: 'refactor',
  },
  { label: 'build    — Build system or bundler configuration changes', section: 'Build', value: 'build' },
  { label: 'test     — Adding missing tests', section: 'Tests', value: 'test' },
  { label: 'ci       — Changes to CI/CD pipeline configuration', section: 'CI', value: 'ci' },
  { label: 'release  — Version bumps and changelog updates', section: 'Release', value: 'release' },
];

const COMMIT_SCOPES: Array<CommitScope> = [
  { label: 'deps      — Dependency version changes', value: 'deps' },
  { label: 'workspace — Root-level monorepo concerns', value: 'workspace' },
];

export const MAXIMUM_SUBJECT_LENGTH = 80;

export const defaultConfig: CommitConfig = {
  commitScopes: [...COMMIT_SCOPES],
  commitTypes: [...COMMIT_TYPES],
  maximumSubjectLength: MAXIMUM_SUBJECT_LENGTH,
  noVerify: false,
};
