---
name: genesis-harness
description: Initialize and operate a project planning harness for Codex. Use this skill when the user types /init, asks to create a new project, add a feature, fix a bug, plan work, generate tests first, update docs, track phases, review changes, audit a repository, or manage architecture decisions.
---

# Project Genesis Harness

This skill turns Codex into a project operating harness.

Codex must not behave like a simple code generator. Codex must behave like a disciplined engineering agent that understands the project before coding, confirms missing product intent, researches the repository and best practices, plans before implementation, defines tests or verification first, keeps docs synchronized with code, tracks tasks explicitly, records bug lessons, maintains architecture diagrams, reviews changed files after implementation, removes unnecessary changes, and escalates when human judgment is required.

## Purpose
Operate a repository through test-first, contract-first, memory-aware Codex workflows.

## When to use
Use for project initialization, planning, feature work, bug fixes, audits, reviews, verification, and repository memory updates.

## When NOT to use
Do not use for simple read-only answers that do not require repository workflow or durable artifacts.

## Inputs required
Read `.codebase/state.json` (MANDATORY on boot), `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, and `.codebase/TEST_MATRIX.md` when present, then inspect only relevant files.

## Outputs required
Plan or implementation artifact, tests, fixtures, verification evidence, docs sync, and codebase memory updates.

## Required tests
Create or update failing tests before implementation.

## Required fixtures
Create fixtures for expected inputs, outputs, validation notes, and recovery cases.

## Required contract updates
Update API, agent, event, or UI contracts when public behavior changes.

## Required codebase map updates
Update `.codebase` memory after meaningful changes.

## Token saving rules
Read summaries before source files, maps before modules, and avoid loading the entire repository.

## Acceptance criteria
Work is complete only when tests pass, contracts and docs are current, and verification evidence is reported.

## Common mistakes
Implementing before tests, skipping fixtures, overloading `AGENTS.md`, and duplicating long context across skills.

## Recovery workflow
If blocked or interrupted, read `.codebase/state.json` to identify your exact FSM state. Rerun verification, identify the first failing phase, and resume from that point based on the strict state rules.

## Core Principle

Do not code first.

Correct order:

```txt
Confirm intent
-> Inspect repository
-> Initialize planning
-> Research
-> Decide
-> Diagram
-> Plan
-> Test contract
-> Implement
-> Verify
-> Review
-> Sync docs
-> Track completion
-> Report
```

Never skip confirmation when intent is unclear, research, planning, test or verification, docs synchronization, task tracking, or review.

## Supported Commands

Support these user intents:

```txt
/init
/new-feature <description>
/fix-bug <description>
/plan <description>
/audit
/review
/status
/spec-change <file>                      [NEW]
/propagate-spec                          [NEW]
/validate-specs                          [NEW]
```

If the user does not type an exact command but clearly asks for one of these workflows, infer the correct workflow.

## NEW: Spec Impact & Propagation Commands

These commands enable automatic cascade prevention:

### `/spec-change <file>` - Detect & Analyze Spec Changes

```bash
/spec-change .planning/API_DOCS.md

What it does:
1. Detects what changed in the file
2. Identifies breaking changes vs feature additions
3. Finds all downstream phases that depend on the change
4. Calculates impact severity (high/medium/low)
5. Generates impact report with recommendations
6. Offers to auto-update all affected phases
```

### `/propagate-spec` - Auto-Update Downstream Phases

```bash
/propagate-spec

What it does:
1. Checks SPEC_CHANGELOG.md for unpropagated changes
2. Queries PHASE_DEPENDENCY_MAP for affected phases
3. AUTO-UPDATES all dependent phase specs
4. AUTO-UPDATES all affected phase tests
5. Runs validation tests in all phases
6. Generates migration guides for breaking changes
7. Updates ROADMAP.md if timeline affected
8. Creates comprehensive impact report
```

### `/validate-specs` - Check All Phases Aligned

```bash
/validate-specs

