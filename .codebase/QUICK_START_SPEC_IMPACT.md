# Quick Start: Using the New Spec Impact System

**Goal**: Understand how to use the new automatic spec propagation features

---

## Scenario 1: API Change During Development

### What Happens

You're in Phase 1 (Auth system). You modify an API endpoint:

```
Before: GET /api/users/:id → { name, email, role }
After:  GET /api/users/:id → { id, name, email, roles[] }
```

### What You Do

```bash
# 1. Commit your changes
git add .planning/API_DOCS.md
git commit -m "feat: add roles array to user API endpoint"
git push

# OR manually trigger impact analysis
/spec-change .planning/API_DOCS.md
```

### What Happens Automatically

```
GitHub Actions triggers:
  ✓ Tests run (verify your change works)
  ✓ spec-impact-engine detects breaking change
  ✓ Finds Phase 2, 3, 4 depend on this API
  ✓ Auto-updates Phase 2 SPEC.md (your API call examples)
  ✓ Auto-updates Phase 2 TEST_CONTRACT.md (5 tests updated)
  ✓ Auto-updates Phase 3 SPEC.md (2 API calls updated)
  ✓ Auto-updates Phase 3 TEST_CONTRACT.md (8 tests updated)
  ✓ Runs tests in Phase 2 and 3 (both pass)
  ✓ Creates .codebase/IMPACT_REPORT_2026-05-30_14-30.md
  ✓ Auto-commits: "docs: auto-sync Phase 2,3 specs after API change [CI]"
  ✓ Auto-updates CURRENT_STATE.md: "Propagated to 2 phases"
```

### What You See

Email/notification:
```
✓ API Change Impact Report
  Breaking change detected: GET /api/users/:id response format

  Affected phases:
  - Phase 2: Updated 1 spec, 5 tests ✓
  - Phase 3: Updated 2 specs, 8 tests ✓
  - Phase 4: 1 related API call reviewed (manual)

  Timeline impact: +0 hours
  Status: Ready to proceed

  Developers: Phase 2 and 3 specs already updated!
```

---

## Scenario 2: Database Schema Change

### What Happens

You're in Phase 2 (Product Catalog). You add a field to products:

```sql
ALTER TABLE products ADD COLUMN category_id UUID;
```

### What You Do

```bash
# Update your implementation files
git add src/models/Product.ts
git add .planning/ARCHITECTURE.md
git commit -m "feat: add product categorization"
git push

# GitHub Actions triggers automatically
```

### What Happens Automatically

```
Spec-impact-engine:
  ✓ Detects ARCHITECTURE.md changed
  ✓ Detects database schema modified
  ✓ Severity: MEDIUM (potential downstream impact)
  ✓ Finds Phase 3 queries need category_id
  ✓ Finds Phase 4 admin dashboard needs category column
  
  Auto-update Phase 3:
  ✓ SPEC.md: updated product queries
  ✓ TEST_CONTRACT.md: added category assertions
  
  Flag for review Phase 4:
  ⚠️ Admin dashboard may need category column
  ⚠️ Manual review recommended
  
  Impact report:
  - Auto-updated: 1 phase
  - Manual review needed: 1 phase
  - Timeline impact: +30 min (Phase 4 review)
```

### What Phase 3 Developer Sees

```
Morning update: Phase 3 spec automatically updated!

What changed:
- Added: Product queries now include category_id
- Added: 3 new test cases for category filtering
- Status: Tests already passing ✓

Your action:
- Read updated SPEC.md (5 min)
- Confirm changes make sense
- Continue implementation

Time saved: 1 hour (you would have discovered this later)
```

---

## Scenario 3: Manually Trigger Impact Analysis

### When to Use

Sometimes you want to manually check impact before committing:

```bash
# Analyze impact of a spec change WITHOUT committing
/spec-change .planning/REQUIREMENTS.md
```

### What You Get

```
Spec Change Analysis

File: .planning/REQUIREMENTS.md
Changed section: Shopping Cart Behavior

Old spec: "Cart should persist 1 hour"
New spec: "Cart should persist 7 days"

Severity: LOW (not breaking, backward compatible)

Affected phases:
- Phase 3: Cart logic exists
  Impact: MEDIUM (needs new cleanup job)
  Action: Update PLAN.md, add background job task

- Phase 4: Payments uses cart
  Impact: LOW (no change needed)
  Action: None

- Phase 5: Admin views cart data
  Impact: LOW (no change needed)
  Action: None

Recommendation:
  This change requires Phase 3 update.
  Timeline impact: +2 hours (add cleanup job)
  
  Ready to proceed? Run:
  /propagate-spec
```

---

## Scenario 4: Resume Work After Interruption

### You Paused Phase 3 Last Week

```
Last week: Phase 3 implementation paused mid-way

Questions:
- Did Phase 1 or 2 specs change while I was gone?
- Are Phase 3 requirements still current?
- What should I work on now?
```

### What You Do

```bash
/validate-specs

# Checks all phases for alignment
```

### What You Get

```
✓ Spec Alignment Check

Phase 1 Status: ✓ Current (last updated 2 days ago)
Phase 2 Status: ⚠️ Stale (last updated 5 days ago)
  - API changes: 2 endpoints modified
  - Phase 2 specs reflect changes ✓
  
Phase 3 Status: ❌ MISALIGNED
  - Depends on Phase 2 API
  - Phase 3 spec: 5 days old
  - Phase 2 changed: 2 days ago
  - SPEC DRIFT DETECTED
  
  Missing updates:
  - Product API response format changed
  - Phase 3 still expects old format
  
  Action needed:
  Run: /propagate-spec
  Then run: Phase 3 tests
  
  Time: 30 min to sync, 1 hour testing

Phase 4 & 5: ✓ OK (no upstream changes)

Recommendation:
  1. Run /propagate-spec (auto-sync)
  2. Run Phase 3 tests
  3. Continue from RECOVERY_POINTS.md
```

