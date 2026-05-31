#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_root="${1:-$repo_root/.codex/skills}"
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

required_memory_files=(
  ARCHITECTURE.md
  CURRENT_STATE.md
  MODULE_INDEX.md
  DEPENDENCY_GRAPH.md
  DOMAIN_MODELS.md
  API_CONTRACTS.md
  TEST_MATRIX.md
  UI_ROUTES.md
  PIPELINE_FLOW.md
  KNOWN_PROBLEMS.md
  EVOLUTION_PLAN.md
)

required_context_files=(
  backend-summary.md
  frontend-summary.md
  pipeline-summary.md
  providers-summary.md
  render-summary.md
  tests-summary.md
)

required_contract_roots=(api agents events ui)
required_fixture_roots=(api agents pipeline render tts images videos)
required_test_roots=(contracts integration unit fixtures)
required_playwright_roots=(e2e smoke visual fixtures)
required_observability_roots=(agent-runs failures decision-logs)
required_agent_contracts=(
  StoryAnalysisAgent
  CharacterBibleAgent
  ScreenplayAgent
  ScenePlanningAgent
  PromptGenerationAgent
  ImageGenerationAgent
  VoiceGenerationAgent
  SubtitleGenerationAgent
  RenderAgent
  PipelineOrchestrator
)

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
  offload-log.sh
  compact-context.sh
  run-verify-loop.sh
)

fail() {
  echo "verify failed: $*" >&2
  exit 1
}

[ -f "$repo_root/.codex-plugin/plugin.json" ] || fail "missing .codex-plugin/plugin.json"

grep -q '"skills"' "$repo_root/.codex-plugin/plugin.json" || fail "plugin manifest missing skills path"

verify_repository_harness() {
  for file in "${required_memory_files[@]}"; do
    [ -f "$repo_root/.codebase/$file" ] || fail "missing codebase memory file: .codebase/$file"
  done

  for file in "${required_context_files[@]}"; do
    [ -f "$repo_root/.codebase/context/$file" ] || fail "missing context summary: .codebase/context/$file"
  done

  for dir in "${required_contract_roots[@]}"; do
    [ -d "$repo_root/contracts/$dir" ] || fail "missing contract directory: contracts/$dir"
  done

  for dir in "${required_fixture_roots[@]}"; do
    [ -d "$repo_root/fixtures/$dir" ] || fail "missing fixture directory: fixtures/$dir"
  done

  for dir in "${required_test_roots[@]}"; do
    [ -d "$repo_root/tests/$dir" ] || fail "missing test directory: tests/$dir"
  done

  for dir in "${required_playwright_roots[@]}"; do
    [ -d "$repo_root/playwright/$dir" ] || fail "missing playwright directory: playwright/$dir"
  done

  for dir in "${required_observability_roots[@]}"; do
    [ -d "$repo_root/observability/$dir" ] || fail "missing observability directory: observability/$dir"
  done

  for agent in "${required_agent_contracts[@]}"; do
    for file in request.json response.json schema.json example.json error.json; do
      [ -f "$repo_root/contracts/agents/$agent/$file" ] || fail "missing agent contract: contracts/agents/$agent/$file"
    done
  done

  [ -f "$repo_root/tests/contracts/contract-template.test.md" ] || fail "missing contract test template"
  [ -f "$repo_root/playwright/visual/visual-regression-template.md" ] || fail "missing visual regression template"
  [ -f "$repo_root/fixtures/agents/agent-fixture-template.md" ] || fail "missing agent fixture template"
  [ -f "$repo_root/observability/decision-logs/decision-log-template.md" ] || fail "missing decision log template"
}

verify_repository_harness

verify_skill_metadata() {
  local skill_dir="$1"
  local expected_name="$2"

  [ -f "$skill_dir/SKILL.md" ] || fail "missing SKILL.md: $skill_dir"
  [ -f "$skill_dir/agents/openai.yaml" ] || fail "missing agents/openai.yaml: $skill_dir"
  grep -q "^name: $expected_name[[:space:]]*$" "$skill_dir/SKILL.md" || fail "invalid skill name frontmatter (expected 'name: $expected_name'): $skill_dir"
  grep -q '^description:' "$skill_dir/SKILL.md" || fail "missing description frontmatter: $skill_dir"
  grep -q 'default_prompt:' "$skill_dir/agents/openai.yaml" || fail "missing default_prompt: $skill_dir"
}

