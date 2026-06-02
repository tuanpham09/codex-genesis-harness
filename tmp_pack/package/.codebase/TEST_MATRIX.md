# Test Matrix

Required checks:

- `scripts/verify.sh`: repository harness structure, skill metadata, contracts, fixtures, and harness smoke test.
- `scripts/run-evals.sh`: install/verify/uninstall regression checks.
- `npm run pack:check`: package contents dry-run.
- Skill validation: run `quick_validate.py` for changed skills when available.

Feature rule: add or update fixtures and expected output before implementation.

