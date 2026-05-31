# Skills Naming Convention & Codex-Only Architecture

## Naming Convention: All Skills Use `genesis-` Prefix

**Standard Pattern**: `genesis-{skill-name}`

### Current Skills (Updated May 30, 2026)

| Old Name | New Name | Purpose |
|----------|----------|---------|
| genesis-harness | ✅ genesis-harness | Main orchestration (no change) |
| genesis-new-design | ✅ genesis-new-design | Design specs (no change) |
| genesis-upgrade-design | ✅ genesis-upgrade-design | Design audit (no change) |
| design-spec-skill | ✅ genesis-design-spec | Design tokens & specs |
| architecture-skill | ✅ genesis-architecture | System architecture |
| planning-skill | ✅ genesis-planning | Project planning |
| codebase-map-skill | ✅ genesis-codebase-map | Codebase documentation |
| api-contract-skill | ✅ genesis-api-contract | API specifications |
| api-sync-skill | ✅ genesis-api-sync | Contract auto-sync |
| ui-ux-test-skill | ✅ genesis-ui-ux-test | UI/UX testing |
| pipeline-orchestration-skill | ✅ genesis-pipeline-orchestration | Workflow orchestration |
| harness-engineering-skill | ✅ genesis-harness-engineering | Test-first harness |
| ai-provider-skill | ✅ genesis-ai-provider | Codex orchestration |
| docs-skill | ✅ genesis-docs | Documentation |
| research-skill | ✅ genesis-research | Research & planning |
| release-skill | ✅ genesis-release | Release management |
| spec-impact-engine | ✅ genesis-spec-impact | Spec change propagation |

---

## 🎯 Codex-Only Architecture

### Core Principle
**Genesis Harness is designed exclusively for Claude 3 Opus (Codex). No model switching mid-project.**

### What This Means

✅ **Codex is PRIMARY**
- Handles all planning, architecture, design specs, contracts, code review
- Manages project decisions and workflow
- Orchestrates external services (as tools)

✅ **External Services are SPECIALIZED** (Codex-controlled)
- Image generation (DALL-E, Midjourney) - AFTER Codex writes specs
- Voice generation (ElevenLabs)
- Subtitle generation (Whisper)
- Video rendering (ffmpeg)

❌ **No Model Switching**
- Cannot switch from Codex to GPT-4, Claude 3.5, Haiku, etc. mid-project
- Cannot let external models make architectural decisions
- Cannot allow model hand-offs without explicit Codex approval

### Documentation References

For complete clarity, see:
- **`.codex/MODEL_ALLOCATION.md`** - Decision matrix for Codex vs external services
- **`.codex/SKILLS_INDEX.md`** - Each skill marked "(Codex-only)" or "(Codex orchestrates)"

---

## Directory Mapping

### Skills Directory Structure

```
.codex/skills/
├── genesis-harness/              # Main orchestration
├── genesis-new-design/           # New design specs
├── genesis-upgrade-design/       # Design audit
├── genesis-design-spec/          # Design tokens
├── genesis-architecture/         # Architecture decisions
├── genesis-planning/             # Project planning
├── genesis-codebase-map/         # Code documentation
├── genesis-api-contract/         # API specs
├── genesis-api-sync/             # Contract auto-sync
├── genesis-ui-ux-test/           # UI/UX testing
├── genesis-pipeline-orchestration/ # Workflow orchestration
├── genesis-harness-engineering/  # Test-first harness
├── genesis-ai-provider/          # Codex token management
├── genesis-docs/                 # Documentation
├── genesis-research/             # Research & analysis
├── genesis-release/              # Release management
└── spec-impact-engine/           # Spec change detection
```

---

## Important Notes

### Why "genesis-" Prefix?
- **Clarity**: Immediate visual indicator that this is Genesis Harness-specific
- **Namespace**: Prevents conflicts with other frameworks
- **Convention**: Standardized naming across all skills
- **Codex-Only**: Reinforces that this harness is Codex-exclusive

### External Service References in Skill Names

Some skills may internally mention external services (e.g., `genesis-ai-provider`):
- This is **normal and expected**
- These skills define HOW Codex orchestrates external services
- The orchestration happens **within Codex's control**
- No model hand-offs

### Backwards Compatibility

If you have references to old names (e.g., `architecture-skill`):
1. Update to new name (e.g., `genesis-architecture`)
2. Update in `.instructions.md`, `.prompt.md`, config files
3. Update in documentation references
4. Search for old names: `grep -r "architecture-skill" .`

---

## Usage

### When Creating New Skills

Follow this pattern:
```
.codex/skills/genesis-{feature-name}/
├── SKILL.md                    # Skill documentation (Codex-only emphasis)
├── templates/                  # Reusable templates
├── examples/                   # Usage examples
├── checklists/                 # Verification checklists
└── [optional] scripts/         # Helper scripts
```

### Documentation Template

Every skill SKILL.md should include:
```markdown
# Genesis {Feature Name}

**Location**: `.codex/skills/genesis-{name}/`

**Purpose**: {description} (Codex-only)

⚠️ **CODEX-ONLY**: This skill is part of Genesis Harness for Codex exclusively.

**Features**:
...

**When to use**: ...

**Output**: ...
```

---

## Verification Checklist

- [ ] All skill directories follow `genesis-*` naming
- [ ] All SKILL.md files include "(Codex-only)" or "(Codex orchestrates)"
- [ ] No references to Claude/Copilot/other models in descriptions
- [ ] External services clearly marked as orchestrated BY Codex
- [ ] `.codex/MODEL_ALLOCATION.md` is referenced in design/architecture skills
- [ ] No model-agnostic language in skill descriptions
- [ ] Project README emphasizes "Codex-only" architecture

---

**Last Updated**: May 30, 2026  
**Status**: ✅ Naming convention standardized, Codex-only architecture enforced
