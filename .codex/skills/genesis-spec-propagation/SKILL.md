---
name: genesis-spec-propagation
description: "Automated specification propagation across project phases. Detects spec changes and automatically cascades updates to all affected downstream phases, preventing stale contracts, misaligned tests, and late-stage rework."
---

# genesis-spec-propagation

## Purpose

Automate cascade propagation of spec changes across all project phases. When Phase 1 API changes, automatically detect affected phases (2-5), update downstream tests, contracts, client SDK types, and E2E scenarios, and generate migration guides for breaking changes. Reduces 45+ min manual update work to 5 min automated propagation.

## When to use

### Auto-Triggers
✅ After `/spec-change` command completes → Detects impact, auto-updates downstream phases
✅ After `/contract-update` for API/DB schema → Propagates to dependent contracts
✅ After SPEC_CHANGELOG.md entry created → Identifies affected phases (from notes)
✅ Before release/deployment → Validates all phases still aligned

## When NOT to use

- For documentation-only changes with no structural impact (field descriptions, examples only)
- When changing a single isolated file with no cross-phase dependencies
- For internal refactoring that preserves all public contracts

## Inputs required

- Path to changed spec file (e.g., `contracts/api/response.json`)
- Current `.codebase/PHASE_DEPENDENCY_MAP.md`
- Current `SPEC_CHANGELOG.md`
- Old vs new spec content (for diff analysis)

## Outputs required

- Updated downstream phase files (tests, contracts, SDK types, E2E scenarios)
- `SPEC_CHANGE_PROPAGATION.md` investigation log
- `SPEC_CHANGELOG.md` entry (auto-appended)
- Migration guide (for breaking changes only)
- Cross-phase validation report

## Required tests

- Each downstream phase's tests must pass after auto-update
- Cross-phase type consistency check (Phase 3 types ⊆ Phase 4 client types)
- Syntax validation of all updated files (JSON, TS, MD)
- Contract alignment test (Phase 3 response schema ⊂ Phase 4 type definitions)

## Required fixtures

- `fixtures/spec-propagation/` with before/after contract files
- Sample `SPEC_CHANGE_PROPAGATION.md` showing format
- Sample migration guide for a breaking field removal

## Required contract updates

- Update `contracts/api/*/response.json` when response schema changes
- Update `.codebase/API_CONTRACTS.md` with change record
- Update `SPEC_CHANGELOG.md` with propagation result

## Required codebase map updates

- `.codebase/CURRENT_STATE.md`: Mark spec propagation complete
- `.codebase/PHASE_DEPENDENCY_MAP.md`: Update if phase dependencies change
- `.codebase/KNOWN_PROBLEMS.md`: Document any propagation failures

## Token saving rules

- Cache PHASE_DEPENDENCY_MAP.md at session start (rarely changes)
- Show before/after diffs, not full file content
- Report "Phase 2,3,4,5 affected" summary, not full impact text
- When validating: report only failing checks, not passing ones
- Reuse dependency graph across multiple operations in same session

## Acceptance criteria

- All downstream phases identified (no phase missed)
- All affected files updated (mocks, types, assertions, E2E)
- All updated files syntactically valid
- Cross-phase validation passes
- SPEC_CHANGELOG.md entry created
- Migration guide present for all breaking changes
- Pre-commit gate passes

## Common mistakes

- Missing a downstream phase (only updating Phase 2 but not Phase 4 client SDK)
- Auto-updating Phase 5 E2E tests without semantic review (may require manual design)
- Forgetting to run tests in each updated phase after auto-update
- Treating non-breaking changes as breaking (causes unnecessary migration guides)
- Committing breaking changes without human approval

## Recovery workflow

If propagation breaks tests or introduces inconsistencies:
1. Run `git revert <propagation-commit>` to restore pre-propagation state
2. Identify which phase update caused the failure
3. Manually review the spec change requirements
4. Re-run propagation with `--dry-run` to preview changes first
5. Apply updates phase-by-phase, testing after each
6. Document edge case in `observability/` for future automation improvement

---

## 3-Phase Propagation Workflow

### Phase 1: Change Detection (5 min)

**Input**: Spec change location (e.g., `contracts/api/response.json`)

**Process**:
1. **Identify Change Type**
   - Breaking change? (field removed, type changed, required added)
   - Feature change? (new field, new endpoint, new validation rule)
   - Non-impact change? (doc update, example update, no structural change)

