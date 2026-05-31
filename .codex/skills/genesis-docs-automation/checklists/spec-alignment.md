# Spec-Alignment Checklist

**Purpose**: Verify that all phases are aligned on specs, types, and data contracts

**When to Use**: During doc validation phase, before marking docs ready for commit

---

## 🔗 Cross-Layer Type Alignment

### Phase 1 → Phase 3 Alignment (Contract → Backend)

**For each endpoint in Phase 1 API contract**:

**GET /api/users/{id}**
- [ ] Phase 1 spec defines response: `{ id: string, email: string, name?: string }`
- [ ] Phase 3 handler returns exactly this structure (no extra fields)
- [ ] Phase 3 type definition: `interface User { id: string; email: string; name?: string; }`
- [ ] No optional fields in Phase 1 become required in Phase 3
- [ ] No required fields in Phase 1 are optional in Phase 3

**POST /api/users**
- [ ] Phase 1 request schema matches Phase 3 handler parameters
- [ ] Phase 1 request validation rules enforced in Phase 3
- [ ] Phase 1 response schema matches Phase 3 handler response
- [ ] No type coercion surprises (string "123" vs number 123)

### Phase 3 → Phase 4 Alignment (Backend → SDK)

**For each type in Phase 3 backend**:

- [ ] Phase 3 response `{ id, email, name }` → Phase 4 type `User`
- [ ] Phase 4 type includes all fields from Phase 3 (nothing lost)
- [ ] Phase 4 optional fields match Phase 3 optional fields
- [ ] Phase 4 methods signature matches Phase 3 API behavior
- [ ] Phase 4 error handling matches Phase 3 error codes

### Phase 4 → Phase 5 Alignment (SDK → E2E Tests)

**For each SDK method used in Phase 5**:

- [ ] Phase 5 test calls `userService.getUser(id)` → Phase 4 method exists
- [ ] Phase 5 test expects type `{ id, email, name }` → Phase 4 type matches
- [ ] Phase 5 test error handling matches Phase 4 SDK errors
- [ ] Phase 5 test data setup uses Phase 4 types/methods

---

## 🔄 Data Flow Alignment

### End-to-End User Data Flow

**Scenario**: User registers, profile updated, retrieved

**Phase 1 Contract**:
```json
POST /api/users/register {
  "email": "user@example.com",
  "password": "secure",
  "name": "John"
}

Response 200 {
  "id": "uuid-1",
  "email": "user@example.com",
  "name": "John"
}
```

**Phase 2 Tests**:
- [ ] Test mock: `{ email: "user@example.com", password: "secure", name: "John" }`
- [ ] Test assertion: Response has `id`, `email`, `name`
- [ ] Test assertion: Password NOT in response

**Phase 3 Backend**:
- [ ] Handler receives: `{ email, password, name }`
- [ ] Handler validates: Email format, password strength
- [ ] Handler hashes: Password stored securely (not plaintext)
- [ ] Handler returns: `{ id, email, name }` (NO password)
- [ ] Handler stores: User record in database

**Phase 4 SDK**:
- [ ] Register method signature: `register(email, password, name)`
- [ ] Type definition: `interface User { id, email, name }`
- [ ] SDK returns: `User` type with id, email, name
- [ ] SDK error handling: Maps backend errors to SDK exceptions

**Phase 5 E2E Tests**:
- [ ] Test data setup: `await userService.register("user@ex.com", "pwd", "John")`
- [ ] Test assertion: `response.id` exists
- [ ] Test assertion: `response.email === "user@ex.com"`
- [ ] Test assertion: `response.password` NOT in response (undefined)

✅ **Full alignment verified**: Data consistent through all phases

---

## 🔒 Error Code Alignment

### Phase 1: Error Codes Defined

```json
{
  "409": "Email already registered",
  "400": "Invalid email format",
  "422": "Password too weak"
}
```

### Phase 3: Error Codes Implemented

- [ ] Handler throws error 409 when: Email collision detected
- [ ] Handler throws error 400 when: Email fails validation
- [ ] Handler throws error 422 when: Password fails strength check
- [ ] Handler includes error message in response
- [ ] Handler doesn't leak sensitive info in error (no stack traces)

### Phase 4: Error Codes Documented

- [ ] SDK has enum: `UserErrors = { EMAIL_EXISTS: 409, INVALID_EMAIL: 400, WEAK_PASSWORD: 422 }`
- [ ] SDK throws TypeScript Error with proper type
- [ ] SDK error message matches Phase 3 message
- [ ] SDK error handling clear in documentation

### Phase 5: Error Codes Tested

- [ ] E2E test: Registers with duplicate email → 409 handled correctly
- [ ] E2E test: Registers with invalid email → 400 handled correctly
- [ ] E2E test: Registers with weak password → 422 handled correctly
- [ ] E2E test: Error UI shows correct message to user

---

## 📋 Database Schema Alignment

**If database schema changed**:

### Phase 1: Schema Changes Documented

