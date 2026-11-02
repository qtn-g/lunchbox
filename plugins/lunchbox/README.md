# Lunchbox

The [`@lunchbox-tools/branch`](https://www.npmjs.com/package/@lunchbox-tools/branch) and [`@lunchbox-tools/commit`](https://www.npmjs.com/package/@lunchbox-tools/commit) tools are interactive prompts, so a coding agent cannot drive them. This plugin teaches Claude to create the same branches and commits with plain git, following the repository's configuration. It also gives Claude an opinionated coding style.

## Install

```
/plugin install lunchbox --marketplace qtn-g/lunchbox
```

## Skills

| Skill | Loads before | What it does |
| --- | --- | --- |
| `lunchbox:lunchbox-branch` | `git checkout -b` or `git switch -c` | Names the branch `<type>/<ticket>-<description>` from the allowed types and ticket provider |
| `lunchbox:lunchbox-commit` | `git commit` | Writes a Conventional Commit from the allowed types, scopes, subject limit and ticket provider |

| `lunchbox:coding-style` | Writing, refactoring, or reviewing code | Applies the coding style below |

The branch and commit skills apply in a repository that has a `lunchbox.config.json` or uses the matching `@lunchbox-tools` package. The tools themselves do not need to be installed.

## Coding style

Unlike the other two skills, `coding-style` applies to all code, in any language and any project. Disable the plugin in projects that follow other conventions. It covers:

- Named constants instead of magic numbers and strings, kept in `<name>.constants.ts` files
- Guard clauses, exhaustive mappers and array methods instead of `switch`, nested ternaries and loops
- Small functions with at most two parameters, no boolean flags, and `Result` values for expected failures
- Strict TypeScript: no `any`, no `as` casts, and every type declared in a `types/` directory
- Verification from the narrowest tests outwards

A project's compiler, linter and formatter configuration wins where it conflicts with the style. The examples are in TypeScript, and the skill explains how to apply them in other languages.

## What it runs

The branch and commit skills read the repository's configuration and git hooks, then tell Claude to run `git`. `lunchbox-branch` runs `git fetch` unless the configuration sets `fetchRemoteBranches` to `false`. The plugin has no hooks or MCP servers, and it does not send data anywhere itself.

See the [documentation](https://qtn-g.github.io/lunchbox/) for the configuration options.
