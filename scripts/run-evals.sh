#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_root="$repo_root/.codex/skills"
harness_dir="$skill_root/genesis-harness"
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
)

fail() {
  echo "eval failed: $*" >&2
  exit 1
}

assert_file() {
  [ -f "$1" ] || fail "missing file: ${1#$repo_root/}"
}

assert_contains() {
  local file="$1"
  local text="$2"
  grep -q -- "$text" "$file" || fail "missing '$text' in ${file#$repo_root/}"
}

assert_file "$repo_root/.codex-plugin/plugin.json"
assert_contains "$repo_root/.codex-plugin/plugin.json" '"skills"'
assert_contains "$repo_root/.codex-plugin/plugin.json" '"genesis-skill-set"'

for ref in workflows.md planning-schema.md research-rubric.md quality-rubric.md; do
  assert_file "$harness_dir/references/$ref"
  assert_contains "$harness_dir/SKILL.md" "references/$ref"
done

for skill_name in "${skill_names[@]}"; do
  assert_file "$skill_root/$skill_name/SKILL.md"
  assert_file "$skill_root/$skill_name/agents/openai.yaml"
  
  expected_name="$skill_name"
  case "$skill_name" in
    genesis-architecture) expected_name="architecture-skill" ;;
    genesis-planning) expected_name="planning-skill" ;;
    genesis-codebase-map) expected_name="codebase-map-skill" ;;
    genesis-design-spec) expected_name="design-spec-skill" ;;
    genesis-api-contract) expected_name="api-contract-skill" ;;
    genesis-harness-engineering) expected_name="harness-engineering-skill" ;;
    genesis-ai-provider) expected_name="ai-provider-skill" ;;
    genesis-pipeline-orchestration) expected_name="pipeline-orchestration-skill" ;;
    genesis-research) expected_name="research-skill" ;;
    genesis-docs) expected_name="docs-skill" ;;
    genesis-release) expected_name="release-skill" ;;
    genesis-api-sync) expected_name="api-sync-skill" ;;
    genesis-debug-guide) expected_name="debug-guide-skill" ;;
  esac

  assert_contains "$skill_root/$skill_name/SKILL.md" "name: $expected_name"
done

assert_contains "$repo_root/scripts/install.sh" '--target agents|legacy|both'
assert_contains "$repo_root/scripts/uninstall.sh" '--target agents|legacy|both'
assert_contains "$repo_root/bin/genesis-harness.js" '--target agents|legacy|both'
assert_contains "$repo_root/package.json" '".codex-plugin"'
assert_contains "$repo_root/package.json" '".codebase"'
assert_contains "$repo_root/package.json" '"contracts"'
assert_contains "$repo_root/package.json" '"fixtures"'
assert_contains "$repo_root/package.json" '"playwright"'
assert_contains "$repo_root/package.json" '"observability"'
assert_contains "$repo_root/README.md" '.codex/skills/'

for skill_name in "${skill_names[@]}"; do
  assert_contains "$repo_root/bin/genesis-harness.js" "$skill_name"
  assert_contains "$repo_root/scripts/install.sh" "$skill_name"
  assert_contains "$repo_root/scripts/uninstall.sh" "$skill_name"
done

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

CODEX_HOME="$tmp/codex" GENESIS_HARNESS_HOME="$tmp/agents" bash "$repo_root/scripts/install.sh" --target both >/dev/null
for skill_name in "${skill_names[@]}"; do
  [ -f "$tmp/agents/skills/$skill_name/SKILL.md" ] || fail "agents install target missing: $skill_name"
  [ -f "$tmp/codex/skills/$skill_name/SKILL.md" ] || fail "legacy install target missing: $skill_name"
done
bash "$repo_root/scripts/verify.sh" "$tmp/agents/skills" >/dev/null
bash "$repo_root/scripts/verify.sh" "$tmp/codex/skills" >/dev/null
CODEX_HOME="$tmp/codex" GENESIS_HARNESS_HOME="$tmp/agents" bash "$repo_root/scripts/uninstall.sh" --target both >/dev/null
for skill_name in "${skill_names[@]}" project-genesis-harness; do
  [ ! -e "$tmp/agents/skills/$skill_name" ] || fail "agents uninstall target remains: $skill_name"
  [ ! -e "$tmp/codex/skills/$skill_name" ] || fail "legacy uninstall target remains: $skill_name"
done

echo "evals passed"