What it does:
1. Validates all phases against their dependencies
2. Detects spec drift (phase using stale upstream specs)
3. Identifies breaking changes not yet propagated
4. Lists any alignment issues
5. Suggests fixes
6. Blocks start of phase if upstream specs incomplete
```

## Resource And Script Map

Bundled resources live under `resources/`. Use them as starting content when creating `.planning/` files:

- `planning-tree-template.md`: required `.planning/` tree.
- `agents-template.md`: concise root `AGENTS.md`.
- `project-template.md` through `check-template.md`: starter content for project, phase, feature, bug, ADR, research, review, verification, audit, and check files.
- `post-implementation-guide.md`: Auto-update workflow after successful implementation. Guides doc synchronization, state tracking, and continuity.
- `requirements-validation.md`: Final validation checklist before implementation to ensure all requirements are clear and complete.

Bundled checklists live under `checklists/`. Use these as structured Q&A before planning:

- **MANDATORY**: `new-feature-qa.md`: Comprehensive Q&A for new features. Complete before `/new-feature` planning.
- **MANDATORY**: `bug-fix-qa.md`: Comprehensive Q&A for bug fixes. Complete before `/fix-bug` planning.
- **MANDATORY**: `refactor-qa.md`: Comprehensive Q&A for refactors. Complete before refactor planning.
- **MANDATORY**: `requirements-validation.md`: Final validation checklist. Use after Q&A, before contracts and tests.
- `checklist.md`: General Genesis Harness workflow checklist.

Bundled skills live under `skills/`. These are specialized automation tools:

- **NEW**: `spec-impact-engine/SKILL.md`: Automatically detect when specs change and update all downstream phases. Prevents cascading rework.
- `api-sync-skill/SKILL.md`: Auto-sync API contracts with implementation after changes.
- `docs-skill/SKILL.md`: Auto-update documentation after implementation.

Bundled references live under `references/`. Load them only when needed:

- `references/workflows.md`: command routing, readiness gate, and completion gate.
- `references/planning-schema.md`: detailed `.planning/` file meanings and required subtrees.
- `references/research-rubric.md`: local/external evidence format for research.
- `references/quality-rubric.md`: scoring rubric for `QUALITY_SCORE.md`.

Bundled scripts live under `scripts/`. Prefer copying or adapting these into `.planning/scripts/` or project scripts during `/init`:

- `init-planning.sh`: creates `AGENTS.md` and the `.planning/` tree.
- `create-feature.sh`: scaffolds `.planning/features/NNN-feature-slug/`.
- `create-bug.sh`: scaffolds `.planning/bugs/NNN-bug-slug/`.
- `create-adr.sh`: scaffolds `.planning/decisions/ADR-NNN-slug.md`.
- `update-state.sh`: updates common fields in `.planning/STATE.md`.
- **NEW**: `transition_state.sh`: Strict FSM transition script. You MUST use this script to move between `INIT`, `REQUIREMENTS_GATHERING`, `PLANNING`, `IMPLEMENTATION`, `VERIFICATION`, and `COMPLETED` states.
- `offload-log.sh`: captures and trims large command outputs to protect the context window.
- `compact-context.sh`: intelligent context compaction summarizing state to disk.
- `run-verify-loop.sh`: state-tracked Ralph Loop verify-fix loop executor.
- `detect-stack.sh`: inspects repository stack clues.
- `list-changed-files.sh`: lists git changes when git is available.
- `run-verification.sh`: runs detected lint/typecheck/test/build checks.
- `detect-changes.sh`: Auto-detect file changes and identify what `.codebase` docs need updating.
- `check-docs-sync.sh`, `check-task-tracking.sh`, `check-no-debug-logs.sh`, `check-spec-changelog.sh`, `check-required-planning-files.sh`, `check-architecture-boundaries.sh`: mechanical harness checks.
- **NEW**: `spec-impact-engine/detect-spec-changes.sh`: Auto-detect spec changes and generate impact report.

## `/init` Workflow

When the user types `/init`, initialize the project planning harness. Before creating files, inspect the current repository.

**Important**: Do not create feature-specific phases. Create only a Foundation phase (Phase 0) as a planning framework. Feature phases are created only after requirements are confirmed and roadmap is finalized.

Look for:

- `README.md`
- `AGENTS.md`
- `package.json`
- `composer.json`
- `pyproject.toml`
- `requirements.txt`
- `Cargo.toml`
- `go.mod`
- `*.csproj` or `*.sln`
- `Dockerfile`
- `docker-compose.yml`
- `src/` or `app/`
- existing docs
- existing tests
- existing API routes
- existing database schema
- existing architecture clues

### Confirmation Rule

If there is enough information to infer the product idea, summarize the detected project brief and ask for confirmation:

```md
## Detected Project Brief

Product:
Target users:
Core features:
Tech stack:
Integrations:
First milestone:
Out of scope:
Assumptions:

Please confirm before I initialize `.planning/`.

Note: I will create a Foundation phase (Phase 0) for documentation 
only. Feature phases will be created later when requirements are finalized.
```

If the app idea is missing or ambiguous, stop and ask:

1. What application are we building?
2. Who are the target users?
3. What are the core features?
4. What tech stack do you prefer?
5. What integrations are required?
6. What is explicitly out of scope?
7. What is the first milestone?
8. Are there any design, architecture, security, or deployment constraints?

Do not create implementation code until the project idea is confirmed.

After confirmation, create root `AGENTS.md`, the `.planning/` structure, initial planning files, base Mermaid diagrams, a Foundation phase (Phase 0) as planning framework only, initial checks, the initial quality score, and the phase dependency map. Use `scripts/init-planning.sh` when it fits the repository.

**Foundation Phase (Phase 0)**: This is a setup phase only, not a feature phase. It contains:
- Tasks to complete project documentation
- No feature implementation tasks
- Placeholder roadmap with no feature phases yet

**Phase Dependency Map**: Created as `.codebase/PHASE_DEPENDENCY_MAP.md`, this is:
- Mapping of which phases provide what
- Which phases depend on which other phases
- Impact calculation rules for spec changes
- Timeline sensitivity analysis
- Used by spec-impact-engine for auto-updates

Feature phases must not be created until requirements are finalized and prioritized. Each feature gets its own numbered phase folder when work begins.

`scripts/init-planning.sh` must only be run after confirmation, using `--confirmed` or `PROJECT_BRIEF_CONFIRMED=1`. Do not bypass this guard unless the user explicitly asks to create a blank harness with unknown product details.

## Root `AGENTS.md`

Create a short root-level `AGENTS.md`. It is a table of contents for Codex, not a giant instruction dump. It must point Codex to the real project knowledge in `.planning/`.

Minimum contents:

```md
# AGENTS.md

This repository uses the Project Genesis Harness.

Before doing feature work, bug fixes, refactors, or architecture changes, read:

1. `.planning/SUMMARY.md`
2. `.planning/STATE.md`
3. `.planning/PROJECT.md`
4. `.planning/REQUIREMENTS.md`
5. `.planning/STACK.md`
6. `.planning/ARCHITECTURE.md`
7. `.planning/CONVENTIONS.md`
8. `.planning/PITFALLS.md`
9. `.planning/LESSONS_LEARNED.md`

For new features, create a folder under `.planning/features/`.
For bug fixes, create a folder under `.planning/bugs/`.
For major decisions, create an ADR under `.planning/decisions/`.

Do not claim completion unless verification passed, docs were synchronized, task tracking was updated, and changed files were reviewed.
```

Keep `AGENTS.md` concise.

## Required `.planning/` Architecture

Create the full tree described in `resources/planning-tree-template.md`, including:

- core docs: `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `STACK.md`, `ARCHITECTURE.md`, `DESIGN.md`, `API_DOCS.md`, `INTEGRATIONS.md`, `CONVENTIONS.md`, `PITFALLS.md`, `LESSONS_LEARNED.md`, `SPEC_CHANGELOG.md`, `FEATURE_INDEX.md`, `CHANGE_IMPACT_MATRIX.md`, `QUALITY_SCORE.md`, `ESCALATION.md`, `OBSERVABILITY.md`, `SMOKE_TESTS.md`, `JOURNEYS.md`, `SUMMARY.md`, `config.json`
- diagrams: `system-context.mmd`, `container-architecture.mmd`, `database-erd.mmd`, `deployment-flow.mmd`, `roadmap-flow.mmd`
- research, decisions, phases, features, bugs, audits, checks, quick, codebase, and templates folders.

## Meaning Of Core Files

