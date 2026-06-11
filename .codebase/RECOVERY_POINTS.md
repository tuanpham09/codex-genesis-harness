# Recovery Points

A reverse-chronological log of stable states to return to if the current task corrupts the project.

---

## 2026-06-10T10:05:00Z: Feature Execution Bootstrap
- **Status**: Stable
- **Git State**: Working tree verified after `run`/`resume` orchestration started auto-scaffolding the first execution-ready feature.
- **Why it's stable**: `tests/integration/cli-smoke.test.js`, `scripts/verify.sh`, `scripts/run-evals.sh`, and `genesis-harness verify-gate` now cover the handoff from discovery into `IMPLEMENTATION` with `active_feature` persisted in `.runs/`.
- **How to recover**: Reapply from this point if `run --idea` falls back to `PLANNING`, if `.planning/features/<NNN>-...` stops being created automatically, or if `resume` loses the active feature checkpoint.
- **Files changed**: `bin/genesis-harness.js`, `tests/integration/cli-smoke.test.js`, `fixtures/pipeline/run-to-feature-execution-fixture.md`, and `.codebase/*.md`.

## 2026-06-10T10:25:00Z: Typed First-Slice Contract Bootstrap
- **Status**: Stable
- **Git State**: Working tree verified after the first feature scaffold started emitting API/UI-specific contracts and fixtures.
- **Why it's stable**: `run --idea` now creates `contracts/ui`, `contracts/api`, `playwright/fixtures`, and `fixtures/api` artifacts when the discovery answers imply those surfaces, and `tests/integration/cli-smoke.test.js` locks the generated paths and tailored values.
- **How to recover**: Reapply from this point if the first feature loses typed contract scaffolding, if generated routes/endpoints regress to generic placeholders, or if `TEST_CONTRACT.md` stops referencing the generated contract paths.
- **Files changed**: `bin/genesis-harness.js`, `tests/integration/cli-smoke.test.js`, `fixtures/pipeline/run-to-feature-execution-fixture.md`, `tests/fixtures/fixture-index.md`, and `.codebase/*.md`.

## 2026-06-10T08:34:56Z: Workflow Consolidation + Trusted Publish Hardening
- **Status**: Stable
- **Git State**: Working tree verified after CI workflow consolidation, registry cleanup, and release-path hardening.
- **Why it's stable**: GitHub Actions now reuse a single `verify-gate` path, release publishing expects OIDC trusted publishing with provenance, and workflow contract tests block drift back to placeholder CI logic.
- **How to recover**: Reapply from this point if CI starts bypassing `verify-gate`, if docs-sync regains custom placeholder logic, or if npm publishing falls back to long-lived tokens and mutable CI version rewrites.
- **Files changed**: `.github/workflows/*.yml`, `tests/unit/workflow_contracts.test.js`, `features/REGISTRY.md`, and `.codebase/*.md`.

## 2026-06-10T16:45:00+07:00: Resume + Run Artifact Hardening
- **Status**: Stable
- **Git State**: Working tree verified after resumable run-artifact and state-invariant changes.
- **Why it's stable**: `run` now writes per-session `.runs/<session-id>` artifacts, `resume` can backfill and report from them, and state metadata tests block stale timestamps.
- **How to recover**: Reapply from this point if mid-project resume loses the next task, if `.runs/` stops being populated, or if `completed_at` drifts behind the active session.
- **Files changed**: `bin/genesis-harness.js`, `.codebase/state.json`, `.codebase/*.md`, `scripts/run-evals.sh`, and CLI/unit test coverage.

## 2026-06-10T14:20:00+07:00: Auto-init + Discovery Bootstrap
- **Status**: Stable
- **Git State**: Working tree verified after init bootstrap changes.
- **Why it's stable**: `tests/integration/cli-smoke.test.js`, `scripts/verify.sh`, `scripts/run-evals.sh` (with temporary npm cache override), and `npm run pack:check` pass.
- **How to recover**: Reapply from this point if init stops creating `.planning/INIT_QA.md`, `01-discovery-and-qa`, or `.codebase/PHASE_DEPENDENCY_MAP.md`.
- **Files changed**: `bin/genesis-harness.js`, `init-planning.sh`, `genesis-harness` skill routing docs, and init smoke coverage.

## 2026-06-10T14:55:00+07:00: Idea-Seeded Planner Bootstrap
- **Status**: Stable
- **Git State**: Working tree verified after brief-to-planning bootstrap changes.
- **Why it's stable**: `init --idea "<brief>"` now fills planning docs and planner state, and verification still passes on `cli-smoke`, `verify.sh`, `run-evals.sh`, and `pack:check`.
- **How to recover**: Reapply from this point if user brief content stops propagating into `PROJECT.md`, `REQUIREMENTS.md`, `STACK.md`, `SUMMARY.md`, or `.codebase/state.json`.
- **Files changed**: `bin/genesis-harness.js`, `init-planning.sh`, `genesis-harness` prompt/routing docs, and init smoke coverage.

## 2026-06-10T15:05:00+07:00: Runtime Pipeline + Verification Hardening
- **Status**: Stable
- **Git State**: Working tree verified after runtime pipeline, gate hardening, and metadata drift fixes.
- **Why it's stable**: `genesis-harness run --idea ... --yes` now advances a blank repo into planning with persisted discovery answers, and `verify-gate` now matches the required completion contract.
- **How to recover**: Reapply from this point if `run` stops filling planning docs, if `verify-gate` stops executing evals/docs/pack checks, or if plugin/package/state metadata drift returns.
- **Files changed**: `bin/genesis-harness.js`, `init-planning.sh`, `.codex-plugin/plugin.json`, `.codebase/*.md`, `.codebase/state.json`, `scripts/run-evals.sh`, and CLI/unit/integration tests.

## 2026-06-03T09:55:00+07:00: Full Score Harness Fix (110/110)
- **Status**: Stable
- **Git State**: Everything committed + new features added.
- **Why it's stable**: All tests (`tests/unit/*.test.js`), `verify.sh`, `run-evals.sh`, and `cold-start-check.js` pass with exit code 0.
- **How to recover**: `git reset --hard HEAD` (assuming commit happens immediately after this)
- **Files added**: `features/REGISTRY.md`, `scripts/cold-start-check.js`, `scripts/check-scope.sh`, observability schemas/samples.

## 2026-06-03T09:30:00+07:00: LeanCTX + CLI Postinstall Seed
- **Status**: Stable
- **Why it's stable**: `npm run verify` and `npm run eval` pass. `context-policy.json` successfully bootstrapped.
- **How to recover**: Return to commit before the evaluation score fixes.

## 2026-06-03T08:35:00+07:00: Harness Drift Gate Hardening
- **Status**: Stable
- **Why it's stable**: `npm run verify`, `npm run eval`, and `npm run pack:check` all pass.
- **How to recover**: Revert to branch state before LeanCTX introduction.
