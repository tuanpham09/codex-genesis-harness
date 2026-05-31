---
name: debug-guide-skill
description: "Systematic debugging for test failures, runtime errors, and production bugs. Follows TDD debugging patterns, isolation strategies, and observability-driven root cause analysis. Auto-triggers after bug fixes to verify fix quality and prevent regressions."
---

# Genesis Debug Guide Skill

## Purpose
Transform debugging from trial-and-error into systematic, evidence-based root cause analysis. Guides developers through structured investigation workflows that isolate problems quickly and verify fixes thoroughly.

## When to use

**Manual trigger** (explicit debugging needs):
- Test failures that need systematic investigation
- Production bugs requiring observability analysis
- Flaky tests needing isolation strategy
- Runtime errors with unclear root cause
- After `/fix-bug` completion for fix verification

**Auto-trigger** (implicit, hook-based):
- ✅ **After `/fix-bug` completes** → Auto-activate debug verification
- ✅ **During test failures** → Suggest debug workflow
- ✅ **On runtime errors** → Guide observability-first troubleshooting

## When NOT to use
- Simple deterministic bugs with obvious fixes (obvious syntax errors)
- One-liner configuration changes
- Documentation-only updates

## Inputs required

For effective debugging:
- Error message or failing test
- Expected vs actual behavior
- Steps to reproduce (if applicable)
- Recent code changes or environment info
- Existing logs/traces (if available)

## Outputs required

Complete debugging artifacts:
1. **Failing Test** (if applicable) - Demonstrates the exact problem
2. **Root Cause Analysis** - Evidence-based explanation
3. **Debug Investigation Log** - Steps taken, findings, decisions
4. **Fix Strategy** - Minimal change to resolve only this issue
5. **Regression Prevention** - Tests added to catch this bug type
6. **Verification Evidence** - Proof fix works and tests pass

## Required tests
Create or update failing tests before implementation.

## Required fixtures
Create fixtures for expected inputs, outputs, validation notes, and recovery cases.

## Required contract updates
Update API, agent, event, or UI contracts when public behavior changes.

## Required codebase map updates
Update `.codebase` memory after meaningful changes.

## Workflow

### Phase 1: Problem Isolation (RED state)
```yaml
1. Understand the Problem:
   - Read error message completely
   - Identify exact failing line or assertion
   - Check reproduction steps
   - Gather logs/traces

2. Run Investigation Checklist:
   - Review checklists/test-failure-debug.md OR
   - Review checklists/production-bug-debug.md OR
   - Review checklists/flaky-test-investigation.md

3. Select Appropriate Playbook:
   - Unit test failure → playbooks/unit-test-failures.md
   - Integration test failure → playbooks/integration-test-failures.md
   - E2E test failure → playbooks/e2e-test-failures.md
   - Runtime error → playbooks/runtime-errors.md

4. Isolate the Failure:
   - Run single failing test only
   - Check test setup/teardown
   - Verify mock setup is correct
   - Confirm test is deterministic (not flaky)
```

### Phase 2: Root Cause Analysis (Investigation)
```yaml
1. Gather Evidence:
   - Console output / logs
   - Stack traces
   - Variable states at failure point
   - Recent code changes
   - Git blame on relevant lines

2. Form Hypotheses:
   - "Expected A, got B because..."
   - Test scenario mismatch?
   - Data state issue?
   - Timing/race condition?
   - Wrong assumption in test?

3. Verify Hypothesis:
   - Add debug logging
   - Check actual values vs expected
   - Review git history
   - Search for similar patterns in codebase

4. Document Findings:
   - Use templates/debug-investigation-log.md
   - Record evidence collected
   - Document hypothesis progression
   - Note dead-ends and what ruled them out
```

### Phase 3: Fix & Verification (GREEN state)
```yaml
1. Implement Minimal Fix:
   - Change ONLY what's necessary
   - Don't refactor other code
   - Don't optimize prematurely
   - Verify fix is isolated

2. Verify Fix:
   - Run single failing test → should PASS
   - Run full test suite → all should PASS
   - Check for new warnings/errors
   - Verify no debug code left

3. Prevention & Regression:
   - Create test catching this bug
   - Add similar patterns to test suite
   - Document in RECOVERY_POINTS.md
   - Update relevant playbook if needed

4. Code Review:
   - Is fix minimal?
   - Are tests adequate?
   - Any debug logs left?
   - Any dead code introduced?
```

### Phase 4: Reflect & Document (IMPROVE state)
```yaml
1. Root Cause Lesson:
   - Was this preventable by test?
   - Should contract/spec have caught this?
   - Architecture issue or implementation error?
   - How to prevent similar bugs?

2. Pattern Documentation:
   - Add to observability/debug-commands.md if new pattern
   - Update playbook with new discovery
   - Document in .codebase/RECOVERY_POINTS.md

3. Team Communication:
   - File decision log in observability/agent-runs/
   - Note for code review process
   - Update documentation if behavior changed
```

