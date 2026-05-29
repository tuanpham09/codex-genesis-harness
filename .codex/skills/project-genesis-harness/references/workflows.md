# Workflow Reference

Use this file when the requested work is a feature, bug fix, plan, audit, review, or status check.

## Command Mapping

| Intent | Workflow |
|---|---|
| Initialize planning | `/init` |
| Add behavior | `/new-feature` |
| Fix regression | `/fix-bug` |
| Plan without implementing | `/plan` |
| Inspect quality and drift | `/audit` |
| Review changed files | `/review` |
| Summarize current state | `/status` |

## Readiness Gate

- [ ] Intent is confirmed.
- [ ] Required planning docs are read.
- [ ] Local codebase evidence is recorded.
- [ ] External research is cited or marked unavailable.
- [ ] Impact, tests, docs, diagrams, and rollback are known.
- [ ] Escalation risks are resolved.

## Completion Gate

- [ ] Verification passed.
- [ ] Docs were synchronized or declared unnecessary.
- [ ] Tracking files were updated.
- [ ] Changed files were reviewed.
- [ ] Unnecessary files, debug logs, and unrelated changes were removed.

