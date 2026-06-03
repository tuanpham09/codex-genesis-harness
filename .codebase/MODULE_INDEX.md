# Module Index

- `.codex/skills/`: packaged Codex skills.
- `bin/genesis-harness.js`: npm CLI for install, verify, uninstall, and path output.
- `scripts/verify.sh`: structural and smoke verification.
- `scripts/run-evals.sh`: package-level regression checks.
- `.codebase/`: compressed repository memory.
- `contracts/`: API, agent, event, and UI contract templates.
- `contracts/features/registry-schema.json`: JSON schema for the feature registry (L08).
- `contracts/observability/agent-run-schema.json`: JSON schema for agent-run observability logs (L11).
- `contracts/observability/failure-schema.json`: JSON schema for failure observability records (L11).
- `features/REGISTRY.md`: machine-readable feature list primitive — canonical status + verify_cmd per feature (L08).
- `fixtures/`: reusable test and validation fixtures.
- `tests/`: harness test architecture templates.
- `tests/unit/feature_registry.test.js`: validates feature registry schema and observability live data (L08 + L11).
- `playwright/`: UI smoke, e2e, and visual harness templates.
- `observability/`: autonomous run and decision logging templates.
- `observability/agent-runs/`: per-session agent execution records (L11).
- `observability/decision-logs/`: rationale logs for significant decisions (L11).
- `observability/failures/`: failure records with root-cause and prevention notes (L11).

