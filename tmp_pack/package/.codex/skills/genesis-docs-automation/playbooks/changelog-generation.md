# Playbook: Changelog Generation

**Purpose**: Generate SPEC_CHANGELOG.md entries automatically with proper formatting and structure

**When to Use**: For every spec/code change that affects user-visible behavior

**Time Estimate**: 10-15 minutes per entry (mostly automated)

---

## 📋 Changelog Entry Structure

Every entry follows this template:

```markdown
## [v2.1] - 2026-05-31

### ✨ Added
- New feature description
  - Detail 1
  - Detail 2

### 🔄 Changed  
- Behavior change description
  - Before: old behavior
  - After: new behavior

### 🐛 Fixed
- Bug fix description
  - Impact: what was broken
  - Fix: how it's resolved

### ⚠️ Deprecated
- Deprecated feature description
  - Timeline: When will it be removed (e.g., "Removed in v2.2")
  - Migration: [See migration guide](#migration-feature)

### 🗑️ Removed
- Removed feature description
  - Reason: Why removed
  - Alternative: What to use instead

### 🔐 Security
- Security issue fix or improvement
  - Issue: What was the risk
  - Fix: How it's resolved

### 📚 Documentation
- Documentation improvements
  - What was improved
  - Where to find it

---

## Change Classification Decision Tree

```
Is this a BREAKING change?
├─ YES (field removed, type changed, behavior inverted)
│  └─ Place under: "🗑️ Removed" or "⚠️ Deprecated"
│     Always provide: Migration guide with concrete examples
│     Always mark: [BREAKING] in title
│     Timeline: When consumers must migrate (e.g., "v2.2 (6 months)")
│
├─ NEW endpoint/feature?
│  └─ Place under: "✨ Added"
│     Always provide: Link to API documentation
│     Include: Performance characteristics if relevant
│     Include: Related tests or examples
│
├─ Behavior change (backward compatible)?
│  └─ Place under: "🔄 Changed"
│     Clarify: Before/after behavior
│     Explain: Why changed
│     Include: Any migration steps (if recommended)
│
├─ Bug fix (behavior corrected)?
│  └─ Place under: "🐛 Fixed"
│     Describe: What was broken
│     Explain: How it's fixed
│     Include: Impact on existing users (if breaking)
│
├─ Deprecation notice?
│  └─ Place under: "⚠️ Deprecated"
│     Timeline: Removal date (suggest 6 months)
│     Migration: Link to migration guide
│     Alternative: What to use instead
│
├─ Documentation-only change?
│  └─ Place under: "📚 Documentation"
│     What: What was improved
│     Where: Link to docs
│     Why: Why improvement was needed
│
└─ Security-related fix?
   └─ Place under: "🔐 Security"
      Risk: What was the vulnerability
      Fix: How it's addressed
      Upgrade: Urgency (critical/high/medium)
```

---

## 🎓 Examples by Change Type

### Example 1: New Endpoint (FEATURE)

**File Changed**: contracts/api/UserRegistration/request.json (new endpoint added)

**Generated Entry**:

```markdown
### ✨ Added

