#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <root> <current-phase> <active-work> <last-completed-task> <next-task> <latest-verification>" >&2
  exit 2
}

root="${1:-}"
phase="${2:-}"
active="${3:-}"
last="${4:-}"
next="${5:-}"
verification="${6:-}"

[ -n "$root" ] && [ -n "$phase" ] && [ -n "$active" ] && [ -n "$last" ] && [ -n "$next" ] && [ -n "$verification" ] || usage

cd "$root"
mkdir -p .planning

cat > .planning/STATE.md <<EOF
# State

Current project state: [~] Active
Current phase: $phase
Current feature or bug: $active
Last completed task: $last
Next task: $next
Blocked items: None recorded
Latest verification result: $verification
EOF

echo ".planning/STATE.md"
