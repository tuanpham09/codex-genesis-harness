---
name: spec-impact-engine
description: Automatically detect specification changes, calculate impact severity on downstream phases, generate migration guidance, and prevent cascading rework.
---

# Spec Impact Engine

## Purpose
Classify spec changes, calculate downstream impact, and produce an actionable propagation report before dependent implementation continues.

## When to use
- A requirement, API, database, UI, auth, config, or integration spec changes.
- A phase begins and upstream specs may have changed.
- A breaking change needs migration planning.
- `/spec-change`, `/propagate-spec`, or `/validate-specs` is requested.

## When NOT to use
- Pure formatting or typo changes.
- Implementation-only changes with no public or phase contract effect.
- Review-only tasks where no spec changed.

## Inputs required
- Changed spec files or git diff.
- `.codebase/PHASE_DEPENDENCY_MAP.md` when present.
- Relevant contracts, fixtures, and phase docs.
- Current roadmap and test matrix.

## Outputs required
- Impact report with severity, affected phases, and required actions.
- Migration guide for breaking changes.
- Recommended verification subset.
- Follow-up handoff notes for `genesis-spec-propagation`.

## Required tests
- Add or update expected-output fixtures when impact report shape changes.
- Run affected contract/fixture checks.
- Run `scripts/run-evals.sh` after changing this skill or detection script.

## Required fixtures
- Use `templates/impact-report.md` for report shape.
- Use `templates/migration-guide.md` for breaking changes.
- Keep example outputs in `examples/` aligned with template changes.

## Required contract updates
- Update `contracts/` if public input/output shape changes.
- Mark breaking contract changes before implementation.
- Keep `.codebase/API_CONTRACTS.md` synchronized.

## Required codebase map updates
- Update `.codebase/CURRENT_STATE.md` when impact analysis changes current work.
- Update `.codebase/TEST_MATRIX.md` if required verification changes.
- Record unresolved risks in `.codebase/RECOVERY_POINTS.md`.

## Token saving rules
- Inspect changed spec snippets first, not full phase folders.
- Use the phase dependency map before broad searches.
- Summarize unaffected phases instead of expanding them.

## Acceptance criteria
- Each changed spec is classified as breaking, feature, or internal.
- All affected phases are listed with severity and action.
- Breaking changes include migration guidance.
- Recommended verification is explicit.

## Common mistakes
- Treating optional field additions as no-impact without checking E2E/UI.
- Ignoring transitive downstream dependencies.
- Producing a report without required next actions.
- Updating downstream files directly before impact classification.

## Recovery workflow
1. Re-run detection on the smallest changed-file set.
2. If severity is unclear, mark it medium and require manual review.
3. Hand off affected phases to `genesis-spec-propagation`.
4. Record unresolved uncertainty in `.codebase/RECOVERY_POINTS.md`.

## Workflow references
- `checklists/checklist.md`: required impact checklist.
- `templates/impact-report.md`: report template.
- `templates/migration-guide.md`: migration template.
- `detect-spec-changes.sh`: local detection helper.
