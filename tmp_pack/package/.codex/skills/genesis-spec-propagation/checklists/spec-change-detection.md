# Spec Change Detection Checklist

## Pre-Propagation Verification

Verify before starting automatic propagation.

### 1. Change Documentation ✓

- [ ] Change is well-documented (why changed, impact)
- [ ] Old spec vs new spec available for comparison
- [ ] Change type identified (breaking/feature/non-impact)
- [ ] SPEC_CHANGELOG.md entry created (if not, auto-append)

### 2. Change Validity

- [ ] Change is intentional (not a mistake)
- [ ] Change doesn't introduce new technical debt
- [ ] Change is aligned with project architecture
- [ ] Change doesn't violate any contracts or constraints

**If any "No"**: STOP propagation, review change with team before continuing.

---

## Change Type Classification

Classify the change before propagation determines update strategy.

### BREAKING CHANGE

**Indicators**:
- ❌ Removed field from API response
- ❌ Changed field type (number → string, optional → required)
- ❌ Removed database column
- ❌ Changed endpoint URL or method
- ❌ Changed validation rule (stricter or behavioral change)
- ❌ Renamed field

**Examples**:
```diff
- { "userId": 123 }  →  { "id": 123 }  // Renamed field
- { "status": "active" }  →  { "status": 1 }  // Type changed
+ { "email": "required" }  // Made required when optional
```

**Propagation Complexity**: HIGH (manual review recommended)
**Downstream Impact**: Major (all phases affected)
**Time to Update**: 2-4 hours (includes design decisions)

---

### FEATURE CHANGE

**Indicators**:
- ✅ Added new optional field to API response
- ✅ Added new optional parameter to function
- ✅ Added new endpoint or operation
- ✅ Added new validation (optional field)
- ✅ Extended enum with new value
- ✅ Made field optional (was required)

**Examples**:
```diff
+ { "avatarUrl": "https://..." }  // New optional field
+ { "tags": [] }  // New optional array
+ POST /api/users/export  // New endpoint
+ "status" in ["active", "inactive", "archived"]  // Extended enum
```

**Propagation Complexity**: MEDIUM (mostly automatic)
**Downstream Impact**: Moderate (Phase 2, 3, 5 affected)
**Time to Update**: 30-60 minutes

---

### NON-IMPACT CHANGE

**Indicators**:
- 📝 Updated description/documentation
- 📝 Updated example values
- 📝 Formatting/styling change
- 📝 Reordered fields (same data)
- 📝 Updated comment (code, not logic)

**Examples**:
```diff
- "description": "User name"  →  "description": "Full name of user"
- { "id": 1, "name": "John" }  →  { "name": "John", "id": 1 }  // Reordered
- 200  →  200  // Same HTTP status, just reformatted
```

**Propagation Complexity**: LOW (minimal updates)
**Downstream Impact**: Minimal (maybe Phase 2 only for docs)
**Time to Update**: 5-10 minutes

---

## Affected Phase Detection Checklist

Verify the right phases are identified as affected.

### Phase 2: Tests
- [ ] Test mocks need updating? (breaking/feature)
- [ ] Test data needs updating? (breaking/feature)
- [ ] Test assertions need updating? (breaking)
- [ ] Affected test file identified?

### Phase 3: Backend Implementation
- [ ] API contract changes? (all types)
- [ ] Response builder affected? (breaking/feature)
- [ ] Request validation affected? (breaking)
- [ ] Database schema affected? (breaking - migration needed)
- [ ] Handler docstring needs update? (breaking)

### Phase 4: Client SDK
- [ ] Client method signatures affected? (breaking)
- [ ] Type definitions need update? (breaking/feature)
- [ ] Serialization logic affected? (breaking)
- [ ] Deprecation warnings needed? (breaking)

### Phase 5: E2E Tests
- [ ] E2E scenarios need new test cases? (feature)
- [ ] E2E assertions need updating? (breaking)
- [ ] E2E data needs updating? (breaking/feature)
- [ ] New scenarios for new fields? (feature)

**Validation**: At least Phase 2 OR Phase 3 should be "Yes" for any change.

---

## Dependency Path Verification

Confirm propagation order is correct (topological sort).

### Valid Propagation Order

