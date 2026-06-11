---
name: genesis-planning
description: Create decision-complete plans for Codex harness work, including tests, fixtures, contracts, memory updates, verification, and recovery. Use for new features, refactors, bug fixes, audits, or multi-phase autonomous work.
---

# Planning Skill

## Purpose
Turn intent into a test-first, contract-first, resumable implementation plan.

## When to use
Use before any non-trivial change, multi-file task, bug fix, refactor, or autonomous workflow.

## When NOT to use
Do not use for direct answers that require no repository mutation.

## Inputs required
Read `.codebase/CURRENT_STATE.md`, `.codebase/MODULE_INDEX.md`, `.codebase/TEST_MATRIX.md`, plus relevant contracts.

## Outputs required
Goal, success criteria, tests, fixtures, contracts, implementation phases, verification, memory updates, and rollback path.

## Required tests
Define the first failing test and expected failure reason.

## Required fixtures
List exact fixture files and expected outputs.

## Required contract updates
Identify contract files that must be created or changed.

## Required codebase map updates
List `.codebase` files to update after implementation.

## Token saving rules
Plan from memory summaries first; inspect only files needed to remove uncertainty.

## Acceptance criteria
An implementer can execute without making design decisions.

## Common mistakes
Planning implementation before tests, omitting fixtures, and leaving verification vague.

## Recovery workflow
If a plan becomes invalid, update the failing test and fixture first, then revise phases.

## MCP Automation Requirements

To ensure plans are grounded in long-term project context and not just short-term conversation history, you **MUST** use the following MCP server:
1. **`@modelcontextprotocol/server-memory`**: Use this MCP tool to automatically query the Knowledge Graph for past bugs, developer preferences, and architectural rules *before* drafting the implementation phases. Any new plan must respect the persistent memory graph.

---

## 🏗️ 5-Phase MVP Roadmap Standards

When decomposing large-scale features or initializing new project modules, you must enforce the **5-Phase MVP Roadmap Standard** using the provided templates:

1. **Phase 1: Core Foundation & Base Setup** (Templates: `phase-1-core.md`, `phase-2-auth.md`)
   - Establish environment skeletons, base CLI arguments, dependency configurations, and contract JSON structures.
   - Core DB migrations, model schemes, and basic configurations.
2. **Phase 2: Contract-First & Skeletal Tests** (Template: `phase-3-features.md`)
   - Compile exhaustive contract endpoints (`contracts/api/`) and mock fixture skeletons (`fixtures/api/`).
   - Auto-generate test skeletons in `tests/integration/` (RED state).
3. **Phase 3: Logic Implementation & Self-Healing** (Template: `phase-3-features.md`)
   - Implement minimal code handlers, controllers, or service endpoints.
   - Execute closed-loop Verify-Fix cycles autonomously until all tests turn GREEN. **CRITICAL**: Do NOT just run `npm test`. You MUST run `npx genesis-harness heal "<test-command>"`. If the test fails, this command will output an `[AGENT_DIRECTIVE]`. You must read the directive and automatically fix the code until it passes without stopping.
4. **Phase 4: Multi-Agent & External Integrations** (Template: `phase-4-integrations.md`)
   - Wire up external components, API sync triggers, or media providers.
5. **Phase 5: E2E Visual QA & Release Readiness** (Template: `phase-5-readiness.md`)
   - Execute full Playwright E2E smoke tests, visual regression checks, and packaging checklists.

### Related Planning Assets
* **Checklist**: `checklists/mvp-readiness.md`
* **Example**: `examples/5-phase-roadmap-example.md`
* **Templates**: `templates/phase-1-core.md`, `phase-2-auth.md`, `phase-3-features.md`, `phase-4-integrations.md`, `phase-5-readiness.md`

