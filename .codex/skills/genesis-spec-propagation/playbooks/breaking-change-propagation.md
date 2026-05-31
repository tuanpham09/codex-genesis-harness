# Breaking Change Propagation Playbook

## Overview

**Scenario**: API field is removed or changed in incompatible way (breaking change)

**Complexity**: HIGH (requires manual review, migration strategy, backward compatibility considerations)

**Time**: 2-4 hours

**Manual Review**: Required (CRITICAL gate before propagation)

**Risk Level**: HIGH (can break production if not handled correctly)

---

## Example: Removing Field from API Response

Suppose API response loses field `avatar`:

```diff
// OLD API response (v1)
{
  "id": 123,
  "name": "John Doe",
  "avatar": "/avatars/john.jpg"
}

// NEW API response (v2)
{
  "id": 123,
  "name": "John Doe",
  // "avatar" removed - client must migrate
}
```

This is **BREAKING** because existing clients rely on `avatar` field.

---

## Pre-Propagation: CRITICAL REVIEW GATE

### ⛔ STOP - Manual Review Required

**Do NOT auto-propagate breaking changes without this review.**

### Review Checklist

- [ ] Why is this field being removed? (business justification)
- [ ] Who are the consumers? (internal clients, external API users)
- [ ] How many consumers affected? (1 or 100+?)
- [ ] Can we do this gradually? (deprecation period?)
- [ ] Do we need a migration period? (6 months? 1 year?)
- [ ] Backward compatibility possible? (keep old field but deprecated)
- [ ] Communication plan: When do consumers migrate by?

### Decision: Which Strategy?

**Option A: Hard Break** (v2 breaking API)
- Remove field completely
- Old clients get error or field missing
- Requires immediate migration
- Timeline: All consumers migrate in 1-2 weeks

**Option B: Gradual Migration** (v1.5 → v2)
- Keep field for 6 months (deprecated)
- New field replaces it (e.g., `avatarUrl`)
- Clients migrate at their pace
- Timeline: All consumers migrate by end of year

**Option C: Parallel APIs** (v1 & v2 coexist)
- v1 API includes `avatar`
- v2 API replaces with `avatarUrl`
- Clients choose which version to use
- Timeline: Flexible, v1 sunset in 12 months

**Recommendation**: Choose Option B (gradual) for external APIs, Option A for internal

### Record Decision

```markdown
## BREAKING CHANGE: Remove 'avatar' Field

**Decision**: Gradual Migration (Option B)

**Timeline**:
- v1.5 (Current): avatar field deprecated, avatarUrl added
- Migration Period: 6 months (now to Dec 31, 2026)
- v2.0 (Jan 1, 2027): avatar field removed completely

**Deprecation Notice**:
"The 'avatar' field is deprecated as of v1.5. 
Use 'avatarUrl' instead. 
The 'avatar' field will be removed in v2.0 (Jan 1, 2027)."

**Communication**:
- Email all API consumers on signup date
- Add deprecation warning to API docs
- Provide migration guide & code examples
- Track migration progress (which clients updated)

**Sign-Off**: Engineering Lead + Product Manager
```

**Once approved**: Proceed with propagation.

---

## Step 1: Create Migration Guide (30 min)

Create `docs/migration-v1-to-v2.md`:

```markdown
# Migration Guide: API v1 → v2

## Overview

The API is evolving from v1 to v2 with some breaking changes. 
This guide helps you migrate your client in minutes.

## What Changed

### Field Removed: `avatar`
- **Removed in**: v2.0 (January 1, 2027)
- **Deprecation period**: 6 months
- **Replacement**: Use `avatarUrl` field instead

```diff
// v1 API Response
{
  "id": 123,
  "name": "John",
  "avatar": "/avatars/john.jpg"  // Deprecated
}

