#!/usr/bin/env bash
set -euo pipefail

skill_names=(
  genesis-harness
  genesis-new-design
  genesis-upgrade-design
  genesis-architecture
  genesis-planning
  genesis-codebase-map
  genesis-design-spec
  genesis-api-contract
  ui-ux-test-skill
  genesis-harness-engineering
  genesis-ai-provider
  genesis-pipeline-orchestration
  genesis-research
  genesis-docs
  genesis-release
  genesis-api-sync
  genesis-debug-guide
  genesis-docs-automation
  genesis-spec-propagation
  genesis-release-orchestration
  genesis-performance-profiling
  genesis-observability-automation
  genesis-research-first
  spec-impact-engine
  project-genesis-harness
)
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
  local target_root="$1"
  for skill_name in "${skill_names[@]}"; do
    local target_dir="$target_root/$skill_name"
    if [ ! -e "$target_dir" ]; then
      echo "Skill is not installed at: $target_dir"
      continue
    fi
    rm -rf "$target_dir"
    echo "Removed: $target_dir"
  done
}

if [ "$target" = "agents" ] || [ "$target" = "both" ]; then
  remove_one "$agents_home/skills"
fi

if [ "$target" = "legacy" ] || [ "$target" = "both" ]; then
  remove_one "$codex_home/skills"
fi
