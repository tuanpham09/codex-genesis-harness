# Playbook: Automated Docs Update Flow

**Purpose**: Complete walkthrough of the automatic documentation update process

**Time Estimate**: 35 minutes total execution (mostly automated)

**Trigger**: After tests pass (PostToolUse Hook #6) or manual `/update-docs` command

---

## 🎯 Complete Workflow

### Phase 1: Change Detection (5 min)

**Step 1.1: Identify Changed Files**

```bash
# Git diff since last stable state
$ git diff HEAD~1 --name-only

contracts/api/UserRegistration/request.json    # CHANGED: Phase 1
contracts/api/UserRegistration/response.json   # CHANGED: Phase 1
src/api/handlers/registerHandler.ts            # CHANGED: Phase 3
src/client/AuthService.ts                      # CHANGED: Phase 4
tests/integration/auth.test.ts                 # CHANGED: Phase 2
playwright/e2e/registration.spec.ts            # CHANGED: Phase 5
```

**Step 1.2: Categorize by Phase**

```
PHASE 1 (API Contract):
  - contracts/api/UserRegistration/request.json
  - contracts/api/UserRegistration/response.json

PHASE 2 (Tests):
  - tests/integration/auth.test.ts

PHASE 3 (Backend Implementation):
  - src/api/handlers/registerHandler.ts

PHASE 4 (SDK/Client):
  - src/client/AuthService.ts

PHASE 5 (E2E Tests):
  - playwright/e2e/registration.spec.ts
```

**Step 1.3: Determine Doc Update Types**

```
Phase 1 API Contract changed:
  → Trigger: API_REFERENCE.md update

Phase 3 Backend handler changed:
  → Trigger: IMPLEMENTATION.md update
  → Trigger: ARCHITECTURE.md update

Phase 4 SDK changed:
  → Trigger: Client SDK Reference update

All phases changed:
  → Trigger: SPEC_CHANGELOG.md entry
  → Trigger: IMPLEMENTATION_HANDOFF.md update

Initial detection complete ✓
```

---

### Phase 2: Doc Type Analysis (10 min)

**Step 2.1: Analyze Each Changed File**

**File 1: contracts/api/UserRegistration/request.json**

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 },
    "name": { "type": "string" }
  },
  "required": ["email", "password"]
}
```

**Analysis**:
- New required fields: `email`, `password`
- Optional fields: `name`
- No fields removed (FEATURE change)
- Backward compatible: ✓

**Action**: Generate API docs section

**File 2: contracts/api/UserRegistration/response.json**

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": { "type": "string" },
    "name": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "email", "createdAt"]
}
```

**Analysis**:
- Response includes user object
- Contains timestamps
- No sensitive fields (password not included)

**Action**: Generate API docs section

**File 3: src/api/handlers/registerHandler.ts**

```typescript
export async function registerHandler(req: Request): Promise<Response> {
  const { email, password, name } = req.body;
  
  // Validation
  if (!isValidEmail(email)) return response(400, { error: "Invalid email" });
  if (password.length < 8) return response(422, { error: "Password too weak" });
  
  // Check existence
  const existing = await User.findByEmail(email);
  if (existing) return response(409, { error: "Email already registered" });
  
  // Create user
  const user = await User.create({
    email,
    passwordHash: await hash(password),
    name
  });
  
  return response(200, user);
}
```

**Analysis**:
- Implements all fields from Phase 1 contract
- Error handling matches contract (400, 409, 422)
- No extra fields in response
- Password properly hashed

**Action**: Generate IMPLEMENTATION.md section

**File 4: src/client/AuthService.ts**

```typescript
export class AuthService {
  async register(email: string, password: string, name?: string): Promise<User> {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    
    if (response.status === 409) {
      throw new EmailAlreadyUsedError("Email already registered");
    }
    
    return response.json();
  }
}
```

**Analysis**:
- Method signature matches Phase 1 contract parameters
- Return type is User (from Phase 1 response)
- Error handling matches Phase 3 error codes
- Backward compatible

**Action**: Generate SDK Reference section

**Step 2.2: Determine Change Severity**

```
Change Type Analysis:

Is this BREAKING?
  - Removed required field? NO
  - Changed field type? NO
  - Changed behavior significantly? NO
  
→ NOT BREAKING

Is this FEATURE?
  - New optional parameter? NO
  - New endpoint? YES (POST /api/users/register)
  - New method? YES (register method)
  
→ FEATURE CHANGE

Severity: MEDIUM (New endpoint/feature)
Requires manual review: ❌ NO
Needs migration guide: ❌ NO
```