```json
"User table:
  - id: UUID (primary key)
  - email: VARCHAR(255) UNIQUE
  - passwordHash: VARCHAR(255)
  - name: VARCHAR(255) NULL
  - createdAt: TIMESTAMP DEFAULT NOW()
"
```

### Phase 3: Schema Changes Implemented

- [ ] Migration script created: `migrations/20260531_add_users_table.sql`
- [ ] Migration creates `users` table with specified columns
- [ ] Unique constraint on `email` field (prevents duplicates)
- [ ] Index on `email` (for fast lookups)
- [ ] Default timestamp on `createdAt`
- [ ] Tests verify migration runs successfully

### Phase 4: Schema Changes Known

- [ ] SDK documentation notes: "User.email is unique"
- [ ] SDK documentation notes: "User.passwordHash never exposed"
- [ ] SDK documentation notes: "User.createdAt is timestamp"

### Phase 5: Schema Changes Verified

- [ ] E2E test: Two users can't have same email (409 on duplicate)
- [ ] E2E test: User.email is returned (public field)
- [ ] E2E test: User.passwordHash is NOT returned (private field)
- [ ] E2E test: User.createdAt is returned (timestamp)

---

## 📊 Type Definition Alignment

### Before (Misaligned)

```
Phase 1: { id: string, email: string, name?: string, avatar?: string }
Phase 3: { id, email, name }  // Missing avatar
Phase 4: { id: string; email: string; name: string; }  // Wrong: name required
Phase 5: Test expects { id, email, name, avatar }  // Expects avatar
```

❌ **MISALIGNED**: Phases disagree on `avatar` field and `name` optionality

### After (Aligned)

```
Phase 1: { id: string, email: string, name?: string }
Phase 3: { id, email, name? }  // Matches contract
Phase 4: { id: string; email: string; name?: string; }  // Matches contract
Phase 5: Test expects { id, email, name? }  // Matches all phases
```

✅ **ALIGNED**: All phases agree on structure

---

## 🔍 Method Signature Alignment

### SDK Method Signature

**Phase 1 (Contract)**: 
```
POST /api/users/register
Request: { email, password, name }
Response: { id, email, name }
```

**Phase 4 (SDK)**: 
- [ ] Method name: `register()` or `createUser()`? Pick ONE consistently
- [ ] Method signature: `register(email: string, password: string, name?: string): Promise<User>`
- [ ] Parameter types: string (matches contract)
- [ ] Parameter optionality: name optional (matches contract)
- [ ] Return type: User object (matches contract response)
- [ ] Throws errors: Matches Phase 3 errors (409, 400, 422)

**Phase 5 (E2E)**:
- [ ] Test calls: `await userService.register("email@ex.com", "pwd", "John")`
- [ ] Test expects: Promise returns User object
- [ ] Test expects: User has { id, email, name }

---

## ⚡ Validation Order

Check these in order (stop if misaligned):

```
1. Phase 1 API Contract Valid?
   - JSON schema valid, types defined
   
2. Phase 1 → Phase 3 Match?
   - Backend implements contract
   
3. Phase 3 → Phase 4 Match?
   - SDK types match backend response
   
4. Phase 4 → Phase 5 Match?
   - E2E tests use SDK correctly
   
5. Round-trip Test
   - Phase 5 test calls all the way through to Phase 1 contract
```

If any mismatch: 🔴 STOP, document conflict, request manual review

---

## 🎓 Example: Breaking Change Detection

### Scenario: Removing `legacyId` field

**Phase 1 Contract Change**:
```diff
{
  "id": "uuid",
  "email": "user@example.com",
- "legacyId": "legacy-format-id"
}
```

**Alignment Check**:

Phase 1 → Phase 3:
- [ ] Phase 3 handler: Remove `legacyId` from response ✓
- [ ] Phase 3 tests: Don't expect `legacyId` ✓

Phase 3 → Phase 4:
- [ ] Phase 4 type: Remove `legacyId` property
  - [ ] But wait: existing code uses `user.legacyId`?
  - [ ] Decision: Add deprecation warning or break?
  - [ ] Need: Migration guide for Phase 4 users

Phase 4 → Phase 5:
- [ ] Phase 5 E2E: Remove test assertions on `legacyId` ✓

**Alignment Result**: ⚠️ BREAKING - Requires migration guide

**Migration Guide Needed**:
```
## Migration: Removing legacyId

Before: const legacyId = user.legacyId;
After: Use user.id instead (single ID field)

Deprecation: legacyId removed in v2.1
Timeline: 6 months from v2.0
```

---

## ✅ Sign-Off

When all alignments verified:

- [ ] All phase-to-phase connections consistent
- [ ] No type mismatches found
- [ ] No missing fields in downstream phases
- [ ] Error codes aligned across all phases
- [ ] Database schema known to all phases
- [ ] Method signatures compatible
- [ ] Migration guides provided for breaking changes

**ALIGNMENT VALIDATION**: ✅ PASSED

Document in: `DOCS_UPDATE_LOG.md`

---

**Last Updated**: May 31, 2026 | **Status**: ACTIVE
