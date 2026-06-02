# Spec Propagation Tracking & Logging

## Overview

Track every spec change propagation to prevent regressions and enable audit trails.

---

## Log File: SPEC_PROPAGATION_LOG.md

Create `.codebase/SPEC_PROPAGATION_LOG.md` to track all propagations.

### Format

```markdown
# Spec Propagation Log

## Propagation #1: Adding avatarUrl to User API

**Date**: 2026-05-31
**Type**: FEATURE (new optional field)
**Severity**: LOW
**Status**: ✅ COMPLETE

**Change**: Added avatarUrl field to User API response

**Affected Phases**:
- Phase 2 (Tests): ✅ Mocks updated, 3 new tests added
- Phase 3 (Backend): ✅ Handler returns avatarUrl
- Phase 4 (SDK): ✅ Types updated
- Phase 5 (E2E): ✅ UI tests updated

**Files Changed**:
- tests/fixtures/user-mocks.js (added mock with avatarUrl)
- tests/api.test.js (added 3 tests)
- src/handlers/user.handler.js (added avatarUrl field)
- contracts/api/response.json (updated schema)
- types/api.ts (added avatarUrl?: string)
- playwright/e2e/user.spec.ts (added avatar display test)

**Tests**:
- Phase 2 tests: ✅ 6/6 pass
- Phase 3 validation: ✅ Contract valid
- Phase 4 type-check: ✅ No errors
- Phase 5 E2E: ✅ 4/4 pass

**Issues Encountered**: None

**Time Taken**: 45 minutes

**Approvals**:
- Engineering Lead: @alice (2026-05-31)
- Code Review: @bob (2026-05-31)

**Commit**: abc123def456...

---

## Propagation #2: Removing deprecated avatar field

**Date**: 2026-06-01
**Type**: BREAKING (field removed)
**Severity**: HIGH
**Status**: ⏳ PENDING REVIEW

**Change**: Removed avatar field (deprecated since v1.5)

**Decision Gate**:
- [ ] Breaking change reviewed by engineering lead
- [ ] Migration guide complete
- [ ] Communication plan ready
- [ ] Timeline specified

**Affected Phases** (planned):
- Phase 2 (Tests): Remove avatar tests
- Phase 3 (Backend): Remove avatar handling
- Phase 4 (SDK): Remove avatar from types
- Phase 5 (E2E): Remove avatar UI tests

**Migration Guide**:
- File: docs/migration-v1-to-v2.md
- Status: ✅ Complete

**Timeline**:
- Deprecation period: 6 months
- Migration deadline: Jan 1, 2027
- Removal in: v2.0.0

**Status**: Awaiting engineering lead approval
```

---

## Tracking Template

Use this template for each propagation:

```markdown
## Propagation #{N}: {CHANGE_TITLE}

**Date**: YYYY-MM-DD
**Type**: BREAKING | FEATURE | NON-IMPACT
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Status**: 🔵 IN_PROGRESS | 🟡 PENDING_REVIEW | ✅ COMPLETE | ❌ FAILED

**Change Summary**: {1-2 sentence description}

**Root Cause**: {Why was this change needed?}

**Affected Phases**:
- Phase {N}: {What changed} - Status: ✅/⚠️/❌

**Files Modified** (with impact):
- {file1}: {what changed}
- {file2}: {what changed}

**Metrics**:
- Lines changed: {number}
- Files affected: {number}
- Tests updated: {number}
- Breaking: YES/NO

**Testing**:
- Phase 2: {X}/{Y} tests passing
- Phase 3: Validation: ✅/❌
- Phase 4: Type check: ✅/❌
- Phase 5: E2E: {X}/{Y} passing

**Issues Encountered**:
1. {Issue 1}: {Resolution}
2. {Issue 2}: {Resolution}

**Time Analysis**:
- Actual time: {duration}
- Estimated time: {duration}
- Variance: {+/- percentage}

**Risk Assessment**:
- Risk level: LOW | MEDIUM | HIGH
- Rollback needed: YES/NO
- Monitoring required: YES/NO

**Sign-Offs**:
- Engineering Lead: {name} ({date})
- QA Lead: {name} ({date})
- Tech Lead: {name} ({date})

**Commit**: {git commit hash}
**PR**: {pull request link}

**Post-Propagation**:
- All tests passing: ✅
- Metrics normal: ✅
- No regressions: ✅
- Ready for production: ✅

**Lessons Learned**:
- What went well: {positive}
- What could improve: {improvement}
- Pattern to document: {pattern}
```

---

## Monitoring Dashboard

Create a simple CSV for tracking:

**File**: `.codebase/propagation-metrics.csv`

```csv
date,change_type,severity,phases_affected,files_changed,time_hours,test_pass_rate,approved_by,status
2026-05-31,FEATURE,LOW,4,6,0.75,100%,engineering_lead,COMPLETE
2026-06-01,BREAKING,HIGH,5,8,3.5,100%,engineering_lead,PENDING
2026-06-05,FEATURE,LOW,3,4,0.5,100%,engineering_lead,COMPLETE
```

### Aggregated Metrics

Track over time:

