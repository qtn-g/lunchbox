import { execFileSync } from 'node:child_process';
import { GIT_BINARY } from './aliases.constants';
import type { CommandResult } from '@lunchbox-tools/utils';
import type { AliasChanges, GitAlias } from './types/aliases.types';

const toConfigKey = (name: string): string => `alias.${name}`;

const toErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/**
 * Reads a global alias, `undefined` when it is not set. Git runs without a shell because alias values hold quotes.
 */
export const readGlobalAlias = (name: string): string | undefined => {
  try {
    return execFileSync(GIT_BINARY, ['config', '--global', '--get', toConfigKey(name)], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trimEnd();
  } catch {
    // `git config --get` fails when the key is not set. An unreadable config surfaces when writing instead.
    return undefined;
  }
};

export const writeGlobalAlias = ({ command, name }: GitAlias): CommandResult => {
  try {
    return {
      ok: true,
      value: execFileSync(GIT_BINARY, ['config', '--global', toConfigKey(name), command], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }),
    };
  } catch (error) {
    return { error: toErrorMessage(error), ok: false };
  }
};

/**
 * Sorts aliases by what writing them would do. Those already set to the same value need nothing.
 */
export const classifyAliases = (
  aliases: ReadonlyArray<GitAlias>,
  readAlias: (name: string) => string | undefined
): AliasChanges => {
  const withCurrent = aliases.map((alias) => ({ alias, current: readAlias(alias.name) }));
  return {
    added: withCurrent.filter(({ current }) => current === undefined).map(({ alias }) => alias),
    conflicting: withCurrent
      .filter(({ alias, current }) => current !== undefined && current !== alias.command)
      .map(({ alias }) => alias),
  };
};
