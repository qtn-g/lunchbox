---
name: release
description: Release the @lunchbox-tools packages to npm, from version bump to verified install.
disable-model-invocation: true
metadata:
  internal: true
---

# Release

All `@lunchbox-tools/*` packages are in one **fixed** group ([.changeset/config.json](../../../.changeset/config.json)): they share a version and bump together, and the highest pending bump applies to all of them.

Publishing is manual for now: the Release workflow fails on `npm publish` with `403 OIDC permission denied for this action` (seen on v1.2.0, cause unknown). The token exchange succeeds and the upload is refused. No published version has trusted publishing or provenance, so CI has never published these packages. When a tag finally publishes from CI, drop step 4 and update this paragraph.

Each outward step below (pushing, publishing, tagging) needs the user's go-ahead unless they asked for the whole release. Publishing also needs their npm login.

## 1. Prepare

```sh
git checkout master && git pull --ff-only
pnpm install --frozen-lockfile
pnpm changeset status
```

Done when the tree is clean, `master` matches `origin/master`, and the status lists the bump. Tell the user the resulting version.

## 2. Bump the version

```sh
pnpm versions
```

This sets `version` in every `package.json`, updates each `CHANGELOG.md`, and deletes the consumed changesets.

Done when every package and `docs` show the new version and the changelogs read correctly.

## 3. Commit and validate

Commit on `master`, then push. Use `release(<scopes>): <x.y.z>` with the scopes of `scripts/commit.mjs` (e.g. `release(commit, branch, core): 1.2.0`). The pre-commit hook runs lint and tests.

```sh
git add -A
git commit -m "release(commit, branch, core): <x.y.z>"
git push origin master
```

Done when the `Validate` workflow succeeds on that commit. Check it on the Actions page or at `https://api.github.com/repos/qtn-g/lunchbox/actions/runs?head_sha=<sha>`.

## 4. Build and publish

Build from this exact commit, since `publish` does not rebuild and the executables embed their version:

```sh
pnpm run build
node packages/commit/dist/cli.mjs --version
```

Once it prints the new version, the user publishes from the same commit, because npm asks for their login or a one-time code:

```sh
npm login                                 # when `npm whoami` fails
pnpm -r publish --access public
```

`-r` publishes every non-private package whose version is missing from npm.

A brand new package must be published this way anyway: trusted publishing is configured per package, so the package has to exist first. Afterwards, add the trusted publisher in its settings on npmjs.com.

Done when the registry serves the new version as `latest` for every package. npm answers `202` and processes for a few minutes, and its endpoints catch up at different times, so check the package-level data rather than the version URL:

```sh
npm view @lunchbox-tools/<name> dist-tags.latest --prefer-online
```

## 5. Tag

Tag the release commit only after step 4 is done. `changeset publish` skips versions it can see on npm and retries any it cannot, which fails.

```sh
git tag v<x.y.z>
git push origin v<x.y.z>
```

Done when the `Release` workflow finishes. Report its result: it should skip every package, and a failure of the Publish job changes nothing on npm.

## 6. Verify

Run the published packages with an empty cache, the way a new user gets them:

```sh
cd "$(mktemp -d)" && git init -q
NPM_CONFIG_CACHE="$PWD/.cache" npx --yes @lunchbox-tools/<name> --version
```

Done when every published package prints the new version. On a machine that already used these packages, `npx` can fail with `ETARGET` until its cache expires; `npx --prefer-online` gets past it, and new users are unaffected.
