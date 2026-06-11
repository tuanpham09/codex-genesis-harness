# Lessons Learned & Historical Bugs

This file chronicles the major failures, recursive bugs, and architectural dead-ends we have encountered. It acts as an immune system preventing the agent from repeating history.

## 1. Duplicate Slash Commands in Registry
- **Symptom**: Agent registered 4 copies of the same slash command for a single skill.
- **Root Cause**: The CLI script recursively scanned the entire `.codex/` directory for active skills, accidentally parsing backup folders (`.codex/backup/`) generated during skill upgrades.
- **Resolution**: Backup directories must ALWAYS be placed completely outside the active parsed directory (e.g., moved to `~/.codex/backups` globally).
- **Rule**: When doing file tree walks for plugins/skills, always explicitly ignore `.git`, `node_modules`, `backup`, and `tmp` folders.

## 2. Documentation Drift & Broken Contracts
- **Symptom**: Code in `scripts/` changed logic without updating `contracts/`.
- **Root Cause**: Agent skipped the documentation step after a "quick fix" code edit.
- **Resolution**: Implemented Validation Gates (`npm run verify`).
- **Rule**: Never finalize a code edit without explicitly checking `TEST_MATRIX.md` and related schemas in `contracts/`. The validation gate will fail the build if it detects drift.

## 3. Excessive Token Usage from `cat` and `ls`
- **Symptom**: Context window flooded with massive minified bundle files or deep directory trees.
- **Root Cause**: Using `cat` on large files or `ls -R` without filters.
- **Resolution**: 
- **Rule**: Always use the native `view_file`, `list_dir`, and `grep_search` tools with precise line bounds or search terms. NEVER `cat` a file directly in bash if a native agent tool exists.

## 4. Init Must Not Depend On Explicit Slash Commands
- **Symptom**: The harness stayed idle on a blank repo until the user typed `/init`, even when the user had already provided a product idea.
- **Root Cause**: The entry skill documented `/init`, but the actual CLI/bootstrap path only exposed an explicit interactive command and did not scaffold discovery artifacts automatically.
- **Resolution**: Treat "empty repo + user idea" as implicit init in `genesis-harness` docs, and make CLI `init` call `init-planning.sh` to create Foundation, Discovery/QA, and dependency-map artifacts.
- **Rule**: For cold starts, initialize first, then ask the discovery/QA/tech-stack questions. Do not force the user to know the harness command vocabulary.

## 5. Auto-init Must Preserve The User Brief
- **Symptom**: Even after auto-init started running, the planner still dumped mostly `TBD` placeholders and lost the original idea unless the user repeated it.
- **Root Cause**: Initialization created structure but did not treat the first user brief as durable bootstrap input.
- **Resolution**: `genesis-harness init --idea "<brief>"` now seeds planning docs and planner state from the brief before follow-up QA begins.
- **Rule**: The first user idea is a source artifact. Persist it into planning docs and state immediately, then ask only the missing clarification questions.

## 6. Prompt Contracts Must Match Runtime Contracts
- **Symptom**: Skill docs and plugin prompts said the harness could auto-init from an idea, but the executable runtime still depended on manual follow-up and incomplete verification gates.
- **Root Cause**: Routing docs, plugin metadata, and gate definitions evolved separately from the actual CLI control flow.
- **Resolution**: Add a deterministic `genesis-harness run --idea ... --yes` pipeline, make `verify-gate` execute the full completion bar, and add regression tests for both.
- **Rule**: Do not describe a harness behavior in prompts or memory until there is a CLI/runtime path and a regression test that enforces it.

## 7. Resume Requires Durable Session Artifacts, Not Just State Labels
- **Symptom**: The harness could move into planning, but a later session still had to infer what to do next from scattered markdown because there was no canonical run checkpoint.
- **Root Cause**: `.codebase/state.json` carried phase labels, but there was no per-session artifact bundle tying brief, discovery answers, and next tasks together.
- **Resolution**: `run` now writes `.runs/<session-id>/INPUT.md`, `DISCOVERY.json`, `STATE.json`, and `RESUME.md`, and `resume` reads or backfills them from state.
- **Rule**: Any harness phase that claims resumability must emit a durable per-session artifact bundle and a deterministic resume entrypoint.

## 8. Discovery-Only Pipelines Still Break End-To-End Execution
- **Symptom**: `run --idea` looked complete in docs, but it only stopped at "Create the first feature plan", forcing a human or later session to bridge the actual execution gap manually.
- **Root Cause**: Discovery persistence existed, but there was no runtime handoff that turned approved scope into a concrete active feature scaffold.
- **Resolution**: `run` now creates the first feature scaffold automatically, seeds spec/plan/test-contract/verification files, records `active_feature`, and advances resumable state into `IMPLEMENTATION`.
- **Rule**: A harness pipeline is not end-to-end unless it leaves the next session inside an execution-ready slice with explicit tests, contracts, and verification steps already scaffolded.

## 9. Generic Execution Scaffolds Still Leave Contract Work To Humans
- **Symptom**: Even after execution bootstrap existed, the first feature slice still began with only generic planning files, so the next agent had to invent API/UI contracts and fixtures manually.
- **Root Cause**: The runtime scaffold did not classify the first slice by surface area and did not reuse the repository's contract and fixture structure.
- **Resolution**: The bootstrap now infers `ui`, `api`, or `full-stack` from discovery answers and emits typed artifacts in `contracts/ui/<feature>/`, `contracts/api/<feature>/`, `playwright/fixtures/`, and `fixtures/api/`.
- **Rule**: If a harness claims contract-first execution, the first slice must already contain the concrete contract and fixture paths needed by the likely implementation surface.
