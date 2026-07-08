export const toKebabCase = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const formatBranchName = (type: string, description: string): string => {
  return `${type}/${toKebabCase(description)}`;
};