**Step 2.3: Compile Change Summary**

```
📋 CHANGE SUMMARY
Generated: May 31, 2026, 10:15 AM

CHANGE TYPE: FEATURE
SEVERITY: MEDIUM
PHASES AFFECTED: 1, 2, 3, 4, 5 (all phases)

SUMMARY:
Added new user registration endpoint and SDK method.
  - New POST /api/users/register endpoint
  - Email validation + password hashing
  - SDK method: AuthService.register(email, password, name?)
  
BACKWARD COMPATIBLE: ✅ YES
BREAKING CHANGE: ❌ NO
MANUAL REVIEW REQUIRED: ❌ NO

AFFECTED FILES:
  - contracts/api/UserRegistration/* (Phase 1)
  - tests/integration/auth.test.ts (Phase 2)
  - src/api/handlers/registerHandler.ts (Phase 3)
  - src/client/AuthService.ts (Phase 4)
  - playwright/e2e/registration.spec.ts (Phase 5)

DOCUMENTATION NEEDED:
  - ✅ API Reference (endpoint + parameters + response)
  - ✅ Implementation Guide (how it works internally)
  - ✅ SDK Reference (method + types + examples)
  - ✅ Changelog entry (what's new)
  - ✅ Handoff document (next steps for UI/integration)
```

---

### Phase 3: Auto-Update Documents (15-20 min)

**Step 3.1: Generate API_REFERENCE.md Section**

```markdown
### POST /api/users/register

**Description**: Register a new user account

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Password (8+ characters) |
| name | string | No | User's display name |

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-05-31T10:15:00Z"
}
```

**Error Responses**:
| Code | Error | Cause | Recovery |
|------|-------|-------|----------|
| 400 | Invalid email format | Email syntax invalid | Check format (user@domain.com) |
| 409 | Email already registered | Email taken | Try password reset instead |
| 422 | Password too weak | <8 chars, no variety | Use 8+ chars with uppercase, number |
| 500 | Internal server error | Server error | Retry after 1 minute |

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

**Example Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-05-31T10:15:00Z"
}
```

---

**Generated**: May 31, 2026 | **Source**: contracts/api/UserRegistration
```

**Step 3.2: Generate IMPLEMENTATION.md Section**

```markdown
## User Registration Implementation

### Handler: `src/api/handlers/registerHandler.ts`

The register handler processes new user signups:

```typescript
export async function registerHandler(req: Request): Promise<Response> {
  const { email, password, name } = req.body;
  
  // 1. Input Validation (lines 12-20)
  if (!isValidEmail(email)) {
    return response(400, { error: "Invalid email format" });
  }
  if (password.length < 8) {
    return response(422, { error: "Password too weak" });
  }
  
  // 2. Uniqueness Check (lines 21-25)
  const existing = await User.findByEmail(email);
  if (existing) {
    return response(409, { error: "Email already registered" });
  }
  
  // 3. User Creation (lines 26-34)
  const user = await User.create({
    email,
    passwordHash: await hash(password),
    name
  });
  
  return response(200, user);
}
```

### Service: `src/services/UserService.ts`

The UserService orchestrates business logic:

- **createUser(email, password, name)**: Creates new user record
- **Validation**: Deferred to handler (single responsibility)
- **Database**: Async insert with error handling
- **Transaction**: Single write (no rollback needed)

### Data Flow

1. Client calls: POST /api/users/register
2. Express router → registerHandler
3. Handler validates input
4. Handler checks uniqueness
5. UserService.createUser() called
6. Database insert
7. Response returned (user object, no password)

### Performance Characteristics

- **Email validation**: O(1) regex
- **Uniqueness check**: O(1) indexed lookup (email unique index)
- **Password hashing**: O(1) bcrypt ~100ms
- **Database insert**: O(1) ~10ms average
- **Total P50**: ~30ms
- **Total P95**: ~150ms (hashing delays)

### Error Handling Strategy

| Error | Source | Recovery |
|-------|--------|----------|
| 400 Invalid email | Handler validation | Client should fix format |
| 409 Email exists | DB uniqueness check | Client should suggest password reset |
| 422 Weak password | Handler validation | Client should suggest stronger password |
| 500 Server error | Unexpected exception | Client should retry with backoff |

### Security Considerations

- ✅ Passwords hashed with bcrypt (not stored plaintext)
- ✅ Email validated (RFC format check)
- ✅ Rate limiting: 5 requests per hour per IP
- ✅ Error messages don't leak user existence (409 is only for existing email)
- ✅ No stack traces in error responses

---

**Generated**: May 31, 2026 | **Source**: src/api/handlers/registerHandler.ts
```

