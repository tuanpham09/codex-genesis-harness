# Example: Harness Evolution - Integrating `genesis-performance-profiling`

This example demonstrates how an engineer (human or AI) safely scales the **Genesis Codex Harness** to support a new playbook-based skill called `genesis-performance-profiling`.

---

## Step 1: Write a Failing Verification Test (RED State)
First, we add the new skill directory to the `skill_names` array inside `scripts/verify.sh` so that it is included in the test loop:
```diff
 skill_names=(
   genesis-harness
   genesis-new-design
   genesis-upgrade-design
+  genesis-performance-profiling
 )
```
And we add its case mapping inside `verify_one`:
```diff
+    genesis-performance-profiling)
+      verify_skill_metadata "$skill_dir" "genesis-performance-profiling"
+      verify_playbook_skill "$skill_dir"
+      ;;
```
When we run `bash scripts/verify.sh`, it fails immediately because the directory `genesis-performance-profiling` does not exist yet. This confirms our validation test is active and skeptical!

---

## Step 2: Implement the Skill (GREEN State)
We create the directory and populate all required files according to the playbook protocol:
- `SKILL.md` (with all 13 standard headers and metadata).
- `agents/openai.yaml`.
- `templates/`, `checklists/`, `playbooks/`, `observability/`, and `examples/` directories.

---

## Step 3: Normalize Line Endings
We run our CRLF-to-LF conversion command to guarantee cross-platform shell compatibility:
```bash
python -c "import os; [open(os.path.join(root, f), 'wb').write(content) for root, dirs, files in os.walk('.') for f in files if f.endswith('.sh') for content in [open(os.path.join(root, f), 'rb').read().replace(b'\r\n', b'\n')]]"
```

---

## Step 4: Run E2E Verification
We run all validation checks locally to confirm that the new skill is fully integrated and compliant:
```bash
$ bash scripts/verify.sh
verify passed: /mnt/d/PROJECT/codex-genesis-harness/.codex/skills

$ bash scripts/run-evals.sh
evals passed
```

---

## Step 5: Update Codebase Memory
We register our evolutionary step in [.codebase/CURRENT_STATE.md](file:///.codebase/CURRENT_STATE.md) and [.codebase/RECOVERY_POINTS.md](file:///.codebase/RECOVERY_POINTS.md) before pushing our changes to version control!
