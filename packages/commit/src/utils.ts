import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { text } from '@clack/prompts';
import { unwrap } from '@lunchbox-tools/utils';
import { validateSubjectLength } from './format';

export const limitedInput = async (message: string, { maxLength }: { maxLength: number }): Promise<string> => {
  const value = await text({
    message: `${message} - (${maxLength} characters max)`,
    validate: (v: string | undefined) => {
      const result = validateSubjectLength(v, maxLength);
      return result === true ? undefined : result;
    },
  });
  return unwrap(value);
};

export const optionalInput = async (message: string): Promise<string> => {
  const value = await text({
    defaultValue: '',
    message,
    placeholder: 'Leave empty to skip',
  });
  return unwrap(value).trim();
};

export const getCommitMessageFile = (): string => {
  const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim();
  return join(gitDir, 'COMMIT_EDITMSG');
};
