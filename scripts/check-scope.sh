#!/usr/bin/env bash
# check-scope.sh — L07 Scope Ledger Enforcement
# Usage: bash scripts/check-scope.sh [SCOPE.md path] [optional: git diff base]
#
# Reads a SCOPE.md file and verifies that all modified files (from git diff)
# are within the permitted boundaries defined in the scope ledger.
#
# Exit codes:
#   0 = all changes within scope
#   1 = out-of-scope changes detected
#   2 = SCOPE.md not found or invalid

set -euo pipefail

SCOPE_FILE="${1:-}"
GIT_BASE="${2:-HEAD}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail() {
  echo "scope-check FAIL: $*" >&2
  exit 1
}

warn() {
  echo "scope-check WARN: $*" >&2
}

if [ -z "$SCOPE_FILE" ]; then
  echo "Usage: bash scripts/check-scope.sh <SCOPE.md path> [git-base]"
  echo "       If no SCOPE.md is provided, scope check is advisory only."
  echo "scope-check: no scope file provided — skipping (advisory mode)"
  exit 0
fi

if [ ! -f "$SCOPE_FILE" ]; then
  echo "scope-check: SCOPE.md not found at '$SCOPE_FILE' — using advisory mode (no hard boundary)"
  echo "scope-check: Create '$SCOPE_FILE' from features/SCOPE-template.md to enable enforcement."
  exit 0
fi

echo "scope-check: Enforcing boundaries from '$SCOPE_FILE'..."

# Extract permitted files section (lines between "## Permitted File Changes" and next ##)
PERMITTED=$(awk '/^### ✅ Files this task MAY create or modify/{found=1; next} /^### /{found=0} found && /^[a-zA-Z_.\/-]/{print $0}' "$SCOPE_FILE")

if [ -z "$PERMITTED" ]; then
  warn "No permitted files extracted from '$SCOPE_FILE' — check format. Skipping enforcement."
  exit 0
fi

# Get list of changed files
if git rev-parse --git-dir > /dev/null 2>&1; then
  CHANGED=$(git diff --name-only "$GIT_BASE" 2>/dev/null || git status --porcelain | awk '{print $2}')
else
  echo "scope-check: not inside a git repo — using git status fallback"
  CHANGED=$(git status --porcelain 2>/dev/null | awk '{print $2}' || echo "")
fi

if [ -z "$CHANGED" ]; then
  echo "scope-check: no changed files detected — scope check trivially passes"
  exit 0
fi

OUT_OF_SCOPE=()
while IFS= read -r changed_file; do
  [ -z "$changed_file" ] && continue
  IN_SCOPE=false
  while IFS= read -r permitted; do
    [ -z "$permitted" ] && continue
    # Check if changed file matches permitted entry (exact or prefix)
    if [[ "$changed_file" == "$permitted" ]] || [[ "$changed_file" == "$permitted"* ]]; then
      IN_SCOPE=true
      break
    fi
  done <<< "$PERMITTED"
  if [ "$IN_SCOPE" = false ]; then
    OUT_OF_SCOPE+=("$changed_file")
  fi
done <<< "$CHANGED"

if [ ${#OUT_OF_SCOPE[@]} -gt 0 ]; then
  echo "scope-check FAIL: The following files are outside the permitted scope:"
  for f in "${OUT_OF_SCOPE[@]}"; do
    echo "  ❌ $f"
  done
  echo ""
  echo "To expand scope: edit '$SCOPE_FILE' and add the file to '## Permitted File Changes'."
  echo "To override: add the file to '🟡 Files requiring explicit confirmation' and get user approval."
  
  if [ "${VIBE_MODE:-0}" = "1" ]; then
    echo "scope-check WARN: VIBE_MODE is active. Bypassing fatal blocker."
    echo "- [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] VIBE_MODE Bypass: ${#OUT_OF_SCOPE[@]} files modified out of scope. Files: ${OUT_OF_SCOPE[*]}" >> "$repo_root/.codebase/TECH_DEBT.md"
    exit 0
  fi
  
  exit 1
fi

echo "scope-check passed: all ${#OUT_OF_SCOPE[@]} changed files are within scope"
echo "scope-check: $(echo "$CHANGED" | wc -l | tr -d ' ') files changed, all permitted"
