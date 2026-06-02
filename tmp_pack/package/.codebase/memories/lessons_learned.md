# Lessons Learned & Historical Bugs

This file chronicles the major failures, recursive bugs, and architectural dead-ends we have encountered. It acts as an immune system preventing the agent from repeating history.

## 1. Duplicate Slash Commands in Registry
- **Symptom**: Agent registered 4 copies of the same slash command for a single skill.
- **Root Cause**: The CLI script recursively scanned the entire `.codex/` directory for active skills, accidentally parsing backup folders (`.codex/backup/`) generated during skill upgrades.
- **Resolution**: Backup directories must ALWAYS be placed completely outside the active parsed directory (e.g., moved to `~/.codex/backups` globally).
- **Rule**: When doing file tree walks for plugins/skills, always explicitly ignore `.git`, `node_modules`, `backup`, and `tmp` folders.

## 2. Documentation Drift & Broken Contracts
- **Symptom**: Code in `scripts/` changed logic without updating `contracts/`.
- **Root Cause**: Agent skipped the documentation step after a "quick fix" code edit.
- **Resolution**: Implemented Validation Gates (`npm run verify`).
- **Rule**: Never finalize a code edit without explicitly checking `TEST_MATRIX.md` and related schemas in `contracts/`. The validation gate will fail the build if it detects drift.

## 3. Excessive Token Usage from `cat` and `ls`
- **Symptom**: Context window flooded with massive minified bundle files or deep directory trees.
- **Root Cause**: Using `cat` on large files or `ls -R` without filters.
- **Resolution**: 
- **Rule**: Always use the native `view_file`, `list_dir`, and `grep_search` tools with precise line bounds or search terms. NEVER `cat` a file directly in bash if a native agent tool exists.
