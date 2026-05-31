# Post-Implementation Auto-Update Guide

**Purpose**: Automated state synchronization and documentation updates after successful implementation.

**Status**: REFERENCE - Use after implementation is verified and tests pass.

## Quick Reference: What Updates Automatically

After passing all tests and verification:

| Change Type | File to Update | Update Trigger |
|-------------|---|---|
| Code implementation | `.codebase/MODULE_INDEX.md` | New module/export added |
| API changes | `.codebase/API_CONTRACTS.md` | Endpoint behavior changed |
| Database changes | `.codebase/DOMAIN_MODELS.md` | Schema or entity changed |
| Route changes | `.codebase/UI_ROUTES.md` | Frontend route added/modified |
| Test coverage | `.codebase/TEST_MATRIX.md` | New test files created |
| Module dependencies | `.codebase/DEPENDENCY_GRAPH.md` | Import statements changed |
| Architecture | `.codebase/ARCHITECTURE.md` | System design changed |
| Status | `.codebase/CURRENT_STATE.md` | Any public-facing change |

---

## Automated Update Workflow

### Phase 1: Detection (After Implementation Passes Tests)

```
Trigger: All tests pass + Manual review approved
┌─────────────────────────────────────────────┐
│ 1. Scan changed files                       │
│ 2. Identify type of changes                 │
│ 3. Check what docs need updating            │
└─────────────────────────────────────────────┘
```

**Scan categories:**
- New files created?
- Public APIs modified?
- Database queries changed?
- Routes added/removed?
- Configuration changes?

### Phase 2: Analysis (Auto-Detect Impact)

**For each changed file, check:**

```javascript
if (file in /api || /endpoint) {
  → Update API_CONTRACTS.md
  → Run api-contract-skill
}

if (file contains database/query) {
  → Update DOMAIN_MODELS.md
  → Validate schema compatibility
}

if (file is route/page) {
  → Update UI_ROUTES.md
  → Check navigation flow
}

if (test file added) {
  → Update TEST_MATRIX.md
  → Calculate coverage %
}

if (file in core module) {
  → Update MODULE_INDEX.md
  → Check import/export statements
}
```

### Phase 3: Documentation Sync

**AUTO-SYNC checklist:**

- [ ] **Module Inventory** (`MODULE_INDEX.md`)
  ```
  When: New file/function/export added
  Auto-Action:
    - Extract new exports
    - Document module purpose
    - Update import paths
  ```

- [ ] **API Contracts** (`API_CONTRACTS.md`)
  ```
  When: API endpoint changed/added
  Auto-Action:
    - Extract request/response schemas
    - Update endpoint paths
    - Document breaking changes
  ```

- [ ] **Domain Models** (`DOMAIN_MODELS.md`)
  ```
  When: Database schema changed
  Auto-Action:
    - Extract new tables/fields
    - Document relationships
    - Note migration strategy
  ```

- [ ] **Test Matrix** (`TEST_MATRIX.md`)
  ```
  When: Test files added/removed
  Auto-Action:
    - Recalculate coverage %
    - Update test counts
    - Flag coverage gaps
  ```

- [ ] **UI Routes** (`UI_ROUTES.md`)
  ```
  When: Frontend routes changed
  Auto-Action:
    - Extract new routes
    - Update navigation flow
    - Document route params
  ```

- [ ] **Current State** (`CURRENT_STATE.md`)
  ```
  When: Any significant change
  Auto-Action:
    - Increment version/phase
    - Record what changed
    - Set "Last Updated"
    - List next steps
  ```

### Phase 4: Verification

```
After Auto-Sync:

✓ All updated docs compile without errors?
✓ Internal links are valid?
✓ Examples are still accurate?
✓ Cross-references consistent?
✓ No stale information?
```

---

## Manual Post-Implementation Checklist

**Use this AFTER implementation is complete and tests pass:**

- [ ] **Read updated `.codebase/` files**
  - [ ] CURRENT_STATE.md reflects implementation
  - [ ] MODULE_INDEX.md includes new modules
  - [ ] API_CONTRACTS.md has endpoint changes
  - [ ] TEST_MATRIX.md shows new test coverage

- [ ] **Verify documentation accuracy**
  - [ ] README examples still work
  - [ ] API docs match implementation
  - [ ] Database docs match schema
  - [ ] UI docs match routing

