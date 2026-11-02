# @lunchbox-tools/setup

Interactive installer for the lunchbox tools, agent skills and git aliases.

```sh
npx @lunchbox-tools/setup
```

Pick what you want, review the planned changes, then confirm. Nothing changes before that.

| Choice | What it does |
|---|---|
| Commit and branch tools | Adds a devDependency with your package manager plus `commit` and `branch` scripts, or installs them globally. An existing script with another command is left alone |
| Agent skills | Runs `npx skills add qtn-g/lunchbox` for the skills you select, in the project or globally |
| Git aliases | Writes the aliases you select with `git config --global`, asking before replacing one with a different value |

**For usage docs, see the [documentation site](https://qtn-g.github.io/lunchbox/guide/getting-started).**

## Package structure

```
src/
  aliases.ts     ← reading and writing global git aliases
  cli.ts         ← `lunchbox-setup` executable
  install.ts     ← install commands and package manager detection
  prompt.ts      ← @clack prompt sequence, builds the plan
  setup.ts       ← orchestration: plan, confirm, apply
  steps.ts       ← turns the plan into steps and runs them
  types/         ← TypeScript interfaces
  *.constants.ts ← fixed values
  tests/
```

## Local development

```sh
# from the repo root
pnpm --filter @lunchbox-tools/setup run build
pnpm --filter @lunchbox-tools/setup run test
pnpm --filter @lunchbox-tools/setup run lint
```

`aliases.constants.ts` mirrors `others/.gitconfig.example`, and a test fails when the two differ.

## License

ISC
