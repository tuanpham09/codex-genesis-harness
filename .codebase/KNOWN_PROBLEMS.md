# Known Problems

Last updated: 2026-06-03

## Active Technical Debt

### TD-001: `SKILL.md` size boundary not auto-enforced during authoring
- **Symptom**: `genesis-observability-automation/SKILL.md` reached 383 lines before the `verify.sh` line-limit gate caught it. The gate catches after-the-fact but does not block during writing.
- **Impact**: L04 (Instruction Not Bloated) is only enforced at verification time, not at authoring time.
- **Mitigation**: Added `references/` split for the observability skill. Gate in `verify.sh` at 500-line hard cap.
- **Permanent Fix Needed**: Add a pre-commit git hook that warns when `SKILL.md` exceeds 200 lines.
- **Assigned to**: `genesis-harness-engineering`
- **Priority**: P2

### TD-002: `KNOWN_PROBLEMS.md` was not populated with actual debt (was 323 bytes)
- **Symptom**: L12 (Clean State Each Session) downgraded — the clean state file was effectively a placeholder.
- **Impact**: Agents in new sessions couldn't assess actual risk before starting work.
- **Fix applied**: This file (2026-06-03).
- **Status**: RESOLVED

### TD-003: Feature list existed only as prose (pre-2026-06-03)
- **Symptom**: Features were described in `ROADMAP.md` and `EVOLUTION_PLAN.md` as human narrative. No `verify_cmd` per feature. No machine-readable status.
- **Impact**: L08 (Feature List as Harness Primitive) gap — agent could not verify individual feature status programmatically.
- **Fix applied**: Created `features/REGISTRY.md` + `contracts/features/registry-schema.json` + test gate.
- **Status**: RESOLVED

### TD-004: Observability directories were empty scaffolding (pre-2026-06-03)
- **Symptom**: `observability/agent-runs/`, `decision-logs/`, `failures/` had no actual data.
- **Impact**: L11 (Observability Inside Harness) gap — harness was designed to observe but collected no data.
- **Fix applied**: Created schemas, sample run, sample failure, and real decision log.
- **Status**: RESOLVED

### TD-005: No per-session `session_id` in `state.json`
- **Symptom**: History entries have timestamps but no unique session identifier. Cannot cross-reference `state.json` with `observability/agent-runs/`.
- **Impact**: L05 (Session Continuity) — cannot trace which session produced which state transition.
- **Mitigation**: Added `session_id` field to state history entries (2026-06-03).
- **Permanent Fix Needed**: CLI `genesis-harness sync` should auto-write the session_id to state on each invocation.
- **Priority**: P2

### TD-006: Playwright templates not populated with executable tests
- **Symptom**: `playwright/` directory contains templates and fixtures but no runnable `.spec.js` files.
- **Impact**: L10 (E2E Testing Changes Outcomes) — E2E layer exists in design but not in execution.
- **Mitigation**: Added `playwright/e2e/auth/login-screen.spec.js` with mocked HTML route (2026-06-03).
- **Status**: RESOLVED

### TD-007: Cold-start test not automated
- **Symptom**: The 5-question cold-start test (L03) is documented conceptually but not executable as a CI gate.
- **Impact**: Drift between repo docs and actual cold-start readiness could go undetected.
- **Fix applied**: `scripts/cold-start-check.js` created (2026-06-03).
- **Priority**: P1 → RESOLVED

### TD-008: No automatic "Context Anxiety" detection
- **Symptom**: No mechanism detects when an agent is converging prematurely due to context pressure.
- **Impact**: L05 — agents may hallucinate completion under context pressure with no harness intervention.
- **Mitigation**: `genesis-verification-before-completion` skill partially addresses this through mandatory evidence.
- **Permanent Fix Needed**: Integrate a token-budget warning callback in the `prompt_sentinel.js` that flags imminent convergence.
- **Priority**: P3