**Step 3.3: Generate SDK Reference Section**

```markdown
## AuthService.register()

**Signature**:
```typescript
async register(email: string, password: string, name?: string): Promise<User>
```

**Parameters**:
- `email`: User email address (required)
- `password`: User password (required, 8+ characters)
- `name`: User's display name (optional)

**Return**: Promise resolving to `User` object

**Errors**: Throws appropriate Error subclass
- `EmailAlreadyUsedError`: Email already registered (409)
- `InvalidEmailError`: Invalid email format (400)
- `WeakPasswordError`: Password too weak (422)
- `ServerError`: Internal server error (500)

**Example**:
```typescript
import { AuthService } from '@myapp/client';

const auth = new AuthService();

try {
  const user = await auth.register(
    'user@example.com',
    'SecurePassword123',
    'John Doe'
  );
  
  console.log(`User registered: ${user.id}`);
  // User registered: 550e8400-e29b-41d4-a716-446655440000
} catch (error) {
  if (error instanceof EmailAlreadyUsedError) {
    console.log('Email already in use, try password reset');
  } else if (error instanceof WeakPasswordError) {
    console.log('Password too weak, try 8+ chars with uppercase and numbers');
  }
}
```

**Type Definitions**:
```typescript
interface User {
  id: string;           // UUID
  email: string;        // Valid email
  name?: string;        // Optional display name
  createdAt: Date;      // Account creation timestamp
}

class EmailAlreadyUsedError extends Error { code: 409; }
class InvalidEmailError extends Error { code: 400; }
class WeakPasswordError extends Error { code: 422; }
```

---

**Generated**: May 31, 2026 | **Source**: src/client/AuthService.ts
```

**Step 3.4: Generate SPEC_CHANGELOG.md Entry**

```markdown
## [v2.1] - 2026-05-31

### ✨ Added

**User Registration Endpoint** [#NEW]
- New `POST /api/users/register` endpoint
- Email validation + password hashing with bcrypt
- Returns user object with UUID, email, name, createdAt
- Rate limited: 5 requests per hour per IP
- Tests: 12 integration tests, 4 E2E test scenarios
- **See**: [API Reference - POST /api/users/register](API_REFERENCE.md#post-apiusersregister)
- **Implementation**: [User Registration Implementation Guide](IMPLEMENTATION.md#user-registration-implementation)
- **SDK**: [AuthService.register()](CLIENT_SDK.md#authserviceregister)

### 📝 Error Codes

| Code | Meaning | When |
|------|---------|------|
| 400 | Invalid email format | Email syntax invalid |
| 409 | Email already registered | Duplicate signup attempt |
| 422 | Password too weak | <8 chars or weak combination |

### 🧪 Test Coverage

**New Tests**:
- ✅ Register with valid data → 200 with user ID
- ✅ Register with duplicate email → 409
- ✅ Register with invalid email → 400
- ✅ Register with weak password → 422
- ✅ Retrieve user after registration → correct data
- ✅ Performance: Response time < 150ms P95

**Coverage**: 94% of registration feature

---

**Timestamp**: May 31, 2026 10:30 AM UTC
**Changed Files**: 5 | **Docs Files**: 3 | **Tests**: 12
```

**Step 3.5: Generate IMPLEMENTATION_HANDOFF.md Update**

