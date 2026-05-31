# Contributing to Genesis Harness

## Before You Start

1. **Read the docs**:
   - [README.md](README.md) - Project overview and installation
   - [AGENTS.md](AGENTS.md) - Workflow and guidelines
   - [.codebase/README.md](.codebase/README.md) - Memory system

2. **Understand the workflow**:
   - We follow **test-first development**
   - All changes require **contract-first design** for APIs
   - Verification must pass before PR merge

## Development Workflow

### 1. Plan Your Work

Before coding, check:
- `.codebase/CURRENT_STATE.md` - What's been done?
- `.codebase/KNOWN_PROBLEMS.md` - Any blockers?
- `.codebase/EVOLUTION_PLAN.md` - Does this align with roadmap?

### 2. For New Features

**Step 1: Create Contract**
```bash
# Copy contract template
cp contracts/agents/agent-fixture-template.md contracts/agents/MyFeature/

# Edit with:
# - request.json (input schema)
# - response.json (expected output)
# - example.json (concrete example)
# - error.json (error cases)
# - schema.json (validation rules)
```

**Step 2: Write Tests First**
```bash
# Create test file
cp tests/unit/unit-template.test.md tests/unit/my-feature.test.md

# Write tests for:
# - Happy path
# - Edge cases
# - Error handling
# - Integration points
```

**Step 3: Create Fixtures**
```bash
# Add test data
cp fixtures/agents/agent-fixture-template.md fixtures/agents/my-feature.md
```

**Step 4: Implement**
- Write minimal code to pass tests
- No hardcoded values
- Immutable data structures
- Comprehensive error handling

**Step 5: Verify**
```bash
npm run verify
npm run eval
npm run pack:check
```

**Step 6: Update Memory**
```bash
# Update these files:
.codebase/CURRENT_STATE.md       # What you did
.codebase/MODULE_INDEX.md        # New modules/exports
.codebase/TEST_MATRIX.md         # Test coverage
observability/decision-logs/     # Why you did it
```

### 3. For Bug Fixes

**Step 1: Reproduce**
```bash
# Add failing test
cp tests/integration/integration-template.test.md tests/integration/bug-fix.test.md

# Write test that fails with current code
npm run verify  # Should fail
```

**Step 2: Fix**
- Minimal change to pass test
- Don't refactor unrelated code
- Update relevant contracts if behavior changed

**Step 3: Verify & Document**
```bash
npm run verify  # Should pass

# Update:
.codebase/CURRENT_STATE.md
.codebase/KNOWN_PROBLEMS.md    # Remove the bug
observability/failures/         # Document the fix
```

### 4. For Refactoring

**Step 1: Ensure Tests Pass**
```bash
npm run verify  # All tests must pass
```

**Step 2: Refactor**
- Keep tests green the entire time
- Make small, reviewable changes
- Update architecture docs if design changed

**Step 3: Verify Again**
```bash
npm run verify
npm run pack:check
```

**Step 4: Update Docs**
```bash
# Only update if:
# - Architecture changed: .codebase/ARCHITECTURE.md
# - Dependencies changed: .codebase/DEPENDENCY_GRAPH.md
# - Module structure changed: .codebase/MODULE_INDEX.md
```

## Code Quality Standards

### Immutability (CRITICAL)
```javascript
// ❌ WRONG
function updateConfig(config, value) {
  config.setting = value;  // Mutates input
  return config;
}

// ✅ CORRECT
function updateConfig(config, value) {
  return { ...config, setting: value };  // Returns new object
}
```

### Error Handling
- All functions must handle errors explicitly
- Provide user-friendly messages
- Log detailed context on server side
- Never silently swallow errors

### Input Validation
- Validate at system boundaries
- Use schema validation (if available)
- Fail fast with clear errors
- Never trust external data

### File Organization
- Maximum 800 lines per file
- Typical file: 200-400 lines
- Group related functionality
- Extract utilities from large modules

### No Magic Numbers
```javascript
// ❌ WRONG
if (items.length > 50) { ... }

// ✅ CORRECT
const MAX_BATCH_SIZE = 50;
if (items.length > MAX_BATCH_SIZE) { ... }
```

## Testing Requirements

### Minimum Coverage: 80%

**Required Test Types:**
1. **Unit Tests** - Individual functions, utilities
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows
4. **Contract Tests** - API schemas and contracts

**Test File Naming:**
```
tests/unit/feature-name.test.md
tests/integration/feature-name.test.md
playwright/e2e/feature-name.test.md
contracts/agents/FeatureName/
```

**Writing Tests:**
1. Write test first (RED)
2. Test fails ✓
3. Implement minimal code (GREEN)
4. Test passes ✓
5. Refactor (IMPROVE)
6. Verify coverage 80%+ ✓

## Commit Standards

### Commit Messages
```
<type>: <description>

<optional body with why/what/how>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Test addition/fix
- `docs:` Documentation
- `chore:` Build, deps, CI
- `perf:` Performance improvement

**Examples:**
```
feat: add image generation agent contract

- Added schema validation
- Created example payloads
- Updated MODULE_INDEX.md

refs #123
```

```
fix: handle null values in pipeline orchestrator

Previously crashed when metadata was undefined.
Now returns sensible default with warning log.

fixes #456
```

### Branch Naming
```
feature/short-description
fix/bug-description
refactor/area-description
docs/what-you-documented
```

## Pull Request Checklist

Before submitting PR:

- [ ] Tests written and passing (`npm run verify`)
- [ ] Coverage 80%+ (`npm run eval`)
- [ ] Code follows style standards
- [ ] No hardcoded values
- [ ] Error handling complete
- [ ] Immutable data structures used
- [ ] Contracts updated (if API changed)
- [ ] `.codebase/` files updated
- [ ] Commit messages clear and descriptive
- [ ] No console.log or debug code left
- [ ] Pack check passes (`npm run pack:check`)

## Verification Commands

**Run before submitting PR:**

```bash
# Verify all tests pass
npm run verify

# Run evaluations
npm run eval

# Check package integrity
npm run pack:check

# Verify installed copy
./scripts/verify.sh ~/.codex/skills
```

## Memory System Updates

**Always update after work:**

| File | When to Update |
|------|---|
| `.codebase/CURRENT_STATE.md` | After every significant change |
| `.codebase/MODULE_INDEX.md` | When adding/removing modules |
| `.codebase/TEST_MATRIX.md` | When adding/fixing tests |
| `.codebase/ARCHITECTURE.md` | When design decisions change |
| `.codebase/API_CONTRACTS.md` | When API changes |
| `.codebase/KNOWN_PROBLEMS.md` | When discovering/fixing issues |
| `observability/decision-logs/` | Major decisions and why |

## Questions?

- Architecture questions? → Read `.codebase/ARCHITECTURE.md`
- Testing questions? → Read `.codebase/TEST_MATRIX.md`
- API questions? → Read `.codebase/API_CONTRACTS.md`
- Still stuck? → Check `AGENTS.md` for workflow reference
