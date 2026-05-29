#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_root="${1:-$repo_root/.codex/skills}"
skill_names=(genesis-harness genesis-new-design genesis-upgrade-design)

required_resources=(
  planning-tree-template.md
  agents-template.md
  project-template.md
  requirements-template.md
  stack-template.md
  architecture-template.md
  design-template.md
  api-docs-template.md
  integrations-template.md
  conventions-template.md
  pitfalls-template.md
  lessons-learned-template.md
  spec-changelog-template.md
  quality-score-template.md
  escalation-template.md
  observability-template.md
  journeys-template.md
  phase-template.md
  feature-template.md
  bug-template.md
  decision-template.md
  research-template.md
  review-template.md
  verification-template.md
  audit-template.md
  check-template.md
)

required_scripts=(
  init-planning.sh
  detect-stack.sh
  list-changed-files.sh
  run-verification.sh
  check-docs-sync.sh
  check-task-tracking.sh
  check-no-debug-logs.sh
  check-spec-changelog.sh
  check-required-planning-files.sh
  check-architecture-boundaries.sh
  create-feature.sh
  create-bug.sh
  create-adr.sh
  update-state.sh
)

fail() {
  echo "verify failed: $*" >&2
  exit 1
}

[ -f "$repo_root/.codex-plugin/plugin.json" ] || fail "missing .codex-plugin/plugin.json"

grep -q '"skills"' "$repo_root/.codex-plugin/plugin.json" || fail "plugin manifest missing skills path"

verify_skill_metadata() {
  local skill_dir="$1"
  local expected_name="$2"

  [ -f "$skill_dir/SKILL.md" ] || fail "missing SKILL.md: $skill_dir"
  [ -f "$skill_dir/agents/openai.yaml" ] || fail "missing agents/openai.yaml: $skill_dir"
  grep -q "^name: $expected_name$" "$skill_dir/SKILL.md" || fail "invalid skill name frontmatter: $skill_dir"
  grep -q '^description:' "$skill_dir/SKILL.md" || fail "missing description frontmatter: $skill_dir"
  grep -q 'default_prompt:' "$skill_dir/agents/openai.yaml" || fail "missing default_prompt: $skill_dir"
}

verify_harness_skill() {
  local skill_dir="$1"

  verify_skill_metadata "$skill_dir" genesis-harness
  [ -d "$skill_dir/resources" ] || fail "missing resources/"
  [ -d "$skill_dir/scripts" ] || fail "missing scripts/"
  grep -q 'Definition Of Ready' "$skill_dir/SKILL.md" || fail "missing Definition Of Ready"
  grep -q 'Definition Of Done' "$skill_dir/SKILL.md" || fail "missing Definition Of Done"
  grep -q 'Quality Rubric' "$skill_dir/SKILL.md" || fail "missing Quality Rubric"

  for ref in workflows.md planning-schema.md research-rubric.md quality-rubric.md; do
    [ -f "$skill_dir/references/$ref" ] || fail "missing reference: $ref"
    grep -q "references/$ref" "$skill_dir/SKILL.md" || fail "SKILL.md does not mention reference: $ref"
  done

  for file in "${required_resources[@]}"; do
    [ -f "$skill_dir/resources/$file" ] || fail "missing resource: $file"
  done

  for file in "${required_scripts[@]}"; do
    [ -f "$skill_dir/scripts/$file" ] || fail "missing script: $file"
    [ -x "$skill_dir/scripts/$file" ] || fail "script is not executable: $file"
  done

  bash -n "$skill_dir"/scripts/*.sh
}

verify_design_skill() {
  local skill_dir="$1"
  local expected_name="$2"

  verify_skill_metadata "$skill_dir" "$expected_name"
  grep -q 'frontend web' "$skill_dir/SKILL.md" || fail "design skill missing frontend web scope: $skill_dir"
  grep -q 'Verify' "$skill_dir/SKILL.md" || fail "design skill missing verification guidance: $skill_dir"
}

verified_harness=0

verify_one() {
  local skill_dir="$1"
  local expected_name
  expected_name="$(basename "$skill_dir")"

  case "$expected_name" in
    genesis-harness)
      verify_harness_skill "$skill_dir"
      verified_harness=1
      ;;
    genesis-new-design|genesis-upgrade-design)
      verify_design_skill "$skill_dir" "$expected_name"
      ;;
    *)
      fail "unknown skill for verification: $expected_name"
      ;;
  esac
}

if [ -f "$skill_root/SKILL.md" ]; then
  verify_one "$skill_root"
else
  for skill_name in "${skill_names[@]}"; do
    verify_one "$skill_root/$skill_name"
  done
fi

if [ "$verified_harness" -ne 1 ]; then
  echo "verify passed: $skill_root"
  exit 0
fi

harness_dir="$skill_root"
if [ ! -f "$harness_dir/SKILL.md" ]; then
  harness_dir="$skill_root/genesis-harness"
fi

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

set +e
"$harness_dir/scripts/init-planning.sh" --root "$tmp" >/dev/null 2>"$tmp/init.err"
code=$?
set -e
[ "$code" -eq 2 ] || fail "init-planning.sh should require confirmation"

"$harness_dir/scripts/init-planning.sh" --confirmed --root "$tmp" >/dev/null
"$harness_dir/scripts/create-feature.sh" sample-feature "Sample Feature" "$tmp" >/dev/null
"$harness_dir/scripts/create-bug.sh" sample-bug "Sample Bug" "$tmp" >/dev/null
"$harness_dir/scripts/create-adr.sh" use-sqlite "Use SQLite" "$tmp" >/dev/null
"$harness_dir/scripts/update-state.sh" "$tmp" "01 Foundation" "features/001-sample-feature" "Created scaffold" "Fill plan" "Smoke passed" >/dev/null
"$harness_dir/scripts/check-required-planning-files.sh" "$tmp"
"$harness_dir/scripts/check-task-tracking.sh" "$tmp"
"$harness_dir/scripts/check-architecture-boundaries.sh" "$tmp"
"$harness_dir/scripts/check-no-debug-logs.sh" "$tmp" >/dev/null

echo "verify passed: $skill_root"
