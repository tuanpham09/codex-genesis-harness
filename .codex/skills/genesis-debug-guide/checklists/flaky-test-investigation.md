# Flaky Test Investigation Checklist

**Purpose**: Systematic debugging for tests that fail intermittently. These are notoriously hard to fix but follow patterns.

**Status**: MANDATORY - Complete before attempting flaky test fix.

## Characteristics: Is It Actually Flaky?

- [ ] **Fails inconsistently**:
  - Run test 10 times: `for i in {1..10}; do npm test -- test.js; done`
  - Fails ~X times out of 10
  - Not always the same assertion fails
  - Not 0% or 100% (if always fails, see test-failure-debug.md)

- [ ] **Failure pattern exists**:
  - Fails more often under load?
  - Fails in CI but not locally?
  - Fails after other tests?
  - Fails at specific time of day?

- [ ] **Previous attempts failed**:
  - Simple retry didn't fix it
  - Disabling parallelization didn't fix it
  - Increasing timeout didn't fix it

---

## Root Cause Pattern Analysis

### Pattern 1: Race Condition (Most Common)
```javascript
// ❌ WRONG: Race condition
test('user updates profile', async () => {
  updateUser({ name: 'New Name' });  // Async, not awaited!
  expect(userName).toBe('New Name');   // Might run before update completes
});

// ✅ CORRECT: Wait for async operation
test('user updates profile', async () => {
  await updateUser({ name: 'New Name' });  // Wait for it
  expect(userName).toBe('New Name');
});
```

**Signs**:
- [ ] Test has async operations
- [ ] Not all async operations awaited
- [ ] Uses `setTimeout` or `setInterval`
- [ ] Fails under high CPU load
- [ ] Fails more in CI (slower machines)

**Fix**:
```javascript
// Add explicit waits
await waitFor(() => expect(element).toBeVisible());

// Use async/await properly
const result = await asyncFunction();

// Don't mix promises with callbacks
// Use either async/await OR .then(), not both
```

### Pattern 2: Test Order Dependency
```javascript
// ❌ WRONG: Tests affect each other
let globalState = 0;
test('first test', () => { globalState = 1; });
test('second test', () => { expect(globalState).toBe(0); });  // Fails if first runs first!

// ✅ CORRECT: Each test is isolated
beforeEach(() => { state = 0; });  // Reset before each test
test('first test', () => { state = 1; });
test('second test', () => { expect(state).toBe(0); });
```

**Signs**:
- [ ] Test passes when run alone
- [ ] Test fails when run with others
- [ ] Test fails when run in random order
- [ ] Global variables used
- [ ] Database not cleaned between tests

**Fix**:
```javascript
beforeEach(() => {
  // Reset all state
  jest.clearAllMocks();
  db.clear();
  localStorage.clear();
});
```

### Pattern 3: Timing Issues
```javascript
// ❌ WRONG: Fixed timeout too short
test('animation completes', async () => {
  await new Promise(r => setTimeout(r, 50));  // Sometimes not enough time
  expect(element.style.opacity).toBe(1);
});

// ✅ CORRECT: Wait for actual condition
test('animation completes', async () => {
  await waitFor(() => expect(element).toHaveStyle('opacity: 1'), { timeout: 5000 });
});
```

**Signs**:
- [ ] Uses `setTimeout` with fixed delays
- [ ] Fails randomly
- [ ] Fails when machine is busy
- [ ] Fails in CI (which is slower)
- [ ] Increasing timeout "fixes" it temporarily

**Fix**:
```javascript
// Instead of sleep:
await new Promise(r => setTimeout(r, 100));

// Use condition-based waiting:
await waitFor(() => expect(element).toBeVisible());
```

### Pattern 4: External Service/Network
```javascript
// ❌ WRONG: Calls actual API
test('fetch user', async () => {
  const user = await fetchRealAPI('/users/1');  // Network unreliable!
  expect(user.name).toBe('John');
});

// ✅ CORRECT: Mock external service
test('fetch user', async () => {
  jest.mock('api', () => ({
    fetch: jest.fn().mockResolvedValue({ name: 'John' })
  }));
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});
```

**Signs**:
- [ ] Test makes network requests
- [ ] Mock not configured properly
- [ ] Network-dependent test
- [ ] Fails in offline environment
- [ ] Fails randomly (network issues)

**Fix**:
```javascript
// Mock all external APIs
jest.mock('node-fetch');
nodeFetch.mockResolvedValue({ json: () => ({ ... }) });
```

