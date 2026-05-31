# Production Bug Debug Checklist

**Purpose**: Structured investigation for production bugs with data integrity and user impact focus.

**Status**: MANDATORY - Complete before `/fix-bug` for production issues.

## Incident Assessment

- [ ] **Bug severity determined**:
  - Critical (service down, data loss): Requires hotfix
  - High (significant user impact): Next release or hotfix
  - Medium (inconvenience, workaround exists): Next release
  - Low (cosmetic, edge case): Backlog

- [ ] **User impact quantified**:
  - How many users affected?
  - What functionality broken?
  - Workaround available?
  - Revenue impact (if applicable)?

- [ ] **Reproducibility confirmed**:
  - Reproduced in staging environment first
  - Not reproduced in production → investigation in staging
  - Confirmed with actual user data (if possible)
  - Environment-specific or universal?

## Data Integrity Assessment

- [ ] **Data corruption checked**:
  - Database queried for anomalies
  - No orphaned records found
  - Foreign keys still valid
  - Timestamps/sequences consistent

- [ ] **Rollback strategy documented**:
  - Rollback steps written down
  - Data recovery plan if needed
  - Backup verified
  - Estimated rollback time

- [ ] **Data migration planned** (if applicable):
  - Affected data identified
  - Migration strategy documented
  - Backwards compatibility checked
  - Dry run successful

## Root Cause Investigation

- [ ] **Logs collected and analyzed**:
  - Error logs reviewed
  - Application logs checked
  - System logs examined
  - Timeline of events mapped

- [ ] **Recent changes identified**:
  - Last deployment time noted
  - Code changes reviewed (git log)
  - Configuration changes checked
  - Infrastructure changes noted

- [ ] **Affected versions identified**:
  - Bug introduced in version X
  - Affects which current versions?
  - Oldest affected version?
  - Fixed in which version?

- [ ] **Root cause identified** (or hypothesis):
  - Specific code/config location
  - Why was it missed in testing?
  - Dependency issue or implementation?
  - Environment-specific factor?

## Fix Strategy

- [ ] **Fix approach decided**:
  - Minimal fix vs architectural refactor?
  - Hotfix vs next release?
  - Backwards compatibility needed?
  - Breaking change implications?

- [ ] **Risk assessment completed**:
  - Could fix introduce new bugs?
  - Dependencies to check?
  - Side effects analyzed?
  - Test coverage adequate?

- [ ] **Verification plan documented**:
  - Metrics to monitor after fix
  - Rollback criteria defined
  - Health checks configured
  - Alert thresholds set

## Testing & Validation

- [ ] **Test created** (reproduces bug):
  - Failing test demonstrates bug
  - Test passes without bug (would fail)
  - Test with production-like data
  - Edge cases included

- [ ] **Fix validated** (in staging):
  - Test passes with fix
  - All related tests pass
  - No new test failures
  - Performance not degraded

- [ ] **Regression testing completed**:
  - Full test suite passes
  - Related features tested
  - Integration scenarios verified
  - Similar bugs searched for

## Deployment Planning

- [ ] **Deployment strategy determined**:
  - Staged rollout or immediate?
  - Feature flags needed?
  - Canary deployment approach?
  - Rollback testing done?

- [ ] **Communication planned**:
  - User notification (if applicable)
  - Workaround documented
  - ETA for fix communicated
  - Post-fix status update planned

- [ ] **Monitoring configured**:
  - Key metrics identified
  - Alerts set for regression
  - Dashboard created for tracking
  - On-call rotation aware

## Release & Monitoring

- [ ] **Release documentation complete**:
  - Fix summary written
  - User-friendly description
  - Migration steps (if needed)
  - Known issues documented

- [ ] **Rollback plan tested**:
  - Rollback procedure practiced
  - Time to rollback estimated
  - Backup verified
  - Stakeholders notified

- [ ] **Post-deployment monitoring** (first 24h):
  - Error rate watched
  - Performance metrics checked
  - User reports monitored
  - Rollback executed if issues

## Prevention & Lessons

- [ ] **Prevention documented**:
  - Better test coverage needed?
  - Contract/spec gap?
  - Monitoring enhancement?
  - Process improvement?

- [ ] **Similar bugs searched**:
  - Code pattern scanned
  - Similar issues found and tracked
  - Prevention applied broadly
  - Team notified

- [ ] **Documentation updated**:
  - Behavior change documented
  - Workaround removed (if applicable)
  - System documentation updated
  - Known issues list maintained

---

## Usage

When debugging production bug:

```bash
# 1. Assess severity
# - Critical: Hotfix needed
# - High: Plan for next release + hotfix consideration
# - Medium/Low: Standard fix process

# 2. Complete this checklist
cat .codex/skills/genesis-debug-guide/checklists/production-bug-debug.md

# 3. Proceed with /fix-bug
/fix-bug "Production issue: [description]"

# 4. After fix: genesis-debug-guide auto-triggers verification
```

## Hotfix vs Regular Release Decision

**Hotfix** (immediate deployment):
- ✅ Service down or data loss risk
- ✅ Critical user impact
- ✅ Can be isolated fix
- ✅ Adequate testing done
- ✅ Rollback strategy documented

**Regular Release** (next scheduled):
- ✅ Medium/Low severity
- ✅ Workaround available
- ✅ Can wait for next release
- ✅ No data integrity risk
- ✅ More complex fix with side effects

**Default**: Regular release unless severity assessment says otherwise.
