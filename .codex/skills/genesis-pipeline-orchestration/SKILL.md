---
name: genesis-pipeline-orchestration
description: Run end-to-end Codex harness orchestration phases from repository analysis through tests, fixtures, implementation, contracts, memory, docs, and change summaries. Use for autonomous multi-phase work.
---

# Pipeline Orchestration Skill

## Purpose
Make autonomous work phase-gated, resumable, observable, and impossible to complete without verification.

## When to use
Use for end-to-end implementation, multi-session work, or pipelines with several dependent agents.

## When NOT to use
Do not use for small read-only questions.

## Inputs required
Goal, current state, module index, test matrix, contracts, fixtures, and acceptance criteria.

## Outputs required
Phase logs, a machine-readable feature queue, tests, fixtures, implementation, contracts, project verification evidence, a final handoff, memory updates, docs updates, and change summary.

## Runtime lifecycle
Use the CLI as the durable control plane:

1. `genesis-harness run --idea ...` creates the first execution-ready feature.
2. `genesis-harness add-feature ...` appends additional planned features.
3. `genesis-harness next` resolves the single active feature.
4. `genesis-harness complete-feature ...` verifies that feature and promotes the next queued feature.
5. After the final feature, `genesis-harness verify-project ...` reruns every feature proof plus the project proof and creates the handoff.
6. `genesis-harness complete-project ...` moves `RELEASE_READY` to `COMPLETED`.
7. `genesis-harness pipeline-audit` checks queue, state, proof, handoff, and event-history consistency.

Do not treat feature completion as project completion.

## Required tests
Create failing tests in Phase 1 before implementation.

## Required fixtures
Create fixtures in Phase 2 before implementation.

## Required contract updates
Update contracts in Phase 5 and verify implementation matches them.

## Required codebase map updates
Update `.codebase` in Phase 6.

## Token saving rules
Never scan the whole repo first. Read memory, map, and test matrix before source.

## Acceptance criteria
No phase is skipped and the final report includes verification evidence.

## Common mistakes
Combining phases, implementing before fixtures, and leaving state non-resumable.

## Recovery workflow
If interrupted, resume from `.runs/<session-id>/STATE.json`, `RESUME.md`, and append-only `EVENTS.jsonl`, then rerun the relevant verification before continuing.
