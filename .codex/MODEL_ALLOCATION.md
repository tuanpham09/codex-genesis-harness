# Model Allocation Matrix

**Date**: May 30, 2026  
**Purpose**: Define which AI model should handle each task in Genesis Harness  
**Status**: FOUNDATIONAL - Use this to make tool/model decisions

---

## 🎯 Primary Model: Claude 3 Opus (Codex)

### ✅ Codex Handles: Core Project Orchestration

| Task | Why Codex? | Complexity | Token Cost |
|------|-----------|-----------|-----------|
| **Test-first workflows** | Reasoning required | High | 5-10k |
| **Multi-phase planning** | Deep orchestration | Very High | 20-30k |
| **Spec-impact-engine** | Complex dependency analysis | Very High | 15-25k |
| **Contract design (APIs)** | Architectural decisions | High | 10-15k |
| **Code review & refactor** | Pattern recognition | High | 8-12k |
| **Documentation sync** | Knowledge synthesis | Medium | 3-5k |
| **Decision making** | Strategic reasoning | Very High | 10-20k |
| **Project memory management** | State tracking | Medium | 2-4k |
| **Integration orchestration** | Workflow coordination | High | 8-15k |
| **Quality assessment** | Comprehensive evaluation | High | 10-15k |

**Total per project**: ~100-200k tokens (with caching: 60-120k)

---

## 🖼️ External Model 1: Image Generation (DALL-E/Midjourney)

### ✅ Image Models Handle: Visual Design ONLY (After Codex specs)

| Task | When Used | Codex Role |
|------|-----------|-----------|
| **Brand kit visuals** | AFTER design-spec-skill creates specs | Codex writes design tokens + brand rules |
| **UI component mockups** | AFTER design-spec-skill creates wireframes | Codex defines spacing, colors, hierarchy |
| **Landing page mockups** | AFTER UX spec is complete | Codex writes UX flow + design tokens |
| **Mobile app screens** | AFTER mobile spec is complete | Codex defines interactions + screens |

### ❌ Image Models CANNOT Do
- Create architecture diagrams (Codex creates with mermaid)
- Define design systems (Codex defines with tokens)
- Make design decisions (Codex decides, image model executes)
- Code anything (not applicable)

### Workflow Pattern
```
1. Codex: Write design specification (*.md + design tokens)
2. Codex: Create wireframe (text + ASCII diagram)
3. Image Model: Generate visual mockup (based on Codex specs)
4. Codex: Review output (validate against spec)
5. Codex: Refine spec if needed (iterate)
```

**Cost per mockup**: $0.50-2.00 (external service cost, not tokens)

---

## 🎙️ External Service 1: Voice Generation (ElevenLabs TTS)

### ✅ Voice Models Handle: Text-to-Speech ONLY

| Task | When Used | Codex Role |
|------|-----------|-----------|
| **Narration for video** | After script written | Codex writes script + voice direction |
| **Voiceover synthesis** | After content finalized | Codex provides text + tone notes |
| **Audio prototype** | In prototype phase only | Codex decides if narration needed |

### ❌ Voice Models CANNOT Do
- Write scripts (Codex writes)
- Choose voice character (Codex decides)
- Edit audio (external audio editor)
- Make creative decisions (Codex decides)

### Scope Limitation
**Genesis Harness is primarily for CODE projects.**  
Voice generation is optional for media/video projects only.

**Cost per request**: $0.50-5.00 (external service)

---

## 🎬 External Service 2: Subtitle Generation (OpenAI Whisper)

### ✅ Subtitle Models Handle: Audio-to-Text ONLY

| Task | When Used | Codex Role |
|------|-----------|-----------|
| **Auto-generate subtitles** | After video recorded | Codex validates + edits |
| **Transcript creation** | After audio finalized | Codex converts to script |

### ❌ Subtitle Models CANNOT Do
- Create videos (render engines)
- Write script (Codex writes)
- Make editing decisions (Codex decides)

### Scope Limitation
**Optional for media/video projects only.**  
Not core Genesis Harness capability.

**Cost per request**: Free (OpenAI Whisper API tier)

---

## 🔧 External Service 3: Render Engines (ffmpeg, custom)

### ✅ Render Engines Handle: Output Execution ONLY

| Task | When Used | Codex Role |
|------|-----------|-----------|
| **Render video** | After pipeline defined | Codex defines pipeline config |
| **Generate thumbnails** | After video complete | Codex specifies thumbnail rules |
| **Encode formats** | After rendering done | Codex decides formats needed |

### ❌ Render Engines CANNOT Do
- Design videos (Codex designs)
- Choose composition (Codex decides)
- Make creative decisions (Codex decides)
- Write code (just execute)

### Codex Role
Codex **orchestrates** render engines:
- Defines pipeline config
- Checks output quality
- Decides retries
- Validates results

Codex **does NOT**:
- Execute render (external tool does)
- Fix rendering errors (external tool fixes)
- Handle video encoding (external tool handles)

---

## 🚫 Skills That Are MISALIGNED (Need Clarification)

### ⚠️ genesis-new-design
**Current description**: "Generate premium web experiences from scratch"  
**Problem**: Implies image generation  
**Clarification**: Codex writes design specs + tokens, NOT images  
**Correct role**: `design-spec-for-new-products` - Codex only

**Workflow**:
```
✓ Codex: Write design specification (*.md)
✓ Codex: Define design tokens (colors, spacing, typography)
✓ Codex: Create wireframes (ASCII + markdown)
✗ Codex: Generate visual mockups (NOT Codex's job)
→ Image model: Generate mockups (from Codex specs)
```

