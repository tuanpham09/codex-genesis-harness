# AGENTS.md

This repository packages the Genesis Codex skill set.

## Workflow

Before any task, read:

1. `.codex/SOUL.md` (Agent Identity & Core Rules)
2. `.codebase/memories/preferences.md` (User & Project Preferences)
3. `.codebase/CURRENT_STATE.md`
4. `.codebase/MODULE_INDEX.md`
5. `.codebase/TEST_MATRIX.md`

Then inspect only relevant files.

Default order:

1. Create or update the failing test.
2. Create fixture and expected output.
3. Update contract if behavior changes.
4. Implement the minimum change.
5. Run verification.
6. Update docs, memories, and `.codebase` state.
7. Record risks or recovery notes when needed.

## Skills

Primary skills live under `.codex/skills/`:

- `genesis-harness`
- `genesis-new-design`
- `genesis-upgrade-design`
- `genesis-architecture`
- `genesis-planning`
- `genesis-codebase-map`
- `genesis-design-spec`
- `genesis-api-contract`
- `genesis-ui-ux-test`
- `genesis-harness-engineering`
- `genesis-ai-provider`
- `genesis-pipeline-orchestration`
- `genesis-api-sync`
- `genesis-debug-guide`
- `genesis-docs-automation`
- `genesis-spec-propagation`
- `genesis-performance-profiling`
- `genesis-observability-automation`
- `genesis-research-first`
- `genesis-release`
- `spec-impact-engine`
- `genesis-executing-plans`
- `genesis-test-driven-development`
- `genesis-verification-before-completion`
- `genesis-using-git-worktrees`

Each skill must keep `SKILL.md`, `templates/`, `examples/`, and `checklists/`.

## Memory

Repository memory lives in `.codebase/`.

- `.codebase/memories/preferences.md` - Long-term developer preferences.
- `.codebase/memories/lessons_learned.md` - Log of past bugs and architectural decisions.
- `.codebase/context/` - Compressed codebase summaries.

Keep memory short and current. Do not duplicate long manuals here.

## Contracts And Fixtures

Contracts live in `contracts/`.

Fixtures live in `fixtures/`.

Every behavior change should have a contract or fixture update when public input/output changes.

## Tests

Harness verification:

```sh
./scripts/verify.sh
./scripts/run-evals.sh
npm run pack:check
```

Test architecture templates live in `tests/` and `playwright/`.

## Safety

Keep this file a map. Put durable detail in `.codebase/`, contracts, fixtures, skill templates, or README.

Do not claim completion without verification evidence.

## External Integrations & MCPs

To prevent reinventing the wheel and to optimize token usage, the agent must leverage external tools and MCP servers for specific domain tasks:

1. **Token Optimization & Code Navigation**
   - **Tree-sitter / Code Map MCP**: Extract function signatures and class definitions instead of loading full implementations.
   - **Git / GitHub MCP**: Read specific diffs or isolated commits rather than doing full repository analysis manually.

2. **Deep Research & Documentation**
   - **Web Search MCP**: Search for the latest framework documentation and GitHub issues before attempting complex bugs.
   - **URL Reader / Markdown Converter**: Fetch external API docs and parse them into clean, token-efficient markdown.

3. **Execution & Validation (Sandbox)**
   - **Jupyter / REPL MCP**: Test isolated code logic, regex patterns, or data transformations securely before committing to the main codebase.
   - **Chrome DevTools MCP / Playwright**: Perform automated UI interaction, Accessibility (a11y) auditing, and catch client-side JS errors.
   - **Cloud Run / Firebase MCP**: Validate infrastructure deployment and database security rules natively.

4. **Semantic Memory**
   - **Vector DB / SQLite MCP**: Store and query long-term lessons learned via vector search to instantly recall past bugs across massive codebases, replacing flat `.md` files where necessary.
