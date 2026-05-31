# Playbook: Harness Evolution & Verification Scaling

This playbook guides the developer or autonomous agent through the process of evolving the **Genesis Codex Harness** itself, ensuring that new skills, scripts, contracts, and lints are integrated without breaking cross-platform execution or causing regression drift.

---

## 🧭 Phase 1: Problem Isolation & Plan Initiation

### 1. Confirm Requirements & Gaps
Identify the exact capability gap or bug in the harness operating environment.
- *Example*: Adding a new skill `genesis-performance-profiling` that needs to be validated in `verify.sh` and CLI scripts.
- *Checklist*: Verify what contracts, fixtures, memory, or scripts are impacted by this change.

### 2. Scaffold on-disk Task Tracking
Do not keep state in your context window. Write the target tasks to a localized planning folder or `task.md` file:
```markdown
- [ ] Task 1: Create failing verification test
- [ ] Task 2: Implement minimal harness script change
- [ ] Task 3: Normalize line-endings and format
- [ ] Task 4: Execute full regression evals
- [ ] Task 5: Recalculate metrics and update codebase memory
```

---

## 🛠 Phase 2: Red State - Writing the Failing Test First

### 1. Identify the Verification Target
- If the change affects a **skill structure**, edit `scripts/verify.sh` to add the new skill folder to the `skill_names` array, and specify its verification protocol.
- If the change affects **CLI installation or paths**, edit `scripts/run-evals.sh` to add assertions targeting the new folders, links, or package outputs.

### 2. Implement the Failing Assertion
Insert a strict, skeptical check that evaluates the *exact* expected invariant before you make the change.
*Example in `verify.sh`*:
```bash
verify_one "$skill_root/genesis-performance-profiling" || fail "performance skill verification failed"
```

### 3. Run the Suite & Confirm RED
Run the script to guarantee it fails precisely where expected:
```bash
bash scripts/verify.sh
```
Verify that the output reports the exact failure you planned to resolve, proving the evaluator is skeptical and active.

---

## 💻 Phase 3: Green State - Minimal Atomic Implementation

### 1. Write the Minimal Change
Implement the new skill, edit the CLI wrapper (`bin/genesis-harness.js`), or adjust the installer script.
- *Strict Rule*: Focus **only** on the targeted fix. Do not refactor unrelated files or add features outside the task scope.

### 2. Handle Carriage Return Safety (CRLF)
Windows checkouts frequently introduce carriage returns (`\r\n`) into Bash scripts, resulting in syntax errors near unexpected tokens like `do` or `then`.
Always run the line-ending normalization pipeline after writing any shell script:
```python
python -c "import os; [open(os.path.join(root, f), 'wb').write(content) for root, dirs, files in os.walk('.') for f in files if f.endswith('.sh') for content in [open(os.path.join(root, f), 'rb').read().replace(b'\r\n', b'\n')]]"
```

---

## 🔍 Phase 4: Verification & Refactoring Loop

### 1. Execute All Verification Levels
Run the entire validation pipeline locally:
```bash
# 1. Structural and metadata compliance
bash scripts/verify.sh

# 2. Package install/uninstall/verify regression checks
bash scripts/run-evals.sh

# 3. Dry-run npm pack check
npm run pack:check
```

### 2. Eliminate Technical Debt
Review your changes and clean up:
- Remove all temporary debug statements, console logs, or print dumps.
- Confirm all new scripts have execution permissions (`chmod +x`).
- Review git diffs to ensure no accidental whitespace or formatting changes were checked in.

---

## 💾 Phase 5: Memory Synchronization & Handoff

### 1. Document Recovery Checkpoint
Append a durable restoration checkpoint entry to `.codebase/RECOVERY_POINTS.md` in the following format:
```markdown
### Checkpoint: <Description of evolution>
- **Date**: YYYY-MM-DD
- **Target Files**: `list of changed paths`
- **Verification Commands**: `bash scripts/verify.sh && bash scripts/run-evals.sh`
- **Rollback Steps**: `git checkout -- <files>`
```

### 2. Recalculate Architecture and Quality Scores
Review [.codebase/CURRENT_STATE.md](file:///.codebase/CURRENT_STATE.md) and [.codebase/MODULE_INDEX.md](file:///.codebase/MODULE_INDEX.md). Update the total skill count, state descriptions, and confirm compliance before marking your work as 100% complete.
