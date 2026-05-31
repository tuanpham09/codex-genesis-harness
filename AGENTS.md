# AGENTS.md

This repository packages the Genesis Codex skill set.

## Workflow

Before any task, read:

1. `.codebase/CURRENT_STATE.md`
2. `.codebase/MODULE_INDEX.md`
3. `.codebase/TEST_MATRIX.md`

Then inspect only relevant files.

Default order:

1. Create or update the failing test.
2. Create fixture and expected output.
3. Update contract if behavior changes.
4. Implement the minimum change.
5. Run verification.
6. Update docs and `.codebase` memory.
7. Record risks or recovery notes when needed.

## Skills

Primary skills live under `.codex/skills/`:

- `genesis-harness`
- `genesis-new-design`
- `genesis-upgrade-design`
- `architecture-skill`
- `planning-skill`
- `codebase-map-skill`
- `design-spec-skill`
- `api-contract-skill`
- `ui-ux-test-skill`
- `harness-engineering-skill`
- `ai-provider-skill`
- `pipeline-orchestration-skill`
- `research-skill`
- `docs-skill`
- `release-skill`

Each skill must keep `SKILL.md`, `templates/`, `examples/`, and `checklists/`.

## Memory

Repository memory lives in `.codebase/`.

Compressed summaries live in `.codebase/context/`.

Keep memory short and current. Do not duplicate long manuals here.

## Contracts And Fixtures

Contracts live in `contracts/`.

Fixtures live in `fixtures/`.

Every behavior change should have a contract or fixture update when public input/output changes.

## Tests

Harness verification:

```sh
./scripts/verify.sh
./scripts/run-evals.sh
npm run pack:check
```

Test architecture templates live in `tests/` and `playwright/`.

## Safety

Keep this file a map. Put durable detail in `.codebase/`, contracts, fixtures, skill templates, or README.

Do not claim completion without verification evidence.
