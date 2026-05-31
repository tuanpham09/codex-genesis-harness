---
name: codebase-map-skill
description: Maintain repository memory and compressed codebase maps for token-efficient Codex operation. Use when files move, modules change, contracts change, tests change, or repository summaries need updating.
---

# Codebase Map Skill

## Purpose
Keep `.codebase/` accurate so future agents read summaries before source.

## When to use
Use after meaningful code, contract, test, route, provider, pipeline, or architecture changes.

## When NOT to use
Do not use for changes that do not affect repository understanding.

## Inputs required
Changed files, verification results, contracts touched, and current `.codebase` files.

## Outputs required
Updated module index, current state, test matrix, dependency graph, and context summaries.

## Required tests
Run `scripts/verify.sh` after memory updates.

## Required fixtures
Update fixture index when fixtures change.

## Required contract updates
Reflect changed contracts in `.codebase/API_CONTRACTS.md`.

## Required codebase map updates
Update all impacted `.codebase` files.

## Token saving rules
Summaries must be short, link to source locations, and avoid duplicating full manuals.

## Acceptance criteria
Future agents can orient by reading `CURRENT_STATE.md`, `MODULE_INDEX.md`, and `TEST_MATRIX.md`.

## Common mistakes
Letting memory drift, overloading summaries with full docs, and forgetting test matrix changes.

## Recovery workflow
If memory conflicts with code, trust verified code, update memory, and add a known problem entry.

