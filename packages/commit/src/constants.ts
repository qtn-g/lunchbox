import type { CommitConfig, CommitScope, CommitType } from './type';

const COMMIT_TYPES: Array<CommitType> = [
  { label: 'feat     — A new feature', section: 'Features', value: 'feat' },
  { label: 'fix      — A bug fix', section: 'Bug Fixes', value: 'fix' },
  { label: 'perf     — A code change that improves performance', section: 'Performance', value: 'perf' },
  { label: 'revert   — Reverts a previous commit', section: 'Reverts', value: 'revert' },
  { label: 'docs     — Documentation only changes', section: 'Documentation', value: 'docs' },
  { label: 'style    — Formatting, missing semi colons, etc', section: 'Styles', value: 'style' },
  {
    label: 'refactor — A code change that neither fixes a bug nor adds a feature',
    section: 'Refactor',
    value: 'refactor',
  },
  { label: 'test     — Adding missing tests', section: 'Tests', value: 'test' },
  { label: 'build    — Changes to build system or dependencies', section: 'Build', value: 'build' },
  { label: 'ci       — Changes to CI/CD pipeline configuration', section: 'CI', value: 'ci' },
  {
    label: 'chore    — Other changes that do not modify src or test files',
    section: 'Chores',
    value: 'chore',
  },
];

const COMMIT_SCOPES: Array<CommitScope> = [
  { label: 'api      — Public API surface', value: 'api' },
  { label: 'ui       — Components & styling', value: 'ui' },
  { label: 'auth     — Authentication & authorization', value: 'auth' },
  { label: 'config   — Configuration files', value: 'config' },
  { label: 'deps     — Dependency updates', value: 'deps' },
  { label: 'core     — Core business logic', value: 'core' },
];

export const MAXIMUM_SUBJECT_LENGTH = 80;
export const LINE_LENGTH = 120;

export const defaultConfig: CommitConfig = {
  commitScopes: [...COMMIT_SCOPES],
  commitTypes: [...COMMIT_TYPES],
  maximumSubjectLength: MAXIMUM_SUBJECT_LENGTH,
  noVerify: true,
};
