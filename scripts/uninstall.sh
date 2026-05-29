#!/usr/bin/env bash
set -euo pipefail

skill_name="project-genesis-harness"
codex_home="${CODEX_HOME:-$HOME/.codex}"
target_dir="$codex_home/skills/$skill_name"

if [ ! -e "$target_dir" ]; then
  echo "Skill is not installed at: $target_dir"
  exit 0
fi

rm -rf "$target_dir"
echo "Removed: $target_dir"

