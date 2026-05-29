#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <slug> [summary] [root]" >&2
  exit 2
}

slug="${1:-}"
summary="${2:-TBD}"
root="${3:-.}"
[ -n "$slug" ] || usage

case "$slug" in
  *[!a-z0-9-]*|'') echo "Slug must use lowercase letters, numbers, and hyphens." >&2; exit 2 ;;
esac

cd "$root"
mkdir -p .planning/bugs

next="$(
  find .planning/bugs -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null \
    | sed -E 's#.*/([0-9]{3})-.*#\1#' \
    | sort -n \
    | tail -1
)"
if [ -z "$next" ]; then
  number="001"
else
  number="$(printf '%03d' "$((10#$next + 1))")"
fi

dir=".planning/bugs/${number}-${slug}"
if [ -e "$dir" ]; then
  echo "Bug directory already exists: $dir" >&2
  exit 1
fi

mkdir -p "$dir"

cat > "$dir/REPORT.md" <<EOF
# Bug Report: $summary

## Summary

$summary

## Expected Behavior

- [ ] TBD

## Actual Behavior

- [ ] TBD

## Reproduction Steps

- [ ] TBD

## Environment

TBD
EOF

cat > "$dir/ROOT_CAUSE.md" <<'EOF'
# Root Cause

## Evidence

- [ ] TBD

## Root Cause

TBD

## Failed Assumption

TBD

## Correct Pattern

TBD
EOF

cat > "$dir/PLAN.md" <<'EOF'
# Plan

## Files To Change

### File: `path/to/file`

Change:
Why:
Risk:
Test:
Docs impact:

## Fix Steps

- [ ] TBD

## Rollback Plan

- [ ] TBD
EOF

cat > "$dir/TEST_CONTRACT.md" <<'EOF'
# Test Contract

- [ ] Reproduction fails before fix
- [ ] Regression test or verification fails before fix
- [ ] Regression test or verification passes after fix
- [ ] Related edge case is covered
EOF

cat > "$dir/TASKS.md" <<'EOF'
# Tasks

- [ ] Read PITFALLS.md
- [ ] Read LESSONS_LEARNED.md
- [ ] Reproduce bug
- [ ] Identify root cause
- [ ] Write regression test or verification
- [ ] Fix bug
- [ ] Run verification
- [ ] Update LESSONS_LEARNED.md
- [ ] Update docs if behavior changed
- [ ] Review changed files
- [ ] Update STATE.md
- [ ] Update SPEC_CHANGELOG.md if needed
EOF

cat > "$dir/VERIFICATION.md" <<'EOF'
# Verification

- [ ] Define reproduction command
- [ ] Run failing verification before fix
- [ ] Run passing verification after fix

| Command | Result | Evidence |
|---|---|---|
| TBD | TBD | TBD |
EOF

cat > "$dir/REVIEW.md" <<'EOF'
# Review

- [ ] Changed files reviewed
- [ ] Regression coverage checked
- [ ] Docs impact checked
- [ ] Debug logs removed

## Findings

| Severity | File | Issue | Follow-Up |
|---|---|---|---|
| TBD | TBD | TBD | TBD |
EOF

echo "$dir"
