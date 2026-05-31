# Phase-Specific Update Verification

Verify that each phase was updated correctly after automatic propagation.

---

## Phase 2: Test Updates

### Checklist: Test Mocks Updated

- [ ] Mock data file identified: `tests/fixtures/mocks/*.js`
- [ ] Old mock data removed (if breaking)
- [ ] New mock data structure matches API spec
- [ ] All required fields in mocks
- [ ] Optional fields handled correctly
- [ ] Test data types match API response types

**Example**:
```javascript
// Before propagation
const mockUser = {
  id: 1,
  name: 'John',
  avatar: '/avatar.png'  // This was removed
};

// After propagation
const mockUser = {
  id: 1,
  name: 'John'
  // avatar removed - matches new API spec
};
```

### Checklist: Test Assertions Updated

- [ ] Assertions check new fields (if feature change)
- [ ] Assertions removed for deleted fields (if breaking)
- [ ] Type assertions match new types
- [ ] Optional vs required assertions correct
- [ ] Test descriptions updated

**Example**:
```javascript
// Before
expect(response.avatar).toBeDefined();
expect(response.avatar).toMatch(/^\/\w+\.png$/);

// After (avatar removed)
expect(response).not.toHaveProperty('avatar');
```

### Checklist: Test Descriptions

- [ ] Test descriptions match new spec
- [ ] Comments explain new test scenarios
- [ ] "What changed" explained in test comments
- [ ] No outdated comments about removed fields

### Validation

```bash
# Run Phase 2 tests
npm test -- tests/
# All tests passing? ✅
```

---

## Phase 3: Backend Contract Updates

### Checklist: API Contract Schema

- [ ] Contract file identified: `contracts/api/response.json`
- [ ] Schema matches new API spec exactly
- [ ] New fields added (if feature)
- [ ] Old fields removed (if breaking)
- [ ] Field types correct
- [ ] Required vs optional correct
- [ ] Validation rules updated
- [ ] Comments/descriptions updated

**Example**:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    // "avatar" removed - breaking change
    "email": { "type": "string", "format": "email" }  // new optional
  },
  "required": ["id", "name"]  // avatar removed from required
}
```

### Checklist: Database Schema

If database schema affected:
- [ ] Schema change identified in `contracts/db/schema.json`
- [ ] Migration script generated (if breaking)
- [ ] Backward compatibility considered (if applicable)
- [ ] Indexes updated (if necessary)
- [ ] Rollback procedure documented

### Checklist: Implementation Docstring

- [ ] Handler docstring updated with new parameters
- [ ] Response structure documented correctly
- [ ] Breaking changes noted in docstring
- [ ] Migration path mentioned (if breaking)

**Example**:
```javascript
/**
 * GET /api/users/:id
 * 
 * Returns user data (v2 format).
 * 
 * BREAKING CHANGE (v2): Field 'avatar' removed. Use 'avatarUrl' instead.
 * Migration: https://docs.example.com/migration-v1-to-v2
 * 
 * Response: { id, name, avatarUrl?, email? }
 */
handler.get('/users/:id', (req, res) => { ... });
```

### Validation

```bash
# Validate API contract
npm run validate:contracts

# Type check
npm run tsc --noEmit

# All valid? ✅
```

---

## Phase 4: Client SDK Updates

### Checklist: Type Definitions

- [ ] Type file identified: `types/api.ts`
- [ ] Interface definition matches API contract
- [ ] New fields added with correct types (if feature)
- [ ] Old fields removed (if breaking)
- [ ] Optional vs required correct
- [ ] Union types updated if applicable

**Example**:
```typescript
// Before
interface User {
  id: number;
  name: string;
  avatar: string;
}

// After
interface User {
  id: number;
  name: string;
  avatarUrl?: string;  // Optional, new field
  email?: string;      // Optional, new field
  // avatar removed
}
```

### Checklist: Client Methods

- [ ] Client method signatures updated (if breaking)
- [ ] Return types match new API contract
- [ ] Parameter types updated
- [ ] Optional parameters marked correctly

**Example**:
```typescript
// Before
fetchUser(id: number): Promise<User & { avatar: string }> { ... }

// After
fetchUser(id: number): Promise<User> { ... }
// avatar removed from return type
```

### Checklist: Serialization/Deserialization

- [ ] Serialization logic updated (request → API)
- [ ] Deserialization logic updated (API → client)
- [ ] Field mapping updated if breaking
- [ ] Type casting correct

### Checklist: Deprecation Warnings (BREAKING ONLY)

- [ ] Deprecation notice added to affected methods
- [ ] Migration path documented
- [ ] Timeline for removal specified
- [ ] Alternative methods suggested

**Example**:
```typescript
/**
 * @deprecated Use fetchUser() instead, avatar field removed in v2
 * Migration: https://docs.example.com/migration-v1-to-v2
 * Removal date: 2026-12-31
 */
