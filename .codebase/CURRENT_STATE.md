# Current System State

**Time**: 2026-06-11
**Status**: `COMPLETED`
**Latest Session**: `2026-06-11-release-readme-prep`
**Time to First Verification (TTFV)**: 60s

## Architectural Position

The Genesis Codex Harness system has a stable initialization bootstrap, explicit verification gates, and a documented repository memory layer.

It is usable as a project harness, but it is still evolving toward a stricter runtime-first architecture.

## Recent Changes (2026-06-03)

- **L08 Feature Registry**: Moved features from prose (`ROADMAP.md`) into a machine-readable `features/REGISTRY.md` with schema enforcement and per-feature `verify_cmd`.
- **L11 Observability**: Bootstrapped the `observability/` folder with live, schema-backed data (`agent-runs`, `failures`, `decision-logs`).
- **L04 Instruction Length**: Refactored `genesis-observability-automation/SKILL.md` to split heavy content into `references/` (reduced from 383 to 148 lines).
- **L03 Cold-Start**: Created `scripts/cold-start-check.js` to automatically verify the repo can answer the 5 core questions without external context.
- **L09 Victory Blocker**: Added `genesis-harness verify-gate` — the agent MUST invoke this to run all tests before claiming done.
- **L12 Debt Log**: Populated `KNOWN_PROBLEMS.md` with 8 tracked technical debt items.
- **L05 Session Continuity**: Added `session_id`, `session_started_at`, and `ttfv_seconds` to `state.json`.
- **L07 Scope Ledger**: Added `scripts/check-scope.sh` to enforce file boundaries via `features/SCOPE-template.md`.
- **L02 Context Scaling**: Added `auto_scale` hints to `.codebase/context-policy.json`.

## Recent Changes (2026-06-10)

- **Auto-init routing**: `genesis-harness` now documents that an empty repo plus a user idea should be treated as implicit `/init`.
- **CLI init bootstrap**: `bin/genesis-harness.js` now supports non-interactive `init --platform ... --yes`, delegates to `init-planning.sh`, and no longer depends on TTY-only behavior.
- **Discovery phase scaffolding**: `init-planning.sh` now creates `.planning/INIT_QA.md`, `01-discovery-and-qa`, and `.codebase/PHASE_DEPENDENCY_MAP.md`.
- **Init regression coverage**: `tests/integration/cli-smoke.test.js` now verifies empty-project init, discovery phase creation, dependency map creation, and QA/tech-stack prompts.
- **Idea-seeded bootstrap**: `init --idea "<brief>"` now seeds `PROJECT.md`, `REQUIREMENTS.md`, `STACK.md`, `SUMMARY.md`, `.codebase/CURRENT_STATE.md`, and `.codebase/state.json` from the first user brief.
- **Pipeline command**: `genesis-harness run --idea ... --yes` now chains init plus discovery-answer persistence so a repo can move from user idea into planning with one deterministic CLI flow.
- **Resumable run artifacts**: `run` now persists `.runs/<session-id>/INPUT.md`, `DISCOVERY.json`, `STATE.json`, and `RESUME.md` so later sessions can re-enter from disk instead of reconstructing context.
- **Resume command**: `genesis-harness resume` now reads or backfills the active run artifact and prints the current state plus next actionable task.
- **Verification hardening**: `verify-gate` now runs structural verify, evals, docs gate, cold-start, pack dry-run, and LeanCTX reporting.
- **Drift cleanup**: plugin metadata, state naming, module index entries, and test-matrix entries are now aligned with the actual runtime behavior.
- **Workflow consolidation**: GitHub Actions now delegate to a reusable `verify-gate` workflow instead of maintaining a separate placeholder docs-sync pipeline.
- **Release hardening**: npm publishing now targets release/manual events, expects GitHub OIDC trusted publishing, and publishes with provenance instead of long-lived tokens plus CI-mutated versions.
- **Feature execution bootstrap**: `genesis-harness run --idea ...` now promotes discovery answers into a real first-feature scaffold under `.planning/features/`, updates `FEATURE_INDEX.md`, and advances state into `IMPLEMENTATION`.
- **Resume enrichment**: run artifacts and `resume` output now include `active_feature`, so the next session can continue the first implementation slice directly.
- **Typed first-slice artifacts**: the first scaffold now infers `ui`, `api`, or `full-stack` surface area and generates specialized contracts and fixtures under `contracts/ui`, `contracts/api`, `playwright/fixtures`, and `fixtures/api`.

## Recent Changes (2026-06-11)

- **Release README preparation**: Root README now documents the v0.1.9 release-candidate bootstrap flow, including `init --idea`, deterministic `run --idea`, `resume`, verify-gate coverage, and npm provenance publishing.
- **Localized release notes**: `README.EN.md`, `README.VI.md`, and `CHANGELOG.md` now summarize the next release candidate and pre-tag consistency checks.
- **Package README fix**: `package.json` now includes `README.EN.md` and `README.VI.md` in the npm tarball so root README language links resolve after publish.
- **Release review risk**: `tmp_pack/package/**` remains a tracked artifact deletion candidate and should be explicitly accepted or restored before the release commit.
- **Verification evidence**: `npm run verify`, `npm run eval`, `npm run pack:check`, `npm pack --dry-run --json`, and `node bin/genesis-harness.js verify-gate` passed on 2026-06-11.

## Active Context Layers

1. **System of Record**: `features/REGISTRY.md` holds the truth for what is planned vs. verified.
2. **Context Policy**: `.codebase/context-policy.json` (Token budget: 12,000, 3 layers).
3. **Execution Gate**: `run-evals.sh` checks structure; `feature_registry.test.js` checks registry content; `check-scope.sh` checks file boundary adherence.

## Next Task Ready

The next session can now safely focus on:
1. Decide whether the tracked `tmp_pack/package/**` deletion is intentional before release.
2. If releasing v0.1.9, bump `package.json`, `.codex-plugin/plugin.json`, and `VERSION` together, then convert `CHANGELOG.md` from `Unreleased` to a dated release.
3. Publish only after the final release commit passes `node bin/genesis-harness.js verify-gate`.