verify_harness_skill() {
  local skill_dir="$1"

  verify_skill_metadata "$skill_dir" genesis-harness
  verify_skill_protocol "$skill_dir"
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
  verify_skill_protocol "$skill_dir"
  grep -q 'frontend web' "$skill_dir/SKILL.md" || fail "design skill missing frontend web scope: $skill_dir"
  grep -q 'Verify' "$skill_dir/SKILL.md" || fail "design skill missing verification guidance: $skill_dir"
}

verify_skill_protocol() {
  local skill_dir="$1"

  [ -d "$skill_dir/templates" ] || fail "missing templates/: $skill_dir"
  [ -d "$skill_dir/examples" ] || fail "missing examples/: $skill_dir"
  [ -d "$skill_dir/checklists" ] || fail "missing checklists/: $skill_dir"
  for section in Purpose "When to use" "When NOT to use" "Inputs required" "Outputs required" "Required tests" "Required fixtures" "Required contract updates" "Required codebase map updates" "Token saving rules" "Acceptance criteria" "Common mistakes" "Recovery workflow"; do
    grep -q "^## $section" "$skill_dir/SKILL.md" || fail "missing section '$section': $skill_dir"
  done
}

verify_playbook_skill() {
  local skill_dir="$1"

  [ -d "$skill_dir/templates" ] || fail "missing templates/: $skill_dir"
  [ -d "$skill_dir/checklists" ] || fail "missing checklists/: $skill_dir"
  [ -d "$skill_dir/playbooks" ] || fail "missing playbooks/: $skill_dir"
  [ -d "$skill_dir/observability" ] || fail "missing observability/: $skill_dir"
  [ -d "$skill_dir/examples" ] || fail "missing examples/: $skill_dir"
  for section in Purpose "When to use" "When NOT to use" "Inputs required" "Outputs required" "Required tests" "Required fixtures" "Required contract updates" "Required codebase map updates" "Token saving rules" "Acceptance criteria" "Common mistakes" "Recovery workflow"; do
    grep -q "^## $section" "$skill_dir/SKILL.md" || fail "missing section '$section': $skill_dir"
  done
}

verify_minimal_skill() {
  local skill_dir="$1"

  [ -d "$skill_dir/templates" ] || fail "missing templates/: $skill_dir"
  [ -d "$skill_dir/examples" ] || fail "missing examples/: $skill_dir"
}

verified_harness=0

verify_one() {
  local skill_dir="$1"
  local dir_name
  dir_name="$(basename "$skill_dir")"

  case "$dir_name" in
    genesis-harness)
      verify_harness_skill "$skill_dir"
      verified_harness=1
      ;;
    genesis-new-design|genesis-upgrade-design)
      verify_design_skill "$skill_dir" "$dir_name"
      ;;
    genesis-architecture)
      verify_skill_metadata "$skill_dir" "architecture-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-planning)
      verify_skill_metadata "$skill_dir" "planning-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-codebase-map)
      verify_skill_metadata "$skill_dir" "codebase-map-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-design-spec)
      verify_skill_metadata "$skill_dir" "design-spec-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-api-contract)
      verify_skill_metadata "$skill_dir" "api-contract-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    ui-ux-test-skill)
      verify_skill_metadata "$skill_dir" "ui-ux-test-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-harness-engineering)
      verify_skill_metadata "$skill_dir" "harness-engineering-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-ai-provider)
      verify_skill_metadata "$skill_dir" "ai-provider-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-pipeline-orchestration)
      verify_skill_metadata "$skill_dir" "pipeline-orchestration-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-research)
      verify_skill_metadata "$skill_dir" "research-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-docs)
      verify_skill_metadata "$skill_dir" "docs-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-release)
      verify_skill_metadata "$skill_dir" "release-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-api-sync)
      verify_skill_metadata "$skill_dir" "api-sync-skill"
      verify_skill_protocol "$skill_dir"
      ;;
    genesis-debug-guide)
      verify_skill_metadata "$skill_dir" "debug-guide-skill"
      verify_playbook_skill "$skill_dir"
      ;;
    genesis-docs-automation|genesis-spec-propagation|genesis-release-orchestration|genesis-performance-profiling|genesis-observability-automation)
      verify_skill_metadata "$skill_dir" "$dir_name"
      verify_playbook_skill "$skill_dir"
      ;;
    genesis-research-first|spec-impact-engine)
      verify_skill_metadata "$skill_dir" "$dir_name"
      verify_minimal_skill "$skill_dir"
      ;;
    *)
      fail "unknown skill for verification: $dir_name"
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
