#!/usr/bin/env bash
set -euo pipefail

confirmed="${PROJECT_BRIEF_CONFIRMED:-0}"
idea="${USER_IDEA:-}"
root="."
script_source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --confirmed)
      confirmed="1"
      shift
      ;;
    --root)
      root="${2:-}"
      [ -n "$root" ] || { echo "--root requires a path" >&2; exit 2; }
      shift 2
      ;;
    --idea)
      idea="${2:-}"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 --confirmed [--root path] [--idea \"user brief\"]" >&2
      echo "Or: PROJECT_BRIEF_CONFIRMED=1 $0 [--root path]" >&2
      exit 0
      ;;
    *)
      root="$1"
      shift
      ;;
  esac
done

if [ "$confirmed" != "1" ]; then
  cat >&2 <<'EOF'
Refusing to initialize .planning/ because project intent has not been confirmed.

First summarize the detected project brief and get user confirmation.
Then rerun with:
  init-planning.sh --confirmed [--root path]

For an explicit blank harness, set PROJECT_BRIEF_CONFIRMED=1.
EOF
  exit 2
fi

cd "$root"

normalize_inline() {
  printf '%s' "$1" | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//'
}

trim_to_words() {
  local text="$1"
  local limit="${2:-8}"
  printf '%s\n' "$text" | awk -v limit="$limit" '{
    out="";
    for (i = 1; i <= NF && i <= limit; i++) {
      out = out (i == 1 ? "" : " ") $i
    }
    print out
  }'
}

normalized_idea="$(normalize_inline "$idea")"
detected_stack="$(bash "$script_source/detect-stack.sh" "$root" 2>/dev/null || true)"

if [ -n "$normalized_idea" ]; then
  idea_summary="$normalized_idea"
  project_title="$(trim_to_words "$normalized_idea" 8)"
  project_users="Users described in the brief and adjacent stakeholders."
  core_value="Turn the idea into a focused v1 outcome without losing the original brief."
  product_scope="- [ ] Build around this brief: $normalized_idea"
  current_milestone="Phase 1 discovery and planning bootstrap"
  success_criteria="- [ ] The first implementation plan stays aligned with this brief: $normalized_idea"
  functional_requirements="- [ ] Support the core flow implied by the brief: $normalized_idea"
  user_stories="- [ ] As a target user, I want the product described in this brief: $normalized_idea"
  acceptance_criteria="- [ ] Discovery confirms scope, QA path, and tech stack for: $normalized_idea"
  known_unknowns="- [ ] Confirm exact product approach, feature cut, and owners for: $normalized_idea"
  summary_focus="- [ ] Bootstrap planning from the user idea: $normalized_idea"
  summary_recent="- [ ] Init seeded planning docs from the first user brief."
  summary_next="- [ ] Close INIT_QA.md and turn this brief into approved scope."
  stack_direction="Product direction clue: $(printf '%s' "$normalized_idea" | cut -c1-140)"
else
  idea_summary="No explicit user brief captured yet."
  project_title="TBD"
  project_users="TBD"
  core_value="TBD"
  product_scope="- [ ] TBD"
  current_milestone="TBD"
  success_criteria="- [ ] TBD"
  functional_requirements="- [ ] TBD"
  user_stories="- [ ] As a user, I want TBD so that TBD."
  acceptance_criteria="- [ ] TBD"
  known_unknowns="- [ ] TBD"
  summary_focus="- [ ] Initialize harness and complete discovery / QA alignment."
  summary_recent="- [ ] Initial planning skeleton and discovery phase created."
  summary_next="- [ ] Answer INIT_QA.md and complete Phase 01 discovery artifacts."
  stack_direction="Product direction clue: TBD"
fi

if printf '%s' "$normalized_idea" | grep -Eiq 'mobile|ios|android|responsive'; then
  stack_hint="Mobile-first delivery is implied by the brief."
else
  stack_hint="TBD"
fi

current_iso_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
current_day_local="$(date +"%Y-%m-%d")"

