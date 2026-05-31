---
name: spec-impact-engine
description: Automatically detect specification changes, calculate impact severity on downstream project phases, generate migration guides, and orchestrate auto-updates to prevent downstream spec drift and cascading rework.
---

# Spec Impact Engine Skill

**Purpose**: Automatically detect spec changes and calculate impact on downstream phases.

**Status**: NEW - Automation layer for cascade prevention

## When to Use

Use this skill when:
- ✅ A spec change happens (API, database, requirements)
- ✅ You need to know which downstream phases are affected
- ✅ You need automatic downstream phase updates
- ✅ You're tracking breaking changes across phases
- ✅ You need migration guides for dependent phases
- ✅ You want to prevent cascading rework

## Commands

```bash
# Detect impact of spec changes
invoke spec-impact-engine

# Parameters:
- changed_files: ["path/to/changed/spec.md"]
- impact_scope: "all" | "current_phase_only"
- auto_update: true | false
- notify: true | false
```

---

## How It Works

### Phase 1: Change Detection

**Detects changes in:**
- `.planning/REQUIREMENTS.md` - Feature/requirement changes
- `.planning/API_DOCS.md` - Endpoint signature changes
- `.planning/ARCHITECTURE.md` - System design changes
- `.planning/DESIGN.md` - UI/UX changes
- `.planning/STACK.md` - Tech stack changes
- `.planning/SPEC_CHANGELOG.md` - Explicit spec entries
- `.planning/features/*/SPEC.md` - Feature spec changes
- `.planning/bugs/*/PLAN.md` - Bug fix plan changes

**For each change, extracts:**
```javascript
{
  type: "breaking" | "feature" | "internal",
  document: "API_DOCS.md",
  section: "/api/users/:id",
  oldValue: "returns { name, email, role }",
  newValue: "returns { id, name, email, roles[] }",
  severity: "high" | "medium" | "low",
  affectedField: "response.roles",
  breaking: true,
  date: "2026-05-30",
  reason: "Support multiple roles per user"
}
```

### Phase 2: Dependency Analysis

**Maps which phases depend on what:**

```javascript
DependencyMap = {
  phase1: {
    provides: ["auth_system", "user_api", "jwt_tokens"],
    provides_to: ["phase2", "phase3", "phase4", "phase5"]
  },
  phase2: {
    requires: ["user_api_from_phase1"],
    depends_on: ["phase1"],
    provides: ["product_catalog", "search_api"],
    provides_to: ["phase3", "phase4"]
  },
  phase3: {
    requires: ["user_api_from_phase1", "product_catalog_from_phase2"],
    depends_on: ["phase1", "phase2"],
    provides: ["shopping_cart", "order_api"],
    provides_to: ["phase4", "phase5"]
  }
}
```

**Located in:** `.codebase/PHASE_DEPENDENCY_MAP.md` (created during `/init`)

### Phase 3: Impact Calculation

**For each change, identifies:**

```
Change: Phase 1 API endpoint signature changed
  ↓
Query: Which phases import Phase 1 API?
  ↓
Result: Phase 2, Phase 3, Phase 4 all depend on Phase 1 API
  ↓
Impact chain: 
  - Phase 2: MEDIUM impact (must update TEST_CONTRACT.md)
  - Phase 3: HIGH impact (must update SPEC.md + TEST_CONTRACT.md)
  - Phase 4: MEDIUM impact (may need migration code)
  ↓
Recommendation: Update in order: Phase 2 → Phase 3 → Phase 4
```

### Phase 4: Auto-Update Execution

**AUTO-UPDATE checklist for each affected phase:**

```markdown
## Affected Phases: Phase 2, Phase 3, Phase 4

### Phase 2 (.planning/features/002-product-catalog/)
- [ ] Update SPEC.md → Replace old API call signature
- [ ] Update TEST_CONTRACT.md → Update test expectations
- [ ] Update PLAN.md → Note breaking change requires update
- [ ] Create migration note: "Phase 1 API changed, updated tests"
- [ ] Validate: Run phase 2 tests locally
- [ ] Status: READY FOR RESUME

### Phase 3 (.planning/features/003-shopping-cart/)
- [ ] Update SPEC.md → Replace 2 places using Phase 1 API
- [ ] Update IMPACT.md → Document dependency on Phase 1
- [ ] Update TEST_CONTRACT.md → 5 tests need updating
- [ ] Update PLAN.md → New migration steps added
- [ ] Create migration guide for Phase 3 → Phase 4
- [ ] Validate: Run phase 3 tests locally
- [ ] Status: READY FOR RESUME

### Phase 4 (.planning/phases/04-payments/)
- [ ] Update PLAN.md → Note Phase 1 change may affect token validation
- [ ] Review security implications
- [ ] Check if migration code needed
- [ ] Status: REVIEW REQUIRED
```

