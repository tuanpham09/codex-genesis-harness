# Test Matrix

Required checks:

- `scripts/verify.sh`: repository harness structure, skill metadata, contracts, fixtures, harness smoke test, and `SKILL.md` progressive-disclosure line limit.
- `scripts/run-evals.sh`: install/verify/uninstall regression checks, manifest route checks, sync-generated Mermaid relationship checks, hook docs-gate checks, LeanCTX policy checks, handoff/state freshness checks, `tests/unit/*.test.js`, and `tests/integration/*.test.js`.
- `tests/integration/cli-smoke.test.js`: package CLI smoke for install/postinstall LeanCTX seeding, `path`, `status`, `docs`, `docs-gate`, `leanctx`, `prime`, `sync`, non-interactive `init`, `init --idea`, deterministic `run --idea`, automatic first-feature execution scaffolding, resumable `.runs/<session-id>` artifacts, and `resume`.
- `tests/unit/prompt_sentinel.test.js`: LeanCTX-backed prompt sentinel threshold and truncation behavior.
- `tests/unit/state_metadata.test.js`: keeps `.codebase/CURRENT_STATE.md` and `.codebase/state.json` aligned for session, TTFV, legal state enums, and non-stale completion timestamps.
- `tests/unit/verify_gate.test.js`: verifies that `verify-gate` includes evals, docs-gate, pack dry-run, and LeanCTX checks.
- `tests/unit/workflow_contracts.test.js`: verifies CI workflows delegate to the reusable `verify-gate` path, pin critical actions, and use trusted npm publishing with provenance.
- `npm run pack:check`: package contents dry-run.
- Skill validation: run `quick_validate.py` for changed skills when available.

Feature rule: add or update fixtures and expected output before implementation.
