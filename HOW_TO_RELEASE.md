# How to release

Releases are driven by [Changesets](https://github.com/changesets/changesets) and a tag-triggered GitHub Actions workflow.

- All `@lunchbox-tools/*` packages are in a **fixed** group (see [.changeset/config.json](.changeset/config.json)): they always share the same version and are bumped together.
- Pushing a `v*` tag runs [.github/workflows/release.yml](.github/workflows/release.yml): lint → build → test → `pnpm changeset publish` to npm.
- Pushes to `master` also redeploy the docs (`docs.yml`) and run `validate.yml`.

## Release steps

### 1. Describe changes while developing

For every user-facing change, add a changeset in the PR/branch that makes it:

```sh
pnpm changeset
```

Pick the affected packages and the bump type (`patch` / `minor` / `major`), and write a short summary. Commit the generated `.changeset/*.md` file with your change.

Because the packages are fixed-versioned, the highest bump among the selected packages applies to all of them.

### 2. Prepare the release (on `master`, clean and up to date)

```sh
git checkout master && git pull
```

Then consume the changesets:

```sh
pnpm versions        # runs `changeset version`
```

This bumps `version` in each `package.json`, updates each `CHANGELOG.md`, and deletes the consumed changeset files. Review the diff.

> Note: `docs/package.json` and `docs/CHANGELOG.md` were versioned alongside the packages in v1.0.0. Check that they are updated too, and bump manually if not.

### 3. Commit the version bump

Use the repo's commit convention (`pnpm commit`), for example:

```sh
git add -A
pnpm commit    # e.g. chore(commit, branch, config): vX.Y.Z
git push origin master
```

Wait for `validate.yml` to pass on `master`.

### 4. Tag and push

The tag must match the new version and start with `v`:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

This triggers the Release workflow, which publishes to npm.