### Phase 5: Verification & Notification

**Automatically:**
- ✅ Runs affected phase tests
- ✅ Checks for broken imports
- ✅ Validates schema compatibility
- ✅ Generates migration guides
- ✅ Creates notification with impact summary

---

## Impact Report Format

After detection, generates `.codebase/IMPACT_REPORT_<timestamp>.md`:

```markdown
# Spec Change Impact Report

**Date**: 2026-05-30  
**Change**: API endpoint signature updated  
**Severity**: HIGH (breaking change)  
**Detection**: Phase 1 API_DOCS.md changed

## Summary

Phase 1 endpoint `/api/users/:id` response format changed:
- OLD: `{ name, email, role }`
- NEW: `{ id, name, email, roles[] }`

This is a **BREAKING CHANGE** affecting 3 downstream phases.

## Affected Phases

| Phase | Dependency | Impact | Action | Status |
|-------|-----------|--------|--------|--------|
| Phase 2 | Imports user_api | MEDIUM | Update 1 spec, 3 tests | ⚠️ NEEDS UPDATE |
| Phase 3 | Imports user_api | HIGH | Update 2 specs, 5 tests | ⚠️ NEEDS UPDATE |
| Phase 4 | Imports user_api | LOW | Review only | ⚠️ REVIEW |
| Phase 5 | Indirect via Phase 4 | LOW | N/A | ✅ OK |

## Migration Strategy

**Recommended execution order:**

1. ✅ Phase 1: Already updated (2026-05-30 14:00)
2. → Phase 2: Update required (est. 30 min)
3. → Phase 3: Update required (est. 1 hour)
4. → Phase 4: Review required (est. 15 min)
5. → Phase 5: No action needed

**Total update time**: ~2 hours

## Rollback Plan

If Phase 2 update fails:
```bash
git checkout HEAD -- .planning/features/002-product-catalog/
# Then revert Phase 1 change if possible
```

## Auto-Generated Updates

- [ ] Phase 2 SPEC.md updated
- [ ] Phase 2 TEST_CONTRACT.md updated
- [ ] Phase 3 SPEC.md updated
- [ ] Phase 3 TEST_CONTRACT.md updated
- [ ] Phase 4 PLAN.md reviewed
- [ ] All tests passing
- [ ] Migration guide created
- [ ] SPEC_CHANGELOG.md entry created

## Validation

All affected phase tests must pass before proceeding:

```bash
cd .planning/features/002-product-catalog && npm test
cd .planning/features/003-shopping-cart && npm test
# Both passing ✓
```

## Timeline Impact

- Phases delayed: Phase 2 (1 hour), Phase 3 (1 hour)
- ROADMAP.md timeline may need adjustment
- Critical path recalculation needed

## Sign-off

- [ ] Developer reviews impact report
- [ ] Auto-updates validated
- [ ] Tests passing
- [ ] Ready to proceed
```

---

## Integration with Genesis Harness

### New Workflows

#### `/spec-change` Command

```bash
/spec-change <changed_file>

# Example:
/spec-change .planning/API_DOCS.md

# Automatically:
1. Detect what changed
2. Calculate impact
3. Identify affected phases
4. Generate impact report
5. Offer to auto-update downstream phases
6. Run validation tests
```

#### `/propagate-spec` Command

```bash
/propagate-spec

# Automatically:
1. Check SPEC_CHANGELOG.md for unpropagated changes
2. Find all affected phases
3. Update all downstream phase specs
4. Run all affected phase tests
5. Generate migration guides
6. Update ROADMAP.md timelines
```

#### `/validate-specs` Command

```bash
/validate-specs

# Automatically:
1. Check all phases for spec misalignments
2. Find phases depending on changed specs
3. Report any spec drifts
4. Suggest updates needed
5. Create blockers if critical misalignment found
```

### Integration Points

**On `/new-feature` completion:**
```
1. Implementation passes tests
2. Docs sync (existing workflow)
3. NEW: Run spec-impact-engine
4. NEW: Detect downstream impact
5. NEW: Auto-update affected phases
6. NEW: Run validation on all phases
7. Completion
```

**On `/api-sync` completion:**
```
1. API contracts updated
2. Breaking changes identified
3. NEW: Run spec-impact-engine
4. NEW: Propagate to downstream phases
5. NEW: Generate migration guides
6. NEW: Update ROADMAP.md
```

---

## Files Created By Skill

### Core Detection Engine

