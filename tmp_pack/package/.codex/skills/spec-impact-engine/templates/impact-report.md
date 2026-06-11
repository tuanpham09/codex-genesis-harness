# Spec Change Impact Report

**Report ID**: IMPACT_{{TIMESTAMP}}  
**Generated**: {{DATE}}  
**Change Source**: {{CHANGED_FILE}}  
**Severity**: {{SEVERITY}} <!-- HIGH | MEDIUM | LOW -->  
**Change Type**: {{CHANGE_TYPE}} <!-- BREAKING | FEATURE | INTERNAL | DOC -->  
**Reporter**: spec-impact-engine v1.0  

---

## Executive Summary

{{CHANGE_SUMMARY_ONE_LINER}}

| Field | Value |
|-------|-------|
| Changed File | `{{CHANGED_FILE}}` |
| Changed Section | `{{CHANGED_SECTION}}` |
| Change Type | {{CHANGE_TYPE}} |
| Severity | {{SEVERITY}} |
| Phases Affected | {{AFFECTED_PHASE_COUNT}} |
| Estimated Update Time | {{ESTIMATED_HOURS}} hours |
| Manual Review Required | {{MANUAL_REVIEW}} |

---

## Change Details

### What Changed

**Before**:
```
{{OLD_VALUE}}
```

**After**:
```
{{NEW_VALUE}}
```

### Why It Changed

{{CHANGE_REASON}}

### Breaking Status

- [ ] **BREAKING** — Existing consumers will break without migration
- [ ] **FEATURE** — New capability added (backward compatible)
- [ ] **INTERNAL** — No external impact

**Breaking assessment**: {{BREAKING_ASSESSMENT}}

---

## Affected Phases

| Phase | Dependency Type | Impact Level | Action Required | Status |
|-------|----------------|-------------|----------------|--------|
| Phase 1 (Contracts) | {{P1_DEP_TYPE}} | {{P1_IMPACT}} | {{P1_ACTION}} | {{P1_STATUS}} |
| Phase 2 (Tests) | {{P2_DEP_TYPE}} | {{P2_IMPACT}} | {{P2_ACTION}} | {{P2_STATUS}} |
| Phase 3 (Backend) | {{P3_DEP_TYPE}} | {{P3_IMPACT}} | {{P3_ACTION}} | {{P3_STATUS}} |
| Phase 4 (SDK) | {{P4_DEP_TYPE}} | {{P4_IMPACT}} | {{P4_ACTION}} | {{P4_STATUS}} |
| Phase 5 (E2E) | {{P5_DEP_TYPE}} | {{P5_IMPACT}} | {{P5_ACTION}} | {{P5_STATUS}} |

**Legend**:
- Impact: HIGH = code must change, MEDIUM = review needed, LOW = informational, N/A = not affected
- Status: ⚠️ NEEDS UPDATE | 🔍 REVIEW | ✅ OK | ⛔ BLOCKED

---

## Detailed Impact Per Phase

### Phase 2: Tests

**Files affected**:
- `{{P2_FILE_1}}` — {{P2_CHANGE_DESC_1}}
- `{{P2_FILE_2}}` — {{P2_CHANGE_DESC_2}}

**Actions**:
- [ ] Update mock data: replace `{{OLD_FIELD}}` with `{{NEW_FIELD}}`
- [ ] Update assertions: verify response includes `{{NEW_FIELD}}`
- [ ] Remove obsolete assertions for `{{REMOVED_FIELD}}`
- [ ] Add test cases for new `{{NEW_BEHAVIOR}}`
- [ ] Validate: run `npm test -- {{P2_TEST_PATTERN}}`

**Estimated time**: {{P2_HOURS}} hours

---

### Phase 3: Backend Implementation

**Files affected**:
- `{{P3_FILE_1}}` — {{P3_CHANGE_DESC_1}}
- `{{P3_FILE_2}}` — {{P3_CHANGE_DESC_2}}

**Actions**:
- [ ] Update API contract schema: `contracts/api/{{ENDPOINT}}/response.json`
- [ ] Update handler to return `{{NEW_FIELD}}` in response
- [ ] Add migration note to handler docstring
- [ ] Validate: run integration tests for `{{ENDPOINT}}`

**Estimated time**: {{P3_HOURS}} hours

---

### Phase 4: Client SDK

**Files affected**:
- `{{P4_FILE_1}}` — {{P4_CHANGE_DESC_1}}

**Actions**:
- [ ] Update TypeScript interface: `{{INTERFACE_NAME}}`
  - Remove field: `{{REMOVED_FIELD}}: {{OLD_TYPE}}`
  - Add field: `{{NEW_FIELD}}: {{NEW_TYPE}}`
- [ ] Update serialization/deserialization if needed
- [ ] Add deprecation warning for removed field (if migration window active)
- [ ] Validate: run `tsc --noEmit` (no type errors)

