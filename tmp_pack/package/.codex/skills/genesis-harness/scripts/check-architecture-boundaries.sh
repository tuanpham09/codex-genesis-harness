#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

status=0
for file in .planning/ARCHITECTURE.md .planning/diagrams/system-context.mmd .planning/diagrams/container-architecture.mmd; do
  if [ ! -s "$file" ]; then
    echo "Missing or empty architecture source: $file"
    status=1
  fi
done

if [ -f .planning/ARCHITECTURE.md ]; then
  if ! grep -Eiq 'boundary|boundaries|dependency|forbidden|data flow' .planning/ARCHITECTURE.md; then
    echo "ARCHITECTURE.md should document boundaries, dependency direction, forbidden patterns, or data flow."
    status=1
  fi
fi

exit "$status"