// v2 API Response
{
  "id": 123,
  "name": "John",
  "avatarUrl": "https://cdn.example.com/avatars/john.jpg"  // New
}
```

## Migration Steps

### Step 1: Update Dependencies (5 min)

```bash
npm update @example/api-client@1.5.0
```

### Step 2: Update Code - Before

```javascript
// v1: Using deprecated avatar field
const user = await api.getUser(123);
console.log(user.avatar);  // "/avatars/john.jpg"
```

### Step 3: Update Code - After

```javascript
// v2: Using new avatarUrl field
const user = await api.getUser(123);
console.log(user.avatarUrl);  // "https://cdn.example.com/avatars/john.jpg"
```

### Step 4: Find All Usages

```bash
# Find all references to deprecated field
grep -r "\.avatar" src/
grep -r "'avatar'" src/
grep -r '"avatar"' src/
```

### Step 5: Update UI Components

```javascript
// BEFORE
<img src={user.avatar} alt={user.name} />

// AFTER
<img src={user.avatarUrl} alt={user.name} />
```

## Testing

```bash
# Run your tests with new field
npm test

# Verify all tests pass
```

## Timeline

- **Now**: Deprecation announced, 6-month migration period starts
- **Dec 15, 2026**: Deprecation warnings increase (last 2 weeks)
- **Jan 1, 2027**: v2.0 released, `avatar` field removed
- **After Jan 1**: Old clients will receive 400 error or field missing

## Support

- Email: api-support@example.com
- Slack: #api-help
- Docs: https://docs.example.com/api/v2
- Migration Issues: GitHub Discussions
```

---

## Step 2: Phase 2 - Update Tests (30 min)

### 2a. Remove Test References to Deprecated Field

File: `tests/api.test.js`

```javascript
// BEFORE - Testing deprecated field
test('should return user with avatar', async () => {
  const user = await api.getUser(1);
  expect(user.avatar).toBeDefined();
  expect(user.avatar).toMatch(/^\/avatars\//);
});

// AFTER - Test removed (field no longer exists)
// ✅ Test deleted - avatar field no longer in API
```

### 2b. Add Tests for Deprecation Period

Add `tests/deprecation.test.js`:

```javascript
describe('Deprecation: avatar field', () => {
  test('should NOT include avatar field in v2 responses', async () => {
    const user = await api.getUser(1);
    expect(user).not.toHaveProperty('avatar');
  });

  test('should include NEW avatarUrl field instead', async () => {
    const user = await api.getUser(1);
    expect(user).toHaveProperty('avatarUrl');
  });

  test('should include deprecation warning in headers', async () => {
    const response = await api.getUser(1);
    expect(response.headers['x-deprecated-fields']).toBeDefined();
    expect(response.headers['x-deprecated-fields']).toContain('avatar');
  });
});
```

### 2c. Update Mock Data

```javascript
// BEFORE
const mockUser = { id: 1, name: 'Alice', avatar: '/avatars/alice.jpg' };

// AFTER - Remove avatar, add avatarUrl
const mockUser = { id: 1, name: 'Alice', avatarUrl: 'https://cdn.example.com/avatars/alice.jpg' };
```

### 2d. Run Tests

```bash
npm test -- tests/

# All tests pass? ✅
```

---

## Step 3: Phase 3 - Update Backend Implementation (30 min)

### 3a. Remove Deprecated Field from Handler

File: `src/handlers/user.handler.js`

```javascript
// BEFORE - Returning deprecated field
async function getUser(req, res) {
  const user = await db.users.findById(req.params.id);
  return res.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar_path  // Deprecated - remove
  });
}

// AFTER - Remove avatar, return avatarUrl
async function getUser(req, res) {
  const user = await db.users.findById(req.params.id);
  return res.json({
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url  // New field
  });
}
```

### 3b. Update Contract Schema

File: `contracts/api/response.json`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "avatarUrl": {  // New field
      "type": ["string", "null"],
      "description": "URL to user avatar"
    }
    // avatar field removed
  },
  "required": ["id", "name"]
}
```

### 3c. Update API Docstring

```javascript
/**
 * GET /api/users/:id
 * 
 * Returns user data (v2 format).
 * 
 * BREAKING CHANGE (v2.0): Field 'avatar' removed.
 * Use 'avatarUrl' instead.
 * 
 * Migration guide: /docs/migration-v1-to-v2
 * Deprecation period: Until January 1, 2027
 * 
 * Response: { id, name, avatarUrl }
 */
