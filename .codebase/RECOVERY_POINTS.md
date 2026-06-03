# Recovery Points

A reverse-chronological log of stable states to return to if the current task corrupts the project.

---

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
