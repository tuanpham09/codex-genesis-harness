---
name: harness-engineering-skill
description: "Evolve the Codex harness itself: verification loops, repository memory, test-first scaffolds, resumability, observability, and autonomous workflow reliability. Use for changes to this repository's skill system or harness architecture."
---

# Harness Engineering Skill

**Automated evolution, verification scaling, and structural safety loop engineering for Codex developer environments**

---

## Purpose

To provide a robust, self-healing, and deterministic development environment for autonomous coding agents (Codex). Harness Engineering shifts the focus from writing soft, non-deterministic natural language prompts to building hard, mechanically-enforced environmental constraints (feedback loops, test runners, custom lints, and state managers) that prevent agentic drift and guarantee software quality.

By scaling and optimizing this harness, we achieve two primary objectives:
1.  **Extreme Feedback Velocity**: Compressing the time from code generation to execution feedback (TDD loop) to allow rapid self-correction.
2.  **Safety & Invariance Enforcement**: Ensuring that all changes satisfy strict codebase constraints (lints, typechecks, API contracts, and E2E journeys) before completion is declared.

---

## When to use

Use this skill when:
-   **Modifying Core Verification Logic**: Adding new checks to `scripts/verify.sh` or expanding `scripts/run-evals.sh`.
-   **Evolving Codex Skills**: Modifying existing `.codex/skills/` metadata, workflows, templates, or checklists.
-   **Updating API, Agent, or Event Contracts**: Defining new schemas, request/response fixtures, or event topologies.
-   **Extending Observability**: Adding tracking files, decision-logging formats, or failure telemetry inside `observability/`.
-   **Configuring Distribution Channels**: Modifying the npm CLI wrapper (`bin/genesis-harness.js`), installers (`install.sh`), or CI/CD pipelines.

---

## When NOT to use

Do not use this skill for:
-   Implementing application-specific business logic or customer features.
-   General codebase research that does not affect the agentic operating environment.
-   One-off scripting tasks unrelated to the reliability and verification loop of Codex.

---

## Inputs required

To evolve the harness, Codex must have access to:
1.  **Current Operating Memory**: `.codebase/CURRENT_STATE.md` and `.codebase/MODULE_INDEX.md`.
2.  **Harness Test Matrix**: `.codebase/TEST_MATRIX.md` showing existing verification paths.
3.  **Target Workflow Specs**: The contract or script being evolved (e.g., `bin/genesis-harness.js`, `scripts/verify.sh`).
4.  **Verification Gap**: The failure scenario or regression that is not currently caught by the test suite.

---

## Outputs required

Every harness evolution must deliver:
1.  **Failing Regression Test**: A new verification case added to `scripts/verify.sh` or `scripts/run-evals.sh` that fails *before* implementation.
2.  **Atomic Implementation Change**: The minimum code, script, or structural edit required to pass the test.
3.  **Clean Run Log**: Execution proof showing `scripts/verify.sh` and `scripts/run-evals.sh` passing cleanly with exit code `0`.
4.  **Normalized Script Files**: LF line ending assurance on all modified `.sh` files to prevent Windows compatibility bugs.
5.  **Durable Memory Update**: A recovery checkpoint written to `.codebase/RECOVERY_POINTS.md`.

---

## Required tests

-   **Red-Green-Refactor Flow**: A failing assertion must be added to the test suite (`scripts/verify.sh` or `scripts/run-evals.sh`) prior to code modification.
-   **Command Integrity Check**: The CLI `genesis-harness` must be verified using `npm run pack:check` and local execution tests in a separate sandbox.
-   **Cross-Platform Validation**: All scripts must be checked for line-ending and interpreter syntax compatibility across POSIX/Bash environments on Windows/WSL and Linux.

---

## Required fixtures

-   **Contract Templates**: Up-to-date `.json` schema templates for all agent, event, API, and UI interaction contracts.
-   **Scaffold Fixtures**: Reusable sample files representing typical project states (like the `sample-feature` and `sample-bug` structures generated in test sandboxes).
-   **Expected Validation Outputs**: JSON or Markdown files representing the expected logs or decision outputs of a successful run.

