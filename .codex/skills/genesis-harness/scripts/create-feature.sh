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
mkdir -p .planning/features

next="$(
  find .planning/features -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null \
    | sed -E 's#.*/([0-9]{3})-.*#\1#' \
    | sort -n \
    | tail -1
)"
if [ -z "$next" ]; then
  number="001"
else
  number="$(printf '%03d' "$((10#$next + 1))")"
fi

dir=".planning/features/${number}-${slug}"
if [ -e "$dir" ]; then
  echo "Feature directory already exists: $dir" >&2
  exit 1
fi

mkdir -p "$dir"

cat > "$dir/SPEC.md" <<EOF
# Feature: $summary

## Summary

$summary

## User Story

As a TBD, I want TBD so that TBD.

## Expected Behavior

- [ ] TBD

## Edge Cases

- [ ] TBD

## Out Of Scope

- [ ] TBD

## Acceptance Criteria

- [ ] TBD
EOF

cat > "$dir/IMPACT.md" <<'EOF'
# Impact

| Question | Answer | Notes |
|---|---|---|
| Does this affect API? | TBD | TBD |
| Does this affect database? | TBD | TBD |
| Does this affect UI? | TBD | TBD |
| Does this affect auth/security? | TBD | TBD |
| Does this affect integrations? | TBD | TBD |
| Does this affect environment variables? | TBD | TBD |
| Does this affect architecture? | TBD | TBD |
| Does this require docs update? | TBD | TBD |
| Does this require tests? | TBD | TBD |
| Does this require migration? | TBD | TBD |
| Does this affect existing user journeys? | TBD | TBD |
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

## Implementation Steps

- [ ] TBD

## Test Strategy

- [ ] TBD

## Docs To Update

- [ ] TBD

## Diagrams To Update

- [ ] DIAGRAM.mmd

## Risks

- [ ] TBD

## Rollback Plan

- [ ] TBD

## Verification Commands

```sh
# TBD
```
EOF

cat > "$dir/TEST_CONTRACT.md" <<'EOF'
# Test Contract

## Normal Input / Output

- [ ] TBD

## Edge Cases

- [ ] TBD

## Invalid Inputs

- [ ] TBD

## Expected Errors

- [ ] TBD

## Acceptance Tests

- [ ] TBD

## Manual Verification

- [ ] TBD
EOF

cat > "$dir/TASKS.md" <<'EOF'
# Tasks

- [ ] Read required planning docs
- [ ] Read PITFALLS.md
- [ ] Read LESSONS_LEARNED.md
- [ ] Research existing codebase patterns
- [ ] Research best practices
- [ ] Create or update Mermaid diagram
- [ ] Write SPEC.md
- [ ] Write IMPACT.md
- [ ] Write PLAN.md
- [ ] Write TEST_CONTRACT.md
- [ ] Add failing tests or verification
- [ ] Implement feature
- [ ] Run verification
- [ ] Update docs
- [ ] Review changed files
- [ ] Remove unnecessary files/code
- [ ] Update STATE.md
- [ ] Update FEATURE_INDEX.md
- [ ] Update SPEC_CHANGELOG.md
- [ ] Mark completed tasks
EOF

cat > "$dir/VERIFICATION.md" <<'EOF'
# Verification

- [ ] Define commands
- [ ] Run commands
- [ ] Record results

| Command | Result | Evidence |
|---|---|---|
| TBD | TBD | TBD |
EOF

cat > "$dir/REVIEW.md" <<'EOF'
# Review

- [ ] Changed files reviewed
- [ ] Missing docs checked
- [ ] Debug logs removed
- [ ] Unnecessary changes removed

## Findings

| Severity | File | Issue | Follow-Up |
|---|---|---|---|
| TBD | TBD | TBD | TBD |
EOF

cat > "$dir/DIAGRAM.mmd" <<'EOF'
flowchart LR
  User["User"] --> Feature["Feature"]
  Feature --> System["System"]
EOF

echo "$dir"
