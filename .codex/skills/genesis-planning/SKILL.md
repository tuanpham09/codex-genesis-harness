---
name: planning-skill
description: Create decision-complete plans for Codex harness work, including tests, fixtures, contracts, memory updates, verification, and recovery. Use for new features, refactors, bug fixes, audits, or multi-phase autonomous work.
---

# Planning Skill

## Purpose
Turn intent into a test-first, contract-first, resumable implementation plan.

## When to use
Use before any non-trivial change, multi-file task, bug fix, refactor, or autonomous workflow.

## When NOT to use
Do not use for direct answers that require no repository mutation.

## Inputs required
Read `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, `.codebase/TEST_MATRIX.md`, plus relevant contracts.

## Outputs required
Goal, success criteria, tests, fixtures, contracts, implementation phases, verification, memory updates, and rollback path.

## Required tests
Define the first failing test and expected failure reason.

## Required fixtures
List exact fixture files and expected outputs.

## Required contract updates
Identify contract files that must be created or changed.

## Required codebase map updates
List `.codebase` files to update after implementation.

## Token saving rules
Plan from memory summaries first; inspect only files needed to remove uncertainty.

## Acceptance criteria
An implementer can execute without making design decisions.

## Common mistakes
Planning implementation before tests, omitting fixtures, and leaving verification vague.

## Recovery workflow
If a plan becomes invalid, update the failing test and fixture first, then revise phases.