---

## Required contract updates

-   **CLI-Skill Protocol**: Any change to CLI arguments, environment variable mappings, or directory output paths must be immediately reflected in `.codex-plugin/plugin.json`.
-   **Agent 캐릭터 Contracts**: Changes to agent execution behavior must be documented in `contracts/agents/` schemas.
-   **Event Topologies**: Updates to the event broker simulation must be verified against `contracts/events/` schemas.

---

## Required codebase map updates

-   **Module Index Sync**: Newly added skills or templates must be registered in `.codebase/MODULE_INDEX.md` and `.codex/SKILLS_INDEX.md`.
-   **Architecture Log**: Major design shifts in the harness workflow must be logged as Architecture Decision Records under `.codebase/decisions/` or `.planning/decisions/`.
-   **State Transition**: Recalculate and update the architecture and quality scores inside `.codebase/CURRENT_STATE.md`.

---

## Token saving rules

-   **Strict Ephemerality**: Treat the model's context window as volatile. Write key state updates to on-disk files (`task.md` and `.codebase/` memory) between steps instead of carrying huge logs in the prompt history.
-   **On-Demand Loading**: Never load multiple `SKILL.md` files at once. Read the `.codebase/context/` summaries to target specific sub-directories.
-   **Keep Commands Silent**: Suppress verbose compiler or script outputs (`>/dev/null`) unless a failure occurs, saving significant context tokens.

---

## Acceptance criteria

A harness modification is accepted *only* when:
-   [x] The new check fails first in a fresh, isolated run of the verification pipeline.
-   [x] The minimal change is implemented, resulting in a successful pass of `verify.sh` and `run-evals.sh` with exit code `0`.
-   [x] All changed `.sh` files are validated to have LF line endings and parse cleanly without syntax warnings.
-   [x] CLI dry-run package checks (`npm run pack:check`) confirm package integrity.
-   [x] The evolution is documented in `.codebase/RECOVERY_POINTS.md` with exact recovery instructions.

---

## Common mistakes

-   **Writing prose instructions**: Attempting to guide the model using soft natural-language descriptions in READMEs instead of writing hard validation scripts.
-   **Duplicating context maps**: Storing identical configuration maps across multiple skills instead of importing standard `.codebase/` definitions.
-   **CRLF Line Ending Traps**: Checking in scripts with Windows line-endings (`\r\n`), causing execution syntax errors in WSL/POSIX shells.
-   **Generator-Evaluator Co-location**: Allowing the agent to grade its own output format using regex within its prompt instead of executing an external compiler or validator command.

---

## Recovery workflow

If a harness evolution breaks the local environment or causes test failures:
1.  **Isolate the Failing State**: Stop all active background processes and subagents.
2.  **Revert to Safety**: Run `git checkout -- <file>` to revert to the last committed stable state.
3.  **Read Recovery Point**: Inspect `.codebase/RECOVERY_POINTS.md` to identify the nearest stable checkpoint.
4.  **Write Minimal Reproducer**: Create a single, isolated script in the `scratch/` directory that demonstrates only the failure.
5.  **Re-attempt TDD**: Implement the fix on top of the reproducer before integrating back into the main harness.

---

## Core Invariants: The PEV Loop

Every agentic activity within this harness must strictly adhere to the **Plan-Execute-Verify (PEV)** pipeline:

```txt
   +---------------------------------------------------+
   |             Plan Phase (DoR Verified)             |
   |  - Research patterns and write on-disk PLAN.md    |
   +---------------------------------------------------+
                             |
                             v
   +---------------------------------------------------+
   |            Execute Phase (TDD Enforced)           |
   |  - Create failing unit test/verification check    |
   |  - Write minimal code to pass verification       |
   +---------------------------------------------------+
                             |
                             v
   +---------------------------------------------------+
   |             Verify Phase (DoD Verified)           |
   |  - Execute verify.sh and run-evals.sh             |
   |  - Normalize line-endings and format files        |
   +---------------------------------------------------+
```

Never skip a phase, and never claim completion without verifiable evidence of test passing.
