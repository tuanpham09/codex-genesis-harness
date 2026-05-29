#!/usr/bin/env bash
set -euo pipefail

confirmed="${PROJECT_BRIEF_CONFIRMED:-0}"
root="."

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
    --help|-h)
      echo "Usage: $0 --confirmed [--root path]" >&2
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

mkdir -p \
  .planning/diagrams \
  .planning/research \
  .planning/decisions \
  .planning/phases/01-foundation \
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

TBD

## Target Users

TBD

## Core Value

TBD

## Product Scope

- [ ] TBD

## Out Of Scope

- [ ] TBD

## Constraints

- [ ] TBD

## Assumptions

- [ ] TBD

## Current Milestone

TBD

## Success Criteria

- [ ] TBD
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

| Phase | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|
| 01 Foundation | [ ] | None | Planning harness initialized and verified |
EOF

write_if_missing .planning/STATE.md <<'EOF'
# State

Current project state: [ ] Initialized planning harness pending product confirmation.
Current phase: 01 Foundation
Current feature or bug: None
Last completed task: None
Next task: Confirm project brief and refine planning docs.
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
| Foundation | [ ] | 01 | phases/01-foundation | Pending |
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

- [ ] Initialize and confirm planning harness.

## Recent Changes

- [ ] Initial planning skeleton created.

## Next Recommended Task

- [ ] Confirm product brief and fill required planning docs.
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

write_if_missing .planning/phases/01-foundation/PLAN.md <<'EOF'
# 01 Foundation Plan

- [ ] Confirm project brief
- [ ] Complete core planning docs
- [ ] Establish verification commands
- [ ] Run initial audit
EOF
write_if_missing .planning/phases/01-foundation/TASKS.md <<'EOF'
# 01 Foundation Tasks

- [ ] Confirm product intent
- [ ] Inspect repository
- [ ] Initialize `.planning/`
- [ ] Fill stack and architecture docs
- [ ] Run verification scripts
- [ ] Review planning harness
EOF
write_if_missing .planning/phases/01-foundation/TESTS.md <<'EOF'
# 01 Foundation Tests

- [ ] Required planning files exist
- [ ] Task tracking exists
- [ ] Base diagrams exist
EOF
write_if_missing .planning/phases/01-foundation/VERIFICATION.md <<'EOF'
# 01 Foundation Verification

- [ ] Run required planning file check
- [ ] Run task tracking check

```sh
.planning/scripts/check-required-planning-files.sh .
.planning/scripts/check-task-tracking.sh .
```
EOF
write_if_missing .planning/phases/01-foundation/REVIEW.md <<'EOF'
# 01 Foundation Review

- [ ] Changed files reviewed
- [ ] Unnecessary files removed
- [ ] Docs synchronized
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
script_source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for script in "$script_source"/*.sh; do
  cp "$script" ".planning/scripts/$(basename "$script")"
  chmod +x ".planning/scripts/$(basename "$script")"
done

echo "Project Genesis Harness planning files initialized."