- [ ] **Check for inconsistencies**
  - [ ] API_CONTRACTS.md ← → actual endpoints
  - [ ] DOMAIN_MODELS.md ← → database schema
  - [ ] UI_ROUTES.md ← → frontend routes
  - [ ] TEST_MATRIX.md ← → test files

- [ ] **Update derived documents**
  - [ ] EVOLUTION_PLAN.md (next phase?)
  - [ ] DEPENDENCY_GRAPH.md (new deps?)
  - [ ] ARCHITECTURE.md (design impact?)
  - [ ] KNOWN_PROBLEMS.md (issues found?)

- [ ] **Release documentation**
  - [ ] Update VERSION file
  - [ ] Add entry to CHANGELOG
  - [ ] Update RELEASE_NOTES
  - [ ] Tag commit appropriately

---

## Docs Skill Integration

### When to invoke `docs-skill` explicitly:

```
AFTER implementation when:
  ✓ All tests pass
  ✓ Code review approved
  ✓ No more changes expected

RUN: Use docs-skill to:
  - Sync all changed docs
  - Update README examples
  - Verify cross-references
  - Generate changelog entry
  - Validate installation docs
```

**Command reference:**
```bash
# After code implementation:
invoke docs-skill

# Parameters:
- changed_files: [list of modified files]
- public_behavior: [what changed from user perspective]
- verification_results: [test results]
- affected_users: [who needs to know about changes]
```

---

## State Continuity: Handoff Document

### Create after implementation for future resumption:

```markdown
## Implementation Handoff - [Feature/Bug Name]

### What Was Done
- Module X: Created new authentication handler
- Module Y: Updated request validation
- Tests: Added 15 new unit tests
- Docs: Updated API_CONTRACTS.md

### Files Changed
- `src/auth/handler.ts` (new)
- `src/middleware/validator.ts` (modified)
- `tests/auth.test.ts` (new)
- `.codebase/API_CONTRACTS.md` (updated)

### Current State
- All tests passing ✓
- Code review approved ✓
- Docs updated ✓
- Ready for: deployment / next feature

### For Continuation
If this needs more work later:
1. Start with `.codebase/CURRENT_STATE.md`
2. Check KNOWN_PROBLEMS.md for blockers
3. Review this handoff document
4. Pick up from "Next Steps" below

### Next Steps
- [ ] Deploy to staging
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Plan Phase 2 features
```

---

## Auto-Update Triggers (Proposed Implementation)

### Git Hook: Post-Merge / Post-Commit

```bash
# .git/hooks/post-commit
if (tests pass) {
  run-auto-update.sh
}
```

### Build Integration: After Successful Build

```bash
# scripts/post-build.sh
detect_changes.js \
  | analyze_impact.js \
  | update-docs.js
```

### CI/CD: After Successful Test Suite

```yaml
# .github/workflows/docs-sync.yml
on: [push]
jobs:
  docs-sync:
    if: tests passed
    runs: docs-skill-sync.sh
```

---

## Troubleshooting Auto-Updates

### Issue: Docs not updating after implementation

**Solution:**
1. Check git has commit all changes
2. Verify tests actually passing
3. Run `scripts/detect-changes.sh` manually
4. Check for errors in auto-update logs

### Issue: Docs out of sync with code

**Solution:**
1. Read `.codebase/CURRENT_STATE.md`
2. Identify what's stale (via TEST_MATRIX.md)
3. Run `docs-skill` explicitly
4. Verify all links/examples work

### Issue: Can't understand what changed

**Solution:**
1. Read IMPLEMENTATION_HANDOFF.md (created after each feature)
2. Check git diff with `.codebase/` baseline
3. Review decision-logs in `observability/`
4. Read PR description or commit messages

---

## Continuous State Tracking

### Quick State Check Command

```bash
./scripts/state-check.sh
# Output:
# ✓ CURRENT_STATE.md is recent (updated 2 hrs ago)
# ⚠ TEST_MATRIX.md is 3 days old - may need refresh
# ✓ API_CONTRACTS.md matches current endpoints
# ✗ DEPENDENCY_GRAPH.md - 5 new dependencies not documented
```

---

## Next Phase: Full Automation

When ready to implement:

1. **Auto-Detection Script** (detect changes automatically)
2. **Impact Analysis** (determine what docs to update)
3. **Docs Regeneration** (auto-update specific sections)
4. **Validation** (check all links/examples work)
5. **Notification** (alert team of updates)

---

**Last Updated**: _2026-05-30_  
**Owner**: _Genesis Harness Team_  
**Status**: _Reference - Ready to implement automation_
