---
name: docs-skill
description: Keep Codex harness docs synchronized with skills, contracts, tests, memory, and release behavior. Use after any workflow, public interface, install, verification, or package behavior change.
---

# Docs Skill

## Purpose
Keep docs short, accurate, and linked to source-of-truth artifacts.

## When to use
Use after changing skills, CLI behavior, contracts, fixtures, tests, repository memory, or publish flow.

## When NOT to use
Do not use to duplicate full architecture manuals in `AGENTS.md`.

## Inputs required
Changed files, public behavior, verification results, and affected users.

## Outputs required
Updated README, AGENTS map, codebase memory, changelog-style summary, and changed docs list.

## Required tests
Run docs-related verification and package dry-run when docs affect packaging or install instructions.

## Required fixtures
Update templates/examples when docs describe reusable workflows.

## Required contract updates
Update contracts when docs describe new interface behavior.

## Required codebase map updates
Update `.codebase/CURRENT_STATE.md`, `MODULE_INDEX.md`, or summaries as needed.

## Token saving rules
Keep docs concise. Link to templates and contracts instead of repeating them.

## Acceptance criteria
Docs match behavior and do not duplicate large internal manuals.

## Common mistakes
Letting AGENTS.md grow too large, documenting unverified behavior, and missing install docs.

## Recovery workflow
If docs drift, add verify assertions or checklist items that catch the drift next time.