## Auto-Trigger Workflow (Post /fix-bug)

When `/fix-bug` completes successfully:

```yaml
Hook: PostToolUse → "/fix-bug completed"
Action: Activate genesis-debug-guide

1. Fix Verification (5 min):
   - Run: npm test (or equivalent)
   - Check: All tests pass
   - Check: No debug logs in code
   - Check: Changed files reviewed

2. Coverage Check (3 min):
   - Verify: Test for bug exists
   - Verify: Test fails without fix
   - Verify: Test passes with fix
   - Verify: Related tests still pass

3. Regression Prevention (5 min):
   - Scan: Similar patterns in codebase
   - Add: Tests for edge cases
   - Document: In RECOVERY_POINTS.md

4. Completion (2 min):
   - Mark: /fix-bug as verified
   - Create: Debug investigation log
   - Update: CURRENT_STATE.md
```

## Debugging Playbooks

### Unit Test Failures
**File**: `playbooks/unit-test-failures.md`

Debugging strategy:
1. **Isolation**: Run single test with debug output
2. **Mock Verification**: Check all mocks are set up correctly
3. **Assertion Analysis**: Verify assertion is testing right thing
4. **State Issues**: Check for shared state between tests
5. **Implementation Review**: Verify code matches test expectations

### Integration Test Failures
**File**: `playbooks/integration-test-failures.md`

Debugging strategy:
1. **Contract Validation**: Verify API contract matches implementation
2. **Database State**: Check DB setup/teardown between tests
3. **External Services**: Verify mocks for external APIs
4. **Event Order**: Check sequence assumptions
5. **Rollback Safety**: Ensure test cleanup is complete

### E2E Test Failures
**File**: `playbooks/e2e-test-failures.md`

Debugging strategy:
1. **Visual Inspection**: Take screenshot at failure point
2. **Timing Issues**: Check for race conditions with waits
3. **Element Locators**: Verify selectors haven't changed
4. **State Setup**: Ensure test data exists
5. **Environment**: Verify test env matches expectations

### Runtime Errors
**File**: `playbooks/runtime-errors.md`

Debugging strategy:
1. **Stack Trace Analysis**: Follow call stack backward
2. **State Inspection**: Log variable values at each step
3. **Observability**: Enable debug logging + traces
4. **Reproduction**: Create minimal test case
5. **Pattern Search**: Find similar errors in codebase

## Checklists

### Test Failure Debug Checklist
**File**: `checklists/test-failure-debug.md`

Pre-debugging verification:
- [ ] Error message read completely
- [ ] Test run in isolation (single test only)
- [ ] No environment variables affecting test
- [ ] Test is deterministic (not flaky)
- [ ] Git status clean (no uncommitted changes)
- [ ] Dependencies are up to date

### Production Bug Debug Checklist
**File**: `checklists/production-bug-debug.md`

Production-specific considerations:
- [ ] Bug reproduced in staging first
- [ ] User impact assessed
- [ ] Hotfix vs regular release decision made
- [ ] Rollback strategy documented
- [ ] Monitoring/alerts configured
- [ ] Data integrity checked

### Flaky Test Investigation Checklist
**File**: `checklists/flaky-test-investigation.md`

Flaky test specific:
- [ ] Test failure rate documented
- [ ] Failure patterns identified (timing? state?)
- [ ] Test history reviewed (when did it start?)
- [ ] Dependencies isolated
- [ ] Timing assumptions verified
- [ ] Race condition ruled out/confirmed

## Templates

### Debug Investigation Log
**File**: `templates/debug-investigation-log.md`

Structure for documenting investigation:
```
## Bug Summary
- What: [describe bug]
- Impact: [user-facing? data loss? blocking?]
- Reproducibility: [consistent? flaky? specific conditions?]

## Investigation Steps
1. [What I tried]
   - Findings: [what I learned]
   - Eliminated: [what I ruled out]

2. [Next thing I tried]
   - Findings: ...

## Root Cause
- Explanation: [why bug occurred]
- Evidence: [logs, stack traces, test output]
- Contributing Factors: [what made this happen]

## Fix Applied
- Change: [what code was modified]
- Why: [why this fixes the root cause]
- Risk: [could this break anything?]

## Verification
- Test: [failing test now passes]
- Coverage: [what edge cases tested]
- Regression: [similar patterns checked]

## Lessons
- Prevention: [how to prevent similar bugs]
- Process: [what process improvement needed]
- Documentation: [what docs need updating]
```

## Observability

### Debug Commands
**File**: `observability/debug-commands.md`

