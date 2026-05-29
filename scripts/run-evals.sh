#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_dir="$repo_root/.codex/skills/project-genesis-harness"

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
assert_contains "$repo_root/.codex-plugin/plugin.json" '"project-genesis-harness"'

for ref in workflows.md planning-schema.md research-rubric.md quality-rubric.md; do
  assert_file "$skill_dir/references/$ref"
  assert_contains "$skill_dir/SKILL.md" "references/$ref"
done

assert_contains "$repo_root/scripts/install.sh" '--target agents|legacy|both'
assert_contains "$repo_root/scripts/uninstall.sh" '--target agents|legacy|both'
assert_contains "$repo_root/bin/genesis-harness.js" '--target agents|legacy|both'
assert_contains "$repo_root/package.json" '".codex-plugin"'
assert_contains "$repo_root/README.md" '.agents/skills'

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

CODEX_HOME="$tmp/codex" GENESIS_HARNESS_HOME="$tmp/agents" bash "$repo_root/scripts/install.sh" --target both >/dev/null
[ -f "$tmp/agents/skills/project-genesis-harness/SKILL.md" ] || fail "agents install target missing"
[ -f "$tmp/codex/skills/project-genesis-harness/SKILL.md" ] || fail "legacy install target missing"
bash "$repo_root/scripts/verify.sh" "$tmp/agents/skills/project-genesis-harness" >/dev/null
bash "$repo_root/scripts/verify.sh" "$tmp/codex/skills/project-genesis-harness" >/dev/null
CODEX_HOME="$tmp/codex" GENESIS_HARNESS_HOME="$tmp/agents" bash "$repo_root/scripts/uninstall.sh" --target both >/dev/null
[ ! -e "$tmp/agents/skills/project-genesis-harness" ] || fail "agents uninstall target remains"
[ ! -e "$tmp/codex/skills/project-genesis-harness" ] || fail "legacy uninstall target remains"

echo "evals passed"
