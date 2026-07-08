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
    expect(formatBranchName('feature', 'Add user authentication')).toBe('feature/add-user-authentication');
  });

  it('formats a bugfix branch name', () => {
    expect(formatBranchName('bugfix', 'Fix login redirect')).toBe('bugfix/fix-login-redirect');
  });

  it('formats a release branch name', () => {
    expect(formatBranchName('release', 'version 2 release')).toBe('release/version-2-release');
  });

  it('formats a custom type branch name', () => {
    expect(formatBranchName('hotfix', 'Urgent production fix')).toBe('hotfix/urgent-production-fix');
  });
});
