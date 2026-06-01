#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

required=(
  ".planning/PROJECT.md"
  ".planning/REQUIREMENTS.md"
  ".planning/ROADMAP.md"
  ".planning/STATE.md"
  ".planning/STACK.md"
  ".planning/ARCHITECTURE.md"
  ".planning/DESIGN.md"
  ".planning/API_DOCS.md"
  ".planning/INTEGRATIONS.md"
  ".planning/CONVENTIONS.md"
  ".planning/PITFALLS.md"
  ".planning/LESSONS_LEARNED.md"
  ".planning/SPEC_CHANGELOG.md"
  ".planning/FEATURE_INDEX.md"
  ".planning/CHANGE_IMPACT_MATRIX.md"
  ".planning/QUALITY_SCORE.md"
  ".planning/ESCALATION.md"
  ".planning/OBSERVABILITY.md"
  ".planning/SMOKE_TESTS.md"
  ".planning/JOURNEYS.md"
  ".planning/SUMMARY.md"
  ".planning/config.json"
  ".planning/diagrams/system-context.mmd"
  ".planning/diagrams/container-architecture.mmd"
  ".planning/diagrams/database-erd.mmd"
  ".planning/diagrams/deployment-flow.mmd"
  ".planning/diagrams/roadmap-flow.mmd"
)

missing=0
for file in "${required[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing: $file"
    missing=1
  fi
done

exit "$missing"