1. **Phase 1**: Original spec change ✅
2. **Phase 2**: Tests updated (independent of implementation)
3. **Phase 3**: Backend implementation aligned with updated tests
4. **Phase 4**: Client SDK updated to match Phase 3 API
5. **Phase 5**: E2E tests updated to use Phase 4 SDK + Phase 3 API

### Order Validation Checklist

- [ ] Phase 2 updates don't depend on Phase 3 changes (true for mocks)
- [ ] Phase 3 updates use Phase 2 tests as reference
- [ ] Phase 4 updates don't precede Phase 3 (SDK depends on API)
- [ ] Phase 5 updates reference Phase 4 SDK + Phase 3 API

**If any violated**: Stop, reorder phases before propagation.

---

## Manual Update Trigger

When should manual review override automatic updates?

### Require Manual Review If...

**CRITICAL TRIGGERS** (Stop propagation):
- [ ] Breaking change + no clear migration path
- [ ] Change affects 5+ files in Phase 3
- [ ] Database migration needed (breaking + data loss risk)
- [ ] API version bump needed (breaking)
- [ ] SDK deprecation policy violated
- [ ] Contract violates architectural constraint

**RECOMMENDED REVIEW** (Proceed with caution):
- [ ] Feature change affecting Phase 3 + Phase 4 together
- [ ] Type system needs re-design (e.g., union type)
- [ ] Performance implications (schema change, new indexes)
- [ ] Security implication (new validation, encryption)

**AUTOMATIC OK** (Can auto-propagate):
- [ ] Optional field addition (feature)
- [ ] Optional parameter addition (feature)
- [ ] New endpoint (feature)
- [ ] New enum value (feature)
- [ ] Documentation update (non-impact)

---

## Conflict Detection Checklist

Watch for conflicts during propagation.

### Potential Conflicts

**Phase 2 ↔ Phase 3**:
- [ ] Phase 2 mocks outdated when Phase 3 was implemented?
- [ ] Phase 3 handler not aligned with Phase 2 expectations?

**Phase 3 ↔ Phase 4**:
- [ ] Phase 4 SDK has workarounds for Phase 3 quirks?
- [ ] Backward compatibility code in Phase 4 would break?

**Phase 4 ↔ Phase 5**:
- [ ] Phase 5 tests rely on deprecated Phase 4 methods?
- [ ] Phase 5 hardcodes values from Phase 4 SDK?

**All Phases**:
- [ ] Any hardcoded values in tests/implementation?
- [ ] Any duplicate data definitions (brittleness)?
- [ ] Any circular dependencies?

**If conflicts found**: Document in CONFLICT_LOG.md, escalate for manual resolution.

---

## Post-Propagation Validation

After automatic updates, verify everything still works.

### Syntax Validation

- [ ] Phase 2 test files are valid JavaScript
- [ ] Phase 3 contract files are valid JSON
- [ ] Phase 4 type files are valid TypeScript
- [ ] Phase 5 scenario files are valid Markdown

### Semantic Validation

- [ ] Phase 2 tests make logical sense (not just syntactically valid)
- [ ] Phase 3 contract accurately describes new API
- [ ] Phase 4 types match Phase 3 contract structure
- [ ] Phase 5 scenarios reference Phase 4 SDK correctly

### Integration Testing

- [ ] Run Phase 2 tests: `npm test -- tests/`
- [ ] Run Phase 3 validation: `npm run validate:contracts`
- [ ] Run Phase 4 type check: `npm run tsc --noEmit`
- [ ] Run Phase 5 E2E: `npm run test:e2e` (subset)

### All Tests Green?

- [ ] Yes → Propagation successful ✅
- [ ] No → Identify failing tests, manual review needed ⚠️

---

## Migration Guide Checklist (BREAKING CHANGES ONLY)

For breaking changes, verify migration guide is complete.

- [ ] Migration guide file exists (e.g., `docs/migration-v2-to-v3.md`)
- [ ] "What changed" section complete
- [ ] "Why changed" section explains rationale
- [ ] "Impact" section lists affected consumers
- [ ] "Migration steps" are clear and step-by-step
- [ ] "Timeline" specified (deprecation period, cutoff date)
- [ ] "Rollback procedure" documented
- [ ] "Backward compatibility period" specified (if any)
- [ ] Examples of old vs new code provided

**If migration guide incomplete**: Block commit until complete.