- `PROJECT.md`: project identity, target users, value, scope, out of scope, constraints, assumptions, current milestone, success criteria.
- `REQUIREMENTS.md`: functional and non-functional requirements, user stories, acceptance criteria, edge cases, known unknowns.
- `ROADMAP.md`: milestones, phases, dependencies, status, acceptance criteria.
- `STATE.md`: current phase, active feature or bug, last completed task, next task, blockers, latest verification.
- `STACK.md`: language, framework, runtime, database, package manager, test framework, lint/typecheck tools, deployment target, versions, local commands.
- `ARCHITECTURE.md`: architecture, module boundaries, data flow, dependency direction, service boundaries, principles, forbidden patterns.
- `DESIGN.md`: UX principles, screens/pages, component conventions, state management, accessibility, constraints.
- `API_DOCS.md`: endpoints, examples, errors, auth, versioning.
- `INTEGRATIONS.md`: services, SDKs, env vars, secrets, failure handling, fallbacks, rate limits.
- `CONVENTIONS.md`: naming, folders, style, errors, logging, tests, API rules, security rules, patterns to follow and avoid.
- `PITFALLS.md`: common mistakes, risky areas, fragile dependencies, historical warnings.
- `LESSONS_LEARNED.md`: fixed bugs, root causes, failed assumptions, correct patterns, prevention rules, changed files, verification evidence.
- `SPEC_CHANGELOG.md`: every spec-affecting change with date/time, reason, impacted docs, impacted tests, migration notes.
- `FEATURE_INDEX.md`: table of features with status, phase, path, notes.
- `CHANGE_IMPACT_MATRIX.md`: mapping from change types to docs that must update.
- `QUALITY_SCORE.md`: quality areas and scores; update during `/audit`, `/review`, major features, and major bug fixes.
- `ESCALATION.md`: when Codex must stop and ask the user.
- `OBSERVABILITY.md`: logs, metrics, traces, errors, health checks, debug commands, local inspection.
- `JOURNEYS.md`: important user journeys with expected UI/API/DB/log state and verification.
- `SMOKE_TESTS.md`: minimal checks proving the app is alive.

## Task Tracking Rule

Every phase, feature, bug, audit, and task must use checkbox tracking:

```txt
[ ] not started
[~] in progress
[x] completed
[!] blocked
```

When a task is started:

1. update checkbox from `[ ]` to `[~]`
2. update `.planning/STATE.md`

When a task is completed:

1. update checkbox from `[~]` or `[ ]` to `[x]`
2. update `.planning/STATE.md`
3. update related phase `TASKS.md`
4. update related feature or bug `TASKS.md` if applicable
5. update `.planning/SUMMARY.md`

Never claim a task is complete unless tracking files were updated.

## Definition Of Ready

Feature, bug, phase, audit, and architecture work is ready to implement only when:

- [x] product intent or bug report is clear enough to avoid guessing
- [x] required planning docs were read
- [x] relevant local codebase patterns were researched
- [x] best-practice research is recorded or internet unavailability is stated
- [x] impact on API, data, UI, auth, integrations, config, docs, and tests is known
- [x] test contract or verification contract exists
- [x] diagram or ADR impact is handled when architecture changes
- [x] escalation concerns were resolved or explicitly recorded

If any item is false, do not implement. Update tracking to `[!]` or ask the user.

## Validation Gates

Before moving to the `COMPLETED` state, the agent MUST pass the validation gates:
- Run `bash scripts/validation_gates.sh`
- Ensure no leftover `TODO`, `FIXME`, `console.log`, or `print` statements remain in production code.
- Ensure all tests and `verify.sh` checks pass.
- If the validation gates fail, the agent is forced to remain in `VERIFICATION` or return to `IMPLEMENTATION` to fix the issues.

## Definition Of Done

Work is done only when:

- [x] implementation is complete and scoped to the plan
- [x] automated tests or documented verification passed
- [x] docs were synchronized (see Docs Sync Rule below)
- [x] task tracking moved from `[ ]` or `[~]` to `[x]`
- [x] `.planning/STATE.md` updated (current phase, active feature, next task)
- [x] `.planning/SUMMARY.md` updated (recent changes, next recommended task)
- [x] `.planning/SPEC_CHANGELOG.md` updated if behavior/API/requirements changed
- [x] `.planning/QUALITY_SCORE.md` recalculated
- [x] `.planning/FEATURE_INDEX.md` updated with feature status
- [x] changed files were reviewed
- [x] debug logs, dead code, unrelated edits, and unnecessary files were removed
- [x] risks and follow-up tasks are recorded

**Never use completion language until ALL items above are satisfied.**

If a doc doesn't need updating, explicitly explain why in the completion report.

## Research Rule

Before planning or implementing any non-trivial task:

1. Research the existing codebase.
2. Identify similar patterns already present.
3. Research best practices using official docs, Google, GitHub, or reputable sources when internet access is available.
4. Record findings in `.planning/research/`.
5. Mention evidence in the plan.

The plan must state what will change, where, why, the pattern or best practice supporting the change, risks, and verification commands. If internet access is unavailable, state this clearly and rely on local codebase research. Never invent external research results.

Use this evidence format in `.planning/research/`:

```md
## Research: <topic>

Date:
Question:

## Local Evidence

| File / Command | Finding | Impact |
|---|---|---|
| `path/to/file` | TBD | TBD |

## External Evidence

| Source | Date Checked | Finding | Impact |
|---|---|---|---|
| URL or official doc name | YYYY-MM-DD | TBD | TBD |

## Decision Impact

- [ ] TBD

## Confidence / Gaps

- [ ] TBD
```

External findings must include a source name or URL and date checked. If browsing is unavailable, write `External Evidence: unavailable in this environment` and do not fabricate sources.

## Mermaid Diagram Rule

Use Mermaid diagrams as architecture source of truth. Before implementation, create or update diagrams when the task affects architecture, data flow, API flow, database schema, deployment, integration, phase dependency, feature workflow, background jobs, or auth.

Required base diagrams:

```txt
.planning/diagrams/system-context.mmd
.planning/diagrams/container-architecture.mmd
.planning/diagrams/database-erd.mmd
.planning/diagrams/deployment-flow.mmd
.planning/diagrams/roadmap-flow.mmd
```

A feature must also have `.planning/features/NNN-feature-name/DIAGRAM.mmd`. Do not implement architecture-changing work before updating the relevant diagram.

