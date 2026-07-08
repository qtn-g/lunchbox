import type { BranchConfig, BranchType } from './type';

const BRANCH_TYPES: Array<BranchType> = [
  { label: 'feature  — New feature development', value: 'feature' },
  { label: 'bugfix   — A bug fix', value: 'bugfix' },
  { label: 'release  — Release preparation', value: 'release' },
  { label: 'spike    — Experimental work', value: 'spike' },
];

export const defaultConfig: BranchConfig = {
  branchTypes: [...BRANCH_TYPES],
};
