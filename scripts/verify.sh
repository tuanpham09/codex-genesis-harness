#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_dir="${1:-$repo_root/.codex/skills/project-genesis-harness}"

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

[ -f "$skill_dir/SKILL.md" ] || fail "missing SKILL.md"
[ -d "$skill_dir/resources" ] || fail "missing resources/"
[ -d "$skill_dir/scripts" ] || fail "missing scripts/"
[ -f "$skill_dir/agents/openai.yaml" ] || fail "missing agents/openai.yaml"

grep -q '^name: project-genesis-harness$' "$skill_dir/SKILL.md" || fail "invalid skill name frontmatter"
grep -q '^description:' "$skill_dir/SKILL.md" || fail "missing description frontmatter"
grep -q 'Definition Of Ready' "$skill_dir/SKILL.md" || fail "missing Definition Of Ready"
grep -q 'Definition Of Done' "$skill_dir/SKILL.md" || fail "missing Definition Of Done"
grep -q 'Quality Rubric' "$skill_dir/SKILL.md" || fail "missing Quality Rubric"

for file in "${required_resources[@]}"; do
  [ -f "$skill_dir/resources/$file" ] || fail "missing resource: $file"
done

for file in "${required_scripts[@]}"; do
  [ -f "$skill_dir/scripts/$file" ] || fail "missing script: $file"
  [ -x "$skill_dir/scripts/$file" ] || fail "script is not executable: $file"
done

bash -n "$skill_dir"/scripts/*.sh

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

set +e
"$skill_dir/scripts/init-planning.sh" --root "$tmp" >/dev/null 2>"$tmp/init.err"
code=$?
set -e
[ "$code" -eq 2 ] || fail "init-planning.sh should require confirmation"

"$skill_dir/scripts/init-planning.sh" --confirmed --root "$tmp" >/dev/null
"$skill_dir/scripts/create-feature.sh" sample-feature "Sample Feature" "$tmp" >/dev/null
"$skill_dir/scripts/create-bug.sh" sample-bug "Sample Bug" "$tmp" >/dev/null
"$skill_dir/scripts/create-adr.sh" use-sqlite "Use SQLite" "$tmp" >/dev/null
"$skill_dir/scripts/update-state.sh" "$tmp" "01 Foundation" "features/001-sample-feature" "Created scaffold" "Fill plan" "Smoke passed" >/dev/null
"$skill_dir/scripts/check-required-planning-files.sh" "$tmp"
"$skill_dir/scripts/check-task-tracking.sh" "$tmp"
"$skill_dir/scripts/check-architecture-boundaries.sh" "$tmp"
"$skill_dir/scripts/check-no-debug-logs.sh" "$tmp" >/dev/null

echo "verify passed: $skill_dir"
