# GitHub Setup

Steps required to enable the CI/CD workflows in this repository.

## 1. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

This allows the `docs.yml` workflow to deploy the VitePress site.

## 2. Add the NPM_TOKEN secret

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: a valid npm access token with `publish` permission for the `@lunchbox-tools` scope
5. Click **Add secret**

This is used by the `release.yml` workflow to publish packages.

## 3. Verify branch protection (optional)

If you use branch protection on `master`, ensure:

- The **Deploy Docs** workflow is allowed to run on push to `master`
- The **Release** workflow is allowed to run on tag pushes (`v*`)

## Workflow Summary

| Workflow | Trigger | Purpose |
|---|---|---|
| `validate.yml` | Push / PR | Lint + build + test |
| `docs.yml` | Push to `master` | Build & deploy VitePress docs to GitHub Pages |
| `release.yml` | Push `v*` tag | Build, test, and publish packages to npm |