2. **Parse Change Impact**
   - Old spec vs new spec comparison
   - Breaking: List removed/changed fields, endpoints, validations
   - Feature: List added fields, endpoints, optional extensions

3. **Identify Affected Phases** (using PHASE_DEPENDENCY_MAP.md)
   ```
   Phase 1 API spec change → 
     Phase 2 tests need API response type updates
     Phase 3 backend implementation affected
     Phase 4 client SDK needs updates
     Phase 5 integration tests need new scenarios
   ```

4. **Record in SPEC_CHANGELOG.md** (auto-append if not done)
   ```
   - 2026-05-31T14:32:00Z | BREAKING | API response field 'user.avatar' removed
     Affected: Phase 2 (test mocks), Phase 3 (API contract), Phase 4 (client SDK), Phase 5 (e2e tests)
   ```

**Output**: Change detection report (type, impact, affected phases)

---

### Phase 2: Downstream Impact Analysis (10 min)

**Input**: Change detection report + PHASE_DEPENDENCY_MAP.md

**Process**:

1. **Build Dependency Graph**
   ```
   Phase 1 (API Contract)
     ├─→ Phase 2 (Tests)
     ├─→ Phase 3 (Backend Implementation)
     └─→ Phase 4 (Client SDK)
   
   Phase 2 (Tests)
     ├─→ Phase 3 (Implementation must pass tests)
     └─→ Phase 5 (E2E tests)
   
   Phase 3 (Backend Implementation)
     ├─→ Phase 4 (Client SDK)
     └─→ Phase 5 (E2E tests)
   ```

2. **Trace Propagation Path** (DFS from change point)
   - Direct dependents: Phase 2, 3, 4
   - Transitive dependents: Phase 5
   - List order of updates needed (topological sort)

3. **Identify Update Type Per Phase**
   - Phase 2: Update mocks, test data, assertions
   - Phase 3: Update API handler, response builder, validation
   - Phase 4: Update client method signatures, serialization
   - Phase 5: Add new scenarios, update expectations

4. **Check for Conflicts**
   - Does this breaking change conflict with Phase 3 implementation?
   - Does Phase 4 client have workarounds we need to update?
   - Are there Phase 5 tests that would break?

5. **Estimate Manual Work**
   - Breaking change: 2-4 hours (requires design decisions)
   - Feature change: 30-60 minutes
   - Non-impact: 5-10 minutes

**Output**: Impact analysis (affected phases, update type per phase, conflict flags, time estimate)

---

### Phase 3: Automatic Phase Updates (15 min)

**Input**: Impact analysis + affected contract files

**Process**:

1. **Update Phase 2 (Tests)**
   - Read current test files (e.g., `tests/api-mocks.test.js`)
   - Update mock data to match new API spec
   - Update assertions to match new field types/presence
   - Update test descriptions for new scenarios
   - Output: Updated test file + change summary

2. **Update Phase 3 (Backend Implementation)**
   - Read current API contract (`contracts/api/response.json`)
   - Update response schema to match API spec
   - Add migration notes (if breaking change)
   - Update backend handler docstring
   - Output: Updated contract + handler docs

3. **Update Phase 4 (Client SDK)**
   - Read current client types (`types/api.ts`)
   - Update interface definitions
   - Update serialization logic if needed
   - Add deprecation warnings for removed fields
   - Output: Updated types + deprecation notice

4. **Update Phase 5 (E2E Tests)**
   - Read current e2e scenarios (`playwright/e2e/scenarios.md`)
   - Add new test scenarios for new fields
   - Update assertions for changed fields
   - Output: Updated scenarios + new test cases

5. **Generate Migration Guide** (for breaking changes only)
   - What changed & why
   - Migration steps for downstream consumers
   - Backward compatibility period (if any)
   - Rollback procedure

**Automatic Updates**: Use text replacement templates to update files systematically
**Manual Review Point**: Breaking changes require human approval before commit

**Output**: Updated phase files + migration guide (if needed)

---

## Implementation Strategy

### Change Detection Logic

