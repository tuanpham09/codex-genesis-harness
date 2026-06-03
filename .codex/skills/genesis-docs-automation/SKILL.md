---
name: genesis-docs-automation
description: "Automatically synchronize documentation with code changes across all project phases. Use after implementation, contract changes, docs-gate failures, or release readiness checks."
---

# Genesis Docs Automation

## Purpose
Keep docs, changelogs, implementation handoffs, and `.codebase` memory synchronized with code, contract, test, and phase changes.

## When to use
- After implementation changes pass tests.
- When API, SDK, UI, E2E, configuration, or contract files change.
- When `genesis-harness docs-gate` reports drift.
- Before release or handoff.

## When NOT to use
- Pure typo/formatting edits with no technical behavior change.
- Exploratory review before any changed files are known.
- Generated package output checks that do not alter repo documentation.

## Inputs required
- Changed files from git diff or implementation summary.
- Current contracts, fixtures, tests, and `.codebase` state.
- Phase or feature context when available.
- Verification output proving implementation status.

## Outputs required
- Updated API/reference docs when contracts changed.
- Updated changelog or spec changelog for behavior changes.
- Updated implementation handoff for completed work.
- Updated `.codebase/CURRENT_STATE.md` and related memory when state changes.
- Docs validation result from `genesis-harness docs-gate`.

## Required tests
- Run `genesis-harness docs-gate`.
- Run affected docs/link/schema checks when available.
- Run `scripts/run-evals.sh` when docs automation or gate behavior changes.

## Required fixtures
- Use templates in `templates/` for changelog entries and handoffs.
- Use examples in `examples/` to keep output shape consistent.
- Add fixture expectations when changing generated docs behavior.

## Required contract updates
- Update `contracts/` first when public API, agent, event, or UI contract behavior changes.
- Keep `.codebase/API_CONTRACTS.md` aligned with contract files.
- Add migration notes for breaking changes.

## Required codebase map updates
- Update `.codebase/CURRENT_STATE.md` after meaningful implementation or gate changes.
- Update `.codebase/TEST_MATRIX.md` when docs validation coverage changes.
- Update `.codebase/RECOVERY_POINTS.md` when adding or changing recovery behavior.

## Token saving rules
- Read `.codebase` summaries before full documents.
- Report only changed sections and verification evidence.
- Use templates and playbooks instead of repeating long instructions.

## Acceptance criteria
- Every behavior-affecting change has matching docs or an explicit non-applicable note.
- Handoff contains real current-state data, not placeholders.
- `genesis-harness docs-gate`, `scripts/verify.sh`, and `scripts/run-evals.sh` pass after harness docs changes.

## Common mistakes
- Claiming docs auto-trigger behavior that is not wired to a CLI or hook.
- Leaving placeholder handoff content.
- Updating docs without updating `.codebase` state.
- Treating E2E or Playwright template presence as executable E2E coverage.

## Recovery workflow
1. Run `genesis-harness docs-gate` to identify drift.
2. Use `templates/handoff-template.md` or changelog templates to restore missing artifacts.
3. Re-run `scripts/run-evals.sh`.
4. Record unresolved drift in `.codebase/RECOVERY_POINTS.md`.

## Workflow references
- `checklists/docs-validation.md`: detailed validation checklist.
- `checklists/spec-alignment.md`: cross-phase alignment checklist.
- `playbooks/auto-update-flow.md`: full docs sync flow.
- `templates/handoff-template.md`: handoff output shape.
- `observability/docs-tracking.md`: docs metrics and tracking format.