### Pattern 5: Randomness/Seeding
```javascript
// ❌ WRONG: Random data without seed
test('shuffle array', () => {
  const result = shuffle([1, 2, 3]);
  expect(result).toEqual([2, 1, 3]);  // Different order each time!
});

// ✅ CORRECT: Seed random for reproducible tests
test('shuffle array', () => {
  Math.seedrandom = () => 0.5;  // Set seed
  const result = shuffle([1, 2, 3]);
  expect(result).toEqual([3, 1, 2]);  // Same every time with same seed
});
```

**Signs**:
- [ ] Test uses `Math.random()`
- [ ] Test uses `Date.now()`
- [ ] Test uses `UUID.generate()`
- [ ] Different assertions fail each run
- [ ] Works locally but fails in CI

**Fix**:
```javascript
// Seed random number generator
beforeEach(() => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
});

// Mock Date.now()
jest.spyOn(Date, 'now').mockReturnValue(1234567890);

// Generate UUIDs deterministically
jest.mock('uuid', () => ({ v4: () => 'test-uuid-123' }));
```

---

## Investigation Checklist

### Documentation
- [ ] When test was added
- [ ] When it started failing
- [ ] Failure frequency recorded
- [ ] Specific assertion that fails (changes?)

### Reproduction
- [ ] Test fails when run 10 times in sequence
- [ ] Test fails when run in random order with others
- [ ] Test fails in CI but not locally (or vice versa)
- [ ] Test fails under high system load

### Code Analysis
- [ ] All async operations have `await`
- [ ] No global state modifications
- [ ] All mocks are configured
- [ ] No `setTimeout` with fixed delays
- [ ] No external service calls
- [ ] No random values without seeding

### Environment
- [ ] Node version documented (local vs CI)
- [ ] Operating system noted (different on CI?)
- [ ] CI environment variables checked
- [ ] Parallelization disabled for test
- [ ] Test isolation verified

### Fix Validation
- [ ] Test passes 20 times consecutively
- [ ] Test passes in random order with other tests
- [ ] Test passes in CI
- [ ] Test passes under load
- [ ] No other tests broken

---

## Debugging Strategy

### If Pattern 1: Race Condition
```bash
# Add debug logging to see timing
npm test -- --verbose path/to/test.js

# Add explicit waits
await new Promise(r => setTimeout(r, 100));

# Use waitFor with debug
await waitFor(() => {
  console.log('Checking condition...');
  expect(element).toBeVisible();
});
```

### If Pattern 2: Test Order Dependency
```bash
# Run tests in random order
npm test -- --randomize path/to/test.js

# Run test alone vs with others
npm test -- test1.js test2.js test3.js  # Together
npm test -- test2.js                     # Alone

# Check beforeEach/afterEach setup
```

### If Pattern 3: Timing Issues
```bash
# Check system load
# Monitor: CPU, Memory, Disk I/O during test run

# Increase timeouts
await waitFor(() => expect(...), { timeout: 10000 });

# Replace sleep with condition
// Instead of: await sleep(1000);
await waitFor(() => expect(element).toBeVisible());
```

### If Pattern 4: External Service
```bash
# Verify all external calls are mocked
grep -r "fetch\|axios\|http" src/__tests__/

# Check mock setup
console.log(jest.mock(...));
```

### If Pattern 5: Randomness
```bash
# Set seed for randomness
jest.spyOn(Math, 'random').mockReturnValue(0.5);

# Mock Date.now()
jest.spyOn(Date, 'now').mockReturnValue(1234567890);

# Use deterministic test data
const testUser = { id: '123', name: 'Test' };  // Same each time
```

---

## Verification: Flaky Test Fixed

- [ ] Test passes 20 times consecutively
- [ ] Test passes 20 times in random order
- [ ] Test passes in CI environment
- [ ] Test passes under system load
- [ ] No debug code left
- [ ] Updated RECOVERY_POINTS.md with pattern
- [ ] Similar tests checked for same issue

---

## Recovery: Still Flaky?

If still failing after fixes:

1. **Add extensive logging**:
   ```javascript
   test('flaky test', async () => {
     console.log('Start:', Date.now());
     const value = getSomeValue();
     console.log('Value:', value);
     await waitForCondition();
     console.log('Condition met:', Date.now());
     expect(...).toBe(...);
   });
   ```

2. **Disable test temporarily**:
   ```javascript
   test.skip('flaky test', async () => {  // Temporarily skip
     // ...
   });
   ```

3. **Escalate**: Mark test with TODO comment for team
   ```javascript
   // TODO: Fix flaky test - likely timing issue, investigate when time permits
   test.skip('should handle concurrent updates', async () => {
   ```

4. **Create issue**: Document flaky test pattern for future fix
