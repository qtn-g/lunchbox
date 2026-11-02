import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifyAliases } from '../aliases';
import { GIT_ALIASES } from '../aliases.constants';
import type { GitAlias } from '../types/aliases.types';

const EXAMPLE_FILE = join(import.meta.dirname, '../../../../others/.gitconfig.example');

const readExample = (args: ReadonlyArray<string>): string => {
  return execFileSync('git', ['config', '-f', EXAMPLE_FILE, ...args], { encoding: 'utf8' }).trimEnd();
};

const alias = (name: string, command: string): GitAlias => ({ command, description: name, name });

describe('GIT_ALIASES', () => {
  it('holds the same aliases as the example gitconfig', () => {
    const exampleNames = readExample(['--name-only', '--get-regexp', '^alias\\.']).split('\n').sort();

    expect(GIT_ALIASES.map(({ name }) => `alias.${name}`).sort()).toEqual(exampleNames);
  });

  it.each(GIT_ALIASES.map(({ command, name }) => [name, command]))('holds the same command for %s', (name, command) => {
    expect(readExample(['--get', `alias.${name}`])).toBe(command);
  });
});

describe('classifyAliases', () => {
  const aliases = [alias('new', 'a'), alias('same', 'b'), alias('other', 'c')];
  const current = new Map([
    ['same', 'b'],
    ['other', 'different'],
  ]);

  it('sorts aliases by what writing them would do', () => {
    const { added, conflicting } = classifyAliases(aliases, (name) => current.get(name));

    expect(added.map(({ name }) => name)).toEqual(['new']);
    expect(conflicting.map(({ name }) => name)).toEqual(['other']);
  });
});
