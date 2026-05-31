# Docs Validation Checklist

**Purpose**: Pre-update verification checklist to catch incomplete/broken documentation before processing

**When to Use**: 
- After code changes detected
- Before auto-doc generation
- During manual `/update-docs` invocation

---

## 📋 Pre-Validation: Is Documentation Update Needed?

- [ ] At least one file changed in Phase 1-5 (contract/backend/SDK/test)?
- [ ] Tests passing? (Required for auto-trigger)
- [ ] Changed files are tracked in Git? (No local-only changes)
- [ ] Changes are committed/staged (not just pending)?

**If any unchecked**: Stop here, resolve first, then re-run

---

## 🔍 Phase 1: Contract Change Detection

### If API Contract Changed (contracts/api/*/request.json or response.json)

**Contract Validation**:
- [ ] request.json has valid JSON schema
- [ ] response.json has valid JSON schema  
- [ ] error.json has valid error code map
- [ ] All required fields marked as such
- [ ] Type definitions are precise (string vs enum, number vs range)
- [ ] Examples provided for each request/response type

**Doc Requirements**:
- [ ] API_REFERENCE.md needs update (endpoint details)
- [ ] SPEC_CHANGELOG.md needs entry (what changed)
- [ ] IMPLEMENTATION_HANDOFF.md may need update (if breaking)
- [ ] Examples need code samples in 2+ languages (JS, Python)

**Change Classification**:

Is this a BREAKING change?
- [ ] Removed required field? **YES** → BREAKING
- [ ] Changed field type? (e.g., string → number) **YES** → BREAKING
- [ ] Changed response structure? **YES** → BREAKING
- [ ] Changed endpoint URL? **YES** → BREAKING
- [ ] Changed error codes? **YES** → BREAKING

If ANY yes: **MARK AS BREAKING** (requires manual review gate)

Is this a FEATURE change?
- [ ] Added new optional field? **YES** → FEATURE
- [ ] Added new endpoint? **YES** → FEATURE
- [ ] Made required field optional? **YES** → FEATURE (backward compatible)
- [ ] Added new error code? **YES** → FEATURE

If ANY yes: **MARK AS FEATURE** (auto-update OK, provide migration guide)

Otherwise: **MARK AS BUG_FIX or INTERNAL**

---

## 🔄 Phase 2: Test File Changes

### If Test Files Changed (tests/unit, tests/integration, playwright/e2e)

**Test Validation**:
- [ ] All tests passing (must have 0 failures)
- [ ] Test file has clear description of what's being tested
- [ ] New test cases have proper setup/teardown
- [ ] Mock data matches expected schema
- [ ] No hardcoded IDs or timestamps (use factories)

**Doc Requirements**:
- [ ] If new integration test: Add scenario to IMPLEMENTATION.md
- [ ] If new E2E test: Add user flow to docs
- [ ] SPEC_CHANGELOG.md: Add "Test Coverage" section if new major scenario
- [ ] Update test coverage % in IMPLEMENTATION_HANDOFF.md

**Test Categorization**:
- [ ] Unit tests: Testing individual functions
- [ ] Integration tests: Testing API endpoint + database
- [ ] E2E tests: Testing user flows across UI + API
- [ ] Performance tests: Testing response times
- [ ] Error tests: Testing error handling

---

## 💾 Phase 3: Backend Implementation Changes

### If Backend Files Changed (src/api/handlers, src/services, src/database)

**Code Quality**:
- [ ] Code has docstrings/comments explaining logic
- [ ] Error handling is explicit (no silent failures)
- [ ] Database queries are indexed (if new queries)
- [ ] Performance is acceptable (check test results for timing)
- [ ] Security implications noted (auth, validation, SQL injection)

**Doc Requirements**:
- [ ] API_REFERENCE.md: Updated if endpoint changed
- [ ] IMPLEMENTATION.md: Added key code locations
- [ ] ARCHITECTURE.md: Updated if data flow changed
- [ ] SPEC_CHANGELOG.md: Entry with implementation notes
- [ ] IMPLEMENTATION_HANDOFF.md: Updated with next steps
- [ ] Docstrings: Added/updated for public methods

**Implementation Category**:
- [ ] New handler: Needs full API docs + implementation guide
- [ ] Modified handler: Needs updated API docs + changelog
- [ ] New service: Needs architecture docs + implementation guide
- [ ] Modified service: Needs updated architecture docs
- [ ] Database change: Needs migration guide + schema docs
- [ ] Error handling: Needs error code documentation

