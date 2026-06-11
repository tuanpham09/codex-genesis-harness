# Debug Investigation Log

**Template**: Use this to document your debugging process for a specific issue.

**Purpose**: Record findings so team can learn from investigation, help others with similar issues, and rebuild context if work resumes later.

---

## Incident Information

**Date**: [YYYY-MM-DD]  
**Time Started**: [HH:MM]  
**Investigator**: [Your Name]  
**Bug ID/Ticket**: [Link if applicable]  
**Severity**: Critical / High / Medium / Low  

---

## Problem Summary

### What
Brief description of what is broken:

[e.g., "User profile API returns 500 when fetching user with unicode characters in name"]

### Impact
Who/what is affected:

- [ ] Users affected: [count or percentage]
- [ ] Data integrity: [yes/no - if yes, describe]
- [ ] Revenue impact: [yes/no - if yes, describe]
- [ ] Production outage: [yes/no]

### Reproducibility
How consistent is the problem:

- [ ] Consistent (fails every time)
- [ ] Intermittent (fails ~X% of time)
- [ ] Environment-specific
- [ ] User-specific
- [ ] Data-specific

### Reproduction Steps
Exact steps to trigger the problem:

1. [First step]
2. [Second step]
3. [Third step]

---

## Investigation Process

### Step 1: Initial Analysis
**Time**: [HH:MM] | **Duration**: [X min]

**What I did**:
- Reviewed error message
- Checked application logs
- Reproduced locally/in staging

**Findings**:
- Error stack trace shows: [key line]
- Logs show: [relevant log entry]
- Reproduced: [yes/no - where]

**Hypotheses formed**:
1. [Hypothesis A]
2. [Hypothesis B]
3. [Hypothesis C]

---

### Step 2: Deep Investigation
**Time**: [HH:MM] | **Duration**: [X min]

**What I did**:
- Examined code at error location
- Added debug logging
- Checked git history
- Tested with different inputs

**Findings**:
- Code location: `src/users/controller.js` line 42
- Recent changes: [Yes/No - which PR?]
- Test coverage: [good/poor/none]

**Eliminated hypotheses**:
- ❌ Hypothesis A because: [reason]
- ❌ Hypothesis B because: [reason]

**Remaining hypotheses**:
- ✓ Hypothesis C: [most likely cause]

---

### Step 3: Root Cause Identification
**Time**: [HH:MM] | **Duration**: [X min]

**Root Cause**:
[Detailed explanation of why the bug occurs]

Example:
```
The Unicode character 'é' (U+00E9) in the user name is not 
being properly escaped in the SQL query. The database driver 
receives: SELECT * FROM users WHERE name='José'
But doesn't properly handle the é character, causing a 
SQL syntax error → 500 error.
```

**Evidence**:
- Stack trace points to: [line X in file Y]
- Debug output shows: [variable values]
- Git history shows: [commit Z changed this]
- Similar issue: [GitHub issue #123]

**Contributing Factors**:
- [ ] Missing test for unicode characters
- [ ] No input validation for special characters
- [ ] Database driver version issue
- [ ] Configuration missing

---

## Solution

### Fix Strategy
**Approach**: [Describe the fix approach]

Example:
```
Option 1: Use parameterized queries (preferred)
- Pro: Prevents all SQL injection issues
- Con: Requires database layer refactoring

Option 2: Escape unicode before query (quick fix)
- Pro: Quick, minimal change
- Con: Only fixes unicode, not other characters

Decision: Option 1 (proper solution)
```

### Fix Implementation
**File**: `src/users/repository.js`  
**Lines**: 42-50  

```javascript
// BEFORE (buggy):
const query = `SELECT * FROM users WHERE name='${name}'`;
const result = await db.query(query);

// AFTER (fixed):
const result = await db.query(
  'SELECT * FROM users WHERE name = ?',
  [name]  // Parameter passed separately - properly escaped
);
```

**Why This Fixes It**:
- Parameterized queries handle all special characters
- Database driver handles escaping automatically
- More secure (prevents SQL injection)

---

## Verification

### Test Added
**Test file**: `src/users/__tests__/repository.test.js`

**Test case**:
```javascript
test('should fetch user with unicode name', async () => {
  const user = await repository.getByName('José');
  expect(user).toEqual({ id: 1, name: 'José' });
});

test('should fetch user with special characters', async () => {
  const user = await repository.getByName("O'Brien");
  expect(user).toEqual({ id: 2, name: "O'Brien" });
});
```

### Verification Results
- [ ] Failing test created → fails before fix
- [ ] Test passes after fix
- [ ] Full test suite passes
- [ ] No new test failures
- [ ] No debug code left in implementation
- [ ] Verified in staging environment (if production bug)
- [ ] Performance: No degradation observed

### Regression Testing
- [ ] All user-related tests pass
- [ ] Query building tests pass
- [ ] Integration tests with database pass
- [ ] Similar code patterns reviewed (no other unicode issues)
- [ ] Code coverage: Now at [X%]

---

## Lessons Learned

### What Went Wrong
1. **No test for unicode characters** - Input validation should include international characters
2. **String interpolation used for SQL** - Parameterized queries should be standard
3. **No code review process for input handling** - Missed in PR review

### Prevention
1. **Add test suite for international character handling**
   - Names with accents (José, François)
   - Apostrophes (O'Brien)
   - Unicode emoji (😀)
   - Right-to-left text (العربية)

2. **Add linting rule**
   - Ban string interpolation in SQL
   - Enforce parameterized queries
   - Review all user input handling

3. **Process improvement**
   - Code review checklist: "Check all user input is validated"
   - Input validation strategy doc
   - New developer onboarding includes input handling section

### Similar Bugs to Look For
- [ ] All user input handling reviewed (search for template literals in queries)
- [ ] Found 2 other locations with same pattern → Fixed together
- [ ] Added to "Known Issues" if not fixed: [none]

---

## Timeline Summary

| Time | Event |
|------|-------|
| 14:00 | Bug reported: API returns 500 for unicode names |
| 14:05 | Reproduced locally |
| 14:15 | Identified: String interpolation in SQL |
| 14:25 | Fixed: Changed to parameterized queries |
| 14:30 | Tests passing, verified in staging |
| 14:45 | Code review approved |
| 15:00 | Deployed to production |
| 15:05 | Monitoring shows error rate at 0% ✓ |

**Total Investigation Time**: 45 minutes

---

## Questions for Next Investigation

If similar issue occurs:
- [ ] Is it unicode-related?
- [ ] Is it in the database layer?
- [ ] Check: Are parameterized queries used everywhere?
- [ ] Check: Is input validation comprehensive?

---

## Artifacts

### Created Files
- `src/users/__tests__/repository.test.js` - New test cases
- `.codebase/RECOVERY_POINTS.md` - Updated with unicode handling notes

### Modified Files
- `src/users/repository.js` - Fixed SQL query
- `src/users/controller.js` - Code review pass

### Documentation
- Added to observability/failures/: This investigation log
- Updated `.codebase/KNOWN_ISSUES.md`: Similar patterns noted

---

## Sign-Off

- [ ] Investigation complete
- [ ] Fix verified
- [ ] Tests passing
- [ ] Team notified
- [ ] Ticket resolved
- [ ] Log archived

**Investigator**: [Your Name]  
**Date Completed**: [YYYY-MM-DD]  
**Approved By**: [Code Reviewer Name]
