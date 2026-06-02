# Repository Memory System

The `.codebase/` directory contains persistent, compressed documentation about the project state, architecture, and ongoing work. This is the **single source of truth** for understanding the codebase.

## Core Reference Files

### CURRENT_STATE.md
**What**: Snapshot of the project's current status
**Update**: After every significant change or phase completion
**When to read**: Before starting work to understand what's been done

### MODULE_INDEX.md
**What**: Complete inventory of all modules, skills, and components
**Update**: When adding/removing modules or significant restructures
**When to read**: To find where functionality lives

### TEST_MATRIX.md
**What**: Coverage status of all testable components
**Update**: After writing tests, every sprint
**When to read**: To identify testing gaps and priorities

### ARCHITECTURE.md
**What**: System design, data flow, and integration points
**Update**: When architecture decisions change
**When to read**: Before major refactoring or new features

### API_CONTRACTS.md
**What**: All API endpoints, schemas, and breaking changes
**Update**: When API changes (must update before implementation)
**When to read**: Before working on API features

### DOMAIN_MODELS.md
**What**: Core data structures and business logic rules
**Update**: When domain models evolve
**When to read**: To understand business constraints

### PIPELINE_FLOW.md
**What**: AI pipeline orchestration and data flow
**Update**: When pipeline configuration changes
**When to read**: To understand job execution order and dependencies

### DEPENDENCY_GRAPH.md
**What**: Module dependencies and relationships
**Update**: When adding new dependencies or removing unused ones
**When to read**: Before major refactoring to understand impact

### UI_ROUTES.md
**What**: Frontend routes, pages, and navigation flow
**Update**: When adding/removing pages or changing routes
**When to read**: To understand frontend structure

### EVOLUTION_PLAN.md
**What**: Future features, roadmap, and planned changes
**Update**: During planning phases
**When to read**: To align current work with long-term goals

### KNOWN_PROBLEMS.md
**What**: Active bugs, technical debt, and limitations
**Update**: When discovering or fixing issues
**When to read**: Before starting features (may need workarounds)

## Context Summaries

The `context/` subdirectory contains compressed summaries for quick reference:

- `backend-summary.md` - Backend services, APIs, databases
- `frontend-summary.md` - UI structure, routes, components
- `pipeline-summary.md` - Job orchestration and data flow
- `providers-summary.md` - External services and integrations
- `render-summary.md` - Rendering engines and output formats
- `tests-summary.md` - Test coverage and strategies

**These are read-only reference documents.** Update the source files, not these summaries.

## Maintenance Guidelines

### Before Starting Any Task

1. Read `CURRENT_STATE.md` - Understand what's been done
2. Read relevant reference files based on your work type
3. Check `KNOWN_PROBLEMS.md` - Avoid duplicating known issues

### After Completing Work

1. Update `CURRENT_STATE.md` with your changes
2. Update any reference files affected by your work
3. If you solved a known problem, remove from `KNOWN_PROBLEMS.md`
4. Create a decision log in `../observability/decision-logs/`

### Keeping Memory Fresh

- Do NOT let `.codebase/` files go stale
- If a file is >6 months old without updates, it's likely outdated
- Run `./scripts/verify.sh` to check consistency
- When in doubt, inspect actual code rather than trusting old docs

## File Size Expectations

- Each file should be **2000-5000 lines MAX**
- If a file grows larger, split into subtopics
- Use `context/` subdirectory for compressed summaries
- Link to specific sections, don't duplicate content

## Structure

```
.codebase/
├── README.md (this file)
├── CURRENT_STATE.md
├── MODULE_INDEX.md
├── TEST_MATRIX.md
├── ARCHITECTURE.md
├── API_CONTRACTS.md
├── DOMAIN_MODELS.md
├── PIPELINE_FLOW.md
├── DEPENDENCY_GRAPH.md
├── UI_ROUTES.md
├── EVOLUTION_PLAN.md
├── KNOWN_PROBLEMS.md
└── context/
    ├── backend-summary.md
    ├── frontend-summary.md
    ├── pipeline-summary.md
    ├── providers-summary.md
    ├── render-summary.md
    └── tests-summary.md
```

## Quick Reference

| Task | Read First | Update After |
|------|-----------|--------------|
| New feature | CURRENT_STATE, EVOLUTION_PLAN | CURRENT_STATE, TEST_MATRIX |
| Bug fix | KNOWN_PROBLEMS, CURRENT_STATE | KNOWN_PROBLEMS, CURRENT_STATE |
| Refactoring | ARCHITECTURE, DEPENDENCY_GRAPH | ARCHITECTURE, DEPENDENCY_GRAPH |
| Testing | TEST_MATRIX | TEST_MATRIX, CURRENT_STATE |
| API work | API_CONTRACTS | API_CONTRACTS, CURRENT_STATE |
| Performance | PIPELINE_FLOW, DOMAIN_MODELS | CURRENT_STATE |
| Deployment | CURRENT_STATE, EVOLUTION_PLAN | CURRENT_STATE |
