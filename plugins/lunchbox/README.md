# Lunchbox

The [`@lunchbox-tools/branch`](https://www.npmjs.com/package/@lunchbox-tools/branch) and [`@lunchbox-tools/commit`](https://www.npmjs.com/package/@lunchbox-tools/commit) tools are interactive prompts, so a coding agent cannot drive them. This plugin teaches Claude to create the same branches and commits with plain git, following the repository's configuration.

## Install

```
/plugin install lunchbox --marketplace qtn-g/lunchbox
```

## Skills

| Skill | Loads before | What it does |
| --- | --- | --- |
| `lunchbox:lunchbox-branch` | `git checkout -b` or `git switch -c` | Names the branch `<type>/<ticket>-<description>` from the allowed types and ticket provider |
| `lunchbox:lunchbox-commit` | `git commit` | Writes a Conventional Commit from the allowed types, scopes, subject limit and ticket provider |

Both apply in a repository that has a `lunchbox.config.json` or uses the matching `@lunchbox-tools` package. The tools themselves do not need to be installed.

## What it runs

The skills read the repository's configuration and git hooks, then tell Claude to run `git`. `lunchbox-branch` runs `git fetch` unless the configuration sets `fetchRemoteBranches` to `false`. The plugin has no hooks or MCP servers, and it does not send data anywhere itself.

See the [documentation](https://qtn-g.github.io/lunchbox/) for the configuration options.
