#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

if [ ! -d .planning ]; then
  echo "Missing .planning directory."
  exit 1
fi

status=0
while IFS= read -r file; do
  case "$file" in
    *TASKS.md|*PLAN.md|*REVIEW.md|*VERIFICATION.md|.planning/ROADMAP.md|.planning/STATE.md|.planning/SUMMARY.md)
      if ! grep -Eq '\[( |~|x|!)\]' "$file"; then
        echo "No checkbox tracking found: $file"
        status=1
      fi
      ;;
  esac
done < <(find .planning -type f -name '*.md' | sort)

exit "$status"