## `/new-feature` Workflow

**IMPORTANT**: Always use `checklists/new-feature-qa.md` BEFORE starting any feature work.

When adding a new feature:

### Step 0: Complete Q&A Checklist (MANDATORY)

```bash
# Before any planning, complete:
cat .codex/skills/genesis-harness/checklists/new-feature-qa.md

# Answer all questions:
- User story clearly defined?
- Success criteria measurable?
- Out of scope documented?
- Requirements clear?
- API/database/UI impacts known?
- Edge cases identified?
- Test strategy defined?
- No unknowns remaining?
```

If ANY question is unanswered → Stop and get clarification before continuing.

### Step 1: Requirements Validation

After Q&A is complete, validate requirements:

```bash
# Use requirements validation checklist:
cat .codex/skills/genesis-harness/checklists/requirements-validation.md

# Verify:
- All items are specific and measurable
- Scope is bounded
- Technical feasibility confirmed
- Acceptance criteria are testable
- Stakeholder alignment obtained
```

If ANY validation fails → Do not continue. Fix before proceeding.

### Step 2: Confirm Definition of Ready

Then read:

```txt
.planning/SUMMARY.md
.planning/STATE.md
.planning/PITFALLS.md
.planning/LESSONS_LEARNED.md
.planning/CONVENTIONS.md
.planning/ARCHITECTURE.md
.planning/STACK.md
```

Verify ALL of these are TRUE:

```
[ ] Q&A checklist completed and all questions answered
[ ] Requirements validation passed
[ ] Product intent is clear enough to avoid guessing
[ ] Required planning docs were read (7 docs above)
[ ] Relevant local codebase patterns were researched
[ ] Best-practice research is recorded or internet unavailability stated
[ ] Impact on API, database, UI, auth, integrations, config, docs, and tests is KNOWN
[ ] Test contract or verification contract will be created
[ ] Diagram or ADR impact is handled if architecture changes
[ ] Escalation concerns are resolved or explicitly recorded

If ANY checkbox is FALSE → Do not continue. 
Ask user for clarification or update tracking to [!] blocked.
```

### Step 3: Research & Plan

Research local patterns and best practices. Create:

```txt
.planning/features/NNN-feature-slug/
├── SPEC.md
├── IMPACT.md
├── PLAN.md
├── TEST_CONTRACT.md
├── TASKS.md
├── VERIFICATION.md
├── REVIEW.md
└── DIAGRAM.mmd
```

`SPEC.md` must include summary, user story, expected behavior, edge cases, out of scope, and acceptance criteria.

`IMPACT.md` must answer whether the feature affects API, database, UI, auth/security, integrations, environment variables, architecture, docs, tests, migrations, or existing user journeys.

`PLAN.md` must include files to create/change, why each changes, implementation steps, test strategy, docs to update, diagrams to update, risks, rollback plan, and verification commands. Each planned file change must use:

```md
### File: `path/to/file`

Change:
Why:
Risk:
Test:
Docs impact:
```

`TEST_CONTRACT.md` must include normal input/output, edge cases, invalid inputs, expected errors, acceptance tests, and manual verification if automated tests are unavailable.

`TASKS.md` must include checkbox tasks for:

**Phase 1: Confirmation & Research**
- [ ] Complete `.codex/skills/genesis-harness/checklists/new-feature-qa.md`
- [ ] Complete `.codex/skills/genesis-harness/checklists/requirements-validation.md`
- [ ] Read required `.planning/` docs (SUMMARY, STATE, PITFALLS, LESSONS, CONVENTIONS, ARCHITECTURE, STACK)
- [ ] Verify Definition of Ready (all 10 items confirmed YES)

**Phase 2: Planning & Contracts**
- [ ] Research codebase patterns for similar features
- [ ] Research best practices (external sources or mark unavailable)
- [ ] Complete SPEC.md with full acceptance criteria
- [ ] Complete IMPACT.md answering all 11 impact questions
- [ ] Complete PLAN.md with file changes, risks, rollback
- [ ] Create TEST_CONTRACT.md with test cases
- [ ] Create DIAGRAM.mmd if architecture affected
- [ ] Identify all docs that will need updates (API_DOCS? REQUIREMENTS? DESIGN? etc.)

**Phase 3: Implementation**
- [ ] Create failing test or verification
- [ ] Implement to pass test
- [ ] Run verification - all pass?
- [ ] Review code for quality

**Phase 4: Documentation & Sync**
- [ ] Check CHANGE_IMPACT_MATRIX.md → which docs must update?
- [ ] Update REQUIREMENTS.md (if behavior/feature added)
- [ ] Update API_DOCS.md (if API endpoints changed)
- [ ] Update ARCHITECTURE.md (if structure changed)
- [ ] Update DESIGN.md (if UI/UX changed)
- [ ] Update INTEGRATIONS.md (if external services changed)
- [ ] Update CONVENTIONS.md (if new patterns established)
- [ ] Update STACK.md (if new tech added)
- [ ] Update SPEC_CHANGELOG.md with: date, reason, impacted docs, impacted tests, migration notes
- [ ] Update .planning/STATE.md (current phase, active feature, next task)
- [ ] Update .planning/SUMMARY.md (recent changes, next recommended task)
- [ ] Update .planning/FEATURE_INDEX.md (add feature status)
- [ ] Update .planning/QUALITY_SCORE.md (recalculate scores)
- [ ] Run post-implementation state sync: `.codex/skills/genesis-harness/resources/post-implementation-guide.md`

**Phase 5: Review & Completion**
- [ ] Review changed files (remove debug logs, dead code, unrelated changes)
- [ ] Update feature REVIEW.md with findings
- [ ] Verify cleanup pass complete
- [ ] Create `.codebase/RECOVERY_POINTS.md` entry for resumption
- [ ] Create or update `.codebase/IMPLEMENTATION_HANDOFF.md`
- [ ] Mark TASKS checklist complete [x]

Prefer `scripts/create-feature.sh` for the initial folder and file scaffold, then fill the generated files with task-specific content.

## `/fix-bug` Workflow

**IMPORTANT**: Always use `checklists/bug-fix-qa.md` BEFORE starting any bug fix work.

Before fixing a bug, always:

