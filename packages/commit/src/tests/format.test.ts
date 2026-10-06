import { describe, expect, it } from 'vitest';
import { formatCommitMessage, validateSubjectLength } from '../format';

describe('formatCommitMessage', () => {
  it('formats a basic commit message with type, scope, and subject', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '',
      scopes: ['api'],
      subject: 'add endpoint',
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
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
      ticketReference: '',
      type: 'fix',
    });

    expect(result).toBe('fix(core): minor tweak');
  });
});

describe('formatCommitMessage with ticket', () => {
  it('appends the ticket reference as a footer', () => {
    const result = formatCommitMessage({
      body: '',
      breakingChange: '',
      scopes: ['api'],
      subject: 'add endpoint',
      ticketReference: 'Refs: PROJ-123',
      type: 'feat',
    });

    expect(result).toBe('feat(api): add endpoint\n\nRefs: PROJ-123');
  });

  it('groups the ticket reference and breaking change in the same footer block', () => {
    const result = formatCommitMessage({
      body: 'Details.',
      breakingChange: 'removed v1',
      scopes: ['api'],
      subject: 'drop v1',
      ticketReference: 'Refs: #42',
      type: 'feat',
    });

    expect(result).toBe('feat(api)!: drop v1\n\nDetails.\n\nRefs: #42\nBREAKING CHANGE: removed v1');
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