mkdir -p \
  .codebase \
  .codebase/context \
  .codebase/failures \
  .codebase/memories \
  .planning/diagrams \
  .planning/research \
  .planning/decisions \
  .planning/phases/00-foundation \
  .planning/phases/01-discovery-and-qa \
  .planning/features \
  .planning/bugs \
  .planning/audits \
  .planning/checks \
  .planning/quick \
  .planning/codebase \
  .planning/templates

write_if_missing() {
  local path="$1"
  shift
  if [ ! -e "$path" ]; then
    cat > "$path"
  else
    cat >/dev/null
  fi
}

write_if_missing AGENTS.md <<'EOF'
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
EOF

write_if_missing .planning/PROJECT.md <<'EOF'
# Project

## What This Project Is

__PROJECT_WHAT__

## Target Users

__PROJECT_USERS__

## Core Value

__PROJECT_VALUE__

## Product Scope

__PROJECT_SCOPE__

## Out Of Scope

- [ ] TBD

## Constraints

- [ ] TBD

## Assumptions

- [ ] TBD

## Current Milestone

__PROJECT_MILESTONE__

## Success Criteria

__PROJECT_SUCCESS__
EOF

write_if_missing .planning/REQUIREMENTS.md <<'EOF'
# Requirements

## Functional Requirements

- [ ] TBD

## Non-Functional Requirements

- [ ] TBD

## User Stories

- [ ] As a user, I want TBD so that TBD.

## Acceptance Criteria

- [ ] TBD

## Edge Cases

- [ ] TBD

## Known Unknowns

- [ ] TBD
EOF

write_if_missing .planning/ROADMAP.md <<'EOF'
# Roadmap

**Note**: Phase 0 (Foundation) is setup and documentation only. Phase 1 captures discovery, QA alignment, and tech stack sign-off before feature phases are planned.

| Phase | Type | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| 00 Foundation | Setup | [ ] | None | Project docs completed, requirements confirmed, harness verified |
| 01 Discovery & QA | Validation | [ ] | 00 Foundation | Product approach confirmed, QA checklist answered, tech stack signed off |
| TBD | Feature | [ ] | 01 Discovery & QA | To be planned after requirements finalized |
EOF

write_if_missing .planning/STATE.md <<'EOF'
# State

Current project state: [ ] Initialized planning harness pending product confirmation.
Current phase: 00 Foundation (Setup phase - documentation only)
Current feature or bug: None
Last completed task: None
Next task: Run discovery Q&A to confirm product approach and tech stack.
Blocked items: None
Latest verification result: Not run
EOF

write_if_missing .planning/STACK.md <<'EOF'
# Stack

Language: TBD
Framework: TBD
Runtime: TBD
Database: TBD
Package manager: TBD
Test framework: TBD
Lint/typecheck tools: TBD
Deployment target: TBD
Version constraints: TBD

## Local Development Commands

```sh
# start
# test
# lint
# typecheck
# build
```
EOF

write_if_missing .planning/ARCHITECTURE.md <<'EOF'
# Architecture

## High-Level Architecture

TBD

## Module Boundaries

- [ ] TBD

## Data Flow

TBD

## Dependency Direction

TBD

## Service Boundaries

TBD

## System Design Principles

- [ ] TBD

## Forbidden Architecture Patterns

- [ ] TBD
EOF

write_if_missing .planning/DESIGN.md <<'EOF'
# Design

## UX Principles

- [ ] TBD

## Screens / Pages

- [ ] TBD

## Component Conventions

- [ ] TBD

## State Management Rules

- [ ] TBD

## Accessibility Notes

- [ ] TBD

## Design Constraints

- [ ] TBD
EOF

write_if_missing .planning/API_DOCS.md <<'EOF'
# API Docs

| Method | Path | Purpose | Auth |
|---|---|---|---|
| TBD | TBD | TBD | TBD |
EOF

write_if_missing .planning/INTEGRATIONS.md <<'EOF'
# Integrations

## External Services

- [ ] TBD

## Environment Variables

