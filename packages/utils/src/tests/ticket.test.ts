import { describe, expect, it, vi } from 'vitest';

vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  text: vi.fn(),
}));

import { text } from '@clack/prompts';
import { askTicket, extractTicketFromBranch, formatTicketReference, normalizeTicket, validateTicket } from '../ticket';
import type { TicketSettings } from '../ticket';

const NONE: TicketSettings = { ticketPrefix: '', ticketProvider: 'none' };
const JIRA: TicketSettings = { ticketPrefix: '', ticketProvider: 'jira' };
const JIRA_WITH_PREFIX: TicketSettings = { ticketPrefix: 'proj-', ticketProvider: 'jira' };
const GITHUB: TicketSettings = { ticketPrefix: '', ticketProvider: 'github' };
const AZURE: TicketSettings = { ticketPrefix: '', ticketProvider: 'azure' };
const GITHUB_WITH_HASH_PREFIX: TicketSettings = { ticketPrefix: '#', ticketProvider: 'github' };
const JIRA_WITHOUT_SEPARATOR: TicketSettings = { ticketPrefix: 'PROJ', ticketProvider: 'jira' };

describe('normalizeTicket', () => {
  it('upper-cases Jira keys', () => {
    expect(normalizeTicket(JIRA, ' proj-123 ')).toBe('PROJ-123');
  });

  it('prepends the ticket prefix to a bare number', () => {
    expect(normalizeTicket(JIRA_WITH_PREFIX, '123')).toBe('PROJ-123');
  });

  it('keeps a full Jira key from another project', () => {
    expect(normalizeTicket(JIRA_WITH_PREFIX, 'other-45')).toBe('OTHER-45');
  });

  it('does not add any separator to the prefix', () => {
    expect(normalizeTicket(JIRA_WITHOUT_SEPARATOR, '123')).toBe('PROJ123');
  });

  it('applies the prefix before the provider normalization', () => {
    expect(normalizeTicket(GITHUB_WITH_HASH_PREFIX, '42')).toBe('42');
  });

  it('does not prefix a bare number without prefix', () => {
    expect(normalizeTicket(JIRA, '123')).toBe('123');
  });

  it('strips the leading hash for GitHub and Azure', () => {
    expect(normalizeTicket(GITHUB, '#42')).toBe('42');
    expect(normalizeTicket(AZURE, ' #42 ')).toBe('42');
  });

  it('returns an empty string when no provider is configured', () => {
    expect(normalizeTicket(NONE, 'PROJ-123')).toBe('');
  });
});

describe('validateTicket', () => {
  it('requires a ticket when a provider is configured', () => {
    expect(validateTicket(JIRA, '')).toBe('A ticket is required.');
    expect(validateTicket(GITHUB, undefined)).toBe('A ticket is required.');
    expect(validateTicket(AZURE, '  ')).toBe('A ticket is required.');
  });

  it('accepts valid tickets', () => {
    expect(validateTicket(JIRA, 'proj-123')).toBe(true);
    expect(validateTicket(JIRA_WITH_PREFIX, '123')).toBe(true);
    expect(validateTicket(GITHUB, '#12')).toBe(true);
    expect(validateTicket(AZURE, '4567')).toBe(true);
  });

  it('rejects invalid tickets', () => {
    expect(validateTicket(JIRA, '123')).toBe('Jira issue key must look like PROJ-123.');
    expect(validateTicket(JIRA_WITH_PREFIX, 'abc')).toBe('Jira issue key must look like PROJ-123.');
    expect(validateTicket(JIRA_WITHOUT_SEPARATOR, '123')).toBe('Jira issue key must look like PROJ-123.');
    expect(validateTicket(GITHUB, 'abc')).toBe('GitHub issue number must be a number (e.g. 123).');
    expect(validateTicket(AZURE, 'AB-1')).toBe('Azure DevOps work item id must be a number (e.g. 123).');
  });

  it('accepts anything when no provider is configured', () => {
    expect(validateTicket(NONE, '')).toBe(true);
  });
});

describe('formatTicketReference', () => {
  it('formats a Jira reference', () => {
    expect(formatTicketReference(JIRA, 'proj-123')).toBe('Refs: PROJ-123');
    expect(formatTicketReference(JIRA_WITH_PREFIX, '123')).toBe('Refs: PROJ-123');
  });

  it('formats GitHub and Azure references', () => {
    expect(formatTicketReference(GITHUB, '42')).toBe('Refs: #42');
    expect(formatTicketReference(AZURE, '#42')).toBe('Refs: #42');
  });

  it('returns an empty string without ticket or provider', () => {
    expect(formatTicketReference(JIRA, '')).toBe('');
    expect(formatTicketReference(NONE, '42')).toBe('');
  });
});

describe('extractTicketFromBranch', () => {
  it('extracts a Jira key', () => {
    expect(extractTicketFromBranch(JIRA, 'feature/PROJ-123-add-login')).toBe('PROJ-123');
    expect(extractTicketFromBranch(JIRA_WITH_PREFIX, 'feature/proj-123')).toBe('PROJ-123');
  });

  it('extracts a numeric id', () => {
    expect(extractTicketFromBranch(GITHUB, 'bugfix/42-fix-login')).toBe('42');
    expect(extractTicketFromBranch(AZURE, '4567-something')).toBe('4567');
  });

  it('returns an empty string when the branch has no ticket', () => {
    expect(extractTicketFromBranch(JIRA, 'feature/add-login')).toBe('');
    expect(extractTicketFromBranch(GITHUB, 'feature/version-2-release')).toBe('');
    expect(extractTicketFromBranch(NONE, 'feature/PROJ-123-add-login')).toBe('');
  });
});

describe('askTicket', () => {
  it('returns the normalized ticket', async () => {
    vi.mocked(text).mockResolvedValue('7');

    expect(await askTicket(JIRA_WITH_PREFIX)).toBe('PROJ-7');
    expect(vi.mocked(text)).toHaveBeenCalledWith(expect.objectContaining({ placeholder: 'e.g. 123 (→ proj-123)' }));
  });

  it('does not prompt when no provider is configured', async () => {
    vi.mocked(text).mockClear();

    expect(await askTicket(NONE)).toBe('');
    expect(vi.mocked(text)).not.toHaveBeenCalled();
  });
});
