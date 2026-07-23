# Feature Completion Fixture

## Given

- `.codebase/state.json` records one `active_feature`.
- `.planning/FEATURE_REGISTRY.json` records that feature as `in-progress`.
- The caller supplies a verification command and an evidence summary.

## When

```sh
genesis-harness complete-feature \
  --verify-cmd "npm test" \
  --evidence "All feature tests passed"
```

## Expected

- The verification command exits `0`.
- The registry feature status becomes `verified`.
- `.planning/FEATURE_INDEX.md` marks the feature `[x]`.
- State becomes `COMPLETED` and records feature lead-time metrics.
- An observability run record is written.
- The active `.runs/<session-id>` checkpoint is refreshed.

If verification exits non-zero, completion is blocked and `failed_gate_count` increments.
