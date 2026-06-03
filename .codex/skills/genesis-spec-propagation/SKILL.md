---
name: genesis-spec-propagation
description: "Automated specification propagation across project phases. Use after spec changes to update affected tests, contracts, client expectations, E2E scenarios, docs, and migration guidance."
---

# Genesis Spec Propagation

## Purpose
Prevent downstream phase drift after a spec change by identifying affected phases, updating dependent artifacts, and validating alignment.

## When to use
- After `/spec-change` or a contract/spec edit.
- When API, database, UI, auth, config, or integration shape changes.
- Before starting downstream work that depends on an updated upstream phase.
- When `spec-impact-engine` reports affected phases.

## When NOT to use
- Pure prose edits that do not alter behavior, schemas, routes, or phase dependencies.
- One-off implementation bugs where no public or phase contract changed.
- Cosmetic docs edits with no downstream dependency.

## Inputs required
- Changed spec or contract files.
- Impact report from `spec-impact-engine` when available.
- `.codebase/PHASE_DEPENDENCY_MAP.md` or equivalent dependency notes.
- Current tests, fixtures, and docs for affected phases.

## Outputs required
- Updated downstream phase specs, mocks, tests, contracts, and E2E scenarios.
- Migration guide for breaking changes.
- Propagation summary in `.codebase` or observability logs.
- Verification evidence for affected phases.

## Required tests
- Run affected unit/integration/E2E checks where executable tests exist.
- Run `scripts/run-evals.sh` after changing propagation skill behavior.
- Validate all updated contracts and fixtures.

## Required fixtures
- Update affected request/response, UI, agent, pipeline, or render fixtures.
- Add expected-output fixtures for generated migration or impact reports.

## Required contract updates
- Update `contracts/` before dependent tests or implementation.
- Mark breaking changes explicitly and include migration instructions.
- Keep `.codebase/API_CONTRACTS.md` and phase docs aligned.

## Required codebase map updates
- Update `.codebase/CURRENT_STATE.md` with propagation status.
- Update `.codebase/TEST_MATRIX.md` if validation coverage changes.
- Update `.codebase/RECOVERY_POINTS.md` for unresolved propagation risks.

## Token saving rules
- Read the impact report and phase dependency map before full specs.
- Load only affected phase files.
- Report failing or changed checks, not all passing detail.

## Acceptance criteria
- Every impacted downstream artifact is updated or explicitly marked non-applicable.
- Breaking changes have migration guidance.
- Affected verification passes.
- `.codebase` records propagation status and remaining risks.

## Common mistakes
- Updating Phase 1 contracts without Phase 2-5 dependent tests.
- Auto-updating E2E expectations without semantic review.
- Omitting migration notes for breaking changes.
- Treating low severity as no-op without documenting why.

## Recovery workflow
1. Re-read the impact report and dependency map.
2. Restore the last known aligned contracts/fixtures if propagation fails.
3. Re-apply changes one affected phase at a time.
4. Record unresolved risk in `.codebase/RECOVERY_POINTS.md`.

## Workflow references
- `checklists/spec-change-detection.md`: impact classification checklist.
- `checklists/phase-update-verification.md`: downstream update checklist.
- `playbooks/feature-change-propagation.md`: additive change workflow.
- `playbooks/breaking-change-propagation.md`: breaking change workflow.
- `templates/migration-guide-template.md`: migration guide shape.
- `observability/propagation-tracking.md`: tracking and metrics format.
