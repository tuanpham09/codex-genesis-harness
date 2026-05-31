---
name: pipeline-orchestration-skill
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
Phase logs, tests, fixtures, implementation, contracts, memory updates, docs updates, and change summary.

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
If interrupted, resume from the last completed phase log and rerun verification before continuing.

