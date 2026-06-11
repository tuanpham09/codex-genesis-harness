#!/usr/bin/env bash
# ==============================================================================
# Genesis Codex Harness — Context Compaction Engine
# ==============================================================================
# Summarizes active project planning files, active tasks, and logs into a single
# .planning/CONTEXT_SUMMARY.md file to safely offload context before compacting.
# Reduces context window usage and prevents Context Rot.
# ==============================================================================

set -euo pipefail

PLANNING_DIR="${1:-.planning}"
SUMMARY_FILE="$PLANNING_DIR/CONTEXT_SUMMARY.md"

if [ ! -d "$PLANNING_DIR" ]; then
  echo "Error: Planning directory '$PLANNING_DIR' does not exist." >&2
  exit 1
fi

echo "==> Compacting active context..."

{
  echo "# Context Compaction Summary"
  echo "Generated: $(date +'%Y-%m-%d %H:%M:%S')"
  echo ""
  echo "## 📊 Active State Summary"
  if [ -f "$PLANNING_DIR/STATE.md" ]; then
    grep -E "^- (Current Phase|Active Feature|Last Completed Task|Next Task|Blockers):" "$PLANNING_DIR/STATE.md" || true
  else
    echo "State file not found. Project initialized but state unpopulated."
  fi
  echo ""
  echo "## 🎯 Key Architectural Invariants"
  if [ -f "$PLANNING_DIR/ARCHITECTURE.md" ]; then
    head -n 25 "$PLANNING_DIR/ARCHITECTURE.md"
  else
    echo "Architecture file not found."
  fi
  echo ""
  echo "## 📝 Active Task Progress"
  # Find all task lists in active features or bugs
  find "$PLANNING_DIR/features" "$PLANNING_DIR/bugs" -name "TASKS.md" 2>/dev/null | while read -r task_file; do
    echo "### Tasks for: $(basename "$(dirname "$task_file")")"
    grep -E "^- \[[x~ ]\]" "$task_file" | tail -n 15 || true
    echo ""
  done
  echo ""
  echo "## ⚠️ Fragile Areas & Lessons Learned"
  if [ -f "$PLANNING_DIR/PITFALLS.md" ]; then
    head -n 15 "$PLANNING_DIR/PITFALLS.md"
  fi
} > "$SUMMARY_FILE"

echo "==> Context compaction complete! Summary saved to: file://$(pwd)/$SUMMARY_FILE"