### Step 0: Complete Bug Fix Q&A (MANDATORY)

```bash
# Complete the bug fix questionnaire:
cat .codex/skills/genesis-harness/checklists/bug-fix-qa.md

# Answer all questions:
- Bug clearly reproduced?
- Root cause identified?
- Severity assessed?
- Affected versions known?
- Impact assessed?
- Fix approach decided?
- Regression prevention plan?
- Deployment strategy known?
```

If ANY question is unanswered → Stop and get clarification before continuing.

### Step 1: Requirements Validation

After bug Q&A is complete:

```bash
# Use requirements validation checklist:
cat .codex/skills/genesis-harness/checklists/requirements-validation.md

# For bugs, verify:
- Root cause is clear
- Fix approach is feasible
- Test strategy is defined
- No scope creep
- Stakeholders aligned
```

### Step 2: Read Context

Then read:

```txt
.planning/PITFALLS.md
.planning/LESSONS_LEARNED.md
.planning/CONVENTIONS.md
.planning/ARCHITECTURE.md
.planning/STACK.md
```

Then reproduce and diagnose before changing code. Create:

```txt
.planning/bugs/NNN-bug-slug/
├── REPORT.md
├── ROOT_CAUSE.md
├── PLAN.md
├── TEST_CONTRACT.md
├── TASKS.md
├── VERIFICATION.md
└── REVIEW.md
```

### Step 3: Bug Documentation

Create `TASKS.md` with checkboxes for:

**Phase 1: Understanding**
- [ ] Complete `.codex/skills/genesis-harness/checklists/bug-fix-qa.md`
- [ ] Complete `.codex/skills/genesis-harness/checklists/requirements-validation.md`
- [ ] Read PITFALLS.md and LESSONS_LEARNED.md
- [ ] Reproduce bug with exact steps
- [ ] Identify root cause
- [ ] Check for similar bugs in LESSONS_LEARNED.md

**Phase 2: Planning**
- [ ] Complete REPORT.md (what is broken?)
- [ ] Complete ROOT_CAUSE.md (why is it broken?)
- [ ] Complete PLAN.md (how to fix it?)
- [ ] Create TEST_CONTRACT.md (regression test)
- [ ] Identify risk level (low/medium/high)
- [ ] Plan rollback strategy

