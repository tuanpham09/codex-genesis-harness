#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

exclude='\.planning/|\.codex/skills/|node_modules/|vendor/|\.git/|build/|dist/|coverage/'
pattern='console\.log|debugger;|var_dump\(|dd\(|print_r\(|pdb\.set_trace\(|binding\.pry|puts\s+["'\'']DEBUG|System\.out\.println'

if command -v rg >/dev/null 2>&1; then
  matches="$(rg -n --hidden -g '!.planning' -g '!.codex/skills' -g '!node_modules' -g '!vendor' -g '!dist' -g '!build' -g '!coverage' "$pattern" . || true)"
else
  matches="$(grep -RInE "$pattern" . 2>/dev/null | grep -Ev "$exclude" || true)"
fi

if [ -n "$matches" ]; then
  echo "$matches"
  exit 1
fi

echo "No obvious debug logs found."