fetchUserWithAvatar(id: number): Promise<User> { ... }
```

### Validation

```bash
# Type check
npm run tsc --noEmit

# Any type errors? ❌
# All types valid? ✅
```

---

## Phase 5: E2E Test Updates

### Checklist: Scenario Files

- [ ] Scenario file identified: `playwright/e2e/scenarios.md`
- [ ] New scenarios added for new fields (if feature)
- [ ] Old scenarios removed or updated (if breaking)
- [ ] Scenarios reference correct Phase 4 SDK methods
- [ ] Test data matches updated spec

**Example**:
```markdown
## Create User with Email

- Input: { name: "John", email: "john@example.com" }
- Expected: User created with email field
- ❌ Removed: "Create User with Avatar" (avatar removed in v2)
```

### Checklist: E2E Assertions

- [ ] Assertions check new fields (if feature)
- [ ] Assertions removed for deleted fields (if breaking)
- [ ] Assertions match new API response structure
- [ ] Element selectors still valid (if UI affected)

**Example**:
```javascript
// Before
page.locator('[data-test="user-avatar"]').isVisible()

// After (avatar removed from UI)
page.locator('[data-test="user-avatar"]').isHidden()
// OR removed entirely if no UI replacement
```

### Checklist: Test Data

- [ ] Test data fixtures match new API spec
- [ ] Mock responses updated if needed
- [ ] Page objects reference updated fields
- [ ] Helper functions updated

### Checklist: Page Objects

- [ ] Page object selectors match updated UI
- [ ] Methods return correct data types
- [ ] No references to removed fields

### Validation

```bash
# Run E2E tests (subset to verify updates)
npm run test:e2e -- --grep "User"

# All E2E tests passing? ✅
```

---

## Cross-Phase Consistency Check

After all phases updated, verify they're still aligned.

### Type System Alignment

- [ ] Phase 3 API contract types ⊂ Phase 4 SDK types?
- [ ] Phase 2 test data types match Phase 3 API response?
- [ ] Phase 5 test data types match Phase 4 SDK input?

**Check**: Types shouldn't require conversion between phases

### Data Flow Alignment

```
Phase 2: Mock data
    ↓ (matches)
Phase 3: API response schema
    ↓ (matches)
Phase 4: Client type definitions
    ↓ (matches)
Phase 5: E2E test expectations
```

- [ ] Mock → API Contract: Same fields & types
- [ ] API Contract → Client Types: Same structure
- [ ] Client Types → E2E Tests: Same data

### Method Call Alignment

- [ ] Phase 5 E2E calls Phase 4 methods correctly
- [ ] Phase 4 SDK methods call Phase 3 endpoints correctly
- [ ] Phase 2 tests verify same behavior as Phase 3

### Validation

```bash
# Run all tests together
npm run test:full

# No integration errors? ✅
# No type mismatches? ✅
```

---

## Conflict Resolution

If any phase is out of sync with others, document the conflict.

### Conflict Recording

Create `CONFLICT_LOG.md` entry:

```markdown
## Conflict: Phase 3 ↔ Phase 4 Type Mismatch

**Date**: 2026-05-31
**Severity**: HIGH
**Change**: API response removed 'avatar' field

**Conflict Details**:
- Phase 3 API contract: { id, name, email } ✓
- Phase 4 SDK types: { id, name, avatar, email } ✗
- Mismatch: avatar field in SDK but not in API

**Resolution**:
1. Remove avatar from Phase 4 types
2. Add deprecation warning
3. Re-run validation

**Status**: RESOLVED
```

### Manual Intervention

If conflicts found:
1. **Identify**: Which phases are misaligned?
2. **Cause**: Why did propagation miss this?
3. **Fix**: Manual update to misaligned phase
4. **Document**: Add to CONFLICT_LOG.md
5. **Re-validate**: Run tests again
6. **Improve**: Update patterns to prevent recurrence

---

## Sign-Off Checklist

Once all updates complete and validated:

- [ ] Phase 2 tests: All green ✅
- [ ] Phase 3 contract: Valid & aligned ✅
- [ ] Phase 4 SDK: Types correct & synchronized ✅
- [ ] Phase 5 E2E: Tests pass & scenarios updated ✅
- [ ] Cross-phase consistency: Verified ✅
- [ ] No conflicts: All aligned ✅
- [ ] Migration guide: Complete (if breaking) ✅
- [ ] SPEC_CHANGELOG.md: Entry added ✅
- [ ] Ready for commit ✅

