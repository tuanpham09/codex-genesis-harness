# Test Failure Debug Checklist

**Purpose**: Systematic verification before debugging test failures. Ensures test environment is clean and failure is reproducible.

**Status**: MANDATORY - Complete before starting test failure investigation.

## Environment Verification

- [ ] **Test runs in isolation**:
  - Run only the failing test: `npm test -- test-name.test.js`
  - Not running entire suite (could be interference)
  - Confirm single test failure is reproducible

- [ ] **No environment contamination**:
  - Git status clean (`git status` shows no uncommitted changes)
  - No stale debug code or console.log statements
  - Dependencies up to date (`npm install` recent)
  - Node version correct (check `.nvmrc` or `package.json`)

- [ ] **Test environment isolated**:
  - No other tests running in parallel
  - No file system state from previous tests
  - Database fixtures clean
  - Cache cleared if applicable

## Test Fundamentals

- [ ] **Test is deterministic** (not flaky):
  - Run test 5 times consecutively
  - Fails same way every time
  - If fails inconsistently → switch to flaky-test-investigation.md

- [ ] **Error message is clear**:
  - Full error read (including stack trace)
  - Assertion message understood
  - Expected vs actual values noted

- [ ] **Reproduction steps documented**:
  - Steps to run failing test written down
  - Any preconditions noted
  - Environment variables documented

## Test Code Analysis

- [ ] **Test structure is correct**:
  - Setup (arrange): Test data initialized
  - Execution (act): Function called with test data
  - Assertion (assert): Result verified
  - Teardown: Resources cleaned up

- [ ] **Mocks are properly configured**:
  - All external dependencies mocked
  - Mock return values match expectations
  - Mock call counts/arguments verified
  - Mocks reset between tests

- [ ] **Test data is valid**:
  - Test fixtures exist
  - Data types correct (number, string, array, object)
  - Null/undefined not unexpected
  - Edge cases considered

## Implementation Analysis

- [ ] **Code under test identified**:
  - Exact function/method being tested known
  - File location noted
  - Recent changes reviewed (git blame)

- [ ] **Code logic reviewed**:
  - Function parameters match test call
  - Return type matches assertion
  - No type mismatches
  - Null checks in place

- [ ] **Dependency chain checked**:
  - All imported modules exist
  - No circular dependencies
  - Versions compatible
  - Initialization order correct

## Debug Information Gathering

- [ ] **Error output analyzed**:
  - Stack trace followed to root
  - Line number in error matches code
  - Message matches code (not outdated?)
  - All context (variables, state) logged

- [ ] **Variable values inspected**:
  - Expected value printed
  - Actual value printed
  - Types match
  - Data structure as expected

- [ ] **Scope issues checked**:
  - Variable in correct scope
  - Not undefined when used
  - Reference vs value semantics correct
  - Closure capturing right variables

## Common Issues Ruled Out

- [ ] **Not a typo**:
  - Function name spelled correctly
  - Variable name matches
  - No case sensitivity issues
  - Import path correct

- [ ] **Not an import issue**:
  - Module imported correctly
  - Correct export used (default vs named)
  - Path relative or absolute correct
  - No circular imports

- [ ] **Not a timing issue** (for async):
  - Promises/callbacks not mixed
  - Async/await used correctly
  - Test waits for async operations
  - No race conditions

## Ready to Debug

- [ ] All checks above passed
- [ ] Investigation log created (templates/debug-investigation-log.md)
- [ ] Ready to proceed with playbook:
  - Unit tests → playbooks/unit-test-failures.md
  - Integration tests → playbooks/integration-test-failures.md
  - E2E tests → playbooks/e2e-test-failures.md

---

## Usage

Before investigating test failure:

```bash
# 1. Run test in isolation
npm test -- NameOfTest.test.js

# 2. Complete this checklist
cat .codex/skills/genesis-debug-guide/checklists/test-failure-debug.md

# 3. Select appropriate playbook
# - Unit: playbooks/unit-test-failures.md
# - Integration: playbooks/integration-test-failures.md
# - E2E: playbooks/e2e-test-failures.md

# 4. Create investigation log
# cp templates/debug-investigation-log.md observability/failures/investigation-$(date +%s).md
```

## Notes

- Don't skip environment verification - most failures are environmental
- If test fails intermittently → See flaky-test-investigation.md
- If multiple tests fail → Check test isolation first
- If all tests fail → Check environment/dependencies