```markdown
# Handoff: User Registration Feature → Phase 4 (SDK/Client)

**Status**: ✅ Ready for Phase 4 (E2E/Frontend Implementation)
**From**: Phase 3 Backend | **To**: Phase 4 SDK/Client
**Date**: May 31, 2026

---

## ✅ What's Implemented (Phase 1-3)

### Phase 1: API Contract ✅
- [x] POST /api/users/register endpoint defined
- [x] Request schema: { email, password, name? }
- [x] Response schema: { id, email, name?, createdAt }
- [x] Error codes defined: 400, 409, 422, 500
- [x] Rate limiting rule: 5 req/hour per IP

### Phase 2: Tests ✅
- [x] 12 integration tests written
- [x] All error cases covered (400, 409, 422)
- [x] Performance tests passing
- [x] Coverage: 94%

### Phase 3: Backend ✅
- [x] Handler: `src/api/handlers/registerHandler.ts`
- [x] Service: `src/services/UserService.ts`
- [x] Database: Users table with email index
- [x] Password hashing: bcrypt cost factor 10
- [x] Error handling: All error codes mapped
- [x] Tests: ALL PASSING (12/12)

---

## ⏳ What Needs Phase 4 (SDK/Client)

### Immediate Tasks

1. **Create AuthService Class** (30 min)
   - Method: `register(email, password, name?): Promise<User>`
   - Error handling: Throw appropriate Error subclasses
   - Tests: Unit tests for AuthService

2. **Implement Type Definitions** (20 min)
   - `User` interface: { id, email, name?, createdAt }
   - Error types: EmailAlreadyUsedError, InvalidEmailError, etc.
   - Validation: client-side input validation

3. **Build Registration Form Component** (1 hour)
   - Input fields: email, password, confirmPassword, name
   - Validation: Match server-side rules (8+ chars, email format)
   - Error display: Show error messages from server
   - Success: Redirect to login or dashboard

4. **Write E2E Tests** (45 min)
   - Happy path: Register with valid data
   - Error case: Duplicate email
   - Error case: Weak password
   - Error case: Invalid email
   - Accessibility: Form properly labeled

---

## 🔑 Key Behaviors

### Successful Registration (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-05-31T10:15:00Z"
}
```
→ Save user ID to session, redirect to dashboard

### Duplicate Email (409)
```json
{
  "error": "Email already registered"
}
```
→ Show error to user, suggest "Forgot Password?"

### Weak Password (422)
```json
{
  "error": "Password too weak"
}
```
→ Show error, provide password strength hints (8+, uppercase, numbers)

### Invalid Email (400)
```json
{
  "error": "Invalid email format"
}
```
→ Show validation error, client-side validation should catch first

---

## 🎯 Design Questions for Phase 4 Team

Before starting implementation:

1. **Session Management**
   - Where to store auth token? (localStorage, sessionStorage, cookie?)
   - Auto-logout after 24 hours?

2. **Validation**
   - Should we validate email/password client-side before sending?
   - Benefit: Faster UX feedback, reduced server load
   - Or trust server-side validation only?

3. **Success Flow**
   - Auto-login after registration, or redirect to login?
   - Show welcome screen or go straight to dashboard?

4. **Error UI**
   - Show error toast notification, inline error, or modal?
   - Should we log errors for analytics?

---

## 📋 Phase 4 Testing Checklist

Before marking E2E complete:
- [ ] Happy path test passing (register → 200)
- [ ] Duplicate email test passing (register → 409)
- [ ] Weak password test passing (register → 422)
- [ ] Invalid email test passing (register → 400)
- [ ] Form validation tests (client-side)
- [ ] Error messages display correctly
- [ ] Success screen shows correct user data
- [ ] Performance acceptable (form submit < 2 sec)
- [ ] Accessibility: Form properly labeled, keyboard navigable

---

## ⚠️ Known Issues

### 🟢 Low Priority

1. **Avatar placeholder**: Currently null, real image upload not implemented
   - Will be implemented in v2.2
   - Workaround: Use default avatar URL for now

2. **Email verification**: Not implemented
   - User can register with any email address
   - Will add verification email in v2.2
   - For now: Works for alpha testing

3. **Password reset**: Skeleton only
   - UI button exists, backend not connected
   - Will be implemented in v2.2

---

## 🚀 Next Phase (Phase 5: E2E/Frontend)

After Phase 4 SDK complete:
1. Build registration form component
2. Add E2E tests for registration flow
3. Integration with auth state management
4. Session persistence

---

## 📞 Questions? Contact

- **Backend Lead**: [name] (registerHandler questions)
- **API Owner**: [name] (endpoint contract questions)
- **QA Lead**: [name] (test results questions)

---

