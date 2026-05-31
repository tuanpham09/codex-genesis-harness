---
name: genesis-research-first
description: Auto-enforce research-first pattern - automatically research documentation, best practices, and GitHub before any important decision. Research output feeds directly into planning. Triggered automatically for features, bugs, architecture changes, and spec updates.
---

# Genesis Research-First (Auto-Enforce)

## Purpose

**Eliminate guesswork by auto-researching before planning.**

This skill enforces a strict research-first pattern:

```
User Request
  → [AUTO] Research Phase
    → Read local documentation
    → Search GitHub for best practices
    → Check official package/framework docs
    → Review existing codebase patterns
  → [AUTO] Compile Research Note
  → [AUTO] Generate Planning Artifact
  → User Reviews & Confirms
  → Planning Proceeds
```

**Not optional. Automatic.**

## When Auto-Triggered

Auto-trigger on these task types:

- `/init` - Project initialization
- `/new-feature` - Feature work
- `/fix-bug` - Bug fixes
- `/spec-change` - Architecture or API changes
- `/architecture` - System design decisions
- `/design` - UI/UX changes
- `/plan` - Planning from scratch
- `/upgrade` - Major upgrades or refactoring

## Research Scope

For each task, research covers:

### 1. Local Documentation (5 min)
```
Check files:
  - .codebase/CURRENT_STATE.md
  - .codebase/DOMAIN_MODELS.md
  - .codebase/MODULE_INDEX.md
  - contracts/ (relevant)
  - README.EN.md / README.VI.md
  - .instructions.md
  - CONTRIBUTING.md
```

### 2. Codebase Patterns (5 min)
```
Search for:
  - Similar features already implemented
  - Existing patterns (test fixtures, error handling, etc.)
  - Related modules and dependencies
  - Previous decisions (in memory files)
```

### 3. External Best Practices (5-10 min)
```
Research:
  - Official docs (Node.js, React, framework, etc.)
  - GitHub repositories (top 3 with similar feature)
  - Stack Overflow (if question is specific)
  - Framework/library GitHub Issues (for known issues)
```

### 4. Compile Research Note
```
Format:
  - Question: What are we deciding?
  - Local Evidence: What does codebase show?
  - External Evidence: What do best practices say?
  - Recommendation: Based on evidence, what's best?
  - Risks: What could go wrong?
  - Next Steps: What to verify?
```

## Output

Each research produces:

1. **Research Note** (saved to `.planning/RESEARCH_NOTES/`)
   - Format: `RESEARCH_[TASK_ID]_[DATE].md`
   - Required: Question, local evidence, external evidence, recommendation, risks

2. **Compiled Plan** (passed to `genesis-planning` automatically)
   - Pre-populated with research findings
   - Pre-populated with existing patterns
   - Pre-populated with risk/constraint list

## Token Saving Rules

- Read summaries before source files (use .codebase summaries)
- Target searches: Search for specific pattern, not broad topics
- Avoid pasting: Cite sources with line numbers, not full excerpts
- Trust cache: If recently researched, skip re-research
- Parallel: Run local + external research in parallel

## Acceptance Criteria

Research is complete when:

- [ ] Local documentation reviewed
- [ ] Codebase patterns identified
- [ ] 3+ external sources checked
- [ ] Research note compiled with recommendation
- [ ] Risks and constraints documented
- [ ] Plan passed to `genesis-planning` with research context

## Common Mistakes

- **Skipping local docs** - Wastes time researching what's already documented
- **Broad searches** - "How to build features" instead of "GraphQL subscriptions in Node.js"
- **Trusting stale docs** - Check issue date and GitHub activity
- **Forgetting to cite** - Always include source, date, and confidence level
- **Over-researching** - 15 min max per task (diminishing returns)

## Recovery Workflow

If research is inconclusive:

1. Identify the **primary source of uncertainty**
2. Research that ONE thing deeper (docs, GitHub issues, etc.)
3. If still unclear, document assumptions and ask user
4. Proceed with smallest reversible test

## Example: Feature Research

### User Request
```
/new-feature "Add real-time notifications with WebSocket"
```

### Auto-Research Output

**RESEARCH_WEBSOCKET_2026-05-31.md**:
```markdown
# Research: WebSocket Implementation

## Question
What's the best way to add real-time notifications with WebSocket?

## Local Evidence
- Codebase uses Express.js (Node.js server)
- Already uses Socket.io for chat (see: src/modules/chat/)
- Test pattern: fixtures + integration tests
- Error handling: try/catch + structured logging

## External Evidence
1. Socket.io docs recommend pub/sub pattern for scaling
2. GitHub trending (express-websocket): 2k+ stars
3. Best practice: Use Socket.io adapter for multi-server scaling

## Recommendation
Extend existing Socket.io setup (already familiar to team, reduces learning)
Add namespace: /notifications
Use Redis adapter for multi-server support

## Risks
- Single point of failure if Redis goes down
- Learning curve for team on Redis adapter (mitigated by docs)

## Next Steps
1. Check existing Socket.io configuration
2. Verify Redis availability
3. Create test fixtures for notification flow
```

### Auto-Generated Plan
```
**Phase 1: Socket.io Namespace Setup**
- Extend existing Socket.io (pattern: src/modules/chat/)
- Create /notifications namespace
- Add Redis adapter

**Phase 2: Authentication**
- Verify user can only receive own notifications
- Add auth middleware

**Phase 3: Notification Flow**
- Create API endpoint to trigger notification
- Add test fixtures
- Integration tests

**Risks from Research**:
- Redis dependency must be available
- Handle redis down gracefully
```

## Installation

Installed with Genesis Codex Harness by default.

```bash
npm install -g codex-genesis-harness@latest
```

## Commands

```bash
# Explicitly trigger research (optional - auto-triggers for /init, /new-feature, etc.)
/research "WebSocket real-time notifications"

# View research notes
cd .planning/RESEARCH_NOTES/
ls *.md | sort -r | head
```

## For Developers: How It Works

This skill runs as a **PreToolUse hook** in `.instructions.md`:

```yaml
PreToolUse:
  - IF: task_type in [init, new-feature, fix-bug, spec-change, architecture, design, plan, upgrade]
    THEN:
      1. Load research prompt template
      2. Run research (local docs + codebase + GitHub)
      3. Compile research note
      4. Generate initial plan from research
      5. Pass to user for review
```

**No code generated until research complete.**

---

**Genesis Research-First** | Enforce best-practice research workflow | v1.0