---

## Scenario 5: Check Project Health

### What You Want to Know

```
- Are all phases still aligned?
- Any cascading failures waiting?
- What's the current project status?
- Timeline risks?
```

### What You Do

```bash
/validate-specs
```

### What You Get

```
Comprehensive Spec Validation Report

Project Health: ⚠️ MEDIUM RISK
  2 phases need attention

Phase 1 (Auth):           ✓ Current
Phase 2 (Products):       ⚠️ Stale (5 days)
  - Spec age: 5 days
  - Last upstream change: 3 days ago
  - Updates applied: NO
  - Action: Run /propagate-spec

Phase 3 (Cart):           ⚠️ BLOCKED
  - Cannot start until Phase 2 aligned
  - Phase 2 has 2 pending spec changes
  - Estimated unblock time: 30 min

Phase 4 (Payments):       ✓ Ready (Phase 3 not started yet)
Phase 5 (Admin):          ✓ Waiting (Phase 4 dependency)

Critical Path: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Timeline Impact:
  Phase 2 misalignment: +30 min
  Phase 3 blocked: +1.5 hours
  
  Current delay: +2 hours from ideal timeline

Recommendations:
  1. URGENT: Run /propagate-spec (30 min)
  2. Validate Phase 3 tests pass (1 hour)
  3. Unblock Phase 3 work
  4. Project back on track

Next steps:
  /propagate-spec
  Then: Run Phase 2 and 3 tests
  Then: Resume Phase 3 development
```

---

## Command Reference

### `/spec-change <file>`

**Purpose**: Detect impact of a single spec change

```bash
/spec-change .planning/API_DOCS.md
/spec-change .planning/ARCHITECTURE.md
/spec-change .planning/REQUIREMENTS.md
```

**Output**: Impact report with affected phases, severity, recommendations

**Time**: 1-2 minutes

---

### `/propagate-spec`

**Purpose**: Auto-update ALL downstream phases for pending spec changes

```bash
/propagate-spec
```

**What it does**:
1. Scans SPEC_CHANGELOG.md for unpropagated changes
2. Auto-updates all affected phase specs
3. Auto-updates all affected test contracts
4. Runs validation tests
5. Generates migration guides
6. Commits changes
7. Creates comprehensive report

**Output**: Updated phase specs, passed tests, impact report

**Time**: 5-15 minutes depending on number of phases

---

### `/validate-specs`

**Purpose**: Check all phases are aligned with dependencies

```bash
/validate-specs
```

**What it checks**:
1. Each phase spec matches upstream outputs
2. No stale specs detected
3. No blocking misalignments
4. All dependencies satisfied
5. Timeline cascading calculated

**Output**: Alignment report, recommendations, blockers

**Time**: 2-3 minutes

---

## Best Practices

### ✅ DO

- ✅ Commit your changes immediately after implementation
- ✅ Let GitHub Actions auto-sync docs
- ✅ Run `/validate-specs` before starting new phase
- ✅ Review IMPACT_REPORT.md for breaking changes
- ✅ Run phase tests after auto-updates

### ❌ DON'T

- ❌ Manually update downstream phase specs (auto-engine does it)
- ❌ Skip `/validate-specs` before phase start
- ❌ Commit without running tests first
- ❌ Ignore impact reports
- ❌ Work on multiple phases without validation

---

## Troubleshooting

### Specs Not Updating?

```bash
# Check if changes detected
git status
# Should show auto-synced files

# Check impact report
ls -la .codebase/IMPACT_REPORT*.md

# Manually trigger if needed
/propagate-spec
```

### Tests Failing After Auto-Update?

```bash
# Review what changed
cat .codebase/IMPACT_REPORT_*.md

# Read updated test contract
cat .planning/features/NNN/TEST_CONTRACT.md

# Run specific test
npm test -- Phase3

# If still broken, revert and review manually
git revert HEAD
/spec-change .planning/API_DOCS.md
```

### Need to Understand What Changed?

```bash
# View detailed impact report
cat .codebase/IMPACT_REPORT_latest.md

# Check SPEC_CHANGELOG for context
grep -A 5 "$(date +%Y-%m-%d)" .planning/SPEC_CHANGELOG.md

# Review git diffs
git diff HEAD~1 .planning/
```

---

## Time Tracking

**Before Automation**:
- Detect change: 5 min
- Manual update Phase 2: 1 hour
- Manual update Phase 3: 1.5 hours
- Manual update Phase 4: 45 min
- Test all phases: 1 hour
- **Total**: ~4.5 hours

**After Automation**:
- Commit change: 2 min
- Auto-detect + update: 2 min
- Tests run: 5 min
- Review impact report: 5 min
- **Total**: ~15 minutes

**Time Saved**: ~4 hours per spec change ✅

---

## Next: Full Harness Documentation

See:
- `.codex/skills/spec-impact-engine/SKILL.md` - Full technical details
- `.codebase/PHASE_DEPENDENCY_MAP.md` - Phase structure
- `.codebase/IMPLEMENTATION_COMPLETE.md` - What was built
- `.codex/skills/genesis-harness/SKILL.md` - Full Genesis Harness reference
