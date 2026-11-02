---
name: lunchbox-commit
description: Writes git commits the way `@lunchbox-tools/commit` does. Load before `git commit` in a repository that has a `lunchbox.config.json` or uses `@lunchbox-tools/commit`.
---

# Commits with lunchbox

`lunchbox-commit` is an interactive prompt that waits on a terminal. Produce the same commit with plain git, following these steps.

## 1. Find the configuration

Take the first source that applies. Options it leaves out keep their default.

1. **A script calling `setupCommitPrompt(...)`**, usually reached from `package.json` `scripts`: its argument, including whatever it imports. This form ignores the config file.
2. **The `"commit"` section of `lunchbox.config.json`**, at the root of the git repository.
3. **The defaults:**

| Option | Default |
|---|---|
| `commitTypes` | `feat`, `fix`, `docs`, `refactor`, `build`, `test`, `ci`, `release` |
| `commitScopes` | `deps` (dependency versions), `workspace` (root-level monorepo concerns) |
| `maximumSubjectLength` | `80` |
| `ticketProvider` | `none` |
| `ticketPrefix` | empty |
| `noVerify` | `false` |

Then read what else governs commits here: commitlint config and git hooks (`.husky/`, `lefthook.yml`) often add rules, such as subject case or protected branches, and those rules also apply. `git log` shows the local style for anything still open.

Done when you know the allowed types and scopes, the subject limit and the ticket provider.

## 2. Check what is staged

`git diff --cached --name-only` must list files, and the message describes exactly those. When the user asked for a commit and nothing is staged, stage the relevant files by name.

Each commit is one change that stands on its own (a dependency bump, a refactor, a feature) and passes the hooks. Ask the user before splitting or merging what they staged.

## 3. Compose the message

```
<type>(<scope>[, <scope>…])[!]: <subject>

[<body>]

[Refs: <ticket>]
[BREAKING CHANGE: <description>]
```

Empty parts disappear along with their blank line.

- **`<type>`**: a `value` from `commitTypes`, picked by what the change does.
- **`<scope>`**: at least one `value` from `commitScopes`, one for each area the commit touches, joined by `, `: `fix(api, ui): …`. Ask the user when none fits, since only listed scopes are valid.
- **`<subject>`**: imperative, no longer than `maximumSubjectLength` characters.
- **`!` and `BREAKING CHANGE:`** go together, only for a change that breaks a consumer.
- **`<body>`**: optional, says why the change was made.
- **`Refs:`**: mandatory when `ticketProvider` is not `none`. Take the ticket from the current branch name, where it directly follows the `/` or starts the name (`feature/PROJ-123-add-login`). Otherwise ask the user. `ticketPrefix` is prepended as-is to a ticket given as a bare number: `PROJ-` turns `123` into `PROJ-123`.

| Provider | Footer |
|---|---|
| `jira` | `Refs: PROJ-123`, always upper-case |
| `github`, `azure` | `Refs: #123` |

The tool adds no other trailer; add one only when the instructions of the repository or the user ask for it.

## 4. Commit

Pass the message through stdin so the blank lines survive:

```sh
git commit -F - <<'EOF'
feat(api): add login endpoint

Sessions expire too early with the legacy endpoint.

Refs: PROJ-123
EOF
```

Add `--no-verify` only when the configuration sets `noVerify` to `true`. When a hook fails, the commit did not happen: fix the cause, stage the fix and run the same command again.

Done when `git log -1 --format=%B` shows the intended message.