**Phase 3: Implementation**
- [ ] Create regression test (should fail with current code)
- [ ] Fix with minimal change (don't refactor unrelated code)
- [ ] Verify regression test now passes
- [ ] Run full test suite - all pass?

**Phase 4: Documentation & Sync**
- [ ] Update LESSONS_LEARNED.md with bug finding
- [ ] Check which docs affected
- [ ] Update REQUIREMENTS.md (if behavior changed)
- [ ] Update API_DOCS.md (if API changed)
- [ ] Update .planning/STATE.md
- [ ] Update .planning/SUMMARY.md
- [ ] Update .planning/SPEC_CHANGELOG.md if needed
- [ ] Update .planning/QUALITY_SCORE.md
- [ ] Run post-implementation state sync: `.codex/skills/genesis-harness/resources/post-implementation-guide.md`

**Phase 5: Review & Completion**
- [ ] Review changed files (minimal change?)
- [ ] Update bug REVIEW.md
- [ ] Verify cleanup pass complete
- [ ] Create `.codebase/RECOVERY_POINTS.md` entry
- [ ] Create or update `.codebase/IMPLEMENTATION_HANDOFF.md`
- [ ] Mark TASKS checklist complete [x]

Append to `.planning/LESSONS_LEARNED.md`:

```md
## Bug: <name>

Date:
Root cause:
Failed assumption:
Correct pattern:
Prevention rule:
Files changed:
Verification:
```

Never fix the same type of bug without checking `LESSONS_LEARNED.md`.

Prefer `scripts/create-bug.sh` for the initial folder and file scaffold, then fill the generated files with task-specific evidence.

## `/api-sync` Workflow

**NEW**: After implementing API-related features or changes, use the **api-sync-skill** to automatically sync contracts with implementation.

When API code is modified, invoke:

```bash
invoke api-sync-skill

# Parameters:
- changed_files: [list of API files modified]
- contract_file: ".codebase/API_CONTRACTS.md"
- breaking_changes: true/false
- version_bump: "major/minor/patch"
```

This workflow:

1. Detects API endpoint changes (new, modified, deprecated)
2. Extracts request/response schemas from code
3. Updates API_CONTRACTS.md with all changes
4. Identifies breaking changes
5. Generates test contracts
6. Creates migration guide if needed
7. Documents version changes

See `.codex/skills/api-sync-skill/SKILL.md` for full workflow.

**Important**: Run before committing API changes.

## `/spec-change` Workflow

**NEW**: When a specification document changes, use this to propagate changes to downstream phases.

When user calls `/spec-change <file>` or notifies you of spec changes:

### Step 1: Detect the Change

```bash
# User says: "I updated the API response format in API_DOCS.md"

Harness:
1. Reads old vs new version of .planning/API_DOCS.md
2. Identifies what changed (breaking vs additive)
3. Classifies severity (high/medium/low)
4. Extracts specific changes (what field changed, how)
```

### Step 2: Query Impact

```bash
# Using PHASE_DEPENDENCY_MAP.md

Query: Which phases depend on the API_DOCS.md changes?

Example:
- Phase 1 changed: GET /api/users/:id response format
- PHASE_DEPENDENCY_MAP shows:
  - Phase 2 imports user_api ← AFFECTED
  - Phase 3 imports user_api ← AFFECTED
  - Phase 4 imports user_api ← AFFECTED
```

### Step 3: Generate Impact Report

```bash
# Create .codebase/IMPACT_REPORT_<timestamp>.md

Contains:
- What changed (before/after)
- Severity level
- All affected phases
- Estimated impact time (30 min? 2 hours?)
- Recommended fix order
- Rollback strategy
```

### Step 4: Auto-Update (Optional)

```bash
# If user says: "Auto-update all affected phases"

For each affected phase:
1. Auto-update SPEC.md (replace old API calls)
2. Auto-update TEST_CONTRACT.md (update assertions)
3. Auto-update PLAN.md (note breaking change)
4. Run validation tests
5. Flag for developer review if HIGH severity
```

### Step 5: Update Tracking

```bash
1. Add entry to SPEC_CHANGELOG.md
2. Update STATE.md with status
3. Create notification with impact details
4. Suggest next steps
```

---

## `/propagate-spec` Workflow

**NEW**: Automatically propagate all pending spec changes to downstream phases.

When user calls `/propagate-spec`:

### Step 1: Find Pending Changes

```bash
# Scan SPEC_CHANGELOG.md for entries marked "pending_propagation"

These are changes that were made but not yet pushed to dependent phases.
```

### Step 2: Identify Affected Phases

```bash
# For each pending change:
# 1. Query PHASE_DEPENDENCY_MAP
# 2. Find phases that depend on the changed capability
# 3. Build execution order (upstream first)
```

### Step 3: Auto-Update All Phases

```bash
# For each affected phase (in order):

1. Update SPEC.md
   - Replace old patterns with new ones
   - Update examples
   - Note breaking changes

2. Update TEST_CONTRACT.md
   - Update test expectations
   - Add migration notes

3. Update PLAN.md
   - Note: "Depends on Phase N spec change"
   - Estimate new work time

4. Generate migration guide if breaking change

5. Run tests
   - If PASS: Mark phase as ready ✓
   - If FAIL: Flag for manual review ⚠️
```

### Step 4: Update Timeline

```bash
# If any phase specs changed significantly:

1. Recalculate ROADMAP.md
   - Update phase timelines
   - Recalculate critical path
   - Notify if project delay > 1 day

2. Update STATE.md
   - Note propagation completed
   - Mark phases as ready to resume
```

### Step 5: Generate Summary

```bash
# Create comprehensive report:

"Spec propagation complete

Updated phases:
- Phase 2: 1 spec, 3 tests (HIGH severity - requires review)
- Phase 3: 2 specs, 5 tests (MEDIUM - ready to resume)
- Phase 4: 0 changes (LOW severity, no impact)

Timeline impact: +2 hours estimated work
Critical path: No changes
Status: Ready to proceed

Next steps:
1. Review Phase 2 changes
2. Run tests in Phase 2
3. Continue Phase 2 implementation"
```

---

## `/validate-specs` Workflow

**NEW**: Check that all phases are aligned with their dependencies.

When user calls `/validate-specs`:

### Step 1: Load Dependency Map

```bash
# Read PHASE_DEPENDENCY_MAP.md

For each phase:
- What it provides
- What it requires
- Which phases it depends on
```

### Step 2: Validate Each Phase

```bash
# For each phase N:

Check: Does phase N's SPEC.md match what upstream provides?

Example:
  Phase 2 spec says: "Uses user_api with { name, email, role }"
  Phase 1 API_DOCS says: "Returns { id, name, email, roles[] }"
  
  Result: MISALIGNED ❌
  Phase 2 spec is STALE (3 days old)
  
  Action: Flag for update
```

### Step 3: Check for Drift

```bash
# Detect stale specs:

For each phase:
1. How old is SPEC.md?
2. How old is TEST_CONTRACT.md?
3. Have upstream phases changed since?
4. If spec older than upstream change → DRIFT DETECTED

Report all drifted phases.
```

### Step 4: Identify Breaking Changes Not Propagated

```bash
# Query: Are there HIGH severity changes in SPEC_CHANGELOG?
# That haven't been propagated to dependent phases?

If YES:
  - Flag as blocker
  - Cannot start downstream phase work until propagated
  - Suggest running /propagate-spec
```

### Step 5: Generate Alignment Report

```bash
# Create report with:

✓ Phases in alignment:
  - Phase 1, 3, 4
  
❌ Phases with issues:
  - Phase 2: Spec STALE (3 days, Phase 1 changed 2 days ago)
  - Phase 5: Cannot start until Phase 4 propagation complete
  
⚠️ Risky:
  - Phase 3 depends on Phase 2 which depends on Phase 1
  - Both Phase 1 and 2 have HIGH severity changes
  - Timeline risk: +4 hours if cascading changes needed

Recommendations:
1. Run /propagate-spec immediately
2. Re-validate after propagation
3. Run tests in all phases
```

---

## Spec Impact Integration into `/new-feature`

When a feature is completed and phases are affected:

### Phase 4: Documentation & Sync (Updated)

- [ ] Check CHANGE_IMPACT_MATRIX.md → which docs must update?
- [ ] Update REQUIREMENTS.md (if behavior/feature added)
- [ ] Update API_DOCS.md (if API endpoints changed)
- [ ] Update ARCHITECTURE.md (if structure changed)
- [ ] Update DESIGN.md (if UI/UX changed)
- [ ] Update INTEGRATIONS.md (if external services changed)
- [ ] Update CONVENTIONS.md (if new patterns established)
- [ ] Update STACK.md (if new tech added)
- [ ] Update SPEC_CHANGELOG.md with: date, reason, impacted docs, impacted tests, migration notes
- [ ] Update .planning/STATE.md (current phase, active feature, next task)
- [ ] Update .planning/SUMMARY.md (recent changes, next recommended task)
- [ ] Update .planning/FEATURE_INDEX.md (add feature status)
- [ ] Update .planning/QUALITY_SCORE.md (recalculate scores)
- [ ] **NEW**: Run `/spec-change <changed-file>` for each updated spec file
- [ ] **NEW**: Review impact report from spec-impact-engine
- [ ] **NEW**: Run `/propagate-spec` to auto-update downstream phases
- [ ] **NEW**: Run `/validate-specs` to confirm all phases aligned
- [ ] Run post-implementation state sync: `.codex/skills/genesis-harness/resources/post-implementation-guide.md`

When the user asks for a plan:

1. Read required planning docs.
2. Research the codebase.
3. Research best practices if internet is available.
4. Create or update relevant diagrams.
5. Write a plan with:

```md
## Goal

## Current State

## Research Findings

## Files to Change

### File: `path/to/file`
Change:
Why:
Risk:
Test:
Docs impact:

## Test Contract

## Verification Commands

## Docs to Update

## Risks

## Rollback Plan
```

Do not implement unless the user asks to implement or the workflow clearly requires implementation.

## `/audit` Workflow

When the user asks for `/audit`, perform a harness audit. Review architecture drift, docs freshness, dead code, duplicated logic, dependency risk, security risk, missing tests, missing diagrams, stale decisions, stale feature tasks, and stale phase tasks.

Update:

```txt
.planning/audits/architecture-drift.md
.planning/audits/dependency-audit.md
.planning/audits/dead-code-audit.md
.planning/audits/security-audit.md
.planning/audits/docs-freshness-audit.md
.planning/QUALITY_SCORE.md
.planning/STATE.md
.planning/SUMMARY.md
```

Create follow-up tasks if needed. Do not make risky code changes during `/audit` unless explicitly requested.

## `/review` Workflow

When the user asks for `/review`, review changed files. Check unnecessary files, unused code, duplicated logic, debug logs, poor naming, missing tests, missing docs update, architecture drift, convention violations, security risks, performance risks, and best-practice improvements.

Record the review in the related feature `REVIEW.md`, related phase `REVIEW.md`, and `.planning/SUMMARY.md`. If problems are found, create tracked follow-up tasks.

## `/status` Workflow

When the user asks for `/status`, summarize current project state, current phase, active feature or bug, completed tasks, blocked tasks, latest verification result, next recommended task, and docs that may be stale.

Use `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/FEATURE_INDEX.md`, and `.planning/SUMMARY.md`. Do not guess.

## Test-First Rule

Before implementation:

1. create or update tests
2. define input/output expectations
3. define edge cases
4. run tests and confirm they fail for the expected reason

If no test framework exists, create a minimal verification script, document manual verification steps, and add a test framework recommendation to `STACK.md` or `ROADMAP.md`. Never claim completion without verification.

## Implementation Rule

During implementation, make the smallest working change. Follow `CONVENTIONS.md`, `ARCHITECTURE.md`, and `STACK.md`. Reuse existing utilities. Avoid unrelated refactors, hidden dependencies, public behavior changes without docs, integrations without `INTEGRATIONS.md`, deleting files without justification, and destructive migrations without user confirmation.

## State Continuity & Resumption

**NEW**: After each implementation phase, document state for resumption:

### Create `.codebase/IMPLEMENTATION_HANDOFF.md`

After successful implementation completion:

```bash
# Create handoff document with:
- What was built (modules created/modified)
- Current state (what's complete, known issues)
- Files changed (detailed list)
- Metrics and status
- For continuation (resumption instructions)
- Recovery points (where to resume if paused)
- Architecture decisions (why this approach?)
```

See `.codebase/IMPLEMENTATION_HANDOFF.md` for template.

### Create `.codebase/RECOVERY_POINTS.md`

Track where work can be safely paused:

```bash
# For each phase, document:
- Phase status (complete, in-progress, paused)
- What was completed
- What remains
- How to resume from this point
- Rollback procedures
```

See `.codebase/RECOVERY_POINTS.md` for template and examples.

### Use After Implementation

Run this workflow after implementation passes tests:

```bash
# 1. Verify all tests passing
npm test

# 2. Auto-detect changes and sync docs
./scripts/detect-changes.sh

# 3. Follow post-implementation guide
cat .codex/skills/genesis-harness/resources/post-implementation-guide.md

# 4. Update state tracking
cat .codebase/IMPLEMENTATION_HANDOFF.md  # Fill out
cat .codebase/RECOVERY_POINTS.md        # Fill out

# 5. Verify all docs in sync
./scripts/check-docs-sync.sh
```

## Docs Sync Rule

**CRITICAL**: Whenever implementation changes behavior, API, data model, UI, integration, architecture, convention, config, environment variable, security behavior, or requirement, update ALL related docs.

Reference `.planning/CHANGE_IMPACT_MATRIX.md` to identify which docs must be updated based on change type.

Possible docs to update:

- `.planning/REQUIREMENTS.md` - If feature/behavior/requirement changed
- `.planning/API_DOCS.md` - If endpoints/schemas/auth changed
- `.planning/ARCHITECTURE.md` - If module boundaries/data flow changed
- `.planning/DESIGN.md` - If UI/UX/screens/components changed
- `.planning/INTEGRATIONS.md` - If external services/env vars changed
- `.planning/STACK.md` - If tech stack/versions/commands changed
- `.planning/CONVENTIONS.md` - If patterns/style/rules changed
- `.planning/ROADMAP.md` - If timeline/phases/priorities changed
- `.planning/STATE.md` - ALWAYS update (current phase, active work, next task)
- `.planning/SPEC_CHANGELOG.md` - ALWAYS update (date, reason, impacted docs)
- `.planning/QUALITY_SCORE.md` - Update with new metrics
- `.planning/OBSERVABILITY.md` - If logging/metrics/traces changed
- `.planning/SMOKE_TESTS.md` - If verification paths changed
- `.planning/JOURNEYS.md` - If user flows changed
- `.planning/diagrams/*.mmd` - If architecture/flow changed
- `.planning/decisions/*.md` - If ADR-level changes made
- `.planning/features/*/*.md` - Update feature folder docs
- `.planning/FEATURE_INDEX.md` - Update feature table

**Docs Sync Checklist (from TASKS.md)**:
- [ ] Check CHANGE_IMPACT_MATRIX.md for required updates
- [ ] Update all applicable docs from list above
- [ ] Add entry to SPEC_CHANGELOG.md with date and reason
- [ ] Update STATE.md and SUMMARY.md
- [ ] Recalculate QUALITY_SCORE.md

If no docs need updating, explicitly state why in the completion report (e.g., "Internal refactor, no behavior change").

## Decision Record Rule

Use ADR files for important decisions. Create files like `.planning/decisions/ADR-003-use-postgres.md`.

Each ADR must include status, context, decision, alternatives considered, consequences, risks, mitigation, and verification evidence.

Use ADRs for tech stack decisions, database choice, auth strategy, architecture boundaries, external integrations, major library choices, deployment strategy, security strategy, and API versioning strategy.

Prefer `scripts/create-adr.sh` for ADR numbering and starter content.

## Quality Rubric

Use this rubric when updating `QUALITY_SCORE.md`:

| Score | Meaning |
|---:|---|
| 0 | Unknown, absent, or not evaluated |
| 2 | Known major gaps with no mitigation |
| 4 | Basic structure exists but is inconsistent or mostly manual |
| 6 | Working baseline with known gaps and follow-up tasks |
| 8 | Strong, verified, documented, and mostly automated |
| 10 | Mature, automated, documented, reviewed, and low-risk |

Area guidance:

- Architecture: module boundaries, dependency direction, diagrams, ADRs, forbidden patterns.
- Tests: regression coverage, smoke tests, edge cases, failing-first evidence, CI/local repeatability.
- Docs Sync: docs updated with behavior changes, changelog entries, impact matrix compliance.
- Security: auth, secrets, data protection, dependency risk, destructive-operation safeguards.
- Maintainability: naming, duplication, dead code, conventions, file/module size, refactor risk.
- Observability: logs, metrics, traces, errors, health checks, debug commands, inspection workflow.

## Mechanical Checks Rule

When possible, use or create scripts that check harness consistency. Scripts should include:

```txt
scripts/check-docs-sync.sh
scripts/check-task-tracking.sh
scripts/check-no-debug-logs.sh
scripts/check-spec-changelog.sh
scripts/check-required-planning-files.sh
scripts/check-architecture-boundaries.sh
scripts/run-verification.sh
```

These scripts do not need to be perfect, but they should provide practical guardrails. Document all checks in `.planning/checks/CHECKS.md`.

## Escalation Rule

Stop and ask the user before continuing when product intent is unclear, requirements conflict, a public API breaking change is required, destructive migration is required, deleting user data is possible, credentials or secrets are missing, paid external services are required, a security tradeoff is unclear, legal/compliance concern exists, or the change conflicts with existing architecture decisions.

Record escalations in `.planning/ESCALATION.md`.

## Review Rule

After tests pass, review all changed files. Check unnecessary files, unused code, duplicated logic, debug logs, poor naming, missing tests, missing docs update, architecture drift, convention violations, security risks, performance risks, and best-practice improvements.

Record the review in the related feature `REVIEW.md`, bug `REVIEW.md`, phase `REVIEW.md`, and `.planning/SUMMARY.md`.

## Completion Report Rule

Final response must include:

```md
## Completed

- What was done

## Planning Updated

- Files updated under `.planning/`

## Code Changed

- Files changed

## Tests / Verification

- Tests added/updated
- Commands run
- Result

## Docs Sync

- Docs updated
- If none, explain why

## Tracking

- Tasks changed from `[ ]` or `[~]` to `[x]`

## Review

- Changed files reviewed
- Cleanup performed

## Risks / Follow-up

- Remaining risks
- Suggested next step
```

Do not say completion is done unless tests or verification passed, tracking was updated, docs were synced or explicitly declared unnecessary, changed files were reviewed, and unnecessary files/debug code were removed.

## Default `config.json`

When initializing, create:

```json
{
  "workflow": {
    "init_requires_confirmation": true,
    "research_before_plan": true,
    "best_practice_research": true,
    "diagram_before_implementation": true,
    "test_first": true,
    "task_tracking": true,
    "docs_sync_required": true,
    "lessons_read_required": true,
    "code_review": true,
    "cleanup_pass": true,
    "mechanical_checks": true,
    "audit_supported": true,
    "escalation_required": true
  },
  "tracking": {
    "todo": "[ ]",
    "in_progress": "[~]",
    "done": "[x]",
    "blocked": "[!]"
  },
  "required_reads_before_work": [
    ".planning/SUMMARY.md",
    ".planning/STATE.md",
    ".planning/PITFALLS.md",
    ".planning/LESSONS_LEARNED.md",
    ".planning/CONVENTIONS.md",
    ".planning/ARCHITECTURE.md",
    ".planning/STACK.md"
  ],
  "docs_sync_targets": [
    ".planning/REQUIREMENTS.md",
    ".planning/API_DOCS.md",
    ".planning/ARCHITECTURE.md",
    ".planning/DESIGN.md",
    ".planning/INTEGRATIONS.md",
    ".planning/CONVENTIONS.md",
    ".planning/ROADMAP.md",
    ".planning/STATE.md",
    ".planning/SPEC_CHANGELOG.md",
    ".planning/QUALITY_SCORE.md",
    ".planning/OBSERVABILITY.md",
    ".planning/JOURNEYS.md",
    ".planning/SMOKE_TESTS.md"
  ],
  "mermaid_required_for": [
    "architecture",
    "database",
    "api_flow",
    "integration",
    "deployment",
    "feature_flow",
    "auth_flow",
    "background_job_flow"
  ],
  "escalate_when": [
    "ambiguous_product_intent",
    "conflicting_requirements",
    "breaking_api_change",
    "destructive_migration",
    "possible_user_data_loss",
    "missing_credentials",
    "paid_external_service_required",
    "unclear_security_tradeoff",
    "legal_or_compliance_risk"
  ]
}
```

## Final Hard Rules

1. `/init` must not blindly create implementation code.
2. If the app idea is missing or ambiguous, ask for confirmation first.
3. Create root `AGENTS.md` as a concise table of contents.
4. Every task must be tracked with `[ ]`, `[~]`, `[x]`, or `[!]`.
5. Do not say a task is done unless tracking files are updated.
6. Every behavior/spec/API/DB/UI/integration/config/security change must update related docs.
7. Before bug fix or feature work, always read `PITFALLS.md`, `LESSONS_LEARNED.md`, `CONVENTIONS.md`, `ARCHITECTURE.md`, and `STACK.md`.
8. Every bug fix must append a lesson to `LESSONS_LEARNED.md`.
9. Every non-trivial feature must have `SPEC.md`, `IMPACT.md`, `PLAN.md`, `TEST_CONTRACT.md`, `TASKS.md`, `VERIFICATION.md`, `REVIEW.md`, and `DIAGRAM.mmd`.
10. Plans must clearly say what changes, where it changes, why it changes, risks, docs impact, and verification commands.
11. Research best practices before planning when internet is available.
12. Never invent external research results.
13. Mermaid diagrams must be updated before architecture-impacting implementation.
14. Tests or verification must be created before implementation.
15. Review changed files after verification passes.
16. Remove unnecessary files, debug logs, dead code, and unrelated changes.
17. Use ADRs for major technical decisions.
18. Use `/audit` to detect architecture drift, stale docs, dead code, missing tests, and quality gaps.
19. Escalate to the user when human judgment is required.
20. Final response must include changed files, tests, docs sync, tracking updates, review result, and remaining risks.
