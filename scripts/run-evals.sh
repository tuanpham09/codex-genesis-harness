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
  genesis-ui-ux-test
  genesis-harness-engineering
  genesis-ai-provider
  genesis-pipeline-orchestration
  genesis-api-sync
  genesis-debug-guide
  genesis-docs-automation
  genesis-spec-propagation
  genesis-performance-profiling
  genesis-observability-automation
  genesis-research-first
  genesis-release
  spec-impact-engine
  genesis-executing-plans
  genesis-test-driven-development
  genesis-verification-before-completion
  genesis-using-git-worktrees
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
  grep -Fq -- "$text" "$file" || fail "missing '$text' in ${file#$repo_root/}"
}

assert_not_contains() {
  local file="$1"
  local text="$2"
  ! grep -Fq -- "$text" "$file" || fail "unexpected '$text' in ${file#$repo_root/}"
}

assert_file "$repo_root/.codex-plugin/plugin.json"
assert_contains "$repo_root/.codex-plugin/plugin.json" '"skills"'
assert_contains "$repo_root/.codex-plugin/plugin.json" '"genesis-skill-set"'
assert_contains "$repo_root/.codex-plugin/plugin.json" '$genesis-pipeline-orchestration'
assert_contains "$repo_root/.codex-plugin/plugin.json" '$genesis-api-contract'
assert_not_contains "$repo_root/.codex-plugin/plugin.json" '$pipeline-orchestration-skill'
assert_not_contains "$repo_root/.codex-plugin/plugin.json" '$api-contract-skill'
assert_contains "$harness_dir/SKILL.md" '/genesis-init'
assert_contains "$repo_root/.codex/SKILLS_INDEX.md" '/genesis-init'
assert_contains "$repo_root/bin/genesis-harness.js" 'genesis-harness docs-gate'
assert_contains "$repo_root/bin/genesis-harness.js" 'check-docs-sync.sh'
assert_contains "$repo_root/bin/genesis-harness.js" 'npx genesis-harness docs-gate'
assert_contains "$harness_dir/scripts/check-docs-sync.sh" '.codebase/'
assert_contains "$harness_dir/scripts/check-docs-sync.sh" 'README(\.[A-Z]{2})?\.md'
assert_contains "$repo_root/.codebase/VISUAL_GRAPH.md" 'genesis-harness'
assert_contains "$repo_root/.codebase/PIPELINE_FLOW.md" 'fixture --> contracts["Update contracts when behavior changes"]'
assert_contains "$repo_root/.codebase/PIPELINE_FLOW.md" 'contracts --> impl'
assert_not_contains "$repo_root/.codebase/VISUAL_GRAPH.md" 'Đăng nhập'
assert_not_contains "$repo_root/.codebase/VISUAL_GRAPH.md" 'src/auth.js'
assert_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" 'Harness Drift Gate Hardening'
assert_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" '2026-06-03'
assert_not_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" '_[Name and reference]_'
assert_not_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" 'Feature A'
assert_not_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" 'YYYY-MM-DD'
assert_contains "$repo_root/.codebase/state.json" '"completed_at": "2026-06-03'
assert_contains "$repo_root/.codebase/CURRENT_STATE.md" '2026-06-03'
assert_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" 'npm run eval'
assert_not_contains "$repo_root/.codebase/IMPLEMENTATION_HANDOFF.md" 'rtk '
assert_not_contains "$repo_root/.codebase/state.json" 'rtk '

for ref in workflows.md planning-schema.md research-rubric.md quality-rubric.md; do
  assert_file "$harness_dir/references/$ref"
  assert_contains "$harness_dir/SKILL.md" "references/$ref"
done

for skill_name in "${skill_names[@]}"; do
  assert_file "$skill_root/$skill_name/SKILL.md"
  assert_file "$skill_root/$skill_name/agents/openai.yaml"
  assert_contains "$skill_root/$skill_name/SKILL.md" "name: $skill_name"
done

assert_contains "$repo_root/scripts/install.sh" '--target agents|legacy|both'
assert_contains "$repo_root/scripts/uninstall.sh" '--target agents|legacy|both'
assert_contains "$repo_root/bin/genesis-harness.js" '--target agents|legacy|both'
assert_contains "$repo_root/package.json" '".codex-plugin"'
assert_contains "$repo_root/package.json" '".codebase"'
assert_contains "$repo_root/package.json" '"contracts"'
assert_contains "$repo_root/package.json" '"features"'
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

install_seed_tmp="$(mktemp -d)"
printf '{"name":"leanctx-install-fixture"}\n' > "$install_seed_tmp/package.json"
(
  cd "$install_seed_tmp"
  CODEX_HOME="$tmp/codex" GENESIS_HARNESS_HOME="$tmp/agents" node "$repo_root/bin/genesis-harness.js" install --target agents >/dev/null
)
assert_file "$install_seed_tmp/.codebase/context-policy.json"
assert_contains "$install_seed_tmp/.codebase/context-policy.json" '"token_budget": 12000'

