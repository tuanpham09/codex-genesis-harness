---
name: genesis-docs-automation
description: "Automatically synchronize documentation with code changes across all project phases. Detects file changes, categorizes update types, auto-generates API docs, changelog entries, implementation handoffs, and validates cross-reference integrity. Use after any phase implementation."
---
---

# Genesis Docs Automation Skill

## Purpose

Automatically synchronize documentation with code changes across all project phases. Detects changed files, categorizes update types, auto-generates API reference docs, changelog entries, implementation handoffs, and validates cross-phase reference integrity. Eliminates 30-60 min manual doc sync per phase.

## When to use

- After any phase implementation (backend, SDK, tests, contracts)
- When API contracts change and docs need updating
- After `/spec-change` or `/contract-update` completes
- When running `/update-docs` or `/validate-alignment` manually
- Before release to verify documentation is current

## When NOT to use

- For documentation-only changes with no code impact
- For formatting/typo fixes that don't affect technical content
- When no implementation files changed in the last commit

## Inputs required

- List of changed files (from git diff or test run output)
- Current API contract files (`contracts/api/*/`)
- Current `.codebase/` memory files
- Phase context (which phase just completed)

## Outputs required

- Updated `.docs/API_REFERENCE.md` (if API contracts changed)
- Updated `SPEC_CHANGELOG.md` entry for all changes
- Updated `IMPLEMENTATION_HANDOFF.md` for phase handoffs
- `DOCS_UPDATE_LOG.md` entry with timestamp and change summary
- Validation report (cross-reference checks, completeness gates)

## Required tests

- Contract validation tests confirming docs match implementation
- Cross-reference link validation (no broken links)
- Changelog completeness check (all changes have entries)
- Migration guide presence check (for all breaking changes)

## Required fixtures

- Sample `DOCS_UPDATE_LOG.md` entry showing format
- Sample `SPEC_CHANGELOG.md` entry showing breaking change format
- `fixtures/docs/` directory with doc update expected outputs

## Required contract updates

- Update `contracts/api/*/` when API docs regenerated
- Update `.codebase/API_CONTRACTS.md` with new/changed endpoints
- Update `.codebase/CURRENT_STATE.md` docs sync status

## Required codebase map updates

- `.codebase/CURRENT_STATE.md`: Note docs sync completion
- `.codebase/KNOWN_PROBLEMS.md`: Document any doc drift found
- `.codebase/EVOLUTION_PLAN.md`: Update docs automation roadmap

## Token saving rules

- Read `.codebase/` summaries before opening full skill files
- Report only changed sections, not full document content
- Link to existing docs instead of duplicating content
- Cache phase dependency map across operations in same session
- Use before/after diffs when showing doc changes

## Acceptance criteria

- All changed API endpoints documented with schemas and examples
- All breaking changes have migration guides
- No broken cross-references in any doc file
- SPEC_CHANGELOG.md has entry for every change
- DOCS_UPDATE_LOG.md records what was updated and when
- Validation gate passes (no TODO markers, no stale links)

## Common mistakes

- Updating docs without running cross-reference validation
- Skipping migration guides for breaking changes
- Leaving emoji headers (`## 🎯`) instead of standard `## Section` format
- Auto-updating circular references (creates inconsistency)
- Forgetting to update `.codebase/API_CONTRACTS.md` after API changes

## Recovery workflow

If docs automation fails or produces incorrect output:
1. Check DOCS_UPDATE_LOG.md for the last successful update
2. Identify which files were incorrectly updated
3. Revert only the doc files (not implementation): `git checkout -- docs/`
4. Re-run `/validate-alignment` to identify remaining gaps
5. Manually fix specific files the automation could not handle
6. Add edge case to observability/docs-tracking.md for future automation

---

## 🎯 Skill Overview

The **genesis-docs-automation** skill automatically synchronizes documentation with code changes, preventing documentation drift and maintaining single source of truth across API specs, implementation guides, and architectural records.

### Problem Statement

In multi-phase development (phases 1-5), documentation becomes outdated quickly:
- API changes in Phase 3 not reflected in Phase 4/5 docs (3-5 hours discovery lag)
- SPEC_CHANGELOG.md entries forgotten or inconsistent (30-60 min per change)
- IMPLEMENTATION_HANDOFF.md incomplete or missing context (2-3 hours per handoff)
- Architecture docs diverge from actual implementation (discovered at Phase 5 integration)
- Cross-reference links broken after major refactoring (1-2 hours debugging)

