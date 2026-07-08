import { describe, expect, it } from 'vitest';
import { formatCommitMessage, validateSubjectLength } from '../format';

describe('formatCommitMessage', () => {
  it('formats a basic commit message with type, scope, and subject', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '',
      scopes: ['api'],
      subject: 'add endpoint',
      type: 'feat',
    });

    expect(result).toBe('feat(api): add endpoint');
  });

  it('joins multiple scopes with comma', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '',
      scopes: ['api', 'auth'],
      subject: 'refactor handlers',
      type: 'refactor',
    });

    expect(result).toBe('refactor(api, auth): refactor handlers');
  });

  it('appends body separated by two newlines', () => {
    const result = formatCommitMessage({
      body: 'This is a detailed description.',
      breakingChange: '',
      scopes: ['core'],
      subject: 'update logic',
      type: 'fix',
    });

    expect(result).toBe('fix(core): update logic\n\nThis is a detailed description.');
  });

  it('trims whitespace from body', () => {
    const result = formatCommitMessage({
      body: '  padded body  ',
      breakingChange: '',
      scopes: ['ui'],
      subject: 'fix layout',
      type: 'fix',
    });

    expect(result).toBe('fix(ui): fix layout\n\npadded body');
  });

  it('appends breaking change with bang and footer', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: 'removed deprecated API',
      scopes: ['api'],
      subject: 'remove v1 endpoints',
      type: 'feat',
    });

    expect(result).toBe('feat(api)!: remove v1 endpoints\n\nBREAKING CHANGE: removed deprecated API');
  });

  it('includes both body and breaking change', () => {
    const result = formatCommitMessage({
      body: 'Migration guide included.',
      breakingChange: 'auth flow changed',
      scopes: ['auth'],
      subject: 'overhaul auth',
      type: 'feat',
    });

    expect(result).toBe('feat(auth)!: overhaul auth\n\nMigration guide included.\n\nBREAKING CHANGE: auth flow changed');
  });

  it('handles empty scopes array', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '',
      scopes: [],
      subject: 'initial commit',
      type: 'chore',
    });

    expect(result).toBe('chore(): initial commit');
  });

  it('ignores whitespace-only body', () => {
    const result = formatCommitMessage({
      body: '   ',
      breakingChange: '',
      scopes: ['deps'],
      subject: 'bump versions',
      type: 'build',
    });

    expect(result).toBe('build(deps): bump versions');
  });

  it('ignores whitespace-only breaking change', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '   ',
      scopes: ['core'],
      subject: 'minor tweak',
      type: 'fix',
    });

    expect(result).toBe('fix(core): minor tweak');
  });
});

describe('validateSubjectLength', () => {
  it('returns true when value is within limit', () => {
    const subjectLength = 80;
    expect(validateSubjectLength('short', subjectLength)).toBe(true);
  });

  it('returns true when value is exactly at limit', () => {
    const subjectLength = 80;
    const value = 'a'.repeat(subjectLength);
    expect(validateSubjectLength(value, subjectLength)).toBe(true);
  });

  it('returns error message when value exceeds limit', () => {
    const subjectLength = 80;
    const value = 'a'.repeat(subjectLength + 1);
    expect(validateSubjectLength(value, subjectLength)).toBe(
      `Input must be ${subjectLength} characters or less (${value.length}).`
    );
  });
});
