#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

run_if() {
  local label="$1"
  shift
  echo "==> $label"
  "$@"
}

if [ -f package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    npm run lint --if-present
    npm run typecheck --if-present
    npm test --if-present
    npm run build --if-present
  fi
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  command -v pytest >/dev/null 2>&1 && run_if "pytest" pytest -q
  command -v ruff >/dev/null 2>&1 && run_if "ruff" ruff check .
  command -v mypy >/dev/null 2>&1 && run_if "mypy" mypy .
elif [ -f Cargo.toml ]; then
  run_if "cargo test" cargo test
  run_if "cargo clippy" cargo clippy -- -D warnings
elif [ -f go.mod ]; then
  run_if "go test" go test ./...
elif [ -f composer.json ]; then
  command -v composer >/dev/null 2>&1 && composer test || true
else
  echo "No known verification command detected. Add project-specific commands to .planning/SMOKE_TESTS.md."
fi

for check in \
  check-required-planning-files.sh \
  check-task-tracking.sh \
  check-no-debug-logs.sh \
  check-spec-changelog.sh \
  check-architecture-boundaries.sh
do
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -x "$script_dir/$check" ]; then
    run_if "$check" "$script_dir/$check" "$root"
  fi
done