By language:
- **Node.js**: `console.debug()`, `console.trace()`, Chrome DevTools
- **Python**: `pdb.set_trace()`, `logging.DEBUG`
- **Ruby**: `binding.pry`, `byebug`
- **PHP**: `var_dump()`, `xdebug`
- **Go**: `fmt.Printf()`, `dlv debugger`

### Inspection Workflows
**File**: `observability/inspection-workflows.md`

Common scenarios:
- "API returns wrong data" → trace data through layers
- "Test fails intermittently" → add timing logs
- "Performance degraded" → profile + identify bottleneck
- "State corruption" → log state changes + assertions

## Token saving rules

When debugging:
1. Don't repeat full error logs - summarize key part
2. Don't paste entire test file - focus on failing part
3. Reference existing RECOVERY_POINTS.md patterns
4. Link to existing playbooks instead of re-explaining
5. Cache investigation findings in memory between runs

## Acceptance criteria

Debug work is complete when:
- ✅ Failing test clearly demonstrates bug
- ✅ Root cause documented with evidence
- ✅ Fix is minimal (only changes needed for bug)
- ✅ Test passes with fix, fails without it
- ✅ No debug code left in implementation
- ✅ Related tests added for regression prevention
- ✅ Investigation log saved for team reference
- ✅ Similar bugs searched in codebase
- ✅ Prevention strategy documented

## Common mistakes

❌ **Don't**:
- Jump to fix without understanding root cause
- Leave debug logging in production code
- Refactor code while fixing bug (separate concerns)
- Trust one test run - verify consistently
- Skip regression prevention
- Assume environment (specify exact OS, Node version, etc.)
- Fix the symptom, not the cause

✅ **Do**:
- Isolate test first, investigate second
- Form hypothesis BEFORE changing code
- Run full test suite after fix
- Add test that catches this bug
- Document investigation findings
- Verify fix on multiple runs
- Check for similar patterns in codebase

## Recovery workflow

If debugging effort exceeds 30 minutes:

```yaml
1. Pause & Document:
   - Save current investigation in debug-investigation-log.md
   - Save all findings and failed hypotheses
   - Record exact error, environment, repro steps

2. Escalate:
   - Check .codebase/RECOVERY_POINTS.md for similar patterns
   - Review observability/failures/ for related issues
   - Ask architecture-to-execution agent for pattern analysis

3. Alternative Approach:
   - Try opposite hypothesis
   - Check error in different environment
   - Isolate smaller component
   - Add more extensive logging

4. Team Help:
   - Use investigation log for code review
   - Ask other developers if seen similar issue
   - Check GitHub issues/PRs for related bugs
```

## Integration with Genesis Harness

**Works with**:
- `genesis-harness` - Auto-triggers after `/fix-bug`
- `genesis-research` - Research best debugging practices for language
- `genesis-testing` - Helps understand test structure
- `spec-impact-engine` - Identifies if fix cascades to other phases

**Workflows**:
- `/fix-bug description` → [fix implementation] → **[debug-guide auto-triggers]** → verification complete
- Test failure → Manual `/debug` → debug-guide activates → systematic investigation
- Production alert → `/debug production-issue` → Root cause analysis → Fix planned

## File Locations

```
.codex/skills/genesis-debug-guide/
├── SKILL.md (this file)
├── checklists/
│   ├── test-failure-debug.md
│   ├── production-bug-debug.md
│   └── flaky-test-investigation.md
├── playbooks/
│   ├── unit-test-failures.md
│   ├── integration-test-failures.md
│   ├── e2e-test-failures.md
│   └── runtime-errors.md
├── templates/
│   ├── debug-investigation-log.md
│   └── root-cause-analysis.md
└── observability/
    ├── debug-commands.md
    └── inspection-workflows.md
```

## Examples

### Example 1: Unit Test Failure
```
User: Test failing - expecting array length 5 but got 3

Debug workflow:
1. Run test in isolation
2. Add console.log to see actual array
3. Review test setup - found mock returning incomplete data
4. Fix mock setup
5. Verify test passes
6. Add more assertions for future
→ Debug guide surfaces: "Mock setup issue" pattern → update checklists
```

### Example 2: Flaky Test
```
User: Test fails ~20% of the time, seems random

Debug workflow:
1. Add timestamps to debug output
2. Pattern found: Timing-dependent assertion
3. Add explicit wait for async operation
4. Verify test passes 10x consecutively
5. Add to flaky test playbook
→ Debug guide suggests: Add timeouts + waiting
```

### Example 3: Production Bug
```
User: /fix-bug "API returns 500 on payment endpoint"

Debug workflow:
1. Check logs - database connection error
2. Review recent changes
3. Found missing connection retry logic
4. Add exponential backoff
5. Test with simulated failures
6. Deploy with monitoring
→ Debug guide auto-verifies: All tests pass, no regressions
```
