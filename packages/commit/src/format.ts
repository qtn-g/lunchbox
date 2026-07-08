export interface FormatCommitMessageInput {
  body: string;
  breakingChange: string;
  scopes: readonly string[];
  subject: string;
  type: string;
}

export const formatCommitMessage = ({ body, breakingChange, scopes, subject, type }: FormatCommitMessageInput): string => {
  const formattedScopes = scopes.join(', ');
  const formattedBody = body.trim() ? `\n\n${body.trim()}` : '';
  const formattedBreakingChange = breakingChange.trim() ? `\n\nBREAKING CHANGE: ${breakingChange.trim()}` : '';
  const breakingChangeBang = breakingChange.trim() ? '!' : '';

  return `${type}(${formattedScopes})${breakingChangeBang}: ${subject}${formattedBody}${formattedBreakingChange}`;
};

export const validateSubjectLength = (value: string | undefined, maxLength: number): true | string => {
  return (value && value.length <= maxLength) || `Input must be ${maxLength} characters or less (${value?.length ?? 0}).`;
};
