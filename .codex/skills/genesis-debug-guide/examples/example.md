# Example: Debugging a Failing Unit Test

## Scenario

A unit test for the `UserService.createUser()` method suddenly fails with:

```
AssertionError: expected undefined but got "john@example.com"
Expected: undefined
Received: "john@example.com"
```

## Using genesis-debug-guide

```
/debug "UserService createUser test failing - expects undefined, gets email string"
```

## Workflow Executed

1. **Isolation** — Run only the failing test:
   ```bash
   npx jest UserService.test.ts --testNamePattern="createUser"
   ```

2. **Mock inspection** — Found that mock setup for `EmailValidator` returns full user object instead of `null` for invalid input.

3. **Root cause** — `EmailValidator` mock was updated to return `{ email }` but test still expected `undefined`.

4. **Fix** — Updated mock to align with new `EmailValidator` interface:
   ```ts
   jest.mock('./EmailValidator', () => ({ validate: () => undefined }));
   ```

5. **Regression test** — Added assertion for both valid and invalid email inputs.

6. **Verification** — Full test suite passes; debug log cleaned up.

## Debug Investigation Log

Saved to: `observability/agent-runs/debug-2026-05-31.md`

## Outcome

- ✅ Root cause documented
- ✅ Fix minimal (1 line in test mock)
- ✅ Regression test added
- ✅ No debug code left in implementation
