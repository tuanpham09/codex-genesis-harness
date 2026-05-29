#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_name="project-genesis-harness"
source_dir="$repo_root/.codex/skills/$skill_name"
codex_home="${CODEX_HOME:-$HOME/.codex}"
agents_home="${GENESIS_HARNESS_HOME:-$HOME/.agents}"
target="both"

usage() {
  echo "Usage: $0 [--target agents|legacy|both]" >&2
  echo "  agents: install to ${agents_home}/skills/${skill_name}" >&2
  echo "  legacy: install to ${codex_home}/skills/${skill_name}" >&2
  echo "  both: install to both locations" >&2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      target="${2:-}"
      [ -n "$target" ] || { usage; exit 2; }
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

case "$target" in
  agents|legacy|both) ;;
  *) usage; exit 2 ;;
esac

if [ ! -f "$source_dir/SKILL.md" ]; then
  echo "Missing skill source: $source_dir/SKILL.md" >&2
  exit 1
fi

install_one() {
  local target_dir="$1"
  mkdir -p "$(dirname "$target_dir")"

  if [ -e "$target_dir" ]; then
    backup_dir="${target_dir}.backup.$(date +%Y%m%d%H%M%S)"
    mv "$target_dir" "$backup_dir"
    echo "Existing skill backed up to: $backup_dir"
  fi

  cp -R "$source_dir" "$target_dir"
  find "$target_dir/scripts" -type f -name '*.sh' -exec chmod +x {} \;
  echo "Installed $skill_name to: $target_dir"
}

if [ "$target" = "agents" ] || [ "$target" = "both" ]; then
  install_one "$agents_home/skills/$skill_name"
fi

if [ "$target" = "legacy" ] || [ "$target" = "both" ]; then
  install_one "$codex_home/skills/$skill_name"
fi

echo "Invoke it in Codex with: Use \$$skill_name"