assert_contains "$repo_root/bin/genesis-harness.js" "genesis-harness remember"
assert_contains "$repo_root/bin/genesis-harness.js" "genesis-harness recall"
assert_contains "$repo_root/bin/genesis-harness.js" 'genesis-harness docs-gate'
assert_contains "$repo_root/bin/genesis-harness.js" 'genesis-harness verify-gate'
assert_contains "$repo_root/bin/genesis-harness.js" 'genesis-harness cold-start'
assert_contains "$repo_root/bin/genesis-harness.js" "genesis-harness remember"
assert_contains "$repo_root/bin/genesis-harness.js" "genesis-harness leanctx"
assert_contains "$repo_root/bin/genesis-harness.js" "seedLeanCtxPolicy"
assert_contains "$repo_root/bin/genesis-harness.js" "genesis-harness view-mockup"
assert_file "$repo_root/.codebase/context-policy.json"
assert_contains "$repo_root/.codebase/context-policy.json" '"token_budget"'
assert_contains "$repo_root/scripts/prompt_sentinel.js" 'context-policy.json'
assert_contains "$repo_root/README.md" 'LeanCTX'
assert_contains "$repo_root/README.VI.md" 'LeanCTX'
assert_contains "$repo_root/README.EN.md" 'LeanCTX'

# Test Beads Memory Commands
node "$repo_root/bin/genesis-harness.js" remember evalsmoke "Verify that evals can store facts." >/dev/null
node "$repo_root/bin/genesis-harness.js" recall evalsmoke | grep -q "Verify that evals" || fail "recall failed to find test fact"
node "$repo_root/bin/genesis-harness.js" prime | grep -q "Verify that evals" || fail "prime failed to include test fact"
node "$repo_root/bin/genesis-harness.js" leanctx | grep -q "rtk optional" || fail "leanctx must keep rtk optional"

# Find the ID of the stored fact to forget it
bead_id=$(node "$repo_root/bin/genesis-harness.js" recall evalsmoke | grep -o "\[[0-9a-f]\{6\}\]" | head -n 1 | tr -d '[]')
node "$repo_root/bin/genesis-harness.js" forget "$bead_id" >/dev/null
node "$repo_root/bin/genesis-harness.js" recall evalsmoke | grep -q "Verify that evals" && fail "forget failed to delete test fact" || true

for unit_test in "$repo_root"/tests/unit/*.test.js; do
  node "$unit_test" >/dev/null
done

node "$repo_root/tests/integration/cli-smoke.test.js" >/dev/null

sync_tmp="$(mktemp -d)"
mkdir -p "$sync_tmp/.codebase" "$sync_tmp/src"
printf '# Current State: Sync Fixture\n' > "$sync_tmp/.codebase/CURRENT_STATE.md"
printf 'export const answer = 42;\n' > "$sync_tmp/src/index.js"
(
  cd "$sync_tmp"
  node "$repo_root/bin/genesis-harness.js" sync >/dev/null
)
assert_contains "$sync_tmp/.codebase/VISUAL_GRAPH.md" 'Harness Relationship Map'
assert_contains "$sync_tmp/.codebase/VISUAL_GRAPH.md" 'genesis-harness docs-gate'
assert_contains "$sync_tmp/.codebase/VISUAL_GRAPH.md" '```mermaid'
assert_not_contains "$sync_tmp/.codebase/VISUAL_GRAPH.md" 'Đăng nhập'
assert_not_contains "$sync_tmp/.codebase/VISUAL_GRAPH.md" 'src/auth.js'

# Test Packaged Install (Tarball)
echo "Running tarball smoke test..."
pack_tmp="$(mktemp -d)"
npm pack --pack-destination "$pack_tmp" >/dev/null
tarball_path=$(ls "$pack_tmp"/*.tgz | head -n 1)
[ -f "$tarball_path" ] || fail "npm pack failed to produce tarball"
(
  cd "$pack_tmp"
  tar xzf "$tarball_path"
  cd package
  bash scripts/verify.sh .codex/skills >/dev/null || exit 1
) || fail "verification failed on packaged tarball"
rm -rf "$pack_tmp"

# L08 — Feature Registry as Harness Primitive
# Ensures features/REGISTRY.md exists and is schema-valid with verify_cmd per feature.
assert_file "$repo_root/features/REGISTRY.md"
assert_contains "$repo_root/features/REGISTRY.md" "| id |"
assert_contains "$repo_root/features/REGISTRY.md" "| status |"
assert_contains "$repo_root/features/REGISTRY.md" "| verify_cmd |"
assert_file "$repo_root/contracts/features/registry-schema.json"
assert_contains "$repo_root/contracts/features/registry-schema.json" '"required_columns"'
assert_contains "$repo_root/.codebase/MODULE_INDEX.md" "features/REGISTRY.md"

# L11 — Observability Live Data
# Ensures observability directories contain actual schema-backed data, not empty scaffolding.
assert_file "$repo_root/contracts/observability/agent-run-schema.json"
assert_contains "$repo_root/contracts/observability/agent-run-schema.json" '"required_fields"'
assert_file "$repo_root/contracts/observability/failure-schema.json"
assert_contains "$repo_root/contracts/observability/failure-schema.json" '"required_fields"'
assert_file "$repo_root/observability/agent-runs/sample-run.json"
assert_contains "$repo_root/observability/agent-runs/sample-run.json" '"session_id"'
assert_contains "$repo_root/observability/agent-runs/sample-run.json" '"outcome"'
assert_file "$repo_root/observability/failures/sample-failure.json"
assert_contains "$repo_root/observability/failures/sample-failure.json" '"error_type"'
assert_file "$repo_root/observability/decision-logs/sample-decision.md"
# Must be a real decision, not the blank template
! grep -Fq "What changed." "$repo_root/observability/decision-logs/sample-decision.md" \
  || fail "L11: decision-logs/sample-decision.md must be a real decision, not a blank template"

echo "evals passed"