---

## 📱 Phase 4: SDK/Client Changes

### If SDK Files Changed (src/client/*, src/types/*)

**Type Validation**:
- [ ] All TypeScript types compile without errors
- [ ] Type definitions match backend schema (Phase 3)
- [ ] No `any` types without justification
- [ ] Generic types properly constrained
- [ ] Deprecation warnings added for old methods

**Doc Requirements**:
- [ ] API Reference: Updated with new methods
- [ ] Type definitions documented with examples
- [ ] SPEC_CHANGELOG.md: Entry with SDK changes
- [ ] IMPLEMENTATION_HANDOFF.md: Updated with next phase steps
- [ ] Migration guide: Provided if breaking change
- [ ] Code examples: Added in docs for new methods

**SDK Change Type**:
- [ ] New method: Needs documentation + example
- [ ] Modified method: Needs updated documentation
- [ ] Deprecated method: Needs migration guide
- [ ] New type: Needs type reference documentation
- [ ] Type change: Breaking change, needs migration guide

---

## 🎯 Phase 5: E2E Test Changes

### If E2E Test Files Changed (playwright/e2e/*.spec.ts)

**Test Scenario Validation**:
- [ ] Each scenario tests a complete user flow
- [ ] Scenarios are independent (no test ordering)
- [ ] Assertions match expected behavior
- [ ] Error scenarios included (not just happy path)
- [ ] Page objects used (not hardcoded selectors)

**Doc Requirements**:
- [ ] User flows documented in IMPLEMENTATION.md
- [ ] Scenario names match documentation
- [ ] SPEC_CHANGELOG.md: New scenarios noted
- [ ] IMPLEMENTATION_HANDOFF.md: Test coverage updated
- [ ] Examples provided for each scenario

**Scenario Classification**:
- [ ] Happy path: Normal user flow
- [ ] Error case: User makes mistake
- [ ] Edge case: Unusual but valid scenario
- [ ] Regression: Previous bug that came back
- [ ] Performance: Testing under load

---

## ✅ Cross-Phase Consistency Check

### Contract ↔ Implementation Alignment

- [ ] Phase 1 endpoint in API contract → Phase 3 handler exists?
- [ ] Phase 1 request schema → Phase 3 validation matches?
- [ ] Phase 1 response schema → Phase 3 handler response matches?
- [ ] Phase 1 error codes → Phase 3 error handling matches?
- [ ] Phase 1 response fields → Phase 2 test mocks match?

**If misaligned**: 🔴 STOP - Document conflict in DOCS_UPDATE_LOG.md

### Implementation ↔ SDK Alignment

- [ ] Phase 3 API response → Phase 4 type definitions match?
- [ ] Phase 3 error codes → Phase 4 error handling matches?
- [ ] Phase 3 data flow → Phase 4 client flow matches?
- [ ] New Phase 3 fields → Phase 4 types include them?

**If misaligned**: 🔴 STOP - Document conflict in DOCS_UPDATE_LOG.md

### SDK ↔ E2E Alignment

- [ ] Phase 4 SDK methods → Phase 5 E2E tests use them?
- [ ] Phase 4 type definitions → Phase 5 test data matches?
- [ ] Phase 4 error handling → Phase 5 error scenarios match?

**If misaligned**: 🔴 STOP - Document conflict in DOCS_UPDATE_LOG.md

---

## 🚨 Manual Review Decision Gate

