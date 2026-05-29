#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

if [ ! -f .planning/SPEC_CHANGELOG.md ]; then
  echo "Missing .planning/SPEC_CHANGELOG.md"
  exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  changed="$(git diff --name-only HEAD 2>/dev/null || git diff --name-only)"
  spec_affecting="$(printf '%s\n' "$changed" | grep -E 'api|route|schema|migration|model|ui|component|config|env|auth|security|integration' || true)"
  changelog_changed="$(printf '%s\n' "$changed" | grep -x '.planning/SPEC_CHANGELOG.md' || true)"
  if [ -n "$spec_affecting" ] && [ -z "$changelog_changed" ]; then
    echo "Spec-affecting files changed but SPEC_CHANGELOG.md was not updated:"
    echo "$spec_affecting"
    exit 1
  fi
fi

echo "Spec changelog check passed."

