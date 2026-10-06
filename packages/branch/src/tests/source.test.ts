import { describe, expect, it } from 'vitest';
import { getSourceBranchHint, parseBranchRefs, sortSourceBranches } from '../source';
import type { SourceBranch } from '../type';

describe('parseBranchRefs', () => {
  it('parses local and remote branches and ignores remote HEAD', () => {
    const output = ['refs/heads/main', 'refs/heads/feature/x', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main', ''].join(
      '\n'
    );

    expect(parseBranchRefs(output)).toEqual([
      { location: 'local', name: 'main' },
      { location: 'local', name: 'feature/x' },
      { location: 'remote', name: 'origin/main' },
    ]);
  });
});

describe('sortSourceBranches', () => {
  it('puts the current branch first, then local, then remote branches', () => {
    const branches: Array<SourceBranch> = [
      { location: 'remote', name: 'origin/main' },
      { location: 'local', name: 'main' },
      { location: 'local', name: 'develop' },
    ];

    expect(sortSourceBranches(branches, 'develop').map((b) => b.name)).toEqual(['develop', 'main', 'origin/main']);
  });
});

describe('getSourceBranchHint', () => {
  it('flags remote and current branches', () => {
    expect(getSourceBranchHint({ location: 'remote', name: 'origin/develop' }, 'develop')).toBe('remote');
    expect(getSourceBranchHint({ location: 'local', name: 'develop' }, 'develop')).toBe('current');
    expect(getSourceBranchHint({ location: 'local', name: 'main' }, 'develop')).toBeUndefined();
  });
});