**Impact**: Teams waste 30-60 minutes per phase on manual doc sync, docs become unreliable, and onboarding new team members is delayed by outdated guides.

### Solution

Automatically:
1. **Detect** which files changed during test phase
2. **Analyze** file types to identify doc updates needed
3. **Generate** updated API docs, changelog entries, implementation handoffs
4. **Validate** cross-references, formatting, completeness
5. **Gate** pre-commit until docs are valid

**Time Savings**: 30-60 min per phase → 5 min (auto-detection + validation)

---

## 📋 Workflow Overview

```
Phase 1: Change Detection (5 min)
├── Find all changed files from test run
├── Categorize by type (API contract, backend handler, SDK, E2E test, config)
└── Map to doc update types

Phase 2: Doc Type Analysis (10 min)
├── For API contract changes:
│   ├── Extract endpoint changes, parameter changes, response changes
│   └── Mark for API docs update
├── For backend handler changes:
│   ├── Extract implementation details, error handling, side effects
│   └── Mark for architecture docs + changelog update
├── For SDK changes:
│   ├── Extract new methods, type changes, deprecations
│   └── Mark for client SDK docs + migration guide
└── For all changes:
    ├── Compile change summary
    └── Mark for SPEC_CHANGELOG.md + IMPLEMENTATION_HANDOFF.md

Phase 3: Auto-Update Documents (15-20 min)
├── API Documentation:
│   ├── Extract from Phase 1 API contract
│   ├── Generate endpoint documentation
│   ├── Generate parameter/response documentation
│   └── Update .docs/API_REFERENCE.md
├── Architecture Documentation:
│   ├── Extract from Phase 3 backend code
│   ├── Update system design docs with flow changes
│   └── Update .docs/ARCHITECTURE.md
├── Implementation Guide:
│   ├── Extract code comments and docstrings
│   ├── Generate implementation walkthrough
│   └── Update .docs/IMPLEMENTATION.md
├── Specification Changelog:
│   ├── Determine change type (BREAKING, FEATURE, BUG_FIX, DOCS)
│   ├── Generate changelog entry with migration guide
│   ├── Link to relevant code/tests
│   └── Append to SPEC_CHANGELOG.md
└── Implementation Handoff:
    ├── Extract phase completion status
    ├── Compile known issues, next steps, risks
    ├── Generate developer notes
    └── Create/update IMPLEMENTATION_HANDOFF.md

Phase 4: Validation (5 min)
├── Syntax Validation:
│   ├── Check markdown formatting
│   ├── Verify code block syntax
│   └── Validate frontmatter (if used)
├── Reference Validation:
│   ├── Check all internal links exist
│   ├── Verify all type references resolve
│   └── Validate all code examples compile/type-check
├── Completeness Check:
│   ├── Ensure all changed endpoints documented
│   ├── Ensure all deprecations have migration guide
│   ├── Ensure no TODO markers remain
│   └── Verify change severity matches changelog
├── Consistency Check:
│   ├── API contracts match implementation
│   ├── Type definitions consistent across phases
│   ├── Error codes documented
│   └── Security implications noted
└── Cross-Phase Alignment:
    ├── Phase 1 API contract ⊂ Phase 3 backend ⊂ Phase 4 SDK
    ├── Phase 2 test data ⊂ Phase 4 SDK validation
    └── Phase 5 E2E scenarios ⊂ Phase 1 API contract

Phase 5: Completion (2 min)
├── Create DOCS_UPDATE_LOG.md entry
├── Gate breaking changes for manual review
├── Flag incomplete docs for manual follow-up
├── Update CURRENT_STATE.md with docs status
└── Return ready-for-commit status or manual review request
```

---

## 🚀 Auto-Trigger Rules