```javascript
// Pseudocode: Detect spec change type
function analyzeSpecChange(oldSpec, newSpec) {
  const changes = {
    breaking: [],
    feature: [],
    nonImpact: []
  };
  
  // Check for removed/modified fields (BREAKING)
  for (const field in oldSpec.properties) {
    if (!newSpec.properties[field]) {
      changes.breaking.push(`Removed field: ${field}`);
    } else if (oldSpec.properties[field].type !== newSpec.properties[field].type) {
      changes.breaking.push(`Changed type: ${field}`);
    }
  }
  
  // Check for new fields (FEATURE)
  for (const field in newSpec.properties) {
    if (!oldSpec.properties[field]) {
      changes.feature.push(`Added field: ${field}`);
    }
  }
  
  // Check for non-structural changes (NON-IMPACT)
  if (oldSpec.description !== newSpec.description) {
    changes.nonImpact.push(`Updated description`);
  }
  
  return changes;
}
```

### Phase Dependency Mapping

**File**: `.codebase/PHASE_DEPENDENCY_MAP.md`

```
# Phase Dependency Map

## Direct Dependencies
- Phase 1 (Contracts) → Phase 2, 3, 4
- Phase 2 (Tests) → Phase 3, 5
- Phase 3 (Implementation) → Phase 4, 5
- Phase 4 (SDK) → Phase 5
- Phase 5 (E2E) → Release

## Change Impact Rules
- API contract change → Tests, Backend, Client, E2E
- DB schema change → Backend, Migrations, Tests
- UI spec change → Frontend, E2E tests
- Breaking change → Higher priority, requires review
```

### Auto-Update Templates

**Pattern 1: Mock Data Update**
```javascript
// OLD
const mockUser = { id: 1, name: 'John', avatar: '/avatar.png' };

// AUTO-UPDATED (after avatar field removed)
const mockUser = { id: 1, name: 'John' };
```

**Pattern 2: Type Definition Update**
```typescript
// OLD
interface User {
  id: number;
  name: string;
  avatar: string; // URL to user avatar
}

// AUTO-UPDATED
interface User {
  id: number;
  name: string;
  // avatar field removed in API v2
}
```

**Pattern 3: Assertion Update**
```javascript
// OLD
expect(response.avatar).toBeDefined();

// AUTO-UPDATED (if field removed)
expect(response).not.toHaveProperty('avatar');
```

---

## Validation Workflow (After Auto-Update)

### Pre-Commit Validation (MANDATORY)

1. **Syntax Check**: All updated files are valid JSON/JS/TS
2. **Contract Alignment**: Updated contracts match actual changes
3. **Test Consistency**: Updated tests still make sense semantically
4. **Type Safety**: Types defined in Phase 4 match Phase 3 API contract
5. **Cross-Phase Validation**:
   - Phase 3 types ⊆ Phase 4 client types ✓
   - Phase 2 test data matches Phase 3 API contract ✓
   - Phase 5 tests reference existing Phase 4 client methods ✓

### Validation Checklist

```markdown
## Spec Propagation Validation

- [ ] Change detection correct? (type identified)
- [ ] Affected phases identified? (no missing phases)
- [ ] Phase 2 tests updated?
  - [ ] Mocks match new spec
  - [ ] Assertions updated
  - [ ] No broken assertions
- [ ] Phase 3 contract updated?
  - [ ] Schema matches API spec
  - [ ] Docstrings accurate
- [ ] Phase 4 SDK updated?
  - [ ] Types match API contract
  - [ ] No type mismatches
- [ ] Phase 5 E2E updated?
  - [ ] Scenarios reference updated SDK
  - [ ] No broken references
- [ ] Cross-phase validation passes?
  - [ ] All files are syntactically valid
  - [ ] No circular dependencies
  - [ ] Migration guide complete (if breaking)
- [ ] SPEC_CHANGELOG.md entry added?
```

---

## Auto-Trigger Integration

### Hook: PreToolUse for `/spec-change`