---

### ⚠️ genesis-upgrade-design
**Current description**: "Improve existing UI without breaking functionality"  
**Problem**: Implies visual design generation  
**Clarification**: Codex audits code + writes design specs, image model generates visuals  
**Correct role**: `design-spec-for-upgrades` - Codex only

**Workflow**:
```
✓ Codex: Audit existing UI (find generic patterns)
✓ Codex: Write upgrade specification (*.md)
✓ Codex: Define new design tokens
✓ Codex: Create improved wireframes
✗ Codex: Generate visual mockups (NOT Codex's job)
→ Image model: Generate new mockups (from Codex specs)
```

---

### ⚠️ pipeline-orchestration-skill
**Current description**: "Multi-agent job coordination and scheduling"  
**Problem**: Unclear if Codex orchestrates or executes  
**Clarification**: Codex **orchestrates**, external tools **execute**  
**Correct role**: `pipeline-coordination-skill` - Codex decides, tools execute

**Codex Role**:
```
✓ Define pipeline configuration
✓ Decide which tool to use when
✓ Monitor job status
✓ Check output quality
✓ Retry on failure
✓ Escalate to user if stuck

✗ Codex does NOT:
  - Actually run render engines
  - Execute video encoding
  - Write files directly
  - Handle system-level tasks
```

---

### ⚠️ ai-provider-skill
**Current description**: "LLM, image, voice, subtitle provider integration"  
**Problem**: Too vague - suggests Codex can be swapped for any model  
**Clarification**: Codex is PRIMARY, others are SPECIALIZED  
**Correct role**: `external-service-coordination-skill` - Codex calls when needed

**Hierarchy**:
```
Codex (PRIMARY - 95% of work)
  ├─ Image generation (SPECIALIZED - AFTER Codex specs)
  ├─ Voice generation (OPTIONAL - after Codex writes script)
  ├─ Subtitle generation (OPTIONAL - after Codex edits)
  └─ Render engines (OPTIONAL - after Codex defines pipeline)

Decision rule:
  Can Codex do it? → YES: Codex does it
  Is it text/reasoning? → YES: Codex does it
  Is it visual/media? → MAYBE: Image model if needed
  Is it external service? → YES: Codex orchestrates
```

---

## 🎓 Model Selection Decision Tree

```
Task assignment: What should do this work?

START
  ↓
Is it planning/architecture/code/reasoning?
  ├─ YES → Codex (Opus) ✓
  └─ NO → Continue
  
Is it API/contract/test design?
  ├─ YES → Codex (Opus) ✓
  └─ NO → Continue
  
Is it visual mockup generation?
  ├─ YES → Image model (after Codex specs) ✓
  └─ NO → Continue
  
Is it voice/audio generation?
  ├─ YES → Voice model (ElevenLabs - optional) ✓
  └─ NO → Continue
  
Is it subtitle/transcription?
  ├─ YES → Subtitle model (Whisper - optional) ✓
  └─ NO → Continue
  
Is it rendering/encoding?
  ├─ YES → Render engine (ffmpeg - orchestrated by Codex) ✓
  └─ NO → Continue
  
Otherwise:
  → Codex handles with orchestration ✓
```

---

## 📊 Token Budget by Task Type

| Task Type | Primary Model | Tokens | Cached? | Check |
|-----------|---------------|--------|---------|-------|
| New feature | Codex | 25-40k | YES | Read state first |
| API contract | Codex | 10-20k | YES | Cache contract |
| Bug fix | Codex | 15-25k | YES | Reuse cache |
| Test-first | Codex | 8-15k | YES | Quick validation |
| Multi-phase | Codex | 50-100k | SOME | Cache dependencies |
| Spec change impact | Codex | 20-35k | NO | Must reanalyze |
| Design spec | Codex | 15-25k | YES | Cache tokens |
| Code review | Codex | 10-18k | YES | Cache patterns |
| Image mockup | Image model | $0.50-2 | N/A | External service |
| Voice narration | Voice model | $1-5 | N/A | External service |
| Video render | Render engine | Varies | N/A | External service |

**Total per project**: 100-200k Codex tokens (60-120k with caching)

---

## ✅ Recommended Action Items

### Immediate (Do Now)
- [ ] Rename `genesis-new-design` → clarify Codex specs role
- [ ] Rename `genesis-upgrade-design` → clarify Codex audit role
- [ ] Rename `pipeline-orchestration-skill` → clarify Codex orchestrates
- [ ] Rename `ai-provider-skill` → clarify Codex is PRIMARY
- [ ] Add this file to `.codex/` for reference

### Short-term (Next Session)
- [ ] Create separate workflow for "design spec → image gen → review"
- [ ] Document when image models are optional vs required
- [ ] Add token budget checks to `.claude.json`
- [ ] Update all skill descriptions to reference this matrix

### Optional (If Using Media)
- [ ] Create `media-orchestration-skill` for voice/video projects
- [ ] Document voice + video project workflows
- [ ] Add constraints for media-heavy projects

---

## 🎯 Bottom Line

**Codex (Claude 3 Opus) is the PRIMARY engineer.**  
External models are **SPECIALIZED TOOLS** that Codex orchestrates.

- ✅ Codex designs, other models execute
- ✅ Codex decides, other tools implement
- ✅ Codex orchestrates, others work on command
- ✅ Codex reviews, others are validated

**Never treat Codex as interchangeable with other models.**  
Codex is the brain. Other models are hands.
