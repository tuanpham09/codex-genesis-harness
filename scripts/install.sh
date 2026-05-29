#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_name="project-genesis-harness"
source_dir="$repo_root/.codex/skills/$skill_name"
codex_home="${CODEX_HOME:-$HOME/.codex}"
target_dir="$codex_home/skills/$skill_name"

if [ ! -f "$source_dir/SKILL.md" ]; then
  echo "Missing skill source: $source_dir/SKILL.md" >&2
  exit 1
fi

mkdir -p "$codex_home/skills"

if [ -e "$target_dir" ]; then
  backup_dir="${target_dir}.backup.$(date +%Y%m%d%H%M%S)"
  mv "$target_dir" "$backup_dir"
  echo "Existing skill backed up to: $backup_dir"
fi

cp -R "$source_dir" "$target_dir"
find "$target_dir/scripts" -type f -name '*.sh' -exec chmod +x {} \;

echo "Installed $skill_name to: $target_dir"
echo "Invoke it in Codex with: Use \$$skill_name"

