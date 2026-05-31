# Foundation Phase (Phase 0)

## Overview

Phase 0 is a setup phase only. Its purpose is to complete project documentation and establish the planning framework.

**This phase contains NO feature implementation tasks.**

Feature phases (Phase 1, 2, 3...) are created later only after:
- Requirements are finalized
- Product roadmap is confirmed
- Prioritization is decided

## Goal

Establish complete project documentation, confirm product intent, and prepare for feature development.

## Scope

- [x] Detect and extract project information
- [ ] Complete PROJECT.md with confirmed details
- [ ] Document all REQUIREMENTS.md
- [ ] Define ARCHITECTURE.md based on codebase inspection
- [ ] Document STACK.md (languages, frameworks, tools)
- [ ] Define CONVENTIONS.md (coding patterns, style)
- [ ] Document INTEGRATIONS.md (if any)
- [ ] Create API_DOCS.md structure
- [ ] Establish PITFALLS.md warnings
- [ ] Create base Mermaid diagrams
- [ ] Create initial QUALITY_SCORE.md
- [ ] Verify harness is functional

## Tasks

### Read & Confirm

- [ ] Read `.planning/PROJECT.md`
- [ ] Confirm product intent is clear
- [ ] Identify any missing requirements

### Document & Refine

- [ ] Complete `.planning/REQUIREMENTS.md` with functional & non-functional reqs
- [ ] Document `.planning/ARCHITECTURE.md` from codebase inspection
- [ ] Complete `.planning/STACK.md` with full tech details
- [ ] Document `.planning/CONVENTIONS.md` from existing code patterns
- [ ] Identify pitfalls and document in `.planning/PITFALLS.md`

### Diagrams & References

- [ ] Create `.planning/diagrams/system-context.mmd`
- [ ] Create `.planning/diagrams/container-architecture.mmd`
- [ ] Create `.planning/diagrams/database-erd.mmd` (if applicable)
- [ ] Create `.planning/diagrams/deployment-flow.mmd`

### Quality & Verification

- [ ] Initial QUALITY_SCORE.md (document current state)
- [ ] Verify `.planning/` structure is complete
- [ ] Verify all core docs have content (not just TBD)
- [ ] Run any existing tests/builds to verify health

## Dependencies

None. Phase 0 is the foundation.

## Acceptance Criteria

- [x] `.planning/` structure created
- [ ] PROJECT.md completed with confirmed product brief
- [ ] REQUIREMENTS.md lists all known requirements
- [ ] STACK.md documents all tech details
- [ ] ARCHITECTURE.md describes system design
- [ ] Diagrams are created and reasonably accurate
- [ ] CONVENTIONS.md documents local patterns
- [ ] No "TBD" remains in critical docs (PROJECT, REQUIREMENTS, STACK, ARCHITECTURE)
- [ ] Team/user confirms they understand the roadmap and agree with scope
- [ ] All verification checks pass

## Verification

```sh
# Check structure exists
ls -la .planning/phases/00-foundation/
ls -la .planning/*.md
ls -la .planning/diagrams/*.mmd

# Verify no critical TBDs remain
grep -l "TBD" .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/STACK.md .planning/ARCHITECTURE.md || echo "✓ No TBDs in critical docs"

# Run any project-specific verification
# npm test
# yarn lint
# python -m pytest
```

## Next Phase

After Foundation phase completes:

1. Create Phase 1 for first priority feature/milestone
2. Each phase gets its own numbered folder (01-feature-name, 02-feature-name, etc.)
3. Create feature-specific plans in `.planning/features/` as work begins

---

## Phase 0 vs Feature Phases

**Phase 0 (Foundation):**
- Documentation & setup
- No feature work
- Establishes framework
- All docs defined but empty

**Phase 1+ (Features):**
- Implement specific features
- Contain implementation tasks
- Follow Foundation as blueprint
- Created when requirements are clear

---

## Why No Feature Phases Initially?

We don't know what users need until we:
1. Complete requirements
2. Research existing patterns
3. Validate assumptions
4. Prioritize work

Phase 0 ensures we document existing state before planning future features.
