# Checklist: Pre-Flight Harness Validation & Compliance

Use this checklist prior to committing or declaring completion on any evolution of the **Genesis Codex Harness** operating environment.

---

## 🏗 Part 1: Structural & File Invariants

- [ ] **Folder Structure Compliance**: Every skill has a `SKILL.md`, `agents/openai.yaml`, `templates/`, and `examples/`. Playbook-based skills also include `checklists/`, `playbooks/`, and `observability/`.
- [ ] **Line Ending Invariants**: All script files recursively (`*.sh`) are verified to have LF line endings to avoid WSL/macOS parse failures on Windows engines.
- [ ] **Executable Bit**: All scripts inside `scripts/` and skill-specific script folders have executable flags set (`chmod +x`).

---

## 📝 Part 2: Skill Frontmatter & Section Checks

- [ ] **Casing Validation**: Standard skill sections match exact capitalization rules:
  - `## Purpose`
  - `## When to use`
  - `## When NOT to use`
  - `## Inputs required`
  - `## Outputs required`
  - `## Required tests`
  - `## Required fixtures`
  - `## Required contract updates`
  - `## Required codebase map updates`
  - `## Token saving rules`
  - `## Acceptance criteria`
  - `## Common mistakes`
  - `## Recovery workflow`
- [ ] **Metadata Alignment**: The frontmatter `name:` matches the legacy expected string checked inside `scripts/verify.sh` for directory mapping.

---

## 🧪 Part 3: Test Suite & Distribution Execution

- [ ] **Red-State Invariant**: The test failure was demonstrated *first* before implementing the changes.
- [ ] **Verification Smoke Pass**: `bash scripts/verify.sh` completes cleanly with exit code `0`.
- [ ] **Regression Eval Pass**: `bash scripts/run-evals.sh` completes cleanly with exit code `0`.
- [ ] **CLI Dry-Run Integrity**: `npm run pack:check` runs successfully and package size is correct.
- [ ] **Uninstall Isolation**: The `uninstall.sh` script leaves no stale files behind in custom home locations.

---

## 💾 Part 4: Memory Invariance

- [ ] **Current State Updated**: Skill counts, quality metrics, and completion statuses are synchronized in `.codebase/CURRENT_STATE.md`.
- [ ] **Recovery Point Saved**: Exact rollback steps and verification logs are saved in `.codebase/RECOVERY_POINTS.md`.