| Name | Purpose | Required | Notes |
|---|---|---:|---|
| TBD | TBD | TBD | TBD |
EOF

write_if_missing .planning/CONVENTIONS.md <<'EOF'
# Conventions

## Patterns To Follow

- [ ] TBD

## Patterns To Avoid

- [ ] TBD
EOF

write_if_missing .planning/PITFALLS.md <<'EOF'
# Pitfalls

- [ ] TBD
EOF

write_if_missing .planning/LESSONS_LEARNED.md <<'EOF'
# Lessons Learned

No bug lessons recorded yet.
EOF

write_if_missing .planning/SPEC_CHANGELOG.md <<'EOF'
# Spec Changelog

| Date/Time | Change | Reason | Impacted Docs | Impacted Tests | Migration Notes |
|---|---|---|---|---|---|
| TBD | Initial planning harness | Project initialization | All planning docs | Initial checks | None |
EOF

write_if_missing .planning/FEATURE_INDEX.md <<'EOF'
# Feature Index

| Feature | Status | Phase | Path | Notes |
|---|---|---|---|---|
| Foundation | [ ] | 00 | phases/00-foundation | Setup phase - documentation only |
EOF

write_if_missing .planning/CHANGE_IMPACT_MATRIX.md <<'EOF'
# Change Impact Matrix

