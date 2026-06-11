---
name: genesis-harness
description: Initialize and operate a project planning harness for Codex. Use for /genesis-init, /init, feature planning, bug fixes, audits, reviews, docs sync, verification, and repository memory updates.
---

# Genesis Harness

## Purpose
Operate a repository through a test-first, contract-first, memory-backed Codex harness with explicit planning, verification, observability, and handoff.

## When to use
- `/genesis-init` or `/init`
- `/new-feature <description>`
- `/fix-bug <description>`
- `/plan <description>`
- `/audit`, `/review`, `/status`
- `/spec-change`, `/propagate-spec`, `/validate-specs`
- Any multi-step task that changes code, contracts, fixtures, tests, docs, or `.codebase`.

## Auto-init trigger
- If the repository has no `.planning/` yet and the user provides a product idea, feature idea, or project brief, treat that as an implicit `/init`.
- Do not wait for the literal word `/init`.
- Create the planning harness first, seed `PROJECT.md`, `REQUIREMENTS.md`, `STACK.md`, `SUMMARY.md`, and `INIT_QA.md` from the user brief when possible, then immediately move into discovery Q&A for product direction, QA closure, and tech stack sign-off.
- When a deterministic bootstrap is needed, call `genesis-harness run --yes --platform codex --idea "<user brief>"` and pass discovery answers if they are already known.

## When NOT to use
- Simple read-only answers with no repository workflow.
- Tasks that are fully handled by a narrower skill and do not need planning, state, or verification artifacts.

## Inputs required
- Start with `genesis-harness prime`, or run `genesis-harness status` and `genesis-harness docs`.
- Read `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, `.codebase/TEST_MATRIX.md`, and relevant contracts.
- Inspect only task-relevant source files after reading state summaries.

## Outputs required
- Plan or implementation artifact.
- Tests or verification checks before implementation when behavior changes.
- Fixtures and contracts when public input/output changes.
- Verification evidence.
- Updated docs, handoff, recovery notes, and `.codebase` state.

## Required tests
- Create or update failing tests before implementation.
- Run the smallest relevant verification first, then required harness gates.
- For harness changes, run `scripts/verify.sh`, `scripts/run-evals.sh`, and `npm run pack:check`.

## Required fixtures
- Add fixtures for expected inputs, outputs, validation notes, and recovery cases.
- Use `fixtures/` and skill templates instead of hardcoded examples when behavior is public.

## Required contract updates
- Update API, agent, event, or UI contracts before implementation when public behavior changes.
- Keep `.codebase/API_CONTRACTS.md` synchronized with contract files.

## Required codebase map updates
- Update `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, `.codebase/TEST_MATRIX.md`, and `.codebase/RECOVERY_POINTS.md` after meaningful changes.
- Update `.codebase/VISUAL_GRAPH.md` and `.codebase/DEPENDENCY_GRAPH.md` when harness relationships change.

## Token saving rules
- Load routing files first, then references only when needed.
- Keep `SKILL.md` as a short router; use `references/`, `resources/`, `checklists/`, and `scripts/` for detail.
- Offload long command output with `scripts/offload-log.sh` when needed.

## Acceptance criteria
- Definition Of Ready is satisfied before implementation.
- Definition Of Done is satisfied before completion.
- Quality Rubric evidence is recorded through tests, docs, and clean handoff.
- Verification evidence is reported with actual commands.

## Common mistakes
- Coding before tests or contracts.
- Overloading `AGENTS.md` or `SKILL.md` with long manuals.
- Declaring completion while `.codebase` or handoff files are stale.
- Trusting template presence as executable E2E coverage.

## Recovery workflow
1. Read `.codebase/state.json`, `.codebase/CURRENT_STATE.md`, and `.codebase/RECOVERY_POINTS.md`.
2. Resume from the recorded state, not from memory.
3. Run the relevant verification gate before continuing.
4. If state is stale, update state and handoff before new implementation.

## Supported commands
```txt
/genesis-init
/init
/run <idea>
/new-feature <description>
/fix-bug <description>
/plan <description>
/audit
/review
/status
/spec-change <file>
/propagate-spec
/validate-specs
```

## Reference map
- `references/workflows.md`: command routing and completion gates.
- `references/planning-schema.md`: `.planning/` file meanings and required tree.
- `references/research-rubric.md`: evidence requirements.
- `references/quality-rubric.md`: score and quality rubric.
- `references/state-machine.md`: FSM states and transition rules.
- `resources/post-implementation-guide.md`: docs, handoff, and recovery workflow.
- `checklists/new-feature-qa.md`: new feature readiness.
- `checklists/bug-fix-qa.md`: bug fix readiness.
- `checklists/refactor-qa.md`: refactor readiness.
- `checklists/requirements-validation.md`: final pre-implementation requirements gate.
- `scripts/init-planning.sh`: creates `.planning/`.
- `scripts/create-feature.sh`, `scripts/create-bug.sh`, `scripts/create-adr.sh`: scaffolding helpers.
- `scripts/check-docs-sync.sh`, `scripts/check-spec-changelog.sh`, `scripts/check-required-planning-files.sh`: mechanical validation.

## Initialization rule
`/genesis-init` and `/init` create Phase 0 Foundation plus Phase 1 Discovery & QA. Feature phases start only after discovery answers, QA closure, and tech stack sign-off are recorded.

`genesis-harness run --yes --platform codex --idea "<brief>" ...` is the deterministic CLI path when the caller wants bootstrap plus persisted discovery answers in one execution.