**Location**: `.instructions.md` (PreToolUse Hook #5)

```yaml
BEFORE /spec-change executes:
  1. Verify change is documented
  2. Confirm change type (breaking/feature/non-impact)
  3. Preview affected phases

AFTER /spec-change completes successfully:
  → Activate genesis-spec-propagation skill
  
  1. Change Detection (5 min)
     - Analyze spec difference
     - Identify breaking vs feature
     - Map affected phases
     - Record in SPEC_CHANGELOG.md
  
  2. Impact Analysis (10 min)
     - Build dependency graph
     - Trace propagation paths
     - Identify update types
     - Estimate effort
  
  3. Auto-Update (15 min)
     - Update Phase 2 tests
     - Update Phase 3 backend contract
     - Update Phase 4 client SDK
     - Update Phase 5 E2E tests
     - Generate migration guide
  
  4. Validation (5 min)
     - Syntax check all files
     - Cross-phase validation
     - Run affected test suites
     - Confirm all phases aligned
  
  5. Completion (2 min)
     - Create SPEC_CHANGE_PROPAGATION.md log
     - Update CURRENT_STATE.md
     - Ready for commit
  
  **CRITICAL**: No breaking change commits without review
  **CRITICAL**: All downstream phases must be updated
  **Non-optional**: Part of /spec-change completion criteria
```

---

## Integration with Other Skills

| Skill | Integration Point |
|-------|-------------------|
| **genesis-research** | Research best practices for API changes |
| **genesis-api-contract** | Generate new API contracts after change |
| **genesis-ui-ux-test** | Update test scenarios based on spec |
| **genesis-harness-engineering** | Orchestrate multi-phase updates |
| **genesis-docs** | Auto-update API docs after propagation |
| **genesis-release** | Use SPEC_CHANGELOG for release notes |
| **spec-impact-engine** | Base dependency tracking |

---

## Token Efficiency Rules

### Cache Aggressively
- Cache PHASE_DEPENDENCY_MAP.md (rarely changes)
- Cache contract templates (reusable)
- Cache update patterns (pattern matching)

### Summarize, Don't Repeat
- When reporting changes: "Phase 2,3,4,5 affected" not full text
- When proposing updates: Show before/after, not full file
- When validating: Report issues only, not passing checks

### Reuse Analysis
- Store dependency graph in session memory (use across operations)
- Reuse contract analysis within same session
- Link to previous propagation logs (avoid re-analyzing)

**Target**: 40-50 min for medium change with caching (vs 45+ min manual)

---

## Success Criteria

✅ **Automated**: /spec-change auto-triggers propagation (zero manual steps)
✅ **Complete**: All affected phases updated (2-5 scanned)
✅ **Validated**: Cross-phase consistency verified before commit
✅ **Documented**: SPEC_CHANGELOG.md + migration guides complete
✅ **Reversible**: Rollback procedure documented for breaking changes
✅ **Efficient**: 25-30 min execution vs 45+ min manual (40% time savings)
✅ **Enforced**: Pre-commit gate prevents misaligned phases

---

## Output Artifacts

### Per Spec Change

1. **SPEC_CHANGE_PROPAGATION.md** (Investigation log)
   - Change detected
   - Affected phases
   - Updates applied
   - Validation results
   - Migration guide (if breaking)

2. **Updated Contract Files**
   - Phase 2: `tests/api-mocks.test.js` (updated mocks)
   - Phase 3: `contracts/api/response.json` (updated schema)
   - Phase 4: `types/api.ts` (updated types)
   - Phase 5: `playwright/e2e/scenarios.md` (updated scenarios)

3. **SPEC_CHANGELOG.md Entry** (auto-append)
   ```
   - 2026-05-31T14:32:00Z | BREAKING | API field change
     Auto-updated phases: 2, 3, 4, 5 | Migration guide: /docs/migration-v2-to-v3.md
   ```

4. **Migration Guide** (for breaking changes)
   - What changed & why
   - Impact for consumers
   - Migration steps
   - Timeline & deadlines
   - Rollback procedure

---

## Recovery & Rollback

### If Propagation Breaks Tests

1. **Identify Breaking Phase**: Which phase fails?
2. **Root Cause**: Is it auto-update error or actual incompatibility?
3. **Recover**:
   - If auto-update error: Revert change, fix pattern, re-run propagation
   - If incompatibility: Manual review + design decision needed
4. **Document**: Add to RECOVERY_POINTS.md with solution

### Rollback to Previous Spec State

```bash
# If propagation introduced bugs:
git revert <propagation-commit>

# Verify all phases revert correctly
npm test

# Then manually review the spec change requirement
```

---

## Related Documentation

- [PHASE_DEPENDENCY_MAP.md](.codebase/PHASE_DEPENDENCY_MAP.md) - Phase dependencies
- [SPEC_CHANGELOG.md](.codebase/SPEC_CHANGELOG.md) - Change history
- [Contract Management](contracts/README.md) - Contract structures
- [Database Schema Evolution](docs/schema-evolution.md) - Migration patterns
