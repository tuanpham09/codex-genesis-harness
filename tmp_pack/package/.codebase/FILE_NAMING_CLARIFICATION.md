# File & Folder Naming Clarification

**Genesis Harness is CODEX-EXCLUSIVE** - All references to "claude" in file names are VS Code/framework naming conventions, NOT indicators of model flexibility.

---

## 🎯 Key Point

```
❌ File names with "claude" does NOT mean:
   - Project supports multiple models
   - Model switching is allowed
   - Alternative models are options

✅ File names with "claude" are simply:
   - VS Code standard naming
   - Framework/tool naming conventions
   - Technical implementation details
```

---

## File Naming Breakdown

### `.claude.json` (Root Level)
**What**: VS Code Copilot extension configuration file  
**Why this name**: VS Code naming standard - all VS Code extension configs use this name  
**Can it be renamed**: NO - VS Code won't recognize it with any other name  
**What it does**: Defines hooks, token budgets, tool restrictions, cache settings  
**Codex-only implication**: ✅ YES - all settings enforce Codex-only operation  

**Note in file**:
```json
{
  "project": "Genesis Codex Harness (Codex-Only)",
  "note": "⚠️ File name '.claude.json' is VS Code standard (cannot be changed). 
           This project is CODEX-EXCLUSIVE - no model switching."
}
```

---

### `.codebase/` (Directory)
**What**: Repository memory system for Codex  
**Why this name**: Internal naming (represents "Codex's knowledge base")  
**Can it be renamed**: Not recommended (would break all references)  
**What it contains**:
- `CURRENT_STATE.md` - Project state
- `MODULE_INDEX.md` - Code structure
- `TEST_MATRIX.md` - Test coverage
- `ARCHITECTURE.md` - System design
- etc.

**Codex-only implication**: ✅ YES - All memory is for Codex's use  

---

### `.codex/` (Directory)
**What**: Genesis skills location  
**Why this name**: Project's skill directory (Codex = "code execution" in this context)  
**Can it be renamed**: Not recommended (would break skill references)  
**What it contains**:
- `skills/` - All 17 Codex-native skills
- `MODEL_ALLOCATION.md` - Model responsibility matrix
- `SKILLS_INDEX.md` - Skill documentation
- etc.

**Codex-only implication**: ✅ YES - All skills are Codex-exclusive  

---

### `.planning/` (Directory - Created by /init)
**What**: Per-project planning documents  
**Why this name**: Simple, semantic ("this is planning stuff")  
**Can it be renamed**: Not recommended (would break references)  
**What it contains**:
- `SPEC_CHANGELOG.md` - Specification changes
- `ROADMAP.md` - Feature roadmap
- `PHASE_*.md` - Phase-specific plans
- etc.

**Codex-only implication**: ✅ YES - All planning is by Codex  

---

### `.instructions.md` (Root Level)
**What**: Codex-specific workflow instructions and hooks  
**Why this name**: Generic naming for instruction files (framework standard)  
**Can it be renamed**: Not recommended (would break references)  
**What it does**: Defines token budgets, safeguards, workflow patterns  
**Codex-only implication**: ✅ YES - All instructions are for Codex  

---

## Naming Convention Summary

| Name | Type | Codex-Only | Can Rename | Why This Name |
|------|------|-----------|------------|---------------|
| `.claude.json` | Config | ✅ YES | ❌ NO | VS Code standard |
| `.codebase/` | Directory | ✅ YES | ⚠️ Hard | Codex memory base |
| `.codex/` | Directory | ✅ YES | ⚠️ Hard | Skills location |
| `.planning/` | Directory | ✅ YES | ⚠️ Hard | Semantic naming |
| `.instructions.md` | File | ✅ YES | ⚠️ Hard | Framework standard |
| `SKILL.md` | File | ✅ YES | ⚠️ Hard | Skill documentation |

---

## For New Developers

### ✅ DO Understand
- These names are NOT indicators of flexibility
- This project is CODEX-EXCLUSIVE regardless of file names
- All architecture decisions are Codex-first
- External services are tools, not alternatives

### ❌ DON'T Assume
- "claude.json" means multiple models supported
- ".codebase" means multiple code engines supported
- File naming = model selection logic
- You can swap models mid-project

### ✅ DO Check
- `.codex/MODEL_ALLOCATION.md` - Defines all model roles
- `.instructions.md` - Codex-only enforcement rules
- `README.md` - Architecture principles
- `.codebase/SKILLS_NAMING_GUIDE.md` - Skill naming conventions

---

## Architecture Enforcement

**Codex-only guarantee is enforced by**:
1. ✅ Skill design (all skills are Codex-native)
2. ✅ Hook system (validates Codex-only operations)
3. ✅ Token budgets (tracks Codex token usage)
4. ✅ Contracts (all API/schema contracts assume Codex)
5. ✅ Documentation (all examples use Codex commands)

**NOT by**: File naming or folder structure

---

## FAQ

**Q: Can I rename `.claude.json`?**  
A: No - VS Code won't recognize it. VS Code extension config MUST be named `.claude.json`.

**Q: Does "claude" in filenames mean other models are supported?**  
A: No - file naming is technical convention, not architecture. All architecture is Codex-only.

**Q: Should I rename `.codebase/` to something else?**  
A: Not recommended - it would require updating 50+ references across the codebase. Not worth it.

**Q: If I fork this, can I rename everything?**  
A: Technically yes, but not recommended. These are established conventions. Better to document the naming like this file does.

---

**Status**: Clarified (May 30, 2026)  
**Applies to**: All Genesis Harness projects  
**Enforcement**: By skill design, not by naming
