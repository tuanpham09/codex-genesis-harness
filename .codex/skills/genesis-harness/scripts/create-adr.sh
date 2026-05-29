#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <slug> [title] [root]" >&2
  exit 2
}

slug="${1:-}"
title="${2:-$slug}"
root="${3:-.}"
[ -n "$slug" ] || usage

case "$slug" in
  *[!a-z0-9-]*|'') echo "Slug must use lowercase letters, numbers, and hyphens." >&2; exit 2 ;;
esac

cd "$root"
mkdir -p .planning/decisions

next="$(
  find .planning/decisions -maxdepth 1 -type f -name 'ADR-[0-9][0-9][0-9]-*.md' 2>/dev/null \
    | sed -E 's#.*/ADR-([0-9]{3})-.*#\1#' \
    | sort -n \
    | tail -1
)"
if [ -z "$next" ]; then
  number="001"
else
  number="$(printf '%03d' "$((10#$next + 1))")"
fi

file=".planning/decisions/ADR-${number}-${slug}.md"
if [ -e "$file" ]; then
  echo "ADR already exists: $file" >&2
  exit 1
fi

cat > "$file" <<EOF
# ADR-${number}: $title

Status: Proposed
Date: $(date +%Y-%m-%d)

## Context

TBD

## Decision

TBD

## Alternatives Considered

- [ ] TBD

## Consequences

- [ ] TBD

## Risks

- [ ] TBD

## Mitigation

- [ ] TBD

## Verification Evidence

TBD
EOF

echo "$file"
