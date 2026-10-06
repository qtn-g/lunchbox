import type { SourceBranch } from './type';

const LOCAL_REF_PREFIX = 'refs/heads/';
const REMOTE_REF_PREFIX = 'refs/remotes/';
const REMOTE_HEAD_SUFFIX = '/HEAD';

/** Git command listing local and remote branches, one full ref per line. */
export const LIST_BRANCHES_COMMAND = 'git for-each-ref --format="%(refname)" refs/heads refs/remotes';

const toSourceBranch = (ref: string): SourceBranch | undefined => {
  if (ref.startsWith(LOCAL_REF_PREFIX)) {
    return { location: 'local', name: ref.slice(LOCAL_REF_PREFIX.length) };
  }
  if (ref.startsWith(REMOTE_REF_PREFIX) && !ref.endsWith(REMOTE_HEAD_SUFFIX)) {
    return { location: 'remote', name: ref.slice(REMOTE_REF_PREFIX.length) };
  }
  return undefined;
};

/**
 * Parses the output of `LIST_BRANCHES_COMMAND` into source branches.
 * Remote `HEAD` symbolic refs (e.g. `origin/HEAD`) are ignored.
 */
export const parseBranchRefs = (output: string): Array<SourceBranch> => {
  return output
    .split('\n')
    .map((line) => toSourceBranch(line.trim()))
    .filter((branch): branch is SourceBranch => branch !== undefined);
};

const LOCATION_ORDER: Record<SourceBranch['location'], number> = {
  local: 0,
  remote: 1,
};

/**
 * Orders branches with the current branch first, then local branches, then remote ones.
 */
export const sortSourceBranches = (branches: readonly SourceBranch[], currentBranch: string): Array<SourceBranch> => {
  const rank = (branch: SourceBranch): number =>
    branch.location === 'local' && branch.name === currentBranch ? -1 : LOCATION_ORDER[branch.location];
  return [...branches].sort((a, b) => rank(a) - rank(b));
};

/**
 * Hint displayed next to a branch in the source selector.
 */
export const getSourceBranchHint = (branch: SourceBranch, currentBranch: string): string | undefined => {
  if (branch.location === 'remote') {
    return 'remote';
  }
  return branch.name === currentBranch ? 'current' : undefined;
};
