export const toKebabCase = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export interface FormatBranchNameInput {
  type: string;
  description: string;
  /** Normalized ticket (e.g. `PROJ-123`, `123`), empty to skip. Kept as-is so Jira keys stay upper-case. */
  ticket: string;
}

export const formatBranchName = ({ type, description, ticket }: FormatBranchNameInput): string => {
  const slug = [ticket.trim(), toKebabCase(description)].filter(Boolean).join('-');
  return `${type}/${slug}`;
};
