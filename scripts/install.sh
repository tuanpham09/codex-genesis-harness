#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_names=(genesis-harness genesis-new-design genesis-upgrade-design)
source_root="$repo_root/.codex/skills"
codex_home="${CODEX_HOME:-$HOME/.codex}"
agents_home="${GENESIS_HARNESS_HOME:-$HOME/.agents}"
target="both"

usage() {
  echo "Usage: $0 [--target agents|legacy|both]" >&2
  echo "  agents: install to ${agents_home}/skills" >&2
  echo "  legacy: install to ${codex_home}/skills" >&2
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

for skill_name in "${skill_names[@]}"; do
  if [ ! -f "$source_root/$skill_name/SKILL.md" ]; then
    echo "Missing skill source: $source_root/$skill_name/SKILL.md" >&2
    exit 1
  fi
done

install_one() {
  local target_root="$1"
  mkdir -p "$target_root"

  for skill_name in "${skill_names[@]}"; do
    local source_dir="$source_root/$skill_name"
    local target_dir="$target_root/$skill_name"

    if [ -e "$target_dir" ]; then
      backup_dir="${target_dir}.backup.$(date +%Y%m%d%H%M%S)"
      mv "$target_dir" "$backup_dir"
      echo "Existing skill backed up to: $backup_dir"
    fi

    cp -R "$source_dir" "$target_dir"
    if [ -d "$target_dir/scripts" ]; then
      find "$target_dir/scripts" -type f -name '*.sh' -exec chmod +x {} \;
    fi
    echo "Installed $skill_name to: $target_dir"
  done
}

if [ "$target" = "agents" ] || [ "$target" = "both" ]; then
  install_one "$agents_home/skills"
fi

if [ "$target" = "legacy" ] || [ "$target" = "both" ]; then
  install_one "$codex_home/skills"
fi

echo "Invoke it in Codex with: Use \$genesis-harness"
