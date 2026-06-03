# SCOPE — [Task Name]

> **File**: `.planning/tasks/[task-id]/SCOPE.md`  
> **Purpose**: Hard boundary definition — lists exactly which files this task MAY modify.  
> **Rule**: Agent MUST NOT touch any file not listed below. If a necessary file is missing, update this SCOPE.md first and get confirmation.

---

## Task ID
`[task-id]` — e.g. `F013-feature-registry`

## Task Description
[One-sentence description of what this task does]

## Skill
`[genesis-skill-name]` — the skill governing this task

---

## Permitted File Changes

### ✅ Files this task MAY create or modify

```
[list each file on its own line, relative to repo root]
features/REGISTRY.md
contracts/features/registry-schema.json
tests/unit/feature_registry.test.js
.codebase/MODULE_INDEX.md
scripts/run-evals.sh
```

### ❌ Files this task MUST NOT touch

```
[list critical files that must not be affected]
.codex/SOUL.md
AGENTS.md
package.json (unless adding to 'files' array only)
```

### 🟡 Files requiring explicit confirmation before touching

```
[files that might need updating but require user review first]
scripts/verify.sh
.codebase/state.json
```

---

## Scope Boundary Rationale

[Why these boundaries? What would happen if the agent went outside them?]

Example: "Restricting to `features/` and `contracts/features/` prevents accidental changes to the core verification loop while adding the registry primitive."

---

## Scope Check Command

```bash
# Verify no out-of-scope files were modified:
bash scripts/check-scope.sh .planning/tasks/[task-id]/SCOPE.md
```
