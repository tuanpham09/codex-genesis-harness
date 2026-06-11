# Run To Feature Execution Fixture

## Input

- Command: `genesis-harness run --idea "<brief>" --yes ...`
- Discovery answers: product approach, primary user, v1 outcome, QA owner, stack, deployment, and test strategy

## Expected Output

- `.planning/features/<NNN>-<slug>/` exists
- `SPEC.md`, `PLAN.md`, `TEST_CONTRACT.md`, `TASKS.md`, `VERIFICATION.md`, and `DIAGRAM.mmd` are seeded for the first active slice
- `contracts/ui/<feature>/screen-contract.json` exists when the first slice is UI-capable
- `playwright/fixtures/<feature>-ui-fixture.md` exists when the first slice is UI-capable
- `contracts/api/<feature>/request.json` and `response.json` exist when the first slice is API-capable
- `fixtures/api/<feature>-api-fixture.md` exists when the first slice is API-capable
- `.planning/FEATURE_INDEX.md` registers the active slice
- `.planning/STATE.md` advances to `02 First Feature Execution`
- `.codebase/state.json` advances to `IMPLEMENTATION`
- `.runs/<session-id>/STATE.json` mirrors the same `IMPLEMENTATION` state and `active_feature`
- `genesis-harness resume` reports the active feature and the next implementation task