**User Registration Endpoint**
- New `POST /api/users/register` endpoint
- Parameters: email (required), password (required, 8+), name (optional)
- Response: User object with id, email, name, createdAt
- Error codes: 400 (invalid email), 409 (duplicate), 422 (weak password), 500 (server error)
- Rate limit: 5 requests per hour per IP
- [See API Reference](API_REFERENCE.md#post-apiusersregister)
- [See Implementation Guide](IMPLEMENTATION.md#user-registration-implementation)
```

**Include in Entry**:
- ✅ What was added
- ✅ Key parameters/options
- ✅ Response structure
- ✅ Error codes
- ✅ Rate limits (if applicable)
- ✅ Links to docs

---

### Example 2: Optional Field Addition (FEATURE)

**File Changed**: contracts/api/GetUser/response.json (added optional `avatarUrl`)

**Generated Entry**:

```markdown
### ✨ Added

**Optional Avatar URL Field**
- User profile now includes optional `avatarUrl` field
- Field: `avatarUrl` (string, optional, nullable if not set)
- Backward compatible: Existing clients unaffected
- Format: HTTPS URL to image (max 2MB)
- Example: `"https://cdn.example.com/avatars/user-123.png"`
- [See API Reference](API_REFERENCE.md#get-apiusersid)
```

**Verification Checklist**:
- [ ] Field is truly optional (won't break existing code)
- [ ] Default behavior clearly documented
- [ ] Examples provided
- [ ] No SQL migration needed (or noted separately)

---

### Example 3: Behavior Change (Compatible)

**File Changed**: src/services/UserService.ts (caching behavior changed)

**Generated Entry**:

```markdown
### 🔄 Changed

**User Cache Invalidation**
- User data now invalidated on ANY update (not just creation)
  - **Before**: Cache cleared only on user creation
  - **After**: Cache cleared on create/update/delete
  - **Why**: Prevents serving stale user data after profile update
- Client impact: None (automatic, transparent)
- Performance impact: +5ms per update (negligible)
- [See Implementation Details](IMPLEMENTATION.md#user-cache-invalidation)
```

**Verification Checklist**:
- [ ] Change is backward compatible
- [ ] No code changes required by clients
- [ ] Performance impact documented (if any)
- [ ] Reason for change explained

---

### Example 4: Bug Fix

**File Changed**: src/api/handlers/userHandler.ts (fixed null reference)

**Generated Entry**:

```markdown
### 🐛 Fixed

**Null Reference Error on User Delete**
- **Issue**: User delete endpoint threw 500 if user had pending transactions
  - Root cause: Missed null check on transaction cleanup
  - Impact: Delete requests failed intermittently
- **Fix**: Added null check before clearing transactions
  - Code: `if (user?.transactions) { clear() }`
  - Tests: Added 3 regression tests
- **Workaround** (if issue encountered): Retry the delete request
- [See Tests](tests/integration/users.test.ts#L234-L245)
```

**Verification Checklist**:
- [ ] Issue clearly described (what went wrong)
- [ ] Root cause explained (why it happened)
- [ ] Fix described in simple terms
- [ ] Tests provided to prevent regression
- [ ] Workaround provided (if applicable)

---

### Example 5: Deprecation Notice

**File Changed**: contracts/api/Auth/response.json (old endpoint deprecated)

**Generated Entry**:

```markdown
### ⚠️ Deprecated

**POST /api/auth/register Endpoint** [DEPRECATED]
- **Removal Timeline**: Removed in v2.2 (planned for August 31, 2026)
- **Alternative**: Use POST /api/users/register instead
- **Why**: Consolidated user management under /users endpoint
- **Migration**: [See Migration Guide](#migration-auth-endpoint)
  - No code changes: New endpoint has identical parameters/response
  - Action required: Update API calls to new endpoint
  - Timeline: Migrate at your convenience before August 31
- **Deprecation Header**: API returns `Deprecation: true` header with removal date

**Migration Path**:
```bash
# Before (v2.0)
POST /api/auth/register { email, password, name }

# After (v2.1+)
POST /api/users/register { email, password, name }
```

---

## Migration Guides

### Migration: Authentication Endpoint Consolidation

**When to Migrate**: Now (new endpoint available), must complete by v2.2

**What's Changing**: Old endpoint is deprecated, new endpoint recommended

**Old Code**:
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});
```

**New Code**:
```javascript
const response = await fetch('/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});
```

**Changes**:
- Endpoint path: `/api/auth/register` → `/api/users/register`
- Request: **No change** (same parameters)
- Response: **No change** (same structure)
- Error codes: **No change** (same errors)

**Testing**:
- [ ] Old endpoint still works (will until v2.2)
- [ ] New endpoint works identically
- [ ] Pick one endpoint and standardize

**Questions?**
- Old endpoint questions: [support@example.com](mailto:support@example.com)
- New endpoint issues: [api-team@example.com](mailto:api-team@example.com)

---

### Migration: Removing Legacy ID Field

**When to Migrate**: Now (new ID structure available)

**What's Changing**: `legacyId` field removed, use `id` instead

**Timeline**:
- v2.0: `legacyId` deprecated (deprecation warning added)
- v2.1: `legacyId` warning increased (deprecation header sent)
- v2.2: `legacyId` removed (breaking change)
- **You must migrate by June 30, 2026 (1 month from now)**

**Old Code**:
```javascript
// Using legacy ID (don't do this)
const userId = user.legacyId;    // e.g., "LEGACY-12345"
const user = await getUser(userId);
```

**New Code**:
```javascript
// Using standard ID
const userId = user.id;           // e.g., "550e8400-e29b-41d4-a716-446655440000"
const user = await getUser(userId);
```

**Why**: Simplifies ID system (single format instead of two)

**Steps to Migrate**:
1. Find all uses of `user.legacyId` in code
2. Replace with `user.id`
3. Verify types match (both string, UUID format)
4. Run tests to confirm
5. Deploy before June 30, 2026

**Troubleshooting**:
| Error | Cause | Fix |
|-------|-------|-----|
| "field does not exist" | Already removed | Check API version |
| Type mismatch | Old code using different format | Cast to string if needed |
| Tests fail | Deprecated field no longer returned | Update test mocks |

---

### Migration: Password Validation Requirement Change

**When to Migrate**: Immediate (API now enforces stricter validation)

**What's Changing**: Password requirements increased

**Before v2.1**:
- Minimum: 6 characters

**From v2.1**:
- Minimum: 8 characters
- Must include: Uppercase letter + number

**Examples**:

| Password | Before | After | Status |
|----------|--------|-------|--------|
| `abc123` | ✅ OK | ❌ NO | Requires 8+ chars |
| `Abc1234` | ✅ OK | ✅ OK | Valid |
| `MyPa$$word` | ✅ OK | ✅ OK | Valid |

**Action Required**:
- Add client-side validation to match new rules
- Update password input field hint text
- Update password reset to enforce new rules
- Notify existing users (optional, but recommended)

**Code Example**:
```javascript
function validatePassword(password) {
  const MIN_LENGTH = 8;
  const HAS_UPPERCASE = /[A-Z]/.test(password);
  const HAS_NUMBER = /\d/.test(password);
  
  if (password.length < MIN_LENGTH) {
    throw new Error('Password must be 8+ characters');
  }
  if (!HAS_UPPERCASE) {
    throw new Error('Password must include uppercase letter');
  }
  if (!HAS_NUMBER) {
    throw new Error('Password must include number');
  }
  
  return true;
}
```

---

## 📊 Changelog Entry Frequency

**When to add entries**:
- ✅ New endpoint/feature
- ✅ Changed behavior
- ✅ Bug fix
- ✅ Deprecation notice
- ✅ Security fix
- ✅ New error code
- ✅ Database schema change

**When NOT to add entries**:
- ❌ Internal refactoring (no behavior change)
- ❌ Comment/documentation updates
- ❌ Test updates (unless covering new behavior)
- ❌ Formatting/style changes
- ❌ Performance optimization (no behavior change)
- ❌ Dependencies (unless affects users)

---

## ✨ Best Practices

### ✅ DO

- **Be specific**: "Added `avatarUrl` field" not "Updated user model"
- **Include links**: Link to API reference, implementation guide, migration guide
- **Provide examples**: Show code before/after for migrations
- **Document errors**: List all error codes added/changed
- **Explain why**: Why was this change made?
- **Set timelines**: For deprecations, be clear on removal date
- **Test examples**: Ensure code examples compile/run

### ❌ DON'T

- **Be vague**: "Fixed things" is not helpful
- **Use marketing language**: "Revolutionary new feature" - be factual
- **Forget migration guides**: Breaking changes need clear guidance
- **Miss edge cases**: Mention limitations or known issues
- **Forget error codes**: List all possible error responses
- **Overcomplicate**: Keep entries readable (2-4 sentences per item)

---

## 🎯 Changelog Completeness Checklist

For each changelog entry, verify:

- [ ] **Clear title**: Describes what changed
- [ ] **Why changed**: Reason for the change
- [ ] **Impact documented**: How does this affect users?
- [ ] **Examples provided**: Concrete code examples
- [ ] **Links included**: To docs, guides, implementation
- [ ] **Tests mentioned**: Where to find validation
- [ ] **Timeline clear**: If deprecation, when is removal?
- [ ] **Migration guide**: If breaking, how to migrate?
- [ ] **Error codes listed**: All possible error responses
- [ ] **Backward compatible**: Clearly stated if breaking

---

## 📝 Template for Copy-Paste

Use this template for new entries:

```markdown
### [SECTION: ✨ Added / 🔄 Changed / 🐛 Fixed / ⚠️ Deprecated / 🗑️ Removed / 🔐 Security / 📚 Documentation]

**[Feature Title]**
- [Brief 1-line description]
- Details:
  - [Detail 1]
  - [Detail 2]
  - [Detail 3]
- Links: [Docs](link) | [Implementation](link) | [Migration](link)
- Tests: [Test file](link) with [N] test cases
```

---

## 🔄 Auto-Generation Rules

The genesis-docs-automation skill automatically generates entries when:

1. **Phase 1 API contract changes**
   - New endpoint → "✨ Added" section
   - Removed endpoint → "🗑️ Removed" section
   - Changed parameter type → "🔄 Changed" or "⚠️ Deprecated"
   - New error code → "✨ Added" under error codes

2. **Phase 3 Backend changes**
   - New service method → linked in "✨ Added"
   - Bug fix → "🐛 Fixed" section
   - Behavior change → "🔄 Changed" section
   - Database schema → separate "Database Migrations" section

3. **Phase 4 SDK changes**
   - New method → "✨ Added" in SDK section
   - Deprecated method → "⚠️ Deprecated" in SDK section
   - Type changes → "🔄 Changed" in SDK section

4. **Manual override**
   - User can manually add entries or override auto-generated
   - Use `/update-changelog` to force regeneration

---

**Version**: v2.3 | **Last Updated**: May 31, 2026 | **Status**: ACTIVE
