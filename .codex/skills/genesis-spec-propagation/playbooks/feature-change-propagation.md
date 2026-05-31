# Feature Change Propagation Playbook

## Overview

**Scenario**: New optional field added to API response (or new endpoint, new enum value, etc.)

**Complexity**: MEDIUM (mostly automatic, some manual review)

**Time**: 30-60 minutes

**Manual Steps**: Low (mainly review & validation)

---

## Example: Adding New Optional Field

Suppose API response gets new field `avatarUrl`:

```diff
// OLD API response
{
  "id": 123,
  "name": "John Doe"
}

// NEW API response
{
  "id": 123,
  "name": "John Doe",
+ "avatarUrl": "https://example.com/avatar.jpg"
}
```

---

## Step 1: Understand the Feature (5 min)

### Questions to Answer

1. **Why added?** Is it for new UI feature, performance, or future use?
2. **Optional or required?** Should consumers always expect it?
3. **Data type**: What is the structure and constraints?
4. **Deprecates anything?** Are we replacing an old field?
5. **Performance impact?** Does fetching this field slow down API?
6. **Backward compatibility**: Will old clients still work without it?

### Record Decision

```markdown
## Feature: Add avatarUrl to User Response

**Why**: New user profile UI needs avatar display

**Field Details**:
- Name: avatarUrl
- Type: string (URL)
- Optional: Yes (default to null if user has no avatar)
- Constraints: Valid URL format, max 2048 chars
- Deprecates: None
- Performance: No additional DB query needed

**Backward Compatibility**: Old clients will simply not use field (ignore unknown properties)
```

---

## Step 2: Update Phase 1 - API Contract (ALREADY DONE)

This is the original spec change. Verify it's complete:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "avatarUrl": {
      "type": ["string", "null"],
      "format": "uri",
      "description": "URL to user's avatar image",
      "maxLength": 2048
    }
  },
  "required": ["id", "name"]
}
```

✅ Contract has new field as optional

---

## Step 3: Phase 2 - Update Tests (15 min)

### 3a. Update Mock Data

Find test mocks: `tests/fixtures/user-mocks.js`

```javascript
// BEFORE
const mockUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

// AFTER - Add avatarUrl to some mocks (realistic data)
const mockUsers = [
  { 
    id: 1, 
    name: 'Alice',
    avatarUrl: 'https://example.com/avatars/alice.jpg'
  },
  { 
    id: 2, 
    name: 'Bob',
    avatarUrl: null  // No avatar
  },
  { 
    id: 3, 
    name: 'Charlie',
    avatarUrl: 'https://example.com/avatars/charlie.jpg'
  }
];
```

**Tip**: Include both cases (with URL and null) for realistic testing.

### 3b. Add New Test Cases

Add `tests/api.test.js`:

```javascript
describe('User API - avatarUrl field', () => {
  test('should include avatarUrl in user response', async () => {
    const response = await api.getUser(1);
    expect(response).toHaveProperty('avatarUrl');
    expect(response.avatarUrl).toMatch(/^https:\/\//);
  });

  test('should handle null avatarUrl for users without avatar', async () => {
    const response = await api.getUser(2);
    expect(response).toHaveProperty('avatarUrl');
    expect(response.avatarUrl).toBeNull();
  });

  test('should validate avatarUrl format', async () => {
    const response = await api.getUser(1);
    if (response.avatarUrl) {
      expect(response.avatarUrl).toMatch(/^https?:\/\/.+/);
    }
  });
});
```

### 3c. Run Tests

```bash
npm test -- tests/api.test.js

# Expected: All tests pass ✅
```

---

## Step 4: Phase 3 - Update Backend Implementation (15 min)

### 4a. Update API Response Builder

Find handler: `src/handlers/user.handler.js`

```javascript
// BEFORE
async function getUser(req, res) {
  const user = await db.users.findById(req.params.id);
  return res.json({
    id: user.id,
    name: user.name
  });
}

// AFTER - Include avatarUrl
async function getUser(req, res) {
  const user = await db.users.findById(req.params.id);
  return res.json({
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url || null  // Map DB field
  });
}
```

### 4b. Update Database Query (if needed)

If `avatar_url` column doesn't exist yet:

```sql
-- Migration: add_user_avatar_url.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(2048) DEFAULT NULL;
```

### 4c. Update Contract Docstring

```javascript
/**
 * GET /api/users/:id
 * 
 * Returns user data.
 * 
 * NEW (v1.1): Field 'avatarUrl' added - optional URL to user's avatar
 * 
 * Response: { id, name, avatarUrl? }
 * 
 * Example:
 * {
 *   "id": 1,
 *   "name": "Alice",
 *   "avatarUrl": "https://example.com/avatars/alice.jpg"
 * }
 */
```

### 4d. Validate Contract

```bash
npm run validate:contracts

# Expected: Valid ✅
```

---

## Step 5: Phase 4 - Update Client SDK (10 min)

### 5a. Update Type Definitions

File: `types/api.ts`

```typescript
// BEFORE
interface User {
  id: number;
  name: string;
}

// AFTER
interface User {
  id: number;
  name: string;
  avatarUrl?: string | null;  // Optional URL to avatar
}
```

### 5b. Update Client Method (if needed)

```typescript
// Usually no change to method signature, just return type updated

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();  // Now includes avatarUrl
}
```

### 5c. Type Check

```bash
npm run tsc --noEmit