**Sign-Off**
- Backend Lead: ✅ Ready for handoff
- QA: ✅ All tests passing
- Architecture: ✅ Approved for Phase 4
- Date: May 31, 2026 10:30 AM
```

---

### Phase 4: Validation (5 min)

**Step 4.1: Syntax Validation**

```bash
✓ Markdown files compile without errors
✓ Code examples are valid TypeScript
✓ JSON examples are valid JSON
✓ All links are internal references
✓ No broken file references
```

**Step 4.2: Reference Validation**

```bash
✓ contracts/api/UserRegistration/request.json exists
✓ contracts/api/UserRegistration/response.json exists
✓ src/api/handlers/registerHandler.ts exists (lines 12-34 valid)
✓ src/services/UserService.ts exists
✓ src/client/AuthService.ts exists
✓ tests/integration/auth.test.ts exists
✓ playwright/e2e/registration.spec.ts exists
```

**Step 4.3: Cross-Phase Alignment**

```bash
✓ Phase 1 contract fields ⊂ Phase 3 handler response
✓ Phase 3 handler response ⊂ Phase 4 SDK types
✓ Phase 4 SDK types ⊂ Phase 5 E2E tests
✓ Error codes consistent across all phases
✓ No required/optional field mismatches
```

**Step 4.4: Completeness Check**

```bash
✓ All endpoints have documentation
✓ All error codes documented
✓ All examples tested (syntax valid)
✓ No TODO markers remain
✓ All tests reference from contract and implementation
```

---

### Phase 5: Completion (2 min)

**Step 5.1: Create Update Log Entry**

```
📋 DOCS_UPDATE_LOG.md

Entry #42 | May 31, 2026 10:35 AM

CHANGE: Added user registration endpoint
TYPE: FEATURE
SEVERITY: MEDIUM

UPDATED FILES:
- ✅ .docs/API_REFERENCE.md (added POST /api/users/register)
- ✅ .docs/IMPLEMENTATION.md (added handler explanation)
- ✅ .docs/CLIENT_SDK.md (added AuthService.register)
- ✅ SPEC_CHANGELOG.md (new entry for v2.1)
- ✅ IMPLEMENTATION_HANDOFF.md (Phase 4 handoff prepared)

VALIDATION: ✅ PASSED
- Syntax: Valid
- References: All valid
- Alignment: All phases aligned
- Completeness: 100%

MANUAL REVIEW GATE: ❌ NOT NEEDED
- Breaking change: NO
- Security issue: NO
- Architecture change: NO

STATUS: ✅ READY FOR COMMIT

Changes by: genesis-docs-automation (auto-generated)
Commit ready: YES
```

**Step 5.2: Update CURRENT_STATE.md**

```
## Documentation Status

LAST UPDATED: May 31, 2026 10:35 AM

### Up-to-Date Docs ✅
- API_REFERENCE.md: Current (v2.1 with user registration)
- IMPLEMENTATION.md: Current (handler explanation added)
- ARCHITECTURE.md: Current (no changes)
- CLIENT_SDK.md: Current (AuthService.register added)
- SPEC_CHANGELOG.md: Current (v2.1 entry added)

### Handoff Documents ✅
- IMPLEMENTATION_HANDOFF.md: Phase 3→4 complete

### Test Coverage ✅
- Integration: 12/12 passing
- E2E: 4/4 ready

### Next Steps
→ Phase 4: Build registration form component
→ Phase 5: Run E2E tests
```

**Step 5.3: Final Status**

```
✅ DOCS UPDATE COMPLETE

Summary:
  - 5 docs files updated
  - 1 log entry created
  - 3 checklists verified
  - All phases aligned
  - Ready for commit

Time: 35 minutes
Manual review: Not required
Status: READY FOR COMMIT

Next: `/commit-docs` to finalize
```

---

## 🎓 Common Patterns

### Pattern 1: Optional Field Addition

**File Changed**: Phase 1 contract (added optional `description` field)

**Auto-Updates Triggered**:
1. API_REFERENCE.md: Add field to documentation
2. IMPLEMENTATION.md: Note where default value set (if any)
3. CLIENT_SDK.md: Update type definition
4. SPEC_CHANGELOG.md: Add under "Added"
5. IMPLEMENTATION_HANDOFF.md: Note for next phase

### Pattern 2: Error Code Addition

**File Changed**: Phase 1 contract (new error 429: Rate Limit Exceeded)

**Auto-Updates Triggered**:
1. API_REFERENCE.md: Add to error codes table
2. IMPLEMENTATION.md: Note implementation location
3. CLIENT_SDK.md: Add to error type definitions
4. SPEC_CHANGELOG.md: Add under "Added"
5. Tests: Verify Phase 2/5 handle 429

### Pattern 3: Breaking Change

**File Changed**: Phase 1 contract (removed `legacyId` field)

**Auto-Updates Triggered**:
1. 🔴 MANUAL REVIEW GATE (breaking change detected)
2. Generation of migration guide template
3. SPEC_CHANGELOG.md entry in "Deprecated" or "Removed" section
4. IMPLEMENTATION_HANDOFF.md: Special attention to migration

---

**Version**: v2.3 | **Last Updated**: May 31, 2026 | **Status**: ACTIVE
