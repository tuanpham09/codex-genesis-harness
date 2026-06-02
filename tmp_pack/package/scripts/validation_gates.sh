#!/usr/bin/env bash
set -euo pipefail

echo "====================================="
echo "   RUNNING VALIDATION GATES          "
echo "====================================="

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILURES=0

fail() {
  echo "❌ VALIDATION FAILED: $*" >&2
  FAILURES=$((FAILURES + 1))
}

echo "1. Checking for leftover debug logs and TODOs..."
# Exclude node_modules, .git, .codex, scripts, .codebase, bin, and md files
EXCLUDES="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.codex --exclude-dir=scripts --exclude-dir=.codebase --exclude-dir=bin --exclude=*.md"

# We check for TODO, FIXME, console.log, print( (python)
# Using grep recursively
if grep -rn $EXCLUDES -E 'TODO|FIXME|console\.log|print\(' "$repo_root" | grep -v 'validation_gates.sh'; then
  fail "Found unresolved TODOs or leftover debug logs in codebase!"
else
  echo "✅ Codebase cleanliness gate passed."
fi

echo "2. Verifying Harness Integrity..."
if [ -f "$repo_root/scripts/verify.sh" ]; then
  if bash "$repo_root/scripts/verify.sh" > /dev/null 2>&1; then
    echo "✅ Harness Integrity gate passed."
  else
    fail "verify.sh failed. Core files or templates are missing."
  fi
fi

echo "3. Checking for Documentation Drift (Alignment with Code changes)..."
if [ -d "$repo_root/.git" ]; then
  # Get list of modified files in git
  CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || true)
  
  if [ -n "$CHANGED_FILES" ]; then
    # API Drift: code under src/ modified, but API contracts not updated
    if echo "$CHANGED_FILES" | grep -qE "src/.*api|src/.*endpoint|src/.*route" && ! echo "$CHANGED_FILES" | grep -qE "contracts/api/|.codebase/API_CONTRACTS.md|.planning/API_DOCS.md"; then
      echo "⚠️  WARNING: You changed API code under src/ but did not update API_CONTRACTS.md, API_DOCS.md or contracts/api/!"
    fi

    # Database Drift: models or schemas modified, but DOMAIN_MODELS.md not updated
    if echo "$CHANGED_FILES" | grep -qE "model|schema|db" && ! echo "$CHANGED_FILES" | grep -qE ".codebase/DOMAIN_MODELS.md"; then
      echo "⚠️  WARNING: You changed database/model files but did not update DOMAIN_MODELS.md!"
    fi

    # Test Drift: test files modified, but TEST_MATRIX.md not updated
    if echo "$CHANGED_FILES" | grep -qE "tests/|playwright/" && ! echo "$CHANGED_FILES" | grep -qE ".codebase/TEST_MATRIX.md"; then
      echo "⚠️  WARNING: You changed test files but did not update TEST_MATRIX.md!"
    fi

    # Dependency Drift: package.json dependencies modified, but DEPENDENCY_GRAPH.md not updated
    if echo "$CHANGED_FILES" | grep -q "package.json" && ! echo "$CHANGED_FILES" | grep -q ".codebase/DEPENDENCY_GRAPH.md"; then
      if git diff package.json 2>/dev/null | grep -qE '^\+.*"(dependencies|devDependencies)"'; then
        echo "⚠️  WARNING: You updated package.json dependencies but did not update DEPENDENCY_GRAPH.md!"
      fi
    fi
    echo "✅ Documentation alignment check complete."
  fi
else
  echo "⚠️  Git repository not found. Skipping drift check."
fi

echo "4. Running Pre-emptive Prompt Sentinel check..."
if [ -f "$repo_root/scripts/prompt_sentinel.js" ] && [ -f "$repo_root/.codebase/CURRENT_STATE.md" ]; then
  # Run prompt sentinel check on the state file as a pre-flight test
  node "$repo_root/scripts/prompt_sentinel.js" --check "$repo_root/.codebase/CURRENT_STATE.md" --threshold 1500
fi



echo "====================================="
if [ $FAILURES -gt 0 ]; then
  echo "❌ $FAILURES Validation Gate(s) failed."
  exit 1
else
  echo "✅ All Validation Gates passed! Output is ready for production."
  exit 0
fi
