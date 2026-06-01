# Recovery Points

**Purpose**: Document where harness architecture implementation can be paused and resumed without losing context or creating inconsistencies.

**Use When**: Evolution of the Codex harness (verification loops, CLI tools, scripts) needs to be paused, or when a rollback is necessary due to environment breakage.

---

## Quick Reference: Current Recovery Points

| Phase | Status | Resumption File | Last Updated |
|-------|--------|-----------------|--------------|
| TUI Mockup Viewer Integration | ✓ Complete | `.codebase/CURRENT_STATE.md` | 2026-06-01 |
| Harness Verification Streamlining | ✓ Complete | `.codebase/CURRENT_STATE.md` | 2026-06-01 |
| Bead Memory Regression Tests | ✓ Complete | `scripts/run-evals.sh` | 2026-06-01 |
| Harness Engineering Overhaul | ⏸️ Idle (Stable) | `scripts/verify.sh` | 2026-06-01 |

---

## Phase: Harness Verification Streamlining & Memory Evals

**Status**: ✓ Complete  
**Last Updated**: 2026-06-01  

### What Happened

- Cleaned up legacy/deprecated skills (e.g., `genesis-mvp-planning`, `genesis-release-orchestration`) from `scripts/verify.sh`, `scripts/uninstall.sh`, and `scripts/run-evals.sh`.
- Removed hard-coded skill name mappings (`expected_name` switch statements), enabling dynamic mapping directly based on directory names.
- Added test coverage in `run-evals.sh` for the local bead memory commands (`remember`, `recall`, `prime`, `forget`).
- Enforced `state-machine.md` presence in `verify_harness_skill()`.

### Safe State Confirmation

The harness currently passes all structural tests cleanly.
```bash
# Verify structure
./scripts/verify.sh

# Verify regression
./scripts/run-evals.sh

# Dry-run package integrity
npm run pack:check
```

---

## Rollback Points

### If A Future Harness Evolution Breaks the CLI/Environment

**Rollback Level 1: Last Stable Run (Current State)**
If a new change to `bin/genesis-harness.js` or `scripts/verify.sh` creates infinite loops or immediate failures:
```bash
git checkout -- bin/genesis-harness.js scripts/verify.sh scripts/run-evals.sh
npm install
./scripts/verify.sh
```

**Rollback Level 2: Full Repository Reset**
If tests are failing in a manner that contaminates local fixtures or memory:
```bash
git reset --hard HEAD
git clean -fd
npm install
./scripts/verify.sh
```

---

## Checklist: Before Pausing Work on Harness Evolutions

- [ ] `scripts/verify.sh` passing cleanly (Exit Code 0)
- [ ] `scripts/run-evals.sh` passing cleanly (Exit Code 0)
- [ ] Script files verified for POSIX/LF line endings
- [ ] No uncommitted changes in core scripts that break existing workflows
- [ ] `.codebase/CURRENT_STATE.md` updated with exact phase details

---

## Contact For Questions
**Owner**: Codex Harness Engineering Team
**Last Validated**: 2026-06-01
