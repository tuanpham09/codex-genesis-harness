# Decision: Feature Registry as Harness Primitive (L08)

**Date**: 2026-06-03  
**Session**: `2026-06-03-harness-engineering-L08-L11`  
**Skill**: `genesis-harness-engineering`

## Decision

Establish `features/REGISTRY.md` as the **single machine-readable source of truth** for all project features. Each feature entry must include: unique `id`, `status`, `title`, `verify_cmd` (executable verification command), and owning `skill`.

## Reason

**Harness Engineering Lecture 08** identifies the feature list as a "harness primitive" — not human prose, but an executable record the harness can validate. The previous state had features scattered across `ROADMAP.md` (prose) and `EVOLUTION_PLAN.md` (markdown narrative), with no per-feature verification command and no machine-readable status.

This meant:
1. An agent couldn't know which features were truly "verified" vs. "claimed done"
2. No CI gate could enforce feature status transitions
3. The harness couldn't generate per-feature test evidence

The fix closes this gap by creating a structured registry that `run-evals.sh` can parse and `feature_registry.test.js` can validate.

## Rejected Options

- **Option A**: Use a JSON file instead of Markdown table  
  *Rejected*: Markdown table is both human-readable and parseable. Keeps the "docs are code" principle without sacrificing discoverability.

- **Option B**: Use GitHub Issues as the feature list  
  *Rejected*: Violates L03 (repo is the single source of truth). External systems cannot be the harness primitive.

- **Option C**: Derive the list from `.planning/ROADMAP.md` automatically  
  *Rejected*: ROADMAP.md is narrative; auto-parsing prose is fragile. Explicit registry is safer.

## Verification

```
node tests/unit/feature_registry.test.js
→ feature_registry tests passed

scripts/run-evals.sh (L08 gate section)
→ evals passed
```

Both gates pass with exit code 0 after implementation. Failure record before fix: `observability/failures/sample-failure.json`.
