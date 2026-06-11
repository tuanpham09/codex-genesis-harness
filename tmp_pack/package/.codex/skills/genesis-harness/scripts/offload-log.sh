#!/usr/bin/env bash
# ==============================================================================
# Genesis Codex Harness — Tool Call Offloading Script
# ==============================================================================
# Captures standard output & error of any command, saves it to a durable log file,
# and prints a trimmed head-and-tail summary if it exceeds a line count threshold.
# Protects the AI context window against Context Rot.
# ==============================================================================

set -uo pipefail

THRESHOLD_LINES=50
SCRATCH_DIR="scratch/tool_outputs"

usage() {
  echo "Usage: $0 [--threshold lines] <command> [args...]" >&2
  exit 2
}

if [ "$#" -eq 0 ]; then
  usage
fi

if [ "$1" = "--threshold" ]; then
  THRESHOLD_LINES="$2"
  shift 2
fi

if [ "$#" -eq 0 ]; then
  usage
fi

mkdir -p "$SCRATCH_DIR"

# Generate unique log file path
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RAND_ID=$((RANDOM % 10000))
LOG_FILE="$SCRATCH_DIR/output_${TIMESTAMP}_${RAND_ID}.log"

# Execute command and capture output
set +e
"$@" > "$LOG_FILE" 2>&1
EXIT_CODE=$?
set -e

# Calculate output size
LINE_COUNT=$(wc -l < "$LOG_FILE")

if [ "$LINE_COUNT" -le "$THRESHOLD_LINES" ]; then
  # Print normally if within threshold
  cat "$LOG_FILE"
else
  # Offload and print head/tail summary
  HEAD_LINES=$((THRESHOLD_LINES / 2))
  TAIL_LINES=$((THRESHOLD_LINES / 2))

  echo "=============================================================================="
  echo "==> [OFFLOADED] Command output exceeded threshold ($LINE_COUNT lines > $THRESHOLD_LINES lines)."
  echo "==> Full log written to disk: file://$(pwd)/$LOG_FILE"
  echo "=============================================================================="
  
  head -n "$HEAD_LINES" "$LOG_FILE"
  
  echo ""
  echo "... [TRUNCATED $(($LINE_COUNT - THRESHOLD_LINES)) LINES] ..."
  echo "Read file://$LOG_FILE to view the full execution history."
  echo ""
  
  tail -n "$TAIL_LINES" "$LOG_FILE"
fi

exit $EXIT_CODE
