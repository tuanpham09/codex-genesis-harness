# Scripts Reference

Utility scripts for verifying, testing, and managing the Genesis Harness project.

## Quick Start

```bash
# First time setup
./scripts/install.sh

# Verify everything works
./scripts/verify.sh

# Before PR submission
npm run verify && npm run eval && npm run pack:check
```

## Scripts

### install.sh

**Purpose**: Install Genesis Harness skills and dependencies

**When to run**:
- First time setting up the project
- After cloning the repository
- When adding new skills

**What it does**:
- Copies skills to `~/.codex/skills/`
- Installs npm dependencies
- Sets up environment paths
- Validates installation

**Usage**:
```bash
# Default installation
./scripts/install.sh

# Custom homes
CODEX_HOME=/path/to/.codex ./scripts/install.sh
GENESIS_HARNESS_HOME=/path/to/.agents ./scripts/install.sh

# Skip postinstall
GENESIS_HARNESS_SKIP_POSTINSTALL=1 npm install -g codex-genesis-harness@latest
```

**Success indicator**: "Installation complete" message, no errors

---

### verify.sh

**Purpose**: Run all verification checks

**When to run**:
- After making code changes
- Before submitting a PR (REQUIRED)
- When debugging test failures
- During development cycles

**What it does**:
- Runs all unit tests
- Runs all integration tests
- Checks TypeScript compilation
- Validates contract schemas
- Checks for linting errors
- Verifies package integrity

**Usage**:
```bash
# Verify project root
./scripts/verify.sh

# Verify installed copy
./scripts/verify.sh ~/.codex/skills

# Run specific test type
npm run verify:unit
npm run verify:integration
npm run verify:e2e
```

**Success indicator**: "✓ All checks passed", exit code 0

**Common issues**:
- Test failures → Fix code, re-run
- Schema validation errors → Update contracts
- TypeScript errors → Fix type issues

---

### run-evals.sh

**Purpose**: Run evaluation suite for coverage and quality metrics

**When to run**:
- Before final PR submission
- During sprint reviews
- When verifying coverage meets 80%
- Performance benchmarking

**What it does**:
- Measures test coverage (target: 80%+)
- Runs performance benchmarks
- Checks code complexity
- Validates fixture integrity
- Generates coverage reports

**Usage**:
```bash
# Run full evaluation
./scripts/run-evals.sh

# Run specific evaluation
npm run eval:coverage
npm run eval:performance
npm run eval:complexity
```

**Output**: Coverage report, performance metrics, complexity analysis

**Success indicator**: Coverage 80%+, no performance regressions

---

### npm Commands

These are defined in `package.json` and run via npm.

#### npm run verify

**Alias**: `./scripts/verify.sh`

Runs all verification checks. **Use this before every PR.**

```bash
npm run verify
```

---

#### npm run eval

**Alias**: `./scripts/run-evals.sh`

Runs evaluation suite. Check coverage and quality metrics.

```bash
npm run eval
```

---

#### npm run pack:check

**Purpose**: Verify package will publish correctly

**When to run**:
- Before publishing to npm
- Before PR submission
- When package.json changes

**What it does**:
- Simulates npm publish
- Validates all files in package
- Checks naming and metadata
- Verifies no secrets exposed

**Usage**:
```bash
npm run pack:check
```

**Success indicator**: "✓ Package ready for publish", exit code 0

---

## Typical Development Workflow

### 1. Start a Feature

```bash
./scripts/install.sh              # If first time
./scripts/verify.sh               # Baseline check
```

### 2. Make Changes

Write code, tests, update contracts.

### 3. Verify Locally

```bash
./scripts/verify.sh               # All tests pass
npm run eval                      # Coverage 80%+
```

### 4. Before PR

```bash
./scripts/verify.sh               # Final verification
npm run eval                      # Final coverage check
npm run pack:check                # Package integrity
```

### 5. After Merge

```bash
./scripts/install.sh              # Re-install with new code
./scripts/verify.sh               # Validate in production paths
```

---

## Debugging Failed Scripts

### Verify Script Fails

**Check test output**:
```bash
npm test 2>&1 | tail -50         # Last 50 lines of output
```

**Run single test**:
```bash
npm run test -- --testNamePattern="specific test"
```

**Run test file**:
```bash
npm run test tests/unit/my-feature.test.md
```

### Eval Script Fails

**Check coverage only**:
```bash
npm run eval:coverage
```

**Check specific metric**:
```bash
npm run eval:performance
```

### Pack Check Fails

**Check what's included**:
```bash
npm pack --dry-run | head -100
```

**Check for secrets**:
```bash
grep -r "API_KEY\|SECRET\|password" . --exclude-dir=node_modules
```

---

## Environment Variables

Control script behavior:

```bash
# Skip postinstall during npm install
GENESIS_HARNESS_SKIP_POSTINSTALL=1

# Custom skill installation paths
CODEX_HOME=/path/to/.codex
GENESIS_HARNESS_HOME=/path/to/.agents

# Enable verbose output
DEBUG=*

# Set Node version
NODE_VERSION=18.0.0
```

---

## Manual Verification

If scripts fail, verify manually:

```bash
# Check Node version
node --version              # Should be 18+

# Check npm modules installed
npm ls                      # Should have no errors

# List test files
find tests -name "*.test.md" -type f

# Count coverage
find . -name "coverage" -type d
```

---

## Performance Tips

**Faster local development**:
```bash
# Skip e2e tests during development
npm run verify:unit
npm run verify:integration

# Then run full verify before PR:
npm run verify
```

**Cache improvements**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
./scripts/install.sh
```

---

## Continuous Integration

These scripts run in CI/CD:

1. `npm install` - Install dependencies
2. `npm run verify` - All checks must pass
3. `npm run eval` - Coverage and quality metrics
4. `npm run pack:check` - Package integrity

**Failed CI blocks PR merge.** Fix locally before pushing.

---

## Support

- Script errors? → Check exit code with `echo $?`
- Still failing? → Read full output, not just errors
- Clear cache and try again: `npm cache clean --force && ./scripts/install.sh`
