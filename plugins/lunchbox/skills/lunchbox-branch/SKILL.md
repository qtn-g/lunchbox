---
name: lunchbox-branch
description: Creates and names git branches the way `@lunchbox-tools/branch` does. Load before `git checkout -b` or `git switch -c` in a repository that has a `lunchbox.config.json` or uses `@lunchbox-tools/branch`.
---

# Branches with lunchbox

`lunchbox-branch` is an interactive prompt that waits on a terminal. Produce the same branch with plain git, following these steps.

## 1. Find the configuration

Take the first source that applies. Options it leaves out keep their default.

1. **A script calling `setupBranchPrompt(...)`**, usually reached from `package.json` `scripts`: its argument, including whatever it imports. This form ignores the config file.
2. **The `"branch"` section of `lunchbox.config.json`**, at the root of the git repository.
3. **The defaults:**

| Option | Default |
|---|---|
| `branchTypes` | `feature`, `bugfix`, `release`, `spike` |
| `ticketProvider` | `none` |
| `ticketPrefix` | empty |
| `fetchRemoteBranches` | `true` |

Then read what else governs branches here: git hooks (`.husky/`, `lefthook.yml`) can refuse commits on protected branches or enforce naming, and those rules also apply.

Done when you know the allowed types, the ticket provider and the prefix.

## 2. Build the name

```
<type>/<description>
<type>/<ticket>-<description>    when a ticket provider is set
```

- **`<type>`**: a `value` from `branchTypes`.
- **`<ticket>`**: mandatory when `ticketProvider` is not `none`. Ask the user when they gave none.

| Provider | Ticket form | Example |
|---|---|---|
| `none` | no ticket | `feature/add-login` |
| `jira` | upper-case key | `feature/PROJ-123-add-login` |
| `github`, `azure` | number, without `#` | `feature/123-add-login` |

`ticketPrefix` is prepended as-is to a ticket given as a bare number: `PROJ-` turns `123` into `PROJ-123`. A full key such as `OTHER-45` stays unchanged.

- **`<description>`**: a short phrase converted to kebab-case: lowercase; characters other than `a-z`, `0-9`, spaces and `-` removed; spaces become `-`; repeated `-` collapsed; no `-` at either end. "Add user authentication" becomes `add-user-authentication`. Accented letters are removed rather than converted, so write the phrase in plain ASCII.

## 3. Create the branch

Start from the source branch the user named, otherwise the current branch. When `fetchRemoteBranches` is `true`, fetch first; a failed fetch (offline, no credentials) only means remote branches may be outdated, so carry on.

```sh
git fetch --all --prune
git checkout -b "feature/PROJ-123-add-login" "main"
```

From a remote branch, add `--no-track`, otherwise it becomes the upstream and `git push` targets it:

```sh
git checkout --no-track -b "feature/PROJ-123-add-login" "origin/main"
```

Done when `git branch --show-current` prints the new name.
