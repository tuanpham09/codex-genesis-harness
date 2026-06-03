# Test Matrix

Required checks:

- `scripts/verify.sh`: repository harness structure, skill metadata, contracts, fixtures, harness smoke test, and `SKILL.md` progressive-disclosure line limit.
- `scripts/run-evals.sh`: install/verify/uninstall regression checks, manifest route checks, sync-generated Mermaid relationship checks, hook docs-gate checks, LeanCTX policy checks, handoff/state freshness checks, `tests/unit/*.test.js`, and `tests/integration/*.test.js`.
- `tests/integration/cli-smoke.test.js`: package CLI smoke for install/postinstall LeanCTX seeding, `path`, `status`, `docs`, `docs-gate`, `leanctx`, `prime`, and `sync` in temporary fixture repositories.
- `tests/unit/prompt_sentinel.test.js`: LeanCTX-backed prompt sentinel threshold and truncation behavior.
- `npm run pack:check`: package contents dry-run.
- Skill validation: run `quick_validate.py` for changed skills when available.

Feature rule: add or update fixtures and expected output before implementation.
