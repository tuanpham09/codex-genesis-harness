# Project Genesis Harness

Project Genesis Harness packages the Genesis Codex skill set: project planning, repository inspection, task tracking, verification, docs synchronization, architecture decisions, audits, and frontend web design workflows.

## Install

### From npm

Install the latest published package globally:

```sh
npm install -g codex-genesis-harness@latest
```

The package auto-installs the Genesis skills into:

```txt
~/.agents/skills/genesis-harness
~/.agents/skills/genesis-new-design
~/.agents/skills/genesis-upgrade-design
~/.codex/skills/genesis-harness
~/.codex/skills/genesis-new-design
~/.codex/skills/genesis-upgrade-design
```

You can also manage it manually:

```sh
genesis-harness install
genesis-harness verify
genesis-harness uninstall
```

Install only one target:

```sh
genesis-harness install --target agents
genesis-harness install --target legacy
genesis-harness install --target both
```

To skip auto-install during npm installation:

```sh
GENESIS_HARNESS_SKIP_POSTINSTALL=1 npm install -g codex-genesis-harness@latest
```

### From Git

Clone or download this repository, then run:

```sh
./scripts/install.sh
```

By default, the installer copies the Genesis skills to:

```txt
~/.agents/skills/genesis-harness
~/.agents/skills/genesis-new-design
~/.agents/skills/genesis-upgrade-design
~/.codex/skills/genesis-harness
~/.codex/skills/genesis-new-design
~/.codex/skills/genesis-upgrade-design
```

If you use a custom Codex home:

```sh
CODEX_HOME=/path/to/.codex ./scripts/install.sh
```

If you use a custom modern skills home:

```sh
GENESIS_HARNESS_HOME=/path/to/.agents ./scripts/install.sh
```

## Verify

```sh
./scripts/verify.sh
```

Verify an installed copy:

```sh
./scripts/verify.sh ~/.codex/skills
```

## Uninstall

```sh
./scripts/uninstall.sh
```

## Use

After installing, invoke the skills in Codex when working in a project:

```txt
Use $genesis-harness and run /init.
Use $genesis-new-design to design and build a premium landing page for a developer tool.
Use $genesis-upgrade-design to improve the existing dashboard UI without changing behavior.
```

`genesis-harness` supports:

- `/init`
- `/new-feature <description>`
- `/fix-bug <description>`
- `/plan <description>`
- `/audit`
- `/review`
- `/status`

## What Gets Installed

```txt
.codex/skills/
├── genesis-harness/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── resources/
│   └── scripts/
├── genesis-new-design/
│   ├── SKILL.md
│   └── agents/openai.yaml
└── genesis-upgrade-design/
    ├── SKILL.md
    └── agents/openai.yaml
```

`genesis-harness` can initialize a target project with a `.planning/` knowledge base after the project brief is confirmed. `genesis-new-design` and `genesis-upgrade-design` guide frontend web design creation and upgrades.

## Plugin Metadata

This repository includes:

```txt
.codex-plugin/plugin.json
```

The plugin manifest points Codex-compatible plugin tooling at the packaged Genesis skill set under `.codex/skills/`.

## Publish To npm

The npm package name is:

```txt
codex-genesis-harness
```

Publish flow:

```sh
npm login
npm run verify
npm run eval
npm run pack:check
npm version patch
npm publish --access public
```

The package is intentionally unscoped so it can be published by the token owner without requiring a pre-created npm organization or scope.

## GitHub Actions npm Publish

This repository includes `.github/workflows/publish-npm.yml`.

On every push to `main`, the workflow:

1. runs `npm run verify`
2. runs `npm run eval`
3. runs `npm run pack:check`
4. derives a unique CI version like `0.1.0-ci.123.1`
5. publishes `codex-genesis-harness` to npm with the `latest` tag

Required GitHub secret:

```txt
NPM_TOKEN
```

Create it from npm with publish permission for `codex-genesis-harness`, then add it under:

```txt
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

If GitHub Actions fails with `npm ERR! code E403` during `npm publish`, npm accepted the token format but rejected the publish authorization. Fix the npm-side credentials before re-running the workflow:

1. Confirm the token belongs to an npm account that owns `codex-genesis-harness`, or can create the package if this is the first publish.
2. Prefer an npm automation token with publish rights for CI. Granular tokens must include package write access.
3. If the package name is already owned by another account or organization, either transfer/grant access on npm or rename/scope the package in `package.json`.
4. Replace the GitHub `NPM_TOKEN` secret after rotating the token.

The workflow validates `NPM_TOKEN` and package visibility before running the expensive verification and publish steps so credential problems fail with an actionable error.