| Change Type | Required Docs |
|---|---|
| API behavior | API_DOCS.md, REQUIREMENTS.md, SPEC_CHANGELOG.md |
| Database schema | ARCHITECTURE.md, API_DOCS.md, diagrams/database-erd.mmd, SPEC_CHANGELOG.md |
| UI behavior | DESIGN.md, REQUIREMENTS.md, SPEC_CHANGELOG.md |
| Integration | INTEGRATIONS.md, STACK.md, SPEC_CHANGELOG.md |
| Architecture | ARCHITECTURE.md, diagrams/*.mmd, decisions/*.md |
| Convention | CONVENTIONS.md, PITFALLS.md |
| Environment variable | INTEGRATIONS.md, STACK.md, SPEC_CHANGELOG.md |
| Security behavior | ARCHITECTURE.md, API_DOCS.md, CONVENTIONS.md, SPEC_CHANGELOG.md |
EOF

write_if_missing .planning/QUALITY_SCORE.md <<'EOF'
# Quality Score

| Area | Score | Issues | Next Action |
|---|---:|---|---|
| Architecture | 0/10 | TBD | TBD |
| Tests | 0/10 | TBD | TBD |
| Docs Sync | 0/10 | TBD | TBD |
| Security | 0/10 | TBD | TBD |
| Maintainability | 0/10 | TBD | TBD |
| Observability | 0/10 | TBD | TBD |
EOF

write_if_missing .planning/ESCALATION.md <<'EOF'
# Escalation

Codex must stop and ask the user before ambiguous product, security, destructive migration, paid-service, data-loss, compliance, or architecture-conflict decisions.

## Escalation Log

| Date/Time | Reason | Decision Needed | Resolution |
|---|---|---|---|
| TBD | TBD | TBD | TBD |
EOF

write_if_missing .planning/OBSERVABILITY.md <<'EOF'
# Observability

Logs: TBD
Metrics: TBD
Traces: TBD
Error reporting: TBD
Health checks: TBD
Debug commands: TBD
Local inspection commands: TBD
EOF

write_if_missing .planning/SMOKE_TESTS.md <<'EOF'
# Smoke Tests

- [ ] Start app
- [ ] Run health check
- [ ] Open main page or CLI command
- [ ] Test one core flow
- [ ] Verify logs do not show critical errors
EOF

write_if_missing .planning/JOURNEYS.md <<'EOF'
# Journeys

## Journey: First Core Flow

Steps:
1. TBD

Expected UI:
Expected API calls:
Expected DB state:
Expected logs:
Verification command:
EOF

write_if_missing .planning/SUMMARY.md <<'EOF'
# Summary

## Current Focus

- [ ] Initialize harness and complete discovery / QA alignment.

## Recent Changes

- [ ] Initial planning skeleton and discovery phase created.

## Next Recommended Task

- [ ] Answer INIT_QA.md and complete Phase 01 discovery artifacts.
EOF

write_if_missing .planning/INIT_QA.md <<'EOF'
# Init Discovery Q&A

Complete this immediately after `/init`. The next agent turn should request answers or explicit assumptions for every section below.

## Product Direction

- [ ] What problem is this project solving?
- [ ] Who is the primary user?
- [ ] What is the smallest acceptable v1 outcome?
- [ ] What approaches were considered and which one is preferred?

## QA Closure

- [ ] Happy path is described end-to-end.
- [ ] Failure and edge cases are listed.
- [ ] Out-of-scope items are explicitly captured.
- [ ] Acceptance criteria are measurable.
- [ ] QA sign-off owner is named.

## Tech Stack Sign-Off

- [ ] Backend/runtime choice confirmed.
- [ ] Frontend/client choice confirmed.
- [ ] Storage/database choice confirmed.
- [ ] Test strategy confirmed.
- [ ] Deployment target confirmed.
- [ ] Final tech stack owner is named.

## Required Output To User

Ask for a concise answer that closes:
1. product approach
2. tech stack
3. QA sign-off / approval owner
EOF

write_if_missing .planning/config.json <<'EOF'
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
EOF

for diagram in system-context container-architecture deployment-flow roadmap-flow; do
  write_if_missing ".planning/diagrams/$diagram.mmd" <<EOF
flowchart LR
  A["TBD"] --> B["TBD"]
EOF
done

write_if_missing .planning/diagrams/database-erd.mmd <<'EOF'
erDiagram
  ENTITY {
    string id
  }
EOF

write_if_missing .planning/research/SUMMARY.md <<'EOF'
# Research Summary

- [ ] TBD
EOF
write_if_missing .planning/research/best-practices.md <<'EOF'
# Best Practices Research

- [ ] TBD
EOF
write_if_missing .planning/research/github-patterns.md <<'EOF'
# GitHub Patterns Research

- [ ] TBD
EOF
write_if_missing .planning/research/alternatives.md <<'EOF'
# Alternatives

- [ ] TBD
EOF

write_if_missing .planning/decisions/ADR-001-tech-stack.md <<'EOF'
# ADR-001: Tech Stack

Status: Proposed

## Context

TBD

## Decision

TBD

## Alternatives Considered

- [ ] TBD

## Consequences

- [ ] TBD

## Risks

- [ ] TBD

## Mitigation

- [ ] TBD

## Verification Evidence

TBD
EOF

write_if_missing .planning/decisions/ADR-002-architecture.md <<'EOF'
# ADR-002: Architecture

Status: Proposed

## Context

TBD

## Decision

TBD

## Alternatives Considered

- [ ] TBD

## Consequences

- [ ] TBD

## Risks

- [ ] TBD

## Mitigation

- [ ] TBD

## Verification Evidence

TBD
EOF

write_if_missing .planning/phases/00-foundation/PLAN.md <<'EOF'
# 00 Foundation Plan

Phase 0 is documentation and setup only. No feature implementation.

- [ ] Confirm project brief
- [ ] Complete PROJECT.md, REQUIREMENTS.md, STACK.md
- [ ] Document ARCHITECTURE.md from codebase
- [ ] Extract CONVENTIONS.md patterns
- [ ] Create base Mermaid diagrams
- [ ] Establish verification commands
- [ ] Run initial quality audit
EOF
write_if_missing .planning/phases/00-foundation/TASKS.md <<'EOF'
# 00 Foundation Tasks

Setup and documentation phase - no feature implementation.

- [ ] Confirm product intent and brief
- [ ] Inspect existing repository structure
- [ ] Complete PROJECT.md with confirmed details
- [ ] Document REQUIREMENTS.md (functional & non-functional)
- [ ] Document STACK.md with all tech details
- [ ] Document ARCHITECTURE.md (module boundaries, data flow)
- [ ] Extract CONVENTIONS.md from existing patterns
- [ ] Identify PITFALLS.md warnings
- [ ] Create system-context.mmd diagram
- [ ] Create container-architecture.mmd diagram
- [ ] Create database-erd.mmd (if applicable)
- [ ] Create deployment-flow.mmd diagram
- [ ] Create initial QUALITY_SCORE.md
- [ ] Verify all `.planning/` structure exists
- [ ] Run existing project verification (tests, builds)
- [ ] Review planning harness is complete
EOF
write_if_missing .planning/phases/00-foundation/TESTS.md <<'EOF'
# 00 Foundation Tests

Verify documentation framework is in place.

- [ ] Required planning files exist
- [ ] No critical TBDs in PROJECT, REQUIREMENTS, STACK, ARCHITECTURE
- [ ] Task tracking exists
- [ ] Base diagrams exist (system-context, container-architecture, deployment-flow)
EOF
write_if_missing .planning/phases/00-foundation/VERIFICATION.md <<'EOF'
# 00 Foundation Verification

Verify setup phase is complete.

- [ ] Run required planning file check
- [ ] Run task tracking check
- [ ] Verify no critical TBD placeholders

```sh
.planning/scripts/check-required-planning-files.sh . || true
.planning/scripts/check-task-tracking.sh . || true
grep -L "TBD" .planning/{PROJECT,REQUIREMENTS,STACK,ARCHITECTURE}.md
```
EOF
write_if_missing .planning/phases/00-foundation/REVIEW.md <<'EOF'
# 00 Foundation Review

Review Phase 0 documentation quality.

- [ ] Changed files reviewed
- [ ] Unnecessary files removed
- [ ] Docs are clear and complete
- [ ] No TBD in core docs
- [ ] Team confirms understanding
EOF

write_if_missing .planning/phases/01-discovery-and-qa/PLAN.md <<'EOF'
# 01 Discovery & QA Plan

Phase 1 closes product direction before feature planning starts.

- [ ] Ask discovery questions from INIT_QA.md
- [ ] Confirm preferred product approach
- [ ] Confirm tech stack and deployment direction
- [ ] Record QA sign-off owner and acceptance criteria
- [ ] Update PROJECT.md, REQUIREMENTS.md, STACK.md, ROADMAP.md
- [ ] Mark feature planning ready
EOF
write_if_missing .planning/phases/01-discovery-and-qa/TASKS.md <<'EOF'
# 01 Discovery & QA Tasks

- [ ] Ask user to confirm product approach
- [ ] Ask user to confirm target users and success criteria
- [ ] Ask user to confirm backend, frontend, database, and deployment stack
- [ ] Run new-feature-qa checklist against current scope
- [ ] Run requirements-validation checklist
- [ ] Assign QA sign-off owner
- [ ] Update ADR-001-tech-stack.md with chosen stack
- [ ] Update PROJECT.md and REQUIREMENTS.md with approved direction
- [ ] Update STATE.md next task toward first feature plan
EOF
write_if_missing .planning/phases/01-discovery-and-qa/TESTS.md <<'EOF'
# 01 Discovery & QA Tests

- [ ] INIT_QA.md completed with no unresolved blockers
- [ ] STACK.md has confirmed stack values or documented assumptions
- [ ] QA owner and approval path recorded
- [ ] ROADMAP.md ready for first feature phase creation
EOF
write_if_missing .planning/phases/01-discovery-and-qa/VERIFICATION.md <<'EOF'
# 01 Discovery & QA Verification

- [ ] INIT_QA.md answered
- [ ] PROJECT.md, REQUIREMENTS.md, STACK.md updated
- [ ] ADR-001-tech-stack.md updated
- [ ] Next phase can be created without open product ambiguity
EOF
write_if_missing .planning/phases/01-discovery-and-qa/REVIEW.md <<'EOF'
# 01 Discovery & QA Review

- [ ] Product approach is explicit
- [ ] Tech stack is explicit
- [ ] QA sign-off path is explicit
- [ ] No blocking TBD remains for feature planning
EOF

write_if_missing .planning/features/FEATURE_TEMPLATE.md <<'EOF'
# Feature Template

Create feature folders as `.planning/features/NNN-feature-slug/` with SPEC.md, IMPACT.md, PLAN.md, TEST_CONTRACT.md, TASKS.md, VERIFICATION.md, REVIEW.md, and DIAGRAM.mmd.
EOF
write_if_missing .planning/bugs/BUG_TEMPLATE.md <<'EOF'
# Bug Template

Create bug folders as `.planning/bugs/NNN-bug-slug/` with REPORT.md, ROOT_CAUSE.md, PLAN.md, TEST_CONTRACT.md, TASKS.md, VERIFICATION.md, and REVIEW.md.
EOF

for audit in AUDIT_TEMPLATE architecture-drift dependency-audit dead-code-audit security-audit docs-freshness-audit; do
  write_if_missing ".planning/audits/$audit.md" <<EOF
# ${audit}

- [ ] TBD
EOF
done

write_if_missing .planning/checks/CHECKS.md <<'EOF'
# Checks

- [ ] Required planning files
- [ ] Task tracking
- [ ] Debug logs
- [ ] Spec changelog
- [ ] Architecture boundaries
- [ ] Project verification
EOF

write_if_missing .codebase/PHASE_DEPENDENCY_MAP.md <<'EOF'
# Phase Dependency Map

| Phase | Depends On | Purpose |
|---|---|---|
| 00 Foundation | None | Bootstrap planning harness and baseline docs |
| 01 Discovery & QA | 00 Foundation | Close product direction, QA checklist, and tech stack sign-off |
| Feature phases (TBD) | 01 Discovery & QA | Implementation planning begins only after discovery is closed |
EOF
for check in lint typecheck test build docs-sync architecture-fitness; do
  write_if_missing ".planning/checks/$check.md" <<EOF
# $check

Command:

\`\`\`sh
# TBD
\`\`\`

Pass criteria:
- [ ] TBD
EOF
done

write_if_missing .planning/quick/quick-fix-template.md <<'EOF'
# Quick Fix Template

- [ ] Confirm scope
- [ ] Reproduce or define verification
- [ ] Make minimal change
- [ ] Verify
- [ ] Update docs/tracking if behavior changed
EOF
write_if_missing .planning/quick/scratch.md <<'EOF'
# Scratch

Temporary notes. Promote durable knowledge to the proper planning file before completion.
EOF

for file in MAP ENTRYPOINTS MODULES DEPENDENCIES HOTSPOTS; do
  write_if_missing ".planning/codebase/$file.md" <<EOF
# $file

- [ ] TBD
EOF
done

for template in adr-template phase-plan-template task-template test-contract-template review-template bug-lesson-template feature-template bug-template audit-template check-template; do
  write_if_missing ".planning/templates/$template.md" <<EOF
# $template

- [ ] TBD
EOF
done

mkdir -p .planning/scripts
for script in "$script_source"/*.sh; do
  cp "$script" ".planning/scripts/$(basename "$script")"
  chmod +x ".planning/scripts/$(basename "$script")"
done

GH_PROJECT_WHAT="$project_title" \
GH_PROJECT_USERS="$project_users" \
GH_PROJECT_VALUE="$core_value" \
GH_PROJECT_SCOPE="$product_scope" \
GH_PROJECT_MILESTONE="$current_milestone" \
GH_PROJECT_SUCCESS="$success_criteria" \
perl -0pi -e 's/__PROJECT_WHAT__/$ENV{GH_PROJECT_WHAT}/g; s/__PROJECT_USERS__/$ENV{GH_PROJECT_USERS}/g; s/__PROJECT_VALUE__/$ENV{GH_PROJECT_VALUE}/g; s/__PROJECT_SCOPE__/$ENV{GH_PROJECT_SCOPE}/g; s/__PROJECT_MILESTONE__/$ENV{GH_PROJECT_MILESTONE}/g; s/__PROJECT_SUCCESS__/$ENV{GH_PROJECT_SUCCESS}/g' .planning/PROJECT.md

GH_FUNCTIONAL_REQUIREMENTS="$functional_requirements" \
GH_USER_STORIES="$user_stories" \
GH_ACCEPTANCE_CRITERIA="$acceptance_criteria" \
GH_KNOWN_UNKNOWNS="$known_unknowns" \
perl -0pi -e 's/- \[ \] TBD\n\n## Non-Functional Requirements/- [ ] TBD\n\n## Seeded From User Idea\n\n$ENV{GH_FUNCTIONAL_REQUIREMENTS}\n\n## Non-Functional Requirements/s; s/- \[ \] As a user, I want TBD so that TBD\./$ENV{GH_USER_STORIES}/g; s/## Acceptance Criteria\n\n- \[ \] TBD/## Acceptance Criteria\n\n$ENV{GH_ACCEPTANCE_CRITERIA}/s; s/## Known Unknowns\n\n- \[ \] TBD/## Known Unknowns\n\n$ENV{GH_KNOWN_UNKNOWNS}/s' .planning/REQUIREMENTS.md

GH_STACK_DIRECTION="$stack_direction" \
GH_STACK_HINT="$stack_hint" \
GH_STACK_CLUES="$detected_stack" \
perl -0pi -e 's/Version constraints: TBD/Version constraints: TBD\n\n## Product Direction Clues\n- $ENV{GH_STACK_DIRECTION}\n- $ENV{GH_STACK_HINT}\n\n## Repository Stack Clues\n$ENV{GH_STACK_CLUES}/s' .planning/STACK.md

GH_SUMMARY_FOCUS="$summary_focus" \
GH_SUMMARY_RECENT="$summary_recent" \
GH_SUMMARY_NEXT="$summary_next" \
perl -0pi -e 's/- \[ \] Initialize harness and complete discovery \/ QA alignment\./$ENV{GH_SUMMARY_FOCUS}/g; s/- \[ \] Initial planning skeleton and discovery phase created\./$ENV{GH_SUMMARY_RECENT}/g; s/- \[ \] Answer INIT_QA\.md and complete Phase 01 discovery artifacts\./$ENV{GH_SUMMARY_NEXT}/g' .planning/SUMMARY.md

GH_IDEA_SUMMARY="$idea_summary" \
perl -0pi -e 's/Complete this immediately after `\/init`\./Complete this immediately after `\/init`.\n\n## Original User Brief\n\n- [ ] $ENV{GH_IDEA_SUMMARY}\n/s' .planning/INIT_QA.md

write_if_missing .codebase/CURRENT_STATE.md <<EOF
# Current System State

**Time**: $current_day_local
**Status**: \`IN_PROGRESS\`
**Latest Session**: \`$current_day_local-auto-init-bootstrap\`

## Active Bootstrap

- Planning harness initialized automatically from the first user brief.
- Current planner phase: \`REQUIREMENTS_GATHERING\`
- User brief: $idea_summary
- Next task: Answer \`.planning/INIT_QA.md\` and confirm product approach, QA closure, and tech stack.
EOF

write_if_missing .codebase/state.json <<EOF
{
  "current_state": "REQUIREMENTS_GATHERING",
  "active_work": "Auto-init from user idea",
  "session_id": "$current_day_local-auto-init-bootstrap",
  "session_started_at": "$current_iso_utc",
  "latest_recovery_point": "Auto-init bootstrap in progress",
  "required_verification": [
    "genesis-harness init --yes --platform codex --idea '<user brief>'",
    "Answer .planning/INIT_QA.md",
    "Update .planning/PROJECT.md, REQUIREMENTS.md, STACK.md"
  ],
  "pending_tasks": [
    "Confirm product approach",
    "Confirm QA sign-off owner",
    "Confirm tech stack"
  ]
}
EOF

echo "Project Genesis Harness planning files initialized."
