# Test Fixture Index

Map every fixture to the contract, test, and module it validates.

| Fixture | Validates | Test / Module |
|---|---|---|
| `fixtures/pipeline/run-to-feature-execution-fixture.md` | `run --idea` advances from discovery into active feature execution with resumable artifacts plus typed API/UI contract scaffolding | `tests/integration/cli-smoke.test.js`, `bin/genesis-harness.js` |
| `fixtures/pipeline/feature-completion-fixture.md` | `next` and `complete-feature` close an active feature only after executable verification and explicit evidence | `tests/integration/cli-smoke.test.js`, `bin/genesis-harness.js` |
| `fixtures/pipeline/end-to-end-project-lifecycle-fixture.md` | Multi-feature promotion, project-wide verification, release-ready handoff, idempotent completion, event history, and pipeline audit | `tests/integration/cli-smoke.test.js`, `bin/genesis-harness.js` |
