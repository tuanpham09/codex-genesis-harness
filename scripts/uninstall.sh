#!/usr/bin/env bash
set -euo pipefail

skill_name="project-genesis-harness"
codex_home="${CODEX_HOME:-$HOME/.codex}"
agents_home="${GENESIS_HARNESS_HOME:-$HOME/.agents}"
target="both"

usage() {
  echo "Usage: $0 [--target agents|legacy|both]" >&2
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

remove_one() {
  local target_dir="$1"
  if [ ! -e "$target_dir" ]; then
    echo "Skill is not installed at: $target_dir"
    return
  fi
  rm -rf "$target_dir"
  echo "Removed: $target_dir"
}

if [ "$target" = "agents" ] || [ "$target" = "both" ]; then
  remove_one "$agents_home/skills/$skill_name"
fi

if [ "$target" = "legacy" ] || [ "$target" = "both" ]; then
  remove_one "$codex_home/skills/$skill_name"
fi
