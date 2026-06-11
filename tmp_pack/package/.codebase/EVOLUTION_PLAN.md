# Evolution Plan

## Current Weaknesses Identified

- The repo started with a small skill set and limited harness-wide specialization.
- Repository memory was absent, so future sessions had to rediscover structure.
- Contracts, fixtures, Playwright templates, and observability templates were not first-class package artifacts.
- Verification did not enforce memory, contracts, fixtures, or skill protocol consistency.
- Installer scripts knew only the initial Genesis skills.

## Target Architecture

- Skills are modular under `.codex/skills/`.
- Memory is compressed under `.codebase/` and `.codebase/context/`.
- Contracts live under `contracts/`.
- Fixtures live under `fixtures/`.
- Harness tests live under `tests/` and `playwright/`.
- Autonomous run evidence lives under `observability/`.

## Implementation Sequence

1. Add failing verification for required harness artifacts.
2. Create memory, contracts, fixtures, tests, Playwright, and observability templates.
3. Add modular skills with `SKILL.md`, `templates/`, `examples/`, and `checklists/`.
4. Update installer and package metadata to include all artifacts.
5. Update AGENTS and README as maps, not manuals.
6. Run verify, evals, skill validation, CLI smoke tests, and package dry-run.

## Next Hardening Pass

- Add machine-readable schema validation for contract JSON.
- Add snapshot tests for package tarball file lists.
- Add a release checklist that blocks publish when ignored generated files are tracked.
- Add forward-testing prompts for each skill against realistic downstream repositories.

