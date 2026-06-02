# Unit Test Failures - Debugging Playbook

**Purpose**: Systematic approach to debugging unit test failures. Unit tests are isolated and deterministic, so failures are usually in test setup, mocks, or implementation logic.

**Trigger**: When a unit test fails consistently

**Duration**: 5-15 minutes typically

---

## Step 1: Isolate the Failure (2-3 min)

```bash
# Run ONLY the failing test
npm test -- path/to/test.test.js

# Verify it fails every time
npm test -- path/to/test.test.js
npm test -- path/to/test.test.js
```

**Check**:
- ✅ Fails same way every run? → Deterministic, proceed
- ❌ Fails sometimes? → See flaky-test-investigation.md
- ❌ Passes on retry? → Environment issue, check dependencies

---

## Step 2: Understand the Failure (2-3 min)

Read the error message **completely**:

```
FAIL src/utils/__tests__/parseDate.test.js
  parseDate()
    ✓ should parse valid ISO date
    ✗ should return null for invalid date
      Expected: null
      Received: "Invalid Date"
      at Object.<anonymous> (src/utils/__tests__/parseDate.test.js:15:5)
```

**Extract**:
- Test name: "should return null for invalid date"
- Expected: `null`
- Received: `"Invalid Date"` (string, not null!)
- File & line: `parseDate.test.js:15`

---

## Step 3: Review Test Code (3-4 min)

Open the test file and find the failing test:

```javascript
// parseDate.test.js line 15
test('should return null for invalid date', () => {
  const result = parseDate('not-a-date');
  expect(result).toBe(null);  // ← Expectation at line 15
});
```

**Questions**:
- [ ] Is test setup correct? (line 1-5)
- [ ] Are mocks configured properly? (if any)
- [ ] Is the assertion testing the right thing?
- [ ] Could test data be wrong?

---

## Step 4: Review Implementation (3-4 min)

Find the function being tested:

```javascript
// parseDate.js
export function parseDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';  // ← BUG! Should return null
  }
  return date;
}
```

**Questions**:
- [ ] Does function return correct type? (null vs "Invalid Date")
- [ ] Does logic match test expectations?
- [ ] Are there other callers expecting different behavior?
- [ ] Any recent changes to this function? (git blame)

---

## Step 5: Fix the Bug (1-2 min)

**Option A: Fix is in implementation**
```javascript
// WRONG: returns string
return 'Invalid Date';

// CORRECT: returns null
return null;
```

**Option B: Fix is in test**
```javascript
// If implementation is correct, test is wrong
expect(result).toBe('Invalid Date');  // Update test
```

**Option C: Fix is in mock setup**
```javascript
// Mock not configured correctly
const mockFetch = jest.fn().mockResolvedValue({ ok: true });
```

**Rule**: Fix only ONE thing per fix. Don't refactor while fixing.

---

## Step 6: Verify Fix (1-2 min)

```bash
# Run failing test - should now PASS
npm test -- path/to/test.test.js

# Run full test suite - all should PASS
npm test

# Check: no new failures
# Check: no debug code left (console.log, debugger)
```

---

## Step 7: Add Prevention (2-3 min)

**Similar bugs to prevent**:
- [ ] Add test for related edge cases
- [ ] Add test for null/undefined inputs
- [ ] Add test for wrong type inputs
- [ ] Add test for boundary values

```javascript
test('should handle null input', () => {
  expect(parseDate(null)).toBe(null);
});

test('should handle undefined input', () => {
  expect(parseDate(undefined)).toBe(null);
});

test('should handle empty string', () => {
  expect(parseDate('')).toBe(null);
});
```

---

## Common Unit Test Issues

### 1. Mock Not Configured
```javascript
// ❌ WRONG: mock returns undefined
const mock = jest.fn();

// ✅ CORRECT: mock returns expected value
const mock = jest.fn().mockReturnValue({ id: 1, name: 'Test' });
```

### 2. Wrong Import
```javascript
// ❌ WRONG: importing test mock
import parseDate from './parseDate.mock.js';

// ✅ CORRECT: importing actual implementation
import { parseDate } from './parseDate.js';
```

### 3. Test Data Type Mismatch
```javascript
// ❌ WRONG: passing wrong type
parseDate(123456);  // Passing number, expects string

// ✅ CORRECT: passing correct type
parseDate('2024-01-01');  // Passing string
```

### 4. Shared State Between Tests
```javascript
// ❌ WRONG: variable shared across tests
let counter = 0;
test('test 1', () => { counter++; });
test('test 2', () => { expect(counter).toBe(1); });  // Fails if test 1 ran first!

// ✅ CORRECT: each test has isolated state
test('test 1', () => { const counter = 0; counter++; });
test('test 2', () => { const counter = 0; expect(counter).toBe(0); });
```

### 5. Async/Promise Not Awaited
```javascript
// ❌ WRONG: not waiting for promise
test('should fetch user', () => {
  fetchUser(1);  // Returns promise, but not awaited
  expect(result).toBe(...);  // Runs before promise resolves!
});

// ✅ CORRECT: await promise or return from test
test('should fetch user', async () => {
  const result = await fetchUser(1);
  expect(result).toBe(...);
});
```

---

## Debugging Strategy by Test Type

### Simple Unit (pure function)
1. Check inputs match implementation
2. Check return type
3. Check logic handles edge cases
4. Add edge case tests

### Function with Dependencies
1. Check mocks are configured
2. Check mock is called correctly
3. Check mock return value used
4. Verify mock reset between tests

### Class/Object Method
1. Check class instantiation
2. Check method parameters
3. Check state after method call
4. Check side effects (if any)

---

## Recovery: Still Can't Find Bug?

If stuck for >10 minutes:

1. **Add debug logging**:
   ```javascript
   test('test name', () => {
     console.log('Input:', input);
     const result = parseDate(input);
     console.log('Result:', result);
     console.log('Expected:', expectedValue);
     expect(result).toBe(expectedValue);
   });
   ```

2. **Simplify test**:
   ```javascript
   // Remove test setup, use hardcoded values
   test('test name', () => {
     const result = parseDate('2024-01-01');
     expect(result).toEqual({ year: 2024, month: 1, day: 1 });
   });
   ```

3. **Check git history**:
   ```bash
   git log -p -- path/to/test.js
   git log -p -- path/to/implementation.js
   ```

4. **Run with debugging**:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand path/to/test.js
   # Opens Chrome DevTools for debugging
   ```

---

## Checklist: Ready to Complete

- [ ] Test fails in isolation
- [ ] Error message understood
- [ ] Test code reviewed
- [ ] Implementation reviewed
- [ ] Bug fixed (one thing only)
- [ ] Test passes
- [ ] Full suite passes
- [ ] No debug code left
- [ ] Edge case tests added
- [ ] Ready to commit
