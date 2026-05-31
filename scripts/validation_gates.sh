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
else
  fail "scripts/verify.sh is missing."
fi

echo "====================================="
if [ $FAILURES -gt 0 ]; then
  echo "❌ $FAILURES Validation Gate(s) failed."
  exit 1
else
  echo "✅ All Validation Gates passed! Output is ready for production."
  exit 0
fi