```

### 3d. Add Deprecation Header (v1 only)

If supporting v1 for compatibility period:

```javascript
// v1 handler (deprecated)
app.get('/v1/users/:id', (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.set('X-API-Version', '1.0');
  res.set('X-Deprecated-Since', '2026-05-31');
  res.set('X-Sunset', '2027-01-01');
  res.set('X-Deprecated-Fields', 'avatar');
  res.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar_path,  // v1 still returns it
    avatarUrl: user.avatar_url  // v2 field preview
  });
});

// v2 handler (current)
app.get('/v2/users/:id', (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.set('X-API-Version', '2.0');
  res.json({
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url  // Only new field
  });
});
```

### 3e. Validate Contract

```bash
npm run validate:contracts

# Expected: Valid ✅
```

---

## Step 4: Phase 4 - Update Client SDK (20 min)

### 4a. Update Type Definitions

File: `types/api.ts`

```typescript
// BEFORE
interface User {
  id: number;
  name: string;
  avatar: string;  // Deprecated
}

// AFTER
interface User {
  id: number;
  name: string;
  avatarUrl: string | null;  // New field
  // avatar removed
}

// For v1 backward compatibility (optional)
interface UserV1 extends User {
  avatar: string;  // Deprecated - only in v1
}
```

### 4b. Update Client Methods

```typescript
// Update method to return new type
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();  // Now avatarUrl instead of avatar
}

// Provide helper for migration (optional)
function migrateUserToV2(userV1: UserV1): User {
  return {
    id: userV1.id,
    name: userV1.name,
    avatarUrl: userV1.avatar  // Map old field to new
  };
}
```

### 4c. Add Deprecation Warning

```typescript
/**
 * @deprecated The 'avatar' field is removed in v2.
 * Use 'avatarUrl' instead.
 * Migration: https://docs.example.com/migration-v1-to-v2
 * Removal date: 2027-01-01
 */
export interface UserV1 {
  avatar: string;
}
```

### 4d: Type Check

```bash
npm run tsc --noEmit

# No errors? ✅
```

---

## Step 5: Phase 5 - Update E2E Tests (20 min)

### 5a. Remove Tests for Deprecated Field

```javascript
// BEFORE - Testing deprecated field
test('should display user avatar', async ({ page }) => {
  await page.goto('/users/1');
  expect(page.locator('[data-avatar]')).toBeVisible();
});

