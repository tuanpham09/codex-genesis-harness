#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git status --short
else
  echo "Not a git repository; changed files cannot be listed with git."
fi

