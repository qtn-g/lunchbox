import { describe, expect, it } from 'vitest';
import { formatBranchName, toKebabCase } from '../format';

describe('toKebabCase', () => {
  it('lowercases input', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(toKebabCase('add user authentication')).toBe('add-user-authentication');
  });

  it('trims leading and trailing whitespace', () => {
    expect(toKebabCase('  fix bug  ')).toBe('fix-bug');
  });

  it('removes special characters', () => {
    expect(toKebabCase('fix: a bug!')).toBe('fix-a-bug');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(toKebabCase('fix   multiple   spaces')).toBe('fix-multiple-spaces');
  });

  it('handles already kebab-cased input', () => {
    expect(toKebabCase('already-kebab-cased')).toBe('already-kebab-cased');
  });

  it('handles input with numbers', () => {
    expect(toKebabCase('version 2 feature')).toBe('version-2-feature');
  });
});

describe('formatBranchName', () => {
  it('formats a feature branch name', () => {
    expect(formatBranchName({ description: 'Add user authentication', ticket: '', type: 'feature' })).toBe(
      'feature/add-user-authentication'
    );
  });

  it('formats a bugfix branch name', () => {
    expect(formatBranchName({ description: 'Fix login redirect', ticket: '', type: 'bugfix' })).toBe('bugfix/fix-login-redirect');
  });

  it('formats a release branch name', () => {
    expect(formatBranchName({ description: 'version 2 release', ticket: '', type: 'release' })).toBe('release/version-2-release');
  });

  it('formats a custom type branch name', () => {
    expect(formatBranchName({ description: 'Urgent production fix', ticket: '', type: 'hotfix' })).toBe(
      'hotfix/urgent-production-fix'
    );
  });

  it('inserts a Jira key after the type, keeping it upper-case', () => {
    expect(formatBranchName({ description: 'Add login', ticket: 'PROJ-123', type: 'feature' })).toBe(
      'feature/PROJ-123-add-login'
    );
  });

  it('inserts a numeric ticket after the type', () => {
    expect(formatBranchName({ description: 'Fix login', ticket: '42', type: 'bugfix' })).toBe('bugfix/42-fix-login');
  });
});
