# Quality Rubric

Use this file when updating `.planning/QUALITY_SCORE.md`.

| Score | Meaning |
|---:|---|
| 0 | Unknown, absent, or not evaluated |
| 2 | Known major gaps with no mitigation |
| 4 | Basic structure exists but is inconsistent or mostly manual |
| 6 | Working baseline with known gaps and follow-up tasks |
| 8 | Strong, verified, documented, and mostly automated |
| 10 | Mature, automated, documented, reviewed, and low-risk |

## Areas

- Architecture: module boundaries, dependency direction, diagrams, ADRs, forbidden patterns.
- Tests: regression coverage, smoke tests, edge cases, failing-first evidence, repeatability.
- Docs Sync: behavior docs, changelog entries, impact matrix compliance.
- Security: auth, secrets, data protection, dependency risk, destructive-operation safeguards.
- Maintainability: naming, duplication, dead code, conventions, module size, refactor risk.
- Observability: logs, metrics, traces, errors, health checks, debug commands, inspection workflow.
