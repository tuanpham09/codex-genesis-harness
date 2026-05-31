---
name: architecture-skill
description: Guide Codex through architecture analysis, boundary decisions, dependency direction, module ownership, and architecture documentation. Use before structural changes, new subsystems, cross-module work, or when architecture memory must be updated.
---

# Architecture Skill

## Purpose
Maintain architecture as a verifiable contract between modules, tests, docs, and repository memory.

## When to use
Use before subsystem changes, dependency changes, major refactors, new services, or architecture decisions.

## When NOT to use
Do not use for copy-only edits or isolated single-file fixes with no boundary impact.

## Inputs required
Read `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, `.codebase/TEST_MATRIX.md`, then inspect relevant architecture files only.

## Outputs required
Architecture decision, impacted modules, dependency changes, diagrams when useful, and `.codebase/ARCHITECTURE.md` updates.

## Required tests
Add or update tests proving module boundaries and dependency behavior.

## Required fixtures
Create fixtures for new boundary inputs, outputs, and failure modes.

## Required contract updates
Update contracts when public behavior or module interfaces change.

## Required codebase map updates
Update `ARCHITECTURE.md`, `MODULE_INDEX.md`, and `DEPENDENCY_GRAPH.md`.

## Token saving rules
Read maps first, then only modules named by the maps. Prefer diagrams and checklists over repeated prose.

## Acceptance criteria
Boundaries are explicit, tests pass, contracts match implementation, and memory is current.

## Common mistakes
Changing dependency direction silently, documenting intent without tests, and scanning the whole repo before reading memory.

## Recovery workflow
If architecture drift is found, stop feature work, create a failing boundary test, update the contract, then repair the smallest module slice.