// AFTER - Test removed, feature uses new field
// ✅ Test deleted - avatar functionality replaced with avatarUrl
```

### 5b. Add Tests for New Field

```javascript
test('should display user avatar using new avatarUrl field', async ({ page }) => {
  await page.goto('/users/1');
  const avatar = page.locator('[data-avatar-url]');
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('src', /^https:\/\//);
});
```

### 5c. Run E2E Tests

```bash
npm run test:e2e -- user.spec.ts

# All tests pass? ✅
```

---

## Step 6: Validation (10 min)

### 6a. Full Test Suite

```bash
npm run test

# Phase 2, 3, 4, 5 all pass? ✅
```

### 6b. Breaking Change Validation

```bash
# Verify old field is truly gone
npm run test:contracts -- --breakingChanges

# Should show: 'avatar' field removed (BREAKING)
```

### 6c. Migration Documentation

```bash
# Verify migration guide exists and is complete
ls -la docs/migration-v1-to-v2.md

# Check content includes all scenarios
grep -i "migration steps" docs/migration-v1-to-v2.md
grep -i "timeline" docs/migration-v1-to-v2.md
```

---

## Step 7: Communication (15 min)

### 7a. Update SPEC_CHANGELOG.md

```markdown
- 2026-05-31T14:30:00Z | BREAKING | Removed 'avatar' field from User response
  Migration: Gradual deprecation period (6 months) then removal in v2.0
  Timeline: Until January 1, 2027 to migrate
  Migration guide: /docs/migration-v1-to-v2
  Auto-updated phases: 2, 3, 4, 5
  Requires: Manual consumer notification
```

### 7b. Notify Consumers

Create notification template:

```
Subject: API Breaking Change: avatar field deprecation

Dear API Consumers,

Effective May 31, 2026, the 'avatar' field in the User API response is deprecated.

DEPRECATION PERIOD: Until January 1, 2027
ACTION: Migrate to use 'avatarUrl' field instead

Migration Guide: https://docs.example.com/migration-v1-to-v2

Questions? Contact: api-support@example.com

Best regards,
API Team
```

### 7c. Update API Documentation

- Add deprecation warning to API docs
- Link to migration guide
- Add upgrade timeline
- Provide code examples

---

## Step 8: Release Planning (30 min)

### 8a. Version Strategy

- **v1.5.0**: Deprecation announced, new field available
- **v2.0.0**: Breaking change, old field removed

### 8b. Release Notes

```markdown
## v2.0.0 - Breaking Changes Release

### Breaking Changes
- REMOVED: User API 'avatar' field
  - Replaced by: 'avatarUrl' field
  - Migration guide: https://docs.example.com/migration-v1-to-v2
  - Deprecation started: v1.5.0 (May 31, 2026)

### Migration Required
All clients must migrate to use 'avatarUrl' before deploying v2.0.0

### Support
- Migration assistance: api-support@example.com
- Slack channel: #api-help
```

### 8c: Rollback Strategy (if needed)

```markdown
## Rollback Procedure

If breaking change causes unexpected issues in production:

1. Identify affected consumers (check logs)
2. Revert v2.0.0 → v1.5.0:
   ```bash
   git revert <v2.0.0-tag>
   npm publish
   ```
3. Notify consumers of reversion
4. Schedule post-mortem (why did this break?)
5. Fix and re-release as v2.0.1

**Timeline**: Rollback can be done in < 1 hour
```

---

## Step 9: Sign-Off

- [ ] Migration guide written ✅
- [ ] Phase 2: Tests updated ✅
- [ ] Phase 3: Handler & contract updated ✅
- [ ] Phase 4: SDK types updated ✅
- [ ] Phase 5: E2E tests updated ✅
- [ ] All tests green ✅
- [ ] SPEC_CHANGELOG.md: Updated ✅
- [ ] Migration guide complete ✅
- [ ] Communication plan ready ✅
- [ ] Rollback strategy documented ✅
- [ ] Ready for code review ✅
- [ ] **ENGINEERING LEAD APPROVAL REQUIRED** ✅

---

## Common Issues & Recovery

### Issue: Clients Break Immediately

**Cause**: Didn't provide deprecation period, broke in-flight requests

**Recovery**:
1. Rollback to v1.5.0 immediately
2. Restore the `avatar` field for backward compatibility
3. Create longer deprecation period (6-12 months)
4. Re-plan breaking change for future release

### Issue: Some Clients Still Using Old Field

**Cause**: Deprecation communication missed some consumers

**Recovery**:
1. Extend migration timeline (add 3 months)
2. Provide tools to find field usage: `api-audit --field avatar`
3. Reach out to non-compliant consumers directly
4. Offer migration assistance

### Issue: Downstream Services Depend on Old Field

**Cause**: Internal services also use the deprecated field

**Recovery**:
1. Update internal services first (before public breaking change)
2. Add feature flag: `use_avatarUrl` (allow gradual rollout)
3. Test both code paths before removing old field
4. Remove old field after internal services upgraded

---

## Time Breakdown

| Task | Time |
|------|------|
| Pre-propagation review & decision | 30 min |
| Create migration guide | 30 min |
| Phase 2: Update tests | 30 min |
| Phase 3: Update handler | 30 min |
| Phase 4: Update SDK | 20 min |
| Phase 5: Update E2E | 20 min |
| Validation & testing | 10 min |
| Communication & docs | 15 min |
| Release planning | 30 min |
| **Total** | **225 min (3.75 hours)** |

---

## Success Criteria

✅ Migration guide is clear & comprehensive
✅ All tests pass (Phase 2-5)
✅ Breaking change is properly detected
✅ Consumers notified with migration timeline
✅ Deprecation period is sufficient (6+ months recommended)
✅ Rollback procedure is documented
✅ Engineering lead approved
✅ Ready for release & communication

