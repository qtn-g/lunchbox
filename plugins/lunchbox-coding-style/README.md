# Lunchbox Coding Style

An opinionated coding style for Claude. Once this plugin is enabled, Claude loads the style before it writes, refactors, or reviews code, in any language and any project. Disable the plugin in projects that follow other conventions.

## Install

```
/plugin install lunchbox-coding-style --marketplace qtn-g/lunchbox
```

## What it asks for

The `lunchbox-coding-style:coding-style` skill covers:

- Named constants instead of magic numbers and strings, kept in `<name>.constants.ts` files
- Guard clauses, exhaustive mappers and array methods instead of `switch`, nested ternaries and loops
- Small functions with at most two parameters, no boolean flags, and `Result` values for expected failures
- Strict TypeScript: no `any`, no `as` casts, and every type declared in a `types/` directory
- Verification from the narrowest tests outwards

A project's compiler, linter and formatter configuration wins where it conflicts with the style. The examples are in TypeScript, and the skill explains how to apply them in other languages.

## What it runs

Nothing. The plugin is a single Markdown skill, with no scripts, hooks or MCP servers, and it does not send data anywhere.