**`.codex/skills/spec-impact-engine/engine.js`** (200+ lines)
- Detects file changes
- Compares old vs new content
- Identifies breaking changes
- Calculates severity

**`.codex/skills/spec-impact-engine/dependency-analyzer.js`** (150+ lines)
- Maps phase dependencies
- Calculates impact chain
- Identifies affected phases
- Suggests update order

**`.codex/skills/spec-impact-engine/auto-updater.js`** (180+ lines)
- Auto-updates dependent phase specs
- Runs validation tests
- Generates migration guides
- Creates notifications

### Templates

**`.codex/skills/spec-impact-engine/templates/impact-report.md`**
- Impact report template
- Affected phases table
- Migration strategy section
- Sign-off checklist

**`.codex/skills/spec-impact-engine/templates/migration-guide.md`**
- Before/after examples
- Step-by-step migration
- Rollback procedures
- Testing checklist

### Configuration

**`.codebase/PHASE_DEPENDENCY_MAP.md`**
- Created during `/init`
- Maps which phases depend on which
- Updated when phases change
- Used by impact engine for calculations

---

## Example: API Breaking Change

### Scenario

Phase 1 API endpoint changes:

```
Before: GET /api/users/:id
  Response: { name, email, role }

After: GET /api/users/:id
  Response: { id, name, email, roles[] }
```

### What Happens

**Step 1: Detect**
```
User runs: /spec-change .planning/API_DOCS.md
Engine detects: API_DOCS.md has breaking change
```

**Step 2: Analyze**
```
Engine finds: Phase 2 and Phase 3 depend on /api/users/:id
Impact: Both phases need updates
```

**Step 3: Auto-Update**
```
Phase 2 SPEC.md:
  OLD: "Call /api/users/:id to get { name, email, role }"
  NEW: "Call /api/users/:id to get { id, name, email, roles[] }"

Phase 2 TEST_CONTRACT.md:
  OLD: expect(response.role).toExist()
  NEW: expect(response.roles).toBeArray()

Phase 3 similar updates...
```

**Step 4: Validate**
```
Run: npm test in Phase 2
Result: ✓ All tests passing
Run: npm test in Phase 3
Result: ✓ All tests passing
```

**Step 5: Report**
```
Create: IMPACT_REPORT_2026-05-30_14-30-00.md
Shows: 2 phases updated, 2 hours timeline impact
```

---

## Configuration

### `.codebase/PHASE_DEPENDENCY_MAP.md`

```yaml
phases:
  phase_1:
    name: "Authentication & User API"
    provides:
      - auth_system
      - user_api
      - jwt_tokens
      - user_model
    provides_to:
      - phase_2
      - phase_3
      - phase_4
      - phase_5
    
  phase_2:
    name: "Product Catalog"
    requires:
      - user_api_from_phase_1
    depends_on:
      - phase_1
    provides:
      - product_catalog_api
      - search_api
      - product_model
    provides_to:
      - phase_3
      - phase_4
  
  phase_3:
    name: "Shopping Cart & Orders"
    requires:
      - user_api_from_phase_1
      - product_catalog_from_phase_2
    depends_on:
      - phase_1
      - phase_2
    provides:
      - shopping_cart_api
      - order_api
    provides_to:
      - phase_4

breaking_change_rules:
  - if: "API endpoint signature changes"
    then: "HIGH severity, affects all dependent phases"
  
  - if: "Database schema changes"
    then: "MEDIUM severity, affects phases using schema"
  
  - if: "Authentication method changes"
    then: "HIGH severity, affects all phases"
```

---

## Benefits

✅ **Prevents cascading rework** - Downstream phases auto-updated  
✅ **Catches breaking changes** - Before they break dependent phases  
✅ **Saves time** - 30-60 min manual work → automatic  
✅ **Improves reliability** - No more discovering issues mid-phase  
✅ **Enables safe refactoring** - Know exactly what breaks  
✅ **Maintains timeline** - Can recalculate impact on schedule  

---

## Next: Implementation Artifacts

This skill generates/updates:
1. `.codebase/IMPACT_REPORT_<timestamp>.md` - Detailed impact analysis
2. `.planning/SPEC_CHANGELOG.md` - Auto-entries for all changes
3. `.planning/features/*/SPEC.md` - Auto-updates for dependent phases
4. `.planning/ROADMAP.md` - Timeline recalculation if needed
5. `.planning/STATE.md` - Updated with spec change status
6. Migration guides for each affected phase
7. Test updates for all dependent phases

---

**Status**: Ready for integration  
**Integration Point**: `/new-feature`, `/api-sync`, `/spec-change` commands  
**Automation Level**: 90% - Detects, analyzes, and auto-updates  
**Manual Required**: Final review and sign-off by developer
