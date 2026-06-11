#!/usr/bin/env bash
# ==============================================================================
# Genesis Codex Harness — Ralph Loop (Verify-Fix) Orchestrator
# ==============================================================================
# Executes verification commands, tracks iteration counts to prevent infinite loops,
# and logs diagnostic failure reports to disk for step resumption.
# Enforces the self-verification safety invariant.
# ==============================================================================

set -uo pipefail

MAX_ITERATIONS=5
PLANNING_DIR=".planning"
LOOP_COUNT_FILE="$PLANNING_DIR/VERIFY_LOOP_COUNT"
FAILURE_LOG="$PLANNING_DIR/LAST_VERIFICATION_FAILURE.md"

usage() {
  echo "Usage: $0 [--max-iterations N] <verification_command> [args...]" >&2
  exit 2
}

if [ "$#" -eq 0 ]; then
  usage
fi

if [ "$1" = "--max-iterations" ]; then
  MAX_ITERATIONS="$2"
  shift 2
fi

if [ "$#" -eq 0 ]; then
  usage
fi

mkdir -p "$PLANNING_DIR"

# Initialize loop count
CURRENT_ITERATION=1
if [ -f "$LOOP_COUNT_FILE" ]; then
  CURRENT_ITERATION=$(cat "$LOOP_COUNT_FILE")
  CURRENT_ITERATION=$((CURRENT_ITERATION + 1))
fi

echo "$CURRENT_ITERATION" > "$LOOP_COUNT_FILE"

echo "==> [VERIFY LOOP] Iteration $CURRENT_ITERATION of $MAX_ITERATIONS"

if [ "$CURRENT_ITERATION" -gt "$MAX_ITERATIONS" ]; then
  echo "=============================================================================="
  echo "==> [BLOCKED] Verify-Fix loop exceeded maximum iteration count ($MAX_ITERATIONS)."
  echo "==> Potentially stuck in an infinite loop. Halting for human intervention."
  echo "=============================================================================="
  rm -f "$LOOP_COUNT_FILE"
  exit 99
fi

# Execute verification command
set +e
"$@" > "$FAILURE_LOG" 2>&1
EXIT_CODE=$?
set -e

if [ $EXIT_CODE -eq 0 ]; then
  echo "==> [VERIFY LOOP] Pass! Verification completed successfully."
  rm -f "$LOOP_COUNT_FILE"
  rm -f "$FAILURE_LOG"
else
  echo "=============================================================================="
  echo "==> [FAILURE] Verification failed with exit code $EXIT_CODE."
  echo "==> Failure diagnostic written to: file://$(pwd)/$FAILURE_LOG"
  echo "==> Please inspect the log, fix the root cause, and re-run verification."
  echo "=============================================================================="
fi

exit $EXIT_CODE
