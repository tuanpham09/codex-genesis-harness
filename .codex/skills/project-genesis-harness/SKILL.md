---
name: project-genesis-harness
description: Initialize and operate a project planning harness for Codex. Use this skill when the user types /init, asks to create a new project, add a feature, fix a bug, plan work, generate tests first, update docs, track phases, review changes, audit a repository, or manage architecture decisions.
---

# Project Genesis Harness

This skill turns Codex into a project operating harness.

Codex must not behave like a simple code generator. Codex must behave like a disciplined engineering agent that understands the project before coding, confirms missing product intent, researches the repository and best practices, plans before implementation, defines tests or verification first, keeps docs synchronized with code, tracks tasks explicitly, records bug lessons, maintains architecture diagrams, reviews changed files after implementation, removes unnecessary changes, and escalates when human judgment is required.

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
```

If the user does not type an exact command but clearly asks for one of these workflows, infer the correct workflow.

## Resource And Script Map

Bundled resources live under `resources/`. Use them as starting content when creating `.planning/` files:

- `planning-tree-template.md`: required `.planning/` tree.
- `agents-template.md`: concise root `AGENTS.md`.
- `project-template.md` through `check-template.md`: starter content for project, phase, feature, bug, ADR, research, review, verification, audit, and check files.

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
- `detect-stack.sh`: inspects repository stack clues.
- `list-changed-files.sh`: lists git changes when git is available.
- `run-verification.sh`: runs detected lint/typecheck/test/build checks.
- `check-docs-sync.sh`, `check-task-tracking.sh`, `check-no-debug-logs.sh`, `check-spec-changelog.sh`, `check-required-planning-files.sh`, `check-architecture-boundaries.sh`: mechanical harness checks.

## `/init` Workflow

When the user types `/init`, initialize the project planning harness. Before creating files, inspect the current repository.

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

After confirmation, create root `AGENTS.md`, the `.planning/` structure, initial planning files, base Mermaid diagrams, the first roadmap phase, initial checks, and the initial quality score. Use `scripts/init-planning.sh` when it fits the repository.

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

## Definition Of Done

Work is done only when:

- [x] implementation is complete and scoped to the plan
- [x] automated tests or documented verification passed
- [x] docs were synchronized, or no-docs-needed was justified
- [x] task tracking moved from `[ ]` or `[~]` to `[x]`
- [x] `STATE.md`, `SUMMARY.md`, and feature/bug/phase tracking are current
- [x] changed files were reviewed
- [x] debug logs, dead code, unrelated edits, and unnecessary files were removed
- [x] risks and follow-up tasks are recorded

Never use completion language until the Definition of Done is satisfied.

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

When adding a new feature, first read:

```txt
.planning/SUMMARY.md
.planning/STATE.md
.planning/PITFALLS.md
.planning/LESSONS_LEARNED.md
.planning/CONVENTIONS.md
.planning/ARCHITECTURE.md
.planning/STACK.md
```

Then research local patterns and best practices. Create:

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

`TASKS.md` must include checkbox tasks for required doc reads, pitfalls, lessons, codebase research, best-practice research, diagram, spec, impact, plan, test contract, failing tests or verification, implementation, verification, docs, review, cleanup, state, feature index, spec changelog, and completion tracking.

Prefer `scripts/create-feature.sh` for the initial folder and file scaffold, then fill the generated files with task-specific content.

## `/fix-bug` Workflow

Before fixing a bug, always read:

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

Bug `TASKS.md` must include checkboxes for reading pitfalls and lessons, reproducing the bug, identifying root cause, writing regression test or verification, fixing, verification, updating lessons learned, updating docs if behavior changed, reviewing changed files, updating state, and updating spec changelog if needed.

Prefer `scripts/create-bug.sh` for the initial folder and file scaffold, then fill the generated files with task-specific evidence.

After fixing the bug, append to `.planning/LESSONS_LEARNED.md`:

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

## `/plan` Workflow

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

## Docs Sync Rule

Whenever implementation changes behavior, API, data model, UI, integration, architecture, convention, config, environment variable, security behavior, or requirement, update all related docs.

Possible docs include:

- `.planning/REQUIREMENTS.md`
- `.planning/API_DOCS.md`
- `.planning/ARCHITECTURE.md`
- `.planning/DESIGN.md`
- `.planning/INTEGRATIONS.md`
- `.planning/STACK.md`
- `.planning/CONVENTIONS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/SPEC_CHANGELOG.md`
- `.planning/QUALITY_SCORE.md`
- `.planning/OBSERVABILITY.md`
- `.planning/SMOKE_TESTS.md`
- `.planning/JOURNEYS.md`
- `.planning/diagrams/*.mmd`
- `.planning/decisions/*.md`
- `.planning/features/*/*.md`
- `.planning/phases/*/*.md`
- `.planning/bugs/*/*.md`

If no docs need updating, explicitly explain why in the final report.

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
