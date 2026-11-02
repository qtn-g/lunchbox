import type { GitAlias } from './types/aliases.types';

/** The aliases of `others/.gitconfig.example`, a test keeps them in sync. */
export const GIT_ALIASES: ReadonlyArray<GitAlias> = [
  { command: 'checkout', description: 'checkout', name: 'co' },
  { command: 'status -sb', description: 'short status with branch', name: 'st' },
  { command: 'branch', description: 'branch', name: 'br' },
  { command: 'commit', description: 'commit', name: 'ci' },
  { command: 'fetch origin', description: 'fetch origin', name: 'fo' },
  { command: '!git --no-pager diff', description: 'diff without a pager', name: 'd' },
  { command: 'difftool', description: 'difftool', name: 'dt' },
  { command: '!git --no-pager diff --stat', description: 'diff --stat without a pager', name: 'stat' },
  {
    command:
      "!f() { for b in main master develop; do git rev-parse -q --verify $b >/dev/null && git branch --merged $b; done | grep -vE '^[*+]|^ *(main|master|develop)$' | sort -u | xargs -r git branch -d; git remote prune origin; }; f",
    description: 'delete merged branches and prune origin',
    name: 'sweep',
  },
  {
    command: "log --graph --all --pretty=format:'%Cred%h%Creset - %s %Cgreen(%cr) %C(bold blue)%an%Creset %C(yellow)%d%Creset'",
    description: 'graph of all branches',
    name: 'lg',
  },
  {
    command: '!git daemon --reuseaddr --verbose  --base-path=. --export-all ./.git',
    description: 'serve the repository with git daemon',
    name: 'serve',
  },
  { command: 'checkout master', description: 'checkout master', name: 'm' },
  { command: 'reset HEAD --', description: 'remove a file from the index', name: 'unstage' },
];

export const GIT_BINARY = 'git';

export const DEFAULT_ALIAS_NAMES: ReadonlyArray<string> = ['sweep'];