**Activated When**: Tests pass successfully (PostToolUse Hook #6)

**Triggers For**:
- Any change to files in Phase 1-5 (contract, backend, SDK, tests)
- Manual `/update-docs` command
- Manual `/validate-alignment` command

**NOT Triggered For**:
- Test files only (unless tests reveal new scenarios)
- Minor formatting changes (unless docs also affected)
- Comments-only changes (unless docs reference those comments)

**Safety Gates**:
- Breaking changes require manual review gate
- Missing docs flag for manual follow-up (non-blocking)
- Cross-phase misalignment blocks pre-commit validation

---

## 📝 Change Detection Logic

### File Type Classification

```
CONTRACT FILES (Phase 1):
├── contracts/api/*/request.json
│   └── Trigger: API docs update + parameter docs
├── contracts/api/*/response.json
│   └── Trigger: API docs update + response schema docs
├── contracts/api/*/error.json
│   └── Trigger: Error handling docs + changelog
└── contracts/agents/*/schema.json
    └── Trigger: Agent docs + capability docs

BACKEND FILES (Phase 3):
├── src/api/handlers/*.ts
│   └── Trigger: API docs update + implementation guide
├── src/database/schema.ts
│   └── Trigger: Database docs + migration guide
├── src/services/*.ts
│   └── Trigger: Service docs + architecture update
└── src/errors/ErrorCatalog.ts
    └── Trigger: Error handling docs

SDK FILES (Phase 4):
├── src/client/*.ts
│   └── Trigger: SDK docs + API reference + client guide
├── src/types/*.ts
│   └── Trigger: Type reference docs
└── src/serialization/*.ts
    └── Trigger: Type conversion docs + migration guide

TEST FILES (Phase 2, 5):
├── tests/unit/*.test.ts
│   └── Trigger: CHANGELOG.md (test coverage section)
├── tests/integration/*.test.ts
│   └── Trigger: Integration examples docs
└── playwright/e2e/*.spec.ts
    └── Trigger: User flow docs + examples

CONFIG FILES:
├── .env.example
│   └── Trigger: Setup docs + environment variable reference
├── package.json
│   └── Trigger: Dependencies docs (if version changes)
└── tsconfig.json
    └── Trigger: Development setup docs
```

### Change Severity Classification

```
BREAKING (High Impact):
├── Removed API endpoint
├── Changed parameter type (e.g., string → number)
├── Changed response structure
├── Removed database field
├── Removed export/public method
└── Changed error code behavior

FEATURE (Medium Impact):
├── New optional parameter
├── New optional response field
├── New endpoint
├── New method
├── New database field (optional)
└── New error code

BUG_FIX (Low Impact):
├── Fixed response structure (matches contract)
├── Fixed error handling (still backward compatible)
├── Fixed validation logic
├── Fixed performance issue
└── Updated error message (not error code)

DOCS (Documentation Only):
├── Updated comments/docstrings
├── Updated examples
├── Updated type hints
├── Improved error messages
└── Clarified behavior

INTERNAL (No Impact):
├── Refactored implementation (no behavior change)
├── Updated tests without API change
├── Updated dependencies (patch/minor)
└── Formatting/style changes
```

---

## 🔄 Auto-Update Phase Handlers

### 1. API Documentation Handler

**Input**: Changes to Phase 1 API contracts
**Output**: Updated `.docs/API_REFERENCE.md`

```markdown
## AUTOMATICALLY GENERATED SECTION

For each changed endpoint:

### POST /api/users/register (NEW)

**Description**: Register a new user account

**Parameters**:
- `email` (string, required): User email address
- `password` (string, required): User password (8+ chars)
- `name` (string, optional): Display name

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2026-05-31T00:00:00Z"
}
```

**Errors**:
- `409`: Email already registered
- `400`: Invalid email format
- `422`: Password too weak

**Example**:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

---

## Note

Auto-generated on: [timestamp]
Last change: [commit hash]
```

### 2. Architecture Documentation Handler

**Input**: Changes to Phase 3 backend code
**Output**: Updated `.docs/ARCHITECTURE.md`

```markdown
## System Flow Changes

For each significant backend change:

### User Registration Flow (UPDATED)

**Previous**: User → API → Database → Return
**Current**: User → API → Validation → Database → Cache invalidation → Return

**Why Changed**: Added cache invalidation to prevent stale user data

**Files Affected**:
- `src/api/handlers/registerHandler.ts`
- `src/services/UserService.ts`
- `src/cache/invalidation.ts`

**Testing**: See `tests/integration/auth.test.ts`
```

### 3. Implementation Guide Handler

**Input**: Changes to Phase 3 code + Phase 2 tests
**Output**: Updated `.docs/IMPLEMENTATION.md`

```markdown
## User Registration Implementation

### Overview

User registration is handled in two phases:
1. Input validation (email, password strength)
2. Database insertion + cache setup

### Key Code Points

**Handler**: `src/api/handlers/registerHandler.ts`
- Lines 12-34: Email validation
- Lines 35-50: Password hashing
- Lines 51-68: Database insertion

**Service**: `src/services/UserService.ts`
- Method `createUser()`: Orchestrates registration
- Handles transactional safety
- Triggers cache invalidation

**Tests**: `tests/integration/auth.test.ts`
- Test case: "should register new user"
- Covers: Valid input, email collision, weak password

### Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| 409 Conflict | Email exists | Suggest password reset |
| 422 Unprocessable | Weak password | Validate: 8+ chars, mixed case, number |
| 500 Server Error | Database down | Retry with exponential backoff |

### Performance Notes

- Email validation: O(1) cache lookup
- Password hashing: ~100ms (bcrypt cost factor 10)
- Database insert: ~10ms avg (indexed on email)
- **Total P95**: ~150ms

### Security Notes

- Passwords hashed with bcrypt (never stored plaintext)
- Email validated format (RFC 5322)
- Rate limiting: 5 attempts per hour per IP
- Logged: Email + timestamp (no password)
```

### 4. Specification Changelog Handler

**Input**: All phase changes
**Output**: Updated `SPEC_CHANGELOG.md`

```markdown
## [UNRELEASED] - 2026-05-31

### Added
- POST /api/users/register endpoint (v2.0)
  - Email validation + password hashing
  - Returns user ID + created timestamp
  - See: [API Reference](API_REFERENCE.md#post-apiusersregister)
  - Tests: tests/integration/auth.test.ts

### Changed
- GET /api/users/{id} now includes `avatarUrl` field (optional)
  - Backward compatible (new field optional)
  - Migration: Update queries to include avatar URL retrieval
  - See: [Migration Guide](#migration-avatarurl)

### Fixed
- User deletion now properly invalidates cache
  - Prevents stale data in subsequent queries
  - Tests: tests/integration/users.test.ts

### Deprecated
- POST /api/auth/register (use /api/users/register instead)
  - Removal planned for v2.2 (6 months)
  - See: [Migration Guide](#migration-auth-endpoint)

---

## Migration Guides

### Migration: New User Registration Endpoint

**When**: v2.0 (now)
**Deadline**: Immediate
**Breaking**: No

**What Changed**:
- Old endpoint: `POST /api/auth/register` (deprecated)
- New endpoint: `POST /api/users/register` (recommended)
- Both work identically now, old endpoint removed in v2.2

**How to Migrate**:
1. Find all calls to `POST /api/auth/register`
2. Change to `POST /api/users/register`
3. No parameter or response changes
4. Deploy at your convenience before v2.2

**Code Example**:
```javascript
// Before
const response = await fetch('/api/auth/register', { ... })

// After
const response = await fetch('/api/users/register', { ... })
```

---

## Release Notes

**v2.0 - May 31, 2026**
- New user registration endpoint
- Cache invalidation on user delete
- 5 new test cases, 12 new integration tests
- Documentation updated

**Known Issues**:
- Avatar URL upload not yet implemented (coming in v2.1)
- Email verification pending (alpha)

**Dependencies Updated**:
- bcrypt: 5.0.0 → 5.1.0 (security patch)
```

### 5. Implementation Handoff Handler

**Input**: Phase completion metrics + test results
**Output**: Updated `IMPLEMENTATION_HANDOFF.md`

```markdown
# Implementation Handoff - User Registration Feature

**Date**: May 31, 2026
**From Phase**: 3 (Backend) → 4 (SDK/Client)
**Status**: ✅ Ready for handoff

---

## What Was Implemented

### Phase 1: API Contract
- ✅ Defined endpoints: POST /api/users/register, GET /api/users/{id}
- ✅ Request/response schemas validated
- ✅ Error codes documented
- **Files**: contracts/api/UserRegistration/*

### Phase 2: Tests
- ✅ 12 integration tests written
- ✅ 100% endpoint coverage
- ✅ Error cases covered (email collision, weak password)
- ✅ Performance tests passing (P95 < 150ms)
- **Files**: tests/integration/auth.test.ts
- **Coverage**: 94%

### Phase 3: Backend Implementation
- ✅ Handlers implemented: registerHandler.ts, userHandler.ts
- ✅ Service layer: UserService.ts (business logic)
- ✅ Database schema: users table with email index
- ✅ Error handling: All 5 error types mapped
- ✅ Security: Password hashing, rate limiting, input validation
- **Files**: src/api/handlers/*, src/services/UserService.ts
- **Tests Passing**: 12/12

---

## Key Decisions & Rationale

### 1. Password Hashing Strategy
- **Decision**: bcrypt with cost factor 10
- **Why**: Industry standard, resistant to GPU attacks
- **Trade-off**: ~100ms per registration (acceptable for auth)

### 2. Email Validation
- **Decision**: Format validation only (no confirmation email)
- **Why**: Reduces friction for alpha, can add confirmation later
- **Risk**: Invalid email addresses possible, mitigated by recovery email flow

### 3. Cache Invalidation
- **Decision**: Immediate invalidation on user creation/update
- **Why**: Prevents serving stale user data
- **Performance**: ~5ms additional latency (negligible)

---

## Known Issues & Limitations

### 🟡 Medium Priority
1. **Avatar URL placeholder**: Currently hardcoded, needs real image upload (Phase 4 task)
2. **Email verification**: Not implemented, planned for v2.1
3. **Password reset**: Skeleton only, not functional

### 🟢 Low Priority
1. **Rate limiting**: Uses in-memory counter (fine for single server, needs Redis for distributed)
2. **Audit logging**: Minimal, could be enhanced with structured logging

---

## What Phase 4 (SDK/Client) Needs to Know

### Type Definitions
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;        // Not populated yet
  createdAt: Date;
}

interface RegisterRequest {
  email: string;             // Required
  password: string;          // Required, 8+ chars
  name?: string;             // Optional
}

interface RegisterResponse {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}
```

### API Behavior Notes
- Registration is idempotent only if error: same email always returns 409
- Password strength: 8+ chars required (enforced server-side, client should validate)
- Response times: P50=20ms, P95=150ms (not P99 for rare slow DB queries)

### Error Handling
| Code | Message | Client Action |
|------|---------|---------------|
| 400 | Invalid email format | Show validation error |
| 409 | Email already registered | Suggest password reset flow |
| 422 | Password too weak | Suggest stronger password |
| 500 | Internal server error | Show retry prompt |

### Integration Points
- **Auth Flow**: registerHandler.ts → UserService.ts → database
- **Cache**: User data cached for 1 hour (or until invalidation)
- **Events**: No webhook on registration (future feature)

---

## Testing Checklist for Phase 4

Before implementing SDK:
- [ ] Call /api/users/register with valid data → 200 with user ID
- [ ] Call /api/users/register with duplicate email → 409
- [ ] Call /api/users/register with weak password → 422
- [ ] Retrieve user via GET /api/users/{id} → correct data
- [ ] Verify response times < 150ms P95
- [ ] Verify error messages are clear

---

## Remaining Work

### For SDK/Client (Phase 4)
1. Create `AuthService` class
2. Implement `register(email, password, name)` method
3. Add input validation (client-side)
4. Add session management
5. Tests: Create unit tests for AuthService + E2E registration flow

### For Future Phases
1. Email verification (v2.1)
2. Avatar upload implementation (v2.1)
3. Social registration (v2.2)
4. Multi-factor authentication (v2.3)

---

## Questions for Phase 4 Team

1. **Session Management**: How should auth tokens be stored (localStorage, cookie)?
2. **Validation**: Should we duplicate server-side validation on client, or trust server?
3. **Error Recovery**: For 409 (email exists), should we auto-suggest password reset?

---

## Sign-Off

- **Backend Lead**: ✅ [name] - All tests passing, ready for handoff
- **QA**: ✅ [name] - Integration tests verified
- **Date**: May 31, 2026
```

---

## 🔐 Validation Gates

### Pre-Commit Validation

```yaml
Validation Suite (Must All Pass):

1. MARKDOWN SYNTAX
   - Valid markdown formatting
   - Code blocks properly fenced
   - Links properly formatted
   - No dangling references

2. CODE REFERENCE VALIDATION
   - All file paths exist
   - All line numbers accurate
   - All type references resolve
   - All API endpoints exist

3. CROSS-PHASE CONSISTENCY
   - Phase 1 API contract ⊂ Phase 3 implementation
   - Phase 2 test data ⊂ Phase 4 SDK expectations
   - Phase 3 response schema ⊂ Phase 4 type definitions
   - Phase 5 scenarios ⊂ Phase 1 contract

4. COMPLETENESS
   - All endpoints have documentation
   - All deprecations have migration guides
   - All error codes documented
   - No TODO markers remain

5. CHANGELOG VERIFICATION
   - Change severity matches impact
   - Migration guide provided for breaking changes
   - Examples provided for new features
   - Timeline clear for deprecations

6. HANDOFF READINESS
   - All tests passing
   - Known issues documented
   - Testing checklist provided
   - Open questions documented
```

### Manual Review Gates

**BREAKING CHANGES** (Always Manual):
- Removing field/endpoint
- Changing type/behavior
- Deprecating feature
- Changing error codes
- Database schema changes

**INCOMPLETE DOCS** (Flag for Review):
- Missing API examples
- Incomplete error handling documentation
- Missing performance notes
- Incomplete type definitions
- Missing test coverage documentation

**ARCHITECTURAL CHANGES** (Always Manual):
- New service/module
- Changed data flow
- New dependency
- Database schema change
- Security-related change

---

## ⚠️ Edge Cases & Recovery

### Edge Case 1: Conflicting Changes in Multiple Phases

**Scenario**: Phase 3 backend AND Phase 4 SDK both changed for same endpoint

**Detection**:
```
Changed files detected:
- src/api/handlers/userHandler.ts (Phase 3)
- src/client/UserClient.ts (Phase 4)

Checking alignment:
- Phase 3 response type: { id, email, name }
- Phase 4 type definition: { id, email }

MISMATCH: Phase 4 missing 'name' field
```

**Resolution**:
1. Flag conflict in DOCS_UPDATE_LOG.md
2. Request manual review (don't proceed with auto-update)
3. Suggest: Update Phase 4 types to include 'name' field
4. Block pre-commit until resolved

### Edge Case 2: Deprecated Endpoint Still Referenced

**Scenario**: Documentation mentions deprecated /api/auth/register without migration guide

**Detection**:
```
Deprecated endpoint found in docs: /api/auth/register
Searching for migration guide... NOT FOUND

Check: Is /api/users/register the replacement?
  YES - Replacement found
  
INCOMPLETE: Migration guide missing
```

**Resolution**:
1. Flag in DOCS_UPDATE_LOG.md
2. Request manual creation of migration guide
3. Block pre-commit until guide added
4. Suggest template from `templates/migration-guide-template.md`

### Edge Case 3: Test Data Doesn't Match New Schema

**Scenario**: Phase 2 tests use old response schema, Phase 3 added new field

**Detection**:
```
Phase 2 test mock (tests/integration/users.test.ts):
  Expected: { id, email }
  
Phase 3 new response schema (contracts/api/GetUser/response.json):
  Actual: { id, email, name }

MISMATCH: Test data outdated
```

**Resolution**:
1. Auto-update test mocks to match new schema
2. Add comment: "Auto-updated on [date] to match Phase 3 schema"
3. Re-run tests to verify
4. Include in DOCS_UPDATE_LOG.md
5. If tests fail, flag for manual review

### Edge Case 4: Circular Documentation References

**Scenario**: Doc A references Doc B, Doc B references Doc A (but one is outdated)

**Detection**:
```
Checking reference chain:
  API_REFERENCE.md → IMPLEMENTATION.md ✓
  IMPLEMENTATION.md → ARCHITECTURE.md ✓
  ARCHITECTURE.md → API_REFERENCE.md ✓
  
Checking freshness:
  API_REFERENCE.md: Updated 2 hours ago ✓
  IMPLEMENTATION.md: Updated 2 hours ago ✓
  ARCHITECTURE.md: Updated 1 day ago ⚠️

STALE: ARCHITECTURE.md not updated with recent changes
```

**Resolution**:
1. Flag for manual review
2. Suggest updating ARCHITECTURE.md
3. Provide context of what changed
4. Don't auto-update circular references (too risky)

---

## 📊 Observability & Tracking

See `observability/docs-tracking.md` for:
- DOCS_UPDATE_LOG.md format
- docs-metrics.csv structure
- Monthly docs health reports
- Query examples for trend analysis

---

## 🎓 Examples

### Example 1: Feature Change (New Optional Field)

**Scenario**: Adding optional `avatarUrl` field to User

**File Changes**:
1. Phase 1: contracts/api/GetUser/response.json
2. Phase 3: src/api/handlers/userHandler.ts
3. Phase 4: src/client/types.ts
4. Phase 5: playwright/e2e/user-profile.spec.ts

**Auto-Generated Docs**:
```markdown
### API Documentation Update
- Added: avatarUrl (optional) to GET /api/users/{id} response
- Example: { id, email, name, avatarUrl }

### Changelog Entry
- Added: User profile now includes optional avatar URL

### Implementation Guide Update
- New service method: getAvatar(userId) for fetching URL
- Image cache invalidated on user update

### IMPLEMENTATION_HANDOFF Update
- Phase 4: Need to implement avatar upload UI

### Validation Result
- ✅ Backward compatible (optional field)
- ✅ All phases aligned
- ✅ Ready for pre-commit
```

### Example 2: Breaking Change (Removed Field)

**Scenario**: Removing deprecated `legacyId` field

**File Changes**:
1. Phase 1: contracts/api/GetUser/response.json
2. Phase 3: src/api/handlers/userHandler.ts
3. Phase 4: src/client/types.ts
4. Phase 5: playwright/e2e/user-profile.spec.ts

**Auto-Generated Docs**:
```markdown
### BREAKING CHANGE DETECTED

### Changelog Entry
- Removed: legacyId field (use id instead)
- Migration deadline: 3 months from v2.1
- See: [Migration Guide](#migration-legacyid)

### Migration Guide (Auto-Generated Template)
- What changed: legacyId removed
- Why: Consolidated ID fields
- How to migrate: Replace legacyId with id
- Timeline: Deprecation warning in v2.0.1, removal in v2.1

### Validation Result
⚠️ BREAKING CHANGE DETECTED
Manual review required before pre-commit
```

---

## 🔗 Dependencies

Works with:
- **genesis-spec-propagation**: Detects spec changes, triggers doc updates
- **genesis-harness-engineering**: Generates test fixtures for docs examples
- **genesis-research**: Provides context for implementation docs
- **genesis-api-contract**: Supplies contract details for API docs
- **genesis-ui-ux-test**: Provides UI flow documentation

---

## 🚀 Quick Start

1. **Read**: This SKILL.md (5 min)
2. **Review**: `checklists/docs-validation.md` (5 min)
3. **Study**: `playbooks/auto-update-flow.md` (10 min)
4. **Test**: Run `/update-docs` on a recent change (5 min)

---

## 📈 Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Manual docs sync time** | 30-60 min/phase | 5 min | 5 min |
| **Docs staleness** | 1-2 days | < 1 hour | < 1 hour |
| **Changelog completeness** | 70% | 98% | 99%+ |
| **Cross-reference accuracy** | 85% | 99% | 99%+ |
| **Breaking change awareness** | 60% | 100% | 100% |
| **Handoff readiness score** | 60/100 | 95/100 | 95+/100 |

---

## 📞 Support & Troubleshooting

### Issue: Docs not updating after code change

**Check**:
1. Did tests pass? (Must pass to trigger docs auto-update)
2. Which files changed? (Must be in contract/backend/SDK/test folders)
3. Run: `/update-docs` manually to force update

**Solution**:
- If tests failed: Fix tests first, then re-run
- If file type not recognized: Check `File Type Classification` section
- If still failing: Check logs in `observability/docs-tracking.md`

### Issue: Manual review gate blocking commit

**Check**:
1. What triggered manual review? (Breaking change? Incomplete docs?)
2. Is this expected? (Breaking changes always need review)

**Solution**:
- For breaking changes: Follow checklist in `checklists/breaking-change-gate.md`
- For incomplete docs: Use template from `templates/` to complete
- For conflicts: Resolve in `observability/docs-tracking.md`

---

**Version**: v2.3 | **Last Updated**: May 31, 2026 | **Status**: ACTIVE
