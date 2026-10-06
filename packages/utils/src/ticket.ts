import { text } from '@clack/prompts';
import { unwrap } from './utils';

/**
 * Issue tracker used to link branches and commits to a ticket.
 * - `none`: no ticket is asked nor inserted.
 * - `jira`: Jira issue key (e.g. `PROJ-123`).
 * - `github`: GitHub issue number (e.g. `#123`).
 * - `azure`: Azure DevOps work item id (e.g. `#123`).
 */
export type TicketProvider = 'none' | 'jira' | 'github' | 'azure';

export type LinkedTicketProvider = Exclude<TicketProvider, 'none'>;

/**
 * Ticket-related options shared by the branch and commit configs.
 */
export interface TicketSettings {
  /**
   * Issue tracker used to link branches and commits to a ticket.
   * When different from `none`, a ticket is mandatory:
   * - branch: inserted after the type prefix (`feature/PROJ-123-add-login`, `feature/123-add-login`).
   * - commit: read from the current branch name (asked only when absent) and added as a
   *   `Refs:` footer (`Refs: PROJ-123` for Jira, `Refs: #123` for GitHub and Azure).
   * @default 'none'
   */
  ticketProvider: TicketProvider;
  /**
   * Prepended as-is to a ticket typed as a bare number, nothing is added in between.
   * The result must still be a valid ticket for the provider.
   * @example
   * { ticketPrefix: 'PROJ-', ticketProvider: 'jira' } // `123` → `PROJ-123`
   * @default ''
   */
  ticketPrefix: string;
}

interface TicketRule {
  /** Example displayed in the prompt. */
  readonly placeholder: string;
  /** Error displayed when the ticket does not match `pattern`. */
  readonly errorMessage: string;
  /** Matches a normalized ticket. */
  readonly pattern: RegExp;
  /** Finds a ticket inside a branch name (first capture group). */
  readonly branchPattern: RegExp;
  /** Turns raw user input into the canonical ticket form. */
  readonly normalize: (input: string) => string;
  /** Text inserted in the commit footer so the tracker links the commit. */
  readonly toCommitReference: (ticket: string) => string;
}

const JIRA_KEY_PATTERN = /^[A-Z][A-Z0-9_]+-\d+$/;
const JIRA_BRANCH_PATTERN = /(?:^|\/)([A-Za-z]\w+-\d+)(?=-|$)/;
const NUMERIC_ID_PATTERN = /^\d+$/;
const NUMERIC_BRANCH_PATTERN = /(?:^|\/)(\d+)(?=-|$)/;

const REQUIRED_TICKET_MESSAGE = 'A ticket is required.';
const COMMIT_REFERENCE_TRAILER = 'Refs';

const stripHash = (input: string): string => input.trim().replace(/^#/, '');

const applyPrefix = (input: string, prefix: string): string => {
  const ticket = input.trim();
  return prefix && NUMERIC_ID_PATTERN.test(ticket) ? `${prefix}${ticket}` : ticket;
};

const TICKET_RULES: Record<LinkedTicketProvider, TicketRule> = {
  // Azure Repos links work items mentioned as `#123` in commits.
  azure: {
    branchPattern: NUMERIC_BRANCH_PATTERN,
    errorMessage: 'Azure DevOps work item id must be a number (e.g. 123).',
    normalize: stripHash,
    pattern: NUMERIC_ID_PATTERN,
    placeholder: 'e.g. 123',
    toCommitReference: (ticket: string): string => `#${ticket}`,
  },
  // GitHub links issues mentioned as `#123` in commits.
  github: {
    branchPattern: NUMERIC_BRANCH_PATTERN,
    errorMessage: 'GitHub issue number must be a number (e.g. 123).',
    normalize: stripHash,
    pattern: NUMERIC_ID_PATTERN,
    placeholder: 'e.g. 123',
    toCommitReference: (ticket: string): string => `#${ticket}`,
  },
  // Jira only detects upper-case issue keys in branch names and commit messages.
  jira: {
    branchPattern: JIRA_BRANCH_PATTERN,
    errorMessage: 'Jira issue key must look like PROJ-123.',
    normalize: (input: string): string => stripHash(input).toUpperCase(),
    pattern: JIRA_KEY_PATTERN,
    placeholder: 'e.g. PROJ-123',
    toCommitReference: (ticket: string): string => ticket,
  },
};

export const isTicketEnabled = (provider: TicketProvider): provider is LinkedTicketProvider => provider !== 'none';

/**
 * Normalizes a ticket to its canonical form (`proj-123` → `PROJ-123`, `#123` → `123`).
 * A bare number is first prepended with `ticketPrefix` (`123` → `PROJ-123` with `PROJ-`).
 * Returns an empty string when no provider is configured or the input is blank.
 */
export const normalizeTicket = ({ ticketProvider, ticketPrefix }: TicketSettings, input: string): string => {
  return isTicketEnabled(ticketProvider) ? TICKET_RULES[ticketProvider].normalize(applyPrefix(input, ticketPrefix)) : '';
};

/**
 * Validates a ticket. When a provider is configured, the ticket is mandatory.
 */
export const validateTicket = (settings: TicketSettings, input: string | undefined): true | string => {
  const provider = settings.ticketProvider;
  if (!isTicketEnabled(provider)) {
    return true;
  }
  const ticket = normalizeTicket(settings, input ?? '');
  if (!ticket) {
    return REQUIRED_TICKET_MESSAGE;
  }
  return TICKET_RULES[provider].pattern.test(ticket) || TICKET_RULES[provider].errorMessage;
};

/**
 * Builds the commit footer referencing the ticket (e.g. `Refs: PROJ-123`, `Refs: #123`).
 * Returns an empty string when there is no ticket.
 */
export const formatTicketReference = (settings: TicketSettings, ticket: string): string => {
  const provider = settings.ticketProvider;
  const normalized = normalizeTicket(settings, ticket);
  return isTicketEnabled(provider) && normalized
    ? `${COMMIT_REFERENCE_TRAILER}: ${TICKET_RULES[provider].toCommitReference(normalized)}`
    : '';
};

/**
 * Extracts the ticket from a branch name following the `type/TICKET-description` convention.
 * Returns an empty string when nothing is found.
 */
export const extractTicketFromBranch = (settings: TicketSettings, branchName: string): string => {
  const provider = settings.ticketProvider;
  if (!isTicketEnabled(provider)) {
    return '';
  }
  const match = TICKET_RULES[provider].branchPattern.exec(branchName);
  return match?.[1] ? normalizeTicket(settings, match[1]) : '';
};

/**
 * Prompts for the mandatory ticket and returns it normalized.
 * Returns an empty string without prompting when no provider is configured.
 */
export const askTicket = async (settings: TicketSettings): Promise<string> => {
  const provider = settings.ticketProvider;
  if (!isTicketEnabled(provider)) {
    return '';
  }
  const value = await text({
    message: 'Enter the related ticket:',
    placeholder: settings.ticketPrefix ? `e.g. 123 (→ ${settings.ticketPrefix}123)` : TICKET_RULES[provider].placeholder,
    validate: (v: string | undefined) => {
      const result = validateTicket(settings, v);
      return result === true ? undefined : result;
    },
  });
  return normalizeTicket(settings, unwrap(value));
};