# Expected: No type errors ✅
```

---

## Step 6: Phase 5 - Update E2E Tests (10 min)

### 6a. Add Scenario

File: `playwright/e2e/user.spec.ts`

```javascript
test('should display user avatar when available', async ({ page }) => {
  await page.goto('/users/1');
  
  // New scenario: avatar displays if avatarUrl present
  const avatar = page.locator('[data-test="user-avatar"]');
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('src', /^https:\/\//);
});

test('should hide avatar placeholder when user has no avatar', async ({ page }) => {
  await page.goto('/users/2');
  
  // User 2 has null avatarUrl
  const avatar = page.locator('[data-test="user-avatar"]');
  await expect(avatar).not.toBeVisible();
});
```

### 6b. Run E2E Tests

```bash
npm run test:e2e -- user.spec.ts

# Expected: All pass ✅
```

---

## Step 7: Validation (5 min)

### 7a. Syntax Check

```bash
npm run lint

# All files pass linting? ✅
```

### 7b. Integration Test

```bash
npm run test

# Run all tests together
# Phase 2 + Phase 3 + Phase 4 + Phase 5 should all pass ✅
```

### 7c. Cross-Phase Consistency

Verify alignment:

```
Phase 1: Contract includes avatarUrl ✓
Phase 2: Tests check for avatarUrl ✓
Phase 3: API returns avatarUrl ✓
Phase 4: SDK types include avatarUrl ✓
Phase 5: E2E tests verify avatarUrl display ✓
```

---

## Step 8: Documentation (5 min)

### 8a. Update SPEC_CHANGELOG.md

```markdown
- 2026-05-31T10:30:00Z | FEATURE | Added avatarUrl to User response
  New optional field for user profile UI improvements
  Auto-updated phases: 2, 3, 4, 5
  Impact: Clients can optionally display user avatars
```

### 8b. Update CURRENT_STATE.md

```markdown
## Current Phase State

- Phase 1 (Contracts): User API contract v1.1 with avatarUrl ✅
- Phase 2 (Tests): 3 new tests for avatarUrl scenarios ✅
- Phase 3 (Implementation): Handler returns avatarUrl ✅
- Phase 4 (SDK): Types updated, avatarUrl optional ✅
- Phase 5 (E2E): 2 new E2E tests for avatar display ✅
```

---

## Step 9: Sign-Off

- [ ] Phase 2: Tests pass ✅
- [ ] Phase 3: Handler returns avatarUrl ✅
- [ ] Phase 4: Types updated ✅
- [ ] Phase 5: E2E tests pass ✅
- [ ] All tests green: `npm test` ✅
- [ ] SPEC_CHANGELOG.md: Updated ✅
- [ ] Ready for commit ✅

---

## Common Issues & Recovery

### Issue: E2E Tests Can't Find Avatar Element

**Cause**: UI doesn't yet render avatar for new field

**Recovery**:
1. Create feature branch: `git checkout -b feat/user-avatar-ui`
2. Implement UI changes to display avatarUrl
3. Run E2E tests again: `npm run test:e2e`
4. Merge UI changes back to main branch

### Issue: Phase 3 Doesn't Have avatar_url Column

**Cause**: Database migration not run

**Recovery**:
1. Run migrations: `npm run migrate`
2. Verify column exists: `SELECT * FROM users LIMIT 1;`
3. Re-run Phase 3 tests

### Issue: Client SDK Still Can't Find avatarUrl

**Cause**: Stale cache or old test data

**Recovery**:
1. Clear cache: `rm -rf node_modules/.cache`
2. Reinstall: `npm install`
3. Re-run type check: `npm run tsc --noEmit`

---

## Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Understand feature | 5 min |
| 2 | Update tests | 15 min |
| 3 | Update API handler | 15 min |
| 4 | Update SDK types | 10 min |
| 5 | Update E2E tests | 10 min |
| — | Validation | 5 min |
| **Total** | | **60 min** |

---

## Success Criteria

✅ All tests pass (Phase 2-5)
✅ Types are consistent (Phase 4 ⊂ Phase 3 API)
✅ E2E scenarios reference avatarUrl correctly
✅ SPEC_CHANGELOG.md entry added
✅ No manual touchups needed
✅ Backward compatible (old clients work fine)
✅ Ready for merge to main