**Estimated time**: {{P4_HOURS}} hours

---

### Phase 5: E2E Tests

**Files affected**:
- `{{P5_FILE_1}}` — {{P5_CHANGE_DESC_1}}

**Actions**:
- [ ] Update scenario that checks `{{REMOVED_FIELD}}`
- [ ] Add scenario for `{{NEW_FIELD}}` behavior
- [ ] Validate: run `npx playwright test {{P5_TEST_PATTERN}}`

**Estimated time**: {{P5_HOURS}} hours

---

## Migration Strategy

### Recommended Execution Order

```
1. ✅ Phase 1: Contract updated (source of change)
2. → Phase 2: Update test mocks and assertions (est. {{P2_HOURS}} h)
3. → Phase 3: Update backend handler + response schema (est. {{P3_HOURS}} h)
4. → Phase 4: Update client SDK types (est. {{P4_HOURS}} h)
5. → Phase 5: Update E2E test scenarios (est. {{P5_HOURS}} h)

Total estimated: {{TOTAL_HOURS}} hours
```

### Topological Sort (Dependency Order)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```
Phases must be updated in this order to avoid downstream breakage.

### Rollback Plan

If propagation fails at any phase:

```bash
# Rollback Phase 2 only (if Phase 2 update broke tests):
git revert HEAD -- .planning/features/{{PHASE2_FEATURE}}/
npm test  # verify passing again

# Rollback entire change (if cascading failures):
git revert <propagation-commit>
# Then manually review the spec change requirement before re-attempting
```

---

## Auto-Generated Updates Log

| File | Update Type | Status | Timestamp |
|------|------------|--------|-----------|
| `{{FILE_1}}` | Mock data updated | {{STATUS_1}} | {{TS_1}} |
| `{{FILE_2}}` | Type definition updated | {{STATUS_2}} | {{TS_2}} |
| `{{FILE_3}}` | Contract schema updated | {{STATUS_3}} | {{TS_3}} |
| `{{FILE_4}}` | Assertion updated | {{STATUS_4}} | {{TS_4}} |
| `SPEC_CHANGELOG.md` | Entry appended | {{CHANGELOG_STATUS}} | {{CHANGELOG_TS}} |

---

## Validation Results

### Pre-Commit Checklist

- [ ] **Syntax check**: All updated files are valid JSON/JS/TS
- [ ] **Contract alignment**: Updated contracts match actual changes
- [ ] **Test consistency**: Updated tests are semantically correct
- [ ] **Type safety**: Phase 4 types match Phase 3 API contract
- [ ] **Cross-phase validation**:
  - [ ] Phase 3 types ⊆ Phase 4 client types
  - [ ] Phase 2 test data matches Phase 3 API contract
  - [ ] Phase 5 tests reference existing Phase 4 client methods
- [ ] **SPEC_CHANGELOG.md**: Entry added with correct severity
- [ ] **Migration guide**: Created (required for BREAKING changes)

### Test Run Results

```
Phase 2 tests: {{P2_TEST_RESULT}}
Phase 3 tests: {{P3_TEST_RESULT}}
Phase 4 type check: {{P4_TYPE_RESULT}}
Phase 5 tests: {{P5_TEST_RESULT}}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Phase 4 clients break on `{{REMOVED_FIELD}}` | {{LIKELIHOOD_1}} | {{IMPACT_1}} | {{MITIGATION_1}} |
| Timeline slippage if Phase 3 complex | {{LIKELIHOOD_2}} | {{IMPACT_2}} | {{MITIGATION_2}} |
| Circular dependency in phase updates | {{LIKELIHOOD_3}} | {{IMPACT_3}} | {{MITIGATION_3}} |

---

## SPEC_CHANGELOG.md Entry (Auto-Appended)

```
- {{DATE}} | {{CHANGE_TYPE}} | {{CHANGE_SUMMARY_ONE_LINER}}
  Changed: {{CHANGED_FILE}} → {{CHANGED_SECTION}}
  Affected: Phase {{AFFECTED_PHASES}} | Migration guide: {{MIGRATION_GUIDE_LINK}}
  Auto-updated phases: {{AUTO_UPDATED_PHASES}} | Manual review: {{MANUAL_REVIEW}}
```

---

## Sign-Off

- [ ] **Developer review**: Impact report reviewed and accurate
- [ ] **Auto-updates validated**: Changes look correct, no unintended modifications
- [ ] **Tests passing**: All affected phase tests green
- [ ] **Migration guide complete**: (required if BREAKING)
- [ ] **Ready to proceed**: All downstream phases aligned

**Reviewed by**: ________________________  
**Date**: {{DATE}}  
**Status**: [ ] APPROVED TO PROCEED | [ ] NEEDS REWORK | [ ] ESCALATE

---

*Generated by spec-impact-engine v1.0 | Genesis Codex Harness*
