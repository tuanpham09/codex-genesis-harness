# Bug Fix Q&A Checklist

**Purpose**: Structured questionnaire to understand and document bug fixes before planning /fix-bug.

**Status**: MANDATORY - Complete before creating implementation plan.

## Bug Identification & Reproduction

- [ ] **Bug clearly described**:
  - What is the incorrect behavior?
  - What should happen instead?
  - Step-by-step repro steps documented

- [ ] **Reproducibility confirmed**:
  - Consistently reproducible?
  - Specific conditions/environment needed?
  - Affects all users or specific scenarios?

- [ ] **Severity & Priority assessed**:
  - Critical (blocks core functionality)?
  - High (significant impact, workaround exists)?
  - Medium (inconvenience, non-blocking)?
  - Low (cosmetic, nice-to-fix)?

- [ ] **Affected Versions identified**:
  - When was this introduced?
  - Which versions affected?
  - Latest stable version affected?

## Root Cause Analysis

- [ ] **Root cause identified** (or hypothesis if unknown):
  - Specific code location/module?
  - Logic error or incorrect assumption?
  - Missing validation or error handling?
  - Race condition or state issue?
  - Integration bug with external service?

- [ ] **Why was it missed**:
  - Was there a test that should have caught this?
  - Missing test coverage?
  - Environment-specific (dev vs. production)?

- [ ] **Affected systems mapped**:
  - Single module or cross-module issue?
  - API side or client side?
  - Database or state management?
  - Performance or correctness?

## Impact Assessment

- [ ] **Data Integrity concerns**:
  - Has data been corrupted or lost?
  - Rollback/recovery strategy needed?
  - Data migration required after fix?

- [ ] **User Impact**:
  - How many users affected?
  - What functionality is broken?
  - Workaround available in the meantime?

- [ ] **Breaking Change Risk**:
  - Does the fix change public API behavior?
  - Will this break existing clients?
  - Backward compatibility needed?

## Fix Strategy

- [ ] **Fix approach decided**:
  - Minimal change to fix only the bug?
  - Or refactor to prevent similar bugs?
  - Tradeoffs understood?

- [ ] **Side Effects considered**:
  - What other code paths use this?
  - Could this fix introduce new bugs?
  - Dependencies to check?

- [ ] **Regression Prevention**:
  - What test catches this bug?
  - Test added before or after fix?
  - Similar patterns to look for?

## Testing & Verification

- [ ] **Test Case for Bug**:
  - Failing test created before fix?
  - Test reproduces the exact bug?
  - Test passes after fix?

- [ ] **Regression Tests**:
  - Existing tests still pass?
  - Edge cases covered?
  - Similar bugs tested in other areas?

- [ ] **Verification Plan**:
  - How will we verify fix in production?
  - Monitoring/alerts to confirm success?
  - Rollback plan if fix causes issues?

## Deployment & Release

- [ ] **Hotfix or Regular Release**:
  - Needs immediate hotfix deployment?
  - Can wait for next regular release?
  - Affects which release branches?

- [ ] **Release Notes**:
  - What message for end users?
  - Migration steps if needed?
  - Workaround guidance during transition?

- [ ] **Rollout Strategy**:
  - Staged rollout or immediate?
  - Feature flags needed?
  - Canary deployment approach?

## Documentation Updates

- [ ] **Docs need updating**:
  - Behavior changed in docs?
  - Workaround documented?
  - Migration guide needed?

- [ ] **Release Notes written**:
  - User-friendly description
  - Workaround mentioned if applicable
  - Any breaking changes noted

## Lesson Learned

- [ ] **How to prevent this in future**:
  - Better test coverage?
  - Code review checklist item?
  - Documentation gap?
  - Process improvement?

- [ ] **Similar bugs searched**:
  - Pattern scan for similar issues in codebase?
  - Found and fixed other instances?

---

## Usage

Use this checklist **before** calling `/fix-bug`:

```
1. Read and reproduce the bug
2. Complete this checklist thoroughly
3. Add bug details to implementation plan
4. Create failing test first
5. Fix with minimal change
6. Verify all tests pass
7. Document lesson learned
```

## Known Information About Bug

- **Bug ID/Ticket**: _reference_
- **Reported By**: _name_
- **Date Reported**: _YYYY-MM-DD_
- **Current Status**: _New / Assigned / In Progress_

---

**Checklist Completed**: ☐  
**Date**: _YYYY-MM-DD_  
**Assigned To**: _Name_
