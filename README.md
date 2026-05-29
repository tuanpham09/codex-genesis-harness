# Project Genesis Harness

Project Genesis Harness is a Codex skill that turns Codex into a project operating harness: planning first, repository inspection, task tracking, test-first implementation, docs synchronization, architecture decisions, Mermaid diagrams, audits, and completion reports.

## Install

### From npm

After the package is published to npm:

```sh
npm install -g @genesis-harness/cli@latest
```

The package auto-installs the Codex skill into:

```txt
~/.agents/skills/project-genesis-harness
~/.codex/skills/project-genesis-harness
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
GENESIS_HARNESS_SKIP_POSTINSTALL=1 npm install -g @genesis-harness/cli@latest
```

### From Git

Clone or download this repository, then run:

```sh
./scripts/install.sh
```

By default, the installer copies the skill to:

```txt
~/.agents/skills/project-genesis-harness
~/.codex/skills/project-genesis-harness
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
./scripts/verify.sh ~/.codex/skills/project-genesis-harness
```

## Uninstall

```sh
./scripts/uninstall.sh
```

## Use

After installing, invoke the skill in Codex when working in a project:

```txt
Use $project-genesis-harness and run /init.
```

The skill supports:

- `/init`
- `/new-feature <description>`
- `/fix-bug <description>`
- `/plan <description>`
- `/audit`
- `/review`
- `/status`

## What Gets Installed

```txt
.codex/skills/project-genesis-harness/
├── SKILL.md
├── agents/openai.yaml
├── resources/
└── scripts/
```

The skill itself can initialize a target project with a `.planning/` knowledge base after the project brief is confirmed.

## Plugin Metadata

This repository includes:

```txt
.codex-plugin/plugin.json
```

The plugin manifest points Codex-compatible plugin tooling at the packaged skill under `.codex/skills/`.

## Publish To npm

The npm package name is:

```txt
@genesis-harness/cli
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

The npm scope `@genesis-harness` must exist and your npm account must have publish rights for it.
