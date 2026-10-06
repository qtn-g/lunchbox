export interface FormatCommitMessageInput {
  body: string;
  breakingChange: string;
  scopes: readonly string[];
  subject: string;
  /** Commit footer linking the ticket (e.g. `Refs: PROJ-123`), empty to skip. */
  ticketReference: string;
  type: string;
}

export const formatCommitMessage = ({
  body,
  breakingChange,
  scopes,
  subject,
  ticketReference,
  type,
}: FormatCommitMessageInput): string => {
  const formattedScopes = scopes.join(', ');
  const formattedBody = body.trim() ? `\n\n${body.trim()}` : '';
  const footers = [ticketReference.trim(), breakingChange.trim() ? `BREAKING CHANGE: ${breakingChange.trim()}` : ''].filter(
    Boolean
  );
  const formattedFooters = footers.length ? `\n\n${footers.join('\n')}` : '';
  const breakingChangeBang = breakingChange.trim() ? '!' : '';

  return `${type}(${formattedScopes})${breakingChangeBang}: ${subject}${formattedBody}${formattedFooters}`;
};

export const validateSubjectLength = (value: string | undefined, maxLength: number): true | string => {
  return (value && value.length <= maxLength) || `Input must be ${maxLength} characters or less (${value?.length ?? 0}).`;
};
