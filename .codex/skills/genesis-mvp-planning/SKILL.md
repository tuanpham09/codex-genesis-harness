---
name: genesis-mvp-planning
description: "Define, structure, and automate the creation of a standard 5-Phase MVP Roadmap right after project initialization. Guarantees a decision-complete path to production-ready launch."
---

# Genesis MVP 5-Phase Planning Skill

## Purpose

The `genesis-mvp-planning` skill is designed to transition a newly initialized project into a structured, decision-complete **5-Phase MVP Roadmap**. Instead of leaving the repository with only a blank generic Phase 0 (Foundation) folder, this skill maps out the entire lifecycle of a production-ready Minimum Viable Product across exactly 5 logical, sequential phases.

---

## When to use

Use the `genesis-mvp-planning` skill when:
- You have just run `/genesis-init` (or `/init`) and need to map out the implementation timeline.
- You want to scope an application specifically to its MVP (Minimum Viable Product) boundaries.
- You want to establish clear gates and milestones for each stage of the project lifecycle.

---

## When NOT to use

Do NOT use the `genesis-mvp-planning` skill when:
- The project is already midway through development with a pre-existing mature roadmap.
- The task is a minor, single-file bug fix or simple refactoring that doesn't affect the project timeline.
- The roadmap has already been fully approved and is currently active.

---

## Inputs required

Before running this planning skill, ensure the following inputs are gathered:
- **Project Brief / Intent**: Clear understanding of what application is being built and target users.
- **Technology Stack**: Backend, frontend, database, auth provider, and deployment target.
- **Core MVP Features List**: The primary business value proposition that must be delivered.

---

## Outputs required

Executing this skill creates the following structured deliverables:
- `.planning/ROADMAP.md`: Updated roadmap with 5 distinct phases defined.
- `.planning/phases/PHASE_1_CORE/`: Planning directory for Phase 1 (Foundation & API Core).
- `.planning/phases/PHASE_2_AUTH/`: Planning directory for Phase 2 (Authentication & Security).
- `.planning/phases/PHASE_3_FEATURES/`: Planning directory for Phase 3 (Core MVP Features).
- `.planning/phases/PHASE_4_INTEGRATIONS/`: Planning directory for Phase 4 (Third-Party Integrations).
- `.planning/phases/PHASE_5_READINESS/`: Planning directory for Phase 5 (Production Readiness & Observability).

---

## Required tests

The planning deliverables are validated using:
- [ ] `test/planning/roadmap-structure.test.js`: Verifies `ROADMAP.md` contains all 5 phases with valid status checkboxes.
- [ ] `test/planning/phase-completeness.test.js`: Verifies each phase directory contains standard `SPEC.md`, `PLAN.md`, and `TASKS.md`.

---

## Required fixtures

- `fixtures/planning/roadmap-expected.md`: The canonical structure of a 5-Phase MVP roadmap.
- `fixtures/planning/phase-config-expected.json`: Complete configuration template mapping out the 5 phases.

---

## Required contract updates

Update the following files if phase boundary standards change:
- `contracts/planning/roadmap.schema.json`: Schema validator for `ROADMAP.md` files.
- `contracts/planning/phase.schema.json`: Schema validator for individual phase directories.

---

## Required codebase map updates

After mapping out the 5-Phase MVP:
- **`.codebase/CURRENT_STATE.md`**: Update current phase to Phase 1, and add the full 5-phase overview.
- **`.codebase/MODULE_INDEX.md`**: Add references to each of the 5 phase directories.

---

## Token saving rules

1. **Reuse templates**: Do not rewrite the basic structure of the phases. Use the provided phase templates in `templates/`.
2. **Summarize context**: Do not read every detail of the repository. Use `SUMMARY.md` and module index.
3. **Draft sequentially**: Plan one phase at a time to keep prompt sizes small.

---

## Acceptance criteria

The 5-Phase MVP roadmap is ACCEPTED when:
- [ ] `ROADMAP.md` is updated with 5 clearly defined phases, dates, and success criteria.
- [ ] All 5 phase planning folders (`PHASE_1_CORE` to `PHASE_5_READINESS`) are created and populated.
- [ ] No feature code is written before the 5 phase boundaries are validated.

---

## Common mistakes

### Mistake 1: Starting Phase 3 (Core Features) before Phase 1 (API Core)
- **Problem**: Writing UI screens without verified backend models and schemas leads to massive rework.
- **Fix**: Complete Phase 1 and 2 to establish a solid database and API contract first.

---

## Recovery workflow

### Recovery 1: Phase drift or timeline changes
1. Mark the affected phase as `[!] blocked` in `ROADMAP.md`.
2. Document the change in `SPEC_CHANGELOG.md`.
3. Adjust downstream phase boundaries accordingly.
