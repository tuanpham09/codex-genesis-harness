#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository; docs sync check is limited to required files."
  test -f .planning/SPEC_CHANGELOG.md
  exit $?
fi

changed="$(git diff --name-only HEAD 2>/dev/null || git diff --name-only)"
docs_pattern='^(\.planning/|\.codebase/|\.codex/SKILLS_INDEX\.md|docs/|README(\.[A-Z]{2})?\.md|AGENTS\.md|CHANGELOG\.md)'
docs_changed="$(printf '%s\n' "$changed" | grep -E "$docs_pattern" || true)"
code_changed="$(printf '%s\n' "$changed" | grep -Ev "$docs_pattern" || true)"

if [ -n "$code_changed" ] && [ -z "$docs_changed" ]; then
  echo "Code changed but no planning/docs files changed."
  echo "$code_changed"
  exit 1
fi

echo "Docs sync check passed or no code changes detected."