If ANY of these apply, require manual review (don't auto-proceed):

### 🔴 ALWAYS MANUAL (Critical)

- [ ] **BREAKING change** detected (field removed, type changed, etc.)
- [ ] **Phase misalignment** detected (contract ≠ implementation)
- [ ] **Security change** (auth, validation, encryption related)
- [ ] **Database schema change** (new table, column removal)
- [ ] **Error code change** (new error, changed error behavior)
- [ ] **Performance regression** (response time increased >10%)
- [ ] **Deprecated endpoint** without migration guide

### 🟡 MANUAL RECOMMENDED (High Value)

- [ ] **New public API** (new endpoint or public method)
- [ ] **Architecture change** (new service, new module, data flow change)
- [ ] **Significant refactoring** (>50 lines changed in critical path)
- [ ] **Third-party library update** (new dependency or major version bump)
- [ ] **Cross-phase impact** (changes affect multiple phases)

### 🟢 AUTO OK (Standard)

- [ ] Feature addition (new optional field, new optional method)
- [ ] Bug fix (behavior corrected, backward compatible)
- [ ] Test addition (new test cases for existing features)
- [ ] Documentation update (comments, examples, guides)
- [ ] Internal refactoring (no behavior change, single module)

---

## 📝 Docs Completeness Checklist

### If Documentation Update Flagged, Verify:

**API Documentation**:
- [ ] All endpoints documented (GET, POST, PUT, DELETE)
- [ ] Request parameters documented (required, optional, types)
- [ ] Response schema documented with example JSON
- [ ] Error codes documented (code, message, cause, resolution)
- [ ] Code examples in 2+ languages (JavaScript, Python)
- [ ] Rate limits noted (if applicable)
- [ ] Authentication requirements noted

**Implementation Documentation**:
- [ ] File locations referenced (src/api/handlers/xxx.ts, etc.)
- [ ] Line numbers accurate (spot-check a few)
- [ ] Docstring examples compile/run
- [ ] Error handling strategy explained
- [ ] Performance characteristics noted (if critical path)
- [ ] Security implications noted (if applicable)
- [ ] Design decisions explained (why this approach?)

**Architecture Documentation**:
- [ ] Data flow diagram updated (if applicable)
- [ ] Service interactions documented
- [ ] Cache strategy documented (if added)
- [ ] External API dependencies noted
- [ ] Scalability considerations noted
- [ ] Failure scenarios documented

**Changelog Documentation**:
- [ ] Change type correct (BREAKING, FEATURE, BUG_FIX)
- [ ] Change severity matches impact
- [ ] Migration guide provided for breaking changes
- [ ] Timeline clear for deprecations
- [ ] Examples provided for new features
- [ ] Related resources linked (API ref, implementation guide)

**Handoff Documentation**:
- [ ] Phase completion status clear (✅ what's done)
- [ ] Testing checklist provided for next phase
- [ ] Known issues documented (severity, workarounds)
- [ ] Next steps clear (what Phase 4 needs to do)
- [ ] Open questions documented
- [ ] Contact info for questions

---

## 🎯 Final Sign-Off Checklist

Before marking docs update COMPLETE:

**Syntax Validation**:
- [ ] All markdown files compile without errors
- [ ] All code blocks properly syntax-highlighted
- [ ] All links internally valid (cross-references work)
- [ ] No broken image references
- [ ] Frontmatter (if used) valid YAML/JSON

**Content Validation**:
- [ ] No TODO markers remain (🚫 "TODO: document this")
- [ ] No placeholder text ("Placeholder for API docs")
- [ ] All examples tested (code runs without errors)
- [ ] All file paths exist (spot-check a few)
- [ ] All line numbers accurate (spot-check a few)

**Consistency Validation**:
- [ ] Terminology consistent (API vs Backend, User vs Account)
- [ ] Formatting consistent (markdown headers, code blocks)
- [ ] Tone consistent (technical, not marketing)
- [ ] All promises kept (referenced features exist)

**Phase Alignment**:
- [ ] Phase 1 contract ⊂ Phase 3 implementation ✓
- [ ] Phase 3 response ⊂ Phase 4 types ✓
- [ ] Phase 4 types ⊂ Phase 5 tests ✓
- [ ] All layers agree on field names, types ✓

**Update Complete**: ✅ Ready for commit

---

## 📊 Validation Results Template

```
DOCS VALIDATION REPORT
Generated: [timestamp]
Change: [brief description]

CONTRACT CHANGES: [0-N]
- [endpoint/field] - [change type]

TEST CHANGES: [0-N] 
- [test name] - [scenario]

BACKEND CHANGES: [0-N]
- [file] - [type of change]

SDK CHANGES: [0-N]
- [method/type] - [change type]

E2E CHANGES: [0-N]
- [scenario] - [user flow]

PHASE ALIGNMENT: ✅ All phases aligned
MANUAL REVIEW GATE: ⚠️ BREAKING CHANGE - Manual review required

DOCS GENERATED:
- ✅ API_REFERENCE.md updated
- ✅ IMPLEMENTATION.md updated
- ✅ ARCHITECTURE.md updated
- ✅ SPEC_CHANGELOG.md entry added
- ⚠️ IMPLEMENTATION_HANDOFF.md incomplete (flagged for manual review)

STATUS: ⚠️ CONDITIONAL COMPLETE
- Auto-update: ✅ DONE
- Manual review: ⏳ REQUIRED (breaking change gate)
- Ready for commit: ❌ NO (awaiting manual approval)
```

---

**Last Updated**: May 31, 2026 | **Status**: ACTIVE