```markdown
## Propagation Metrics (Last 30 Days)

**Total Propagations**: 12
**Successful**: 11 (92%)
**Failed**: 1 (8%)

**By Type**:
- Feature: 8 (avg 0.7 hours)
- Breaking: 2 (avg 3.2 hours)
- Non-impact: 2 (avg 0.3 hours)

**By Severity**:
- Critical: 0
- High: 2
- Medium: 4
- Low: 6

**Test Coverage**:
- Avg pass rate: 99%
- Min pass rate: 95%
- Failures: 1 (fixed in 2 hours)

**Approval Times**:
- Average review time: 2 hours
- Fastest: 15 minutes
- Slowest: 8 hours

**Time Savings vs Manual**:
- Manual estimate: 60+ hours (for 12 changes)
- Actual automated: 12 hours
- Savings: 48 hours (80% reduction!)
```

---

## Query: Find All Propagations

Quickly find propagations by criteria:

```bash
# Find all BREAKING changes
grep -B3 "^Type: BREAKING" .codebase/SPEC_PROPAGATION_LOG.md

# Find all propagations in June
grep "2026-06-" .codebase/SPEC_PROPAGATION_LOG.md

# Find failed propagations
grep "Status: ❌" .codebase/SPEC_PROPAGATION_LOG.md

# Find high-severity changes
grep "Severity: HIGH" .codebase/SPEC_PROPAGATION_LOG.md

# Calculate average time per phase
awk -F: '/Time Taken:/ {sum+=$2; count++} END {print "Avg:", sum/count}' .codebase/SPEC_PROPAGATION_LOG.md
```

---

## Impact Analysis Report

Run monthly to understand propagation health:

```markdown
# Monthly Spec Propagation Report - May 2026

## Summary
- Total propagations: 12
- Success rate: 92%
- Average time: 0.8 hours
- Time savings: 48 hours vs manual

## Breakdown by Phase

### Phase 2 (Tests)
- Updates required: 12/12 (100%)
- Avg time per update: 15 min
- Regression risk: LOW (comprehensive tests)

### Phase 3 (Backend)
- Updates required: 12/12 (100%)
- Avg time per update: 15 min
- Breaking changes: 2 (16.7%)

### Phase 4 (SDK)
- Updates required: 10/12 (83%)
- Avg time per update: 10 min
- Type mismatches detected: 1 (fixed)

### Phase 5 (E2E)
- Updates required: 8/12 (67%)
- Avg time per update: 8 min
- UI breakage: 0 (0%)

## Issues & Resolutions

| Issue | Frequency | Resolution | Time |
|-------|-----------|-----------|------|
| Test mock data not updated | 1 | Manual update + add pattern | 30 min |
| Type mismatch Phase 4↔3 | 1 | Update detection logic | 20 min |
| Migration guide incomplete | 1 | Template created | 45 min |

## Recommendations

1. **Add Phase 4↔3 validation**: Detect type mismatches earlier
2. **Enhance migration template**: Include more examples
3. **Track consumer communication**: Monitor for missed notifications
4. **Automate E2E updates**: Currently manual for 33% of changes

## Next Month Focus

- Implement Phase 4↔3 cross-layer validation
- Set target: 95%+ automated E2E updates
- Reduce breaking change review time: 2hrs → 1hr
```

---

## Query Examples

Find specific patterns:

```bash
# Find all changes affecting Phase 3 & Phase 5 together
grep -A5 "Affected Phases" .codebase/SPEC_PROPAGATION_LOG.md | grep "Phase 3" | grep "Phase 5"

# Find all breaking changes not yet approved
grep -B2 "Status: PENDING_REVIEW" .codebase/SPEC_PROPAGATION_LOG.md | grep "BREAKING"

# List all migration guides created
grep "Migration Guide" .codebase/SPEC_PROPAGATION_LOG.md

# Find longest propagations
grep "Time Taken" .codebase/SPEC_PROPAGATION_LOG.md | sort -t: -k2 -rn | head -5

# Count by status
grep "^**Status**:" .codebase/SPEC_PROPAGATION_LOG.md | sort | uniq -c
```

---

## Automatic Logging

When running propagation automation, auto-append to log:

```bash
#!/bin/bash
# Auto-append propagation log

LOG_FILE=".codebase/SPEC_PROPAGATION_LOG.md"
CHANGE_ID="$(git rev-parse --short HEAD)"
TIMESTAMP="$(date -u +%Y-%m-%d)"

cat >> "$LOG_FILE" << EOF

## Propagation #{N}: {AUTO_DETECTED_TITLE}

**Date**: $TIMESTAMP
**Commit**: $CHANGE_ID
**Type**: {AUTO_DETECTED_TYPE}
**Status**: ✅ COMPLETE

{Auto-populated from propagation logs}
EOF
```

---

## Archive Old Propagations

After 1 year, move propagations to archive:

```bash
# Create archive
git mv .codebase/SPEC_PROPAGATION_LOG.md .codebase/SPEC_PROPAGATION_LOG.2025.md

# Start new log
touch .codebase/SPEC_PROPAGATION_LOG.md

# Add header
echo "# Spec Propagation Log\n\n" >> .codebase/SPEC_PROPAGATION_LOG.md
```

---

## Related Files

- `.codebase/CURRENT_STATE.md` - Current phase status
- `.codebase/SPEC_CHANGELOG.md` - All spec changes (high-level)
- `.codebase/RECOVERY_POINTS.md` - Failed propagations & recovery
- `docs/migration-v*-to-v*.md` - Migration guides for breaking changes

