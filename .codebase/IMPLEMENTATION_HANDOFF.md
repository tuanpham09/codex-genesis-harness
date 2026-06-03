# Implementation Handoff: Harness Drift Gate Hardening + LeanCTX

**Completed date**: 2026-06-03  
**Status**: Completed, pending user-requested commit only  
**Owner**: Codex harness engineering  

## Summary

The harness has been hardened against source-of-truth drift, stale Mermaid graphs, placeholder handoffs, long skill entrypoints, and missing executable CLI smoke coverage. It now also ships portable LeanCTX defaults and auto-seeds them during install/postinstall when a project root is detected, so npm users get token-budget guidance without requiring a machine-specific command wrapper or a manual inspection command.

## Changed Subsystems

- **CLI**: `genesis-harness sync` now generates harness relationship Mermaid graphs and keeps roadmap-derived output generic so sample app task names do not leak into `.codebase/VISUAL_GRAPH.md`.
- **Verification**: `scripts/verify.sh` enforces a 500-line maximum for skill entrypoints. `scripts/run-evals.sh` now validates handoff freshness, state freshness, sync-generated Mermaid, and integration smoke coverage.
- **LeanCTX**: `.codebase/context-policy.json` defines token budget layers, `genesis-harness install` and npm `postinstall` seed it into detected projects without overwriting custom policies, `genesis-harness leanctx` reports the policy, `genesis-harness prime` includes the same policy, and `scripts/prompt_sentinel.js` reads the policy for compaction thresholds.
- **Skills**: Oversized `SKILL.md` entrypoints were converted into short routing files that point to existing references, playbooks, templates, and checklists.
- **State and memory**: `.codebase/CURRENT_STATE.md`, `.codebase/state.json`, `.codebase/TEST_MATRIX.md`, `.codebase/RECOVERY_POINTS.md`, `.codebase/DEPENDENCY_GRAPH.md`, `.codebase/PIPELINE_FLOW.md`, and `.codebase/VISUAL_GRAPH.md` now describe the current harness gates.

## Verification Evidence

Required commands for this handoff:

```bash
node --check bin/genesis-harness.js
node --check scripts/prompt_sentinel.js
node tests/integration/cli-smoke.test.js
node tests/unit/prompt_sentinel.test.js
bash -n scripts/verify.sh
bash -n scripts/run-evals.sh
npm run verify
npm run eval
npm run pack:check
node bin/genesis-harness.js docs-gate
```

Last expected status: all commands pass.

## Remaining Risks

- Full 10/10 WalkingLabs parity still requires CI/CD enforcement and an application-backed browser E2E target. This repo is a package harness, so the current executable E2E layer is CLI-focused.
- Worktree is intentionally not staged or committed until the user requests it.

## Resume Instructions

1. Start with `.codebase/CURRENT_STATE.md`, `.codebase/state.json`, and this handoff.
2. Re-run `npm run verify`, `npm run eval`, and `npm run pack:check` before publishing or committing.
3. If a future change reintroduces Mermaid or handoff drift, inspect `scripts/run-evals.sh` first; it owns the regression checks.
4. If skill entrypoint size fails, move operational detail into the skill's references, playbooks, templates, or checklists instead of raising the limit.
5. If token budget behavior changes, update `.codebase/context-policy.json`, install/postinstall seeding, `genesis-harness leanctx`, and `scripts/prompt_sentinel.js` together.
