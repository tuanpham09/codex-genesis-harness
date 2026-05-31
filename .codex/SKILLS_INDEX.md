# Genesis Skills Index

Complete reference for all 21 skills in the Genesis Harness system. Each skill provides specialized capabilities for specific development tasks.

## NEW IMPROVEMENTS (v2026-05-30 Phase 2)

The Genesis Harness has been enhanced with automated spec change propagation and CI/CD integration:

1. **Spec Impact Engine** (NEW skill #17)
   - Auto-detect when specs change
   - Auto-identify affected downstream phases
   - Auto-update specs and tests in dependent phases
   - Prevents cascading rework

2. **Spec Propagation Workflows** (NEW)
   - `/spec-change <file>` - Detect changes and generate impact report
   - `/propagate-spec` - Auto-update all downstream phases
   - `/validate-specs` - Verify all phases aligned with dependencies

3. **Phase Dependency Map** (NEW)
   - `.codebase/PHASE_DEPENDENCY_MAP.md` - Document phase dependencies
   - Created during `/init`
   - Used by spec-impact-engine for impact calculations

4. **CI/CD Auto-Sync** (NEW)
   - GitHub Actions workflow for automatic docs sync on merge
   - Auto-generate SPEC_CHANGELOG entries
   - Prevent merge if docs incomplete
   - Auto-update CURRENT_STATE.md

5. **Enhanced Post-Implementation**
   - Spec changes automatically propagate
   - Downstream phases auto-updated
   - Timeline recalculation automatic
   - Team notifications included

See each skill below for updated workflows using these new tools.

## Core System Skills

### genesis-harness
**Location**: `.codex/skills/genesis-harness/`

**Purpose**: Main entry point and project orchestration

**Commands**:
- `/init` - Initialize project planning harness
- `/new-feature <description>` - Start a new feature (run new-feature-qa.md first)
- `/fix-bug <description>` - Start a bug fix (run bug-fix-qa.md first)
- `/plan <description>` - Create implementation plan
- `/audit` - Audit codebase health
- `/review` - Review completed work
- `/status` - Show project status

**When to use**: First interaction, planning new work, status checks

**Output**: Implementation plans, checklists, guidance

**NEW MANDATORY Q&A WORKFLOWS**:
- Before `/new-feature`: Complete `.codex/skills/genesis-harness/checklists/new-feature-qa.md`
- Before `/fix-bug`: Complete `.codex/skills/genesis-harness/checklists/bug-fix-qa.md`
- Before implementation: Complete `.codex/skills/genesis-harness/checklists/requirements-validation.md`

**NEW POST-IMPLEMENTATION**:
- After successful implementation: Follow `.codex/skills/genesis-harness/resources/post-implementation-guide.md`
- Run `./scripts/detect-changes.sh` to auto-identify docs needing updates
- Create `.codebase/IMPLEMENTATION_HANDOFF.md` to document what was built
- Create `.codebase/RECOVERY_POINTS.md` to enable safe work resumption

**Important Note on `/init`**:
- Creates `.planning/` structure with 22+ documentation files
- Detects existing project info from README, package.json, code structure
- Asks for product brief confirmation before creating structure
- Creates **Phase 0 (Foundation)** as setup phase ONLY - no feature implementation
- Creates **PHASE_DEPENDENCY_MAP.md** - essential for spec-impact-engine
- Phase 0 focuses on completing documentation and establishing planning framework
- Feature phases (Phase 1+) are created later, only after requirements are confirmed and prioritized
- Does NOT create feature-specific phases until roadmap is finalized

---

### spec-impact-engine (genesis-spec-impact)
**Location**: `.codex/skills/spec-impact-engine/`

**Purpose**: Auto-detect spec changes and propagate to downstream phases (Codex-only)

⚠️ **CODEX-ONLY SKILL**: Genesis Harness uses Codex exclusively for all planning and coordination.

**Commands**:
- `/spec-change <file>` - Detect impact of spec changes
- `/propagate-spec` - Auto-update all dependent phases
- `/validate-specs` - Verify all phases aligned with dependencies

**When to use**:
- ✅ After specs change (API, database, requirements, UI)
- ✅ Before downstream phase work starts
- ✅ When ensuring changes don't break dependent phases
- ✅ When timeline impact needs recalculation

**Key Features**:
- **Detect**: Identifies breaking vs feature changes
- **Analyze**: Finds all affected downstream phases
- **Calculate**: Severity levels and impact estimates
- **Auto-Update**: Updates specs and tests automatically
- **Validate**: Runs tests on all affected phases
- **Report**: Detailed impact analysis with recommendations

**Severity Levels**:
- HIGH: Breaking change → Auto-update all phases
- MEDIUM: Potential impact → Flag for review
- LOW: Informational → Log suggestion

**Breaking Changes Detected**:
- API endpoint signature changes
- Database schema changes
- Authentication method changes
- UI requirement changes
- Configuration changes

**Integration with Genesis Harness**:
- Runs automatically after `/new-feature` completes (if specs changed)
- Runs after `/api-sync` (if API changes detected)
- Creates impact reports in `.codebase/IMPACT_REPORT_*.md`
- Uses `.codebase/PHASE_DEPENDENCY_MAP.md` for calculations
- Updates `.planning/SPEC_CHANGELOG.md` automatically

**Output**: Impact reports, updated phase specs, migration guides, impact analysis

---

### genesis-spec-propagation
**Location**: `.codex/skills/genesis-spec-propagation/`

**Purpose**: Automated specification propagation across project phases (Codex-only)

**When to use**:
- ✅ Auto-triggers after `/spec-change` completes
- ✅ Manual: `/propagate-specs` for manual propagation
- ✅ Manual: `/validate-alignment` to check phase consistency

**Workflow** (3 phases, 35 minutes):
1. **Change Detection** (5 min)
   - Analyze: Old spec vs new spec
   - Identify: Breaking vs feature vs non-impact
   - Map: Affected phases (2, 3, 4, 5)

2. **Downstream Impact Analysis** (10 min)
   - Build: Dependency graph
   - Trace: Propagation paths
   - Check: For conflicts

3. **Auto-Update Phases** (15 min)
   - Phase 2: Update test mocks + assertions
   - Phase 3: Update API contract + handler
   - Phase 4: Update client SDK types
   - Phase 5: Update E2E scenarios
   - Generate: Migration guide (if breaking)

4. **Validation** (5 min)
   - Syntax check all files
   - Cross-phase consistency
   - Run affected tests

5. **Completion** (2 min)
   - Create propagation log
   - Mark BREAKING changes for manual review
   - Ready for commit

**Features**:
- Auto-detect breaking vs feature vs non-impact changes
- Identify affected downstream phases
- Auto-update dependent specs & tests
- Cross-layer validation (API ↔ DB ↔ SDK ↔ UI)
- Migration guide generation
- Propagation logging & tracking

**Checklists**:
- `spec-change-detection.md` - Pre-propagation verification
- `phase-update-verification.md` - Post-update validation

**Playbooks**:
- `feature-change-propagation.md` - Adding new fields/endpoints
- `breaking-change-propagation.md` - Removing/changing fields (with migration strategy)

**Templates**:
- `migration-guide-template.md` - Template for breaking change guides

**Observability**:
- `propagation-tracking.md` - Log all spec changes for audit trail

**Auto-Trigger**: After `/spec-change` completes (via PreToolUse Hook #5 in .instructions.md)

**Rules**:
- BREAKING changes require manual review before commit
- All downstream phases must be updated
- Migration guides required for breaking changes
- Part of /spec-change completion criteria

**Output**: 
- Updated phase files (tests, backend, SDK, E2E)
- Migration guides (breaking changes only)
- SPEC_CHANGE_PROPAGATION.md log
- Propagation metrics & tracking

**Time Savings**: 45-60 min vs 60+ min manual (40% reduction)

**Impact**: Prevents phase misalignment, cascading rework, late-stage bugs

---

### genesis-docs-automation (NEW - Skill #21)
**Location**: `.codex/skills/genesis-docs-automation/`

**Purpose**: Automated documentation sync & validation across project phases (Codex-only)

**When to use**:
- ✅ Auto-triggers after tests pass (Phase 2 or Phase 5)
- ✅ Manual: `/update-docs` for manual documentation update
- ✅ Manual: `/validate-docs` to check documentation completeness

**Workflow** (5 phases, 35 minutes):
1. **Change Detection** (5 min)
   - Find: All changed files since last stable state
   - Categorize: By phase (1, 2, 3, 4, 5)
   - Classify: Change type (FEATURE, BUG_FIX, BREAKING, INTERNAL)
   - Map: To doc update requirements

2. **Doc Type Analysis** (10 min)
   - API contract changes? → API_REFERENCE.md update
   - Backend changes? → IMPLEMENTATION.md update
   - SDK changes? → SDK Reference update
   - All changes? → SPEC_CHANGELOG.md + IMPLEMENTATION_HANDOFF.md

3. **Auto-Update Documents** (15-20 min)
   - API_REFERENCE.md: Add endpoint docs
   - IMPLEMENTATION.md: Add implementation details
   - ARCHITECTURE.md: Update if data flow changed
   - SPEC_CHANGELOG.md: Add entry with migration guides
   - IMPLEMENTATION_HANDOFF.md: Update phase status + next steps

4. **Validation** (5 min)
   - Syntax check: All markdown files valid
   - Reference validation: All internal links exist
   - Cross-phase alignment: Types consistent, errors aligned
   - Completeness: All endpoints/methods documented
   - Flag BREAKING changes for manual review

5. **Completion** (2 min)
   - Create DOCS_UPDATE_LOG.md entry
   - Update .codebase/CURRENT_STATE.md
   - Gate BREAKING changes for manual approval
   - Ready for commit

**Features**:
- Auto-detect which docs need updates based on code changes
- Generate API documentation from contracts
- Generate implementation guides from code + tests
- Auto-generate changelog entries
- Auto-generate implementation handoff documents
- Cross-phase alignment validation
- Migration guide generation (breaking changes)
- Pre-commit validation gate

**Checklists**:
- `docs-validation.md` - Verify docs completeness before update
- `spec-alignment.md` - Cross-phase consistency validation

**Playbooks**:
- `auto-update-flow.md` - Complete docs update workflow (35 min example)
- `changelog-generation.md` - Generate changelog entries by change type

**Templates**:
- `changelog-entry-template.md` - Reusable changelog entry template
- `handoff-template.md` - Reusable implementation handoff template

**Observability**:
- `docs-tracking.md` - Log all doc changes, metrics, trends, improvements

**Auto-Trigger**: After tests pass (via PreToolUse Hook #6 in .instructions.md)

**Rules**:
- BREAKING changes require manual review before commit
- No stale documentation allowed
- All code changes must have documentation updates
- Part of test phase completion criteria

**Output**: 
- Updated documentation files (API ref, implementation guide, architecture)
- SPEC_CHANGELOG.md entries with migration guides
- IMPLEMENTATION_HANDOFF.md with phase status
- DOCS_UPDATE_LOG.md entry
- Migration guides (breaking changes only)

**Time Savings**: 30-60 min per phase vs manual (60% reduction)

**Impact**: Prevents documentation drift, single source of truth, zero manual doc sync

---

---

## Design & UX Skills

### genesis-new-design
**Location**: `.codex/skills/genesis-new-design/`

**Purpose**: Create design specifications for new frontend web experiences (Codex-only)

⚠️ **IMPORTANT**: This skill is for **Codex design specs ONLY**, not image generation.

**What Codex Does**:
- Write design specifications (markdown)
- Define design tokens (colors, spacing, typography)
- Create wireframes (ASCII + text descriptions)
- Document UX patterns and interactions
- Specify component hierarchies

**What Codex Does NOT Do**:
- Generate visual mockups (use image model AFTER specs)
- Create pixel-perfect designs (use image model)
- Generate images (external service)

**Features**:
- High-end UI/UX patterns (documented)
- Cinematic composition rules (specified)
- Typography scale definition
- Component system specification
- Design token generation

**When to use**: Building new features, documenting design decisions, creating design systems

**Workflow**:
1. Codex: Write design spec + tokens (→ *.md files)
2. Codex: Create wireframe diagrams (→ ASCII art)
3. Image model: Generate mockups (from Codex specs) ← OPTIONAL
4. Codex: Review and refine

**Output**: Design specifications, design tokens, wireframes, design system documentation

**Related**: See `.codex/MODEL_ALLOCATION.md` for clarification on Codex vs image models

---

### genesis-upgrade-design
**Location**: `.codex/skills/genesis-upgrade-design/`

**Purpose**: Audit and improve existing UI specs without changing behavior (Codex-only)

⚠️ **IMPORTANT**: This skill is for **Codex design audits ONLY**, not image generation.

**What Codex Does**:
- Audit existing UI code and design
- Identify generic patterns that need updating
- Write improved design specifications
- Define new design tokens
- Create updated wireframes

**What Codex Does NOT Do**:
- Generate visual mockups (use image model AFTER specs)
- Modify actual UI components (that's a separate task)
- Change application behavior

**Features**:
- Visual quality assessment
- Pattern consistency checking
- Design token generation
- Specification refinement
- Before/after documentation

**When to use**: Refreshing design systems, improving visual consistency, modernizing interfaces

**Workflow**:
1. Codex: Audit existing UI (review code + design)
2. Codex: Write upgraded design spec (→ *.md)
3. Codex: Define new design tokens
4. Codex: Create improved wireframes
5. Image model: Generate new mockups (from Codex specs) ← OPTIONAL
6. Codex: Review and refine

**Output**: Audit reports, upgraded design specifications, design tokens, improved wireframes

**Related**: See `.codex/MODEL_ALLOCATION.md` for clarification on Codex vs image models

---

### genesis-design-spec
**Location**: `.codex/skills/genesis-design-spec/`

**Purpose**: Create detailed design specifications and design systems (Codex-only)

⚠️ **CODEX-ONLY SKILL**: Pure design specification - Codex documents design decisions, NOT image generation.

**What Codex Does**:
- Component breakdowns (documentation)
- Spacing and sizing rules (specification)
- Color system definition (tokens)
- Typography scales (specification)
- Animation specifications (documentation)
- Design system documentation

**What This Skill Does NOT Include**:
- Image generation ✗
- CSS implementation ✗
- Visual mockups ✗

**Features**:
- Component specification format
- Design token definition
- Spacing system rules
- Color palette documentation
- Typography hierarchy specification
- Animation timing specification

**When to use**: Before development, documenting design decisions, creating design tokens, building design systems

**Output**: Design specifications, component libraries, design tokens, system documentation

**Related**: See `.codex/MODEL_ALLOCATION.md` for model responsibilities

---

## Architecture & Planning Skills

### genesis-architecture
**Location**: `.codex/skills/genesis-architecture/`

**Purpose**: System design and architectural decisions (Codex-only)

**Features**:
- Data flow modeling
- Component relationships
- Integration patterns
- Scalability analysis
- Dependency mapping

**When to use**: Major refactoring, scaling decisions, system redesign

**Output**: Architecture diagrams, decision documents, implementation roadmaps

---

### genesis-planning
**Location**: `.codex/skills/genesis-planning/`

**Purpose**: Break down large projects into implementation phases (Codex-only)

**Features**:
- Task decomposition
- Dependency analysis
- Risk identification
- Resource estimation
- Timeline planning

**When to use**: Starting large features, planning sprints, resource allocation

**Output**: Implementation plans, task lists, Gantt charts, risk analysis

---

### genesis-codebase-map
**Location**: `.codex/skills/genesis-codebase-map/`

**Purpose**: Understand and document codebase structure (Codex-only)

**Features**:
- Module dependency graphing
- Code relationship mapping
- Complexity analysis
- Hotspot identification
- Refactoring opportunity discovery

**When to use**: Onboarding, large refactoring, performance analysis

**Output**: Codebase maps, dependency graphs, complexity reports

---

## Contract & Testing Skills

### genesis-api-contract
**Location**: `.codex/skills/genesis-api-contract/`

**Purpose**: Design and validate API contracts (Codex-only)

**Features**:
- Schema definition
- Request/response validation
- Error handling contracts
- Version compatibility checks
- Breaking change detection

**When to use**: **BEFORE** implementing any API feature, API changes, integration work

**Output**: Contract definitions, schema files, test cases

---

### genesis-api-sync
**Location**: `.codex/skills/genesis-api-sync/`

**Purpose**: Automatic API contract synchronization with implementation (Codex-only)

**Features**:
- Endpoint change detection
- Schema extraction from code
- Contract auto-update
- Breaking change identification
- Migration guide generation
- Test contract generation

**When to use**: **AFTER** implementing API features or changes, before committing API changes

**Commands**:
- `invoke api-sync-skill` - Sync API contracts with implementation

**Output**: Updated API_CONTRACTS.md, migration guides, test contracts

**Related Artifacts**:
- `.codebase/API_CONTRACTS.md` - Single source of truth for all API specifications
- `.codex/skills/api-sync-skill/templates/api-change-template.md` - Use for documenting API changes
- `.codex/skills/api-sync-skill/checklists/api-sync-checklist.md` - Verification checklist

---

### genesis-ui-ux-test
**Location**: `.codex/skills/genesis-ui-ux-test/`

**Purpose**: Create UI/UX test specifications (Codex-only)

**Features**:
- User flow testing
- Interaction validation
- Accessibility compliance
- Visual regression detection
- Component state testing

**When to use**: UI development, accessibility reviews, design validation

**Output**: Test specifications, test scenarios, acceptance criteria

---

## Implementation Skills

### genesis-pipeline-orchestration
**Location**: `.codex/skills/genesis-pipeline-orchestration/`

**Purpose**: Codex orchestrates project workflows and external services (Codex-only orchestrator)

⚠️ **CODEX IS THE ORCHESTRATOR**: Codex coordinates all project work, including when to use external services (image generation, voice, etc.).

**Features**:
- Codex workflow coordination
- Phase sequencing
- External service dispatch (DALL-E, ElevenLabs, etc.) 
- Error recovery
- State management
- Performance optimization

**Key Principle**:
Codex doesn't hand off control to other models mid-project. 
- ✅ Codex makes decisions
- ✅ Codex calls external services when needed (as tools)
- ✅ Codex reviews results
- ✅ Codex continues work

**When to use**: Complex multi-step workflows, multi-phase projects, external service coordination

**Output**: Pipeline configurations, workflow orchestration rules, integration specs

**Related**: See `.codex/MODEL_ALLOCATION.md` for Codex role in orchestration

---

### genesis-harness-engineering
**Location**: `.codex/skills/genesis-harness-engineering/`

**Purpose**: Test-first development harness implementation (Codex-only)

**Features**:
- Test-first workflow enforcement
- Fixture management
- Mock/stub generation
- Coverage tracking
- Contract validation

**When to use**: Development, testing, quality assurance, coverage improvement

**Output**: Test suites, fixtures, coverage reports

---

### genesis-ai-provider
**Location**: `.codex/skills/genesis-ai-provider/`

**Purpose**: Codex AI capabilities, token optimization, and orchestration

⚠️ **CODEX-ONLY**: This project uses Codex exclusively. External services (image generation, voice, etc.) are orchestrated BY Codex, not replacing it.

**What Codex Does**:
- Orchestrates project work with Codex brain + external hands
- Manages token budgets for Codex usage
- Optimizes prompts for Codex efficiency
- Coordinates with external services (DALL-E, ElevenLabs, etc.)

**Key Principle**: 
- ✅ Codex is PRIMARY (100-200k tokens/project)
- ✅ External services are SPECIALIZED (image render, voice gen, etc.)
- ✅ Codex orchestrates, not replaces

**Features**:
- Token budget optimization
- Prompt engineering for Codex
- External service coordination
- Context window management
- Caching strategies

**When to use**: Project setup, token optimization, external service coordination

**Output**: Token budgets, optimization rules, service integration configs

**Related**: See `.codex/MODEL_ALLOCATION.md` for detailed model responsibilities

---

## Documentation & Release Skills

### genesis-docs
**Location**: `.codex/skills/genesis-docs/`

**Purpose**: Documentation generation and maintenance (Codex-only)

**Features**:
- API documentation
- User guides
- Architecture guides
- Code examples
- Tutorial creation

**When to use**: Project kickoff, feature completion, release preparation

**Output**: Documentation files, guides, examples

---

### genesis-research-first (NEW v2.1)
**Location**: `.codex/skills/genesis-research-first/`

**Purpose**: Auto-enforce research-first workflow before any planning (Codex-only)

**Auto-Triggers On**:
- `/init` - Project initialization
- `/new-feature` - New features
- `/fix-bug` - Bug fixes
- `/spec-change` - Spec/architecture changes
- `/architecture` - System design
- `/design` - UI/UX changes
- `/plan` - Planning from scratch
- `/upgrade` - Major refactoring

**Automatic Workflow**:
1. Research Phase (local docs + codebase + GitHub)
2. Compile research notes with evidence
3. Generate initial plan from research
4. Present to user for review & approval

**Features**:
- Auto-trigger research for important tasks
- Research local documentation first
- Search codebase for existing patterns
- Research GitHub/external best practices
- Compile evidence-based research notes
- Generate pre-populated plans from research
- No guesswork, all decisions evidence-based

**When to use**: Automatic! Triggered before `/init`, `/new-feature`, `/fix-bug`, etc.

**Output**: Research notes (`.planning/RESEARCH_NOTES/`), pre-populated plans, evidence-based recommendations

**Token Savings**: Research targets specific topics (not broad), cites sources instead of copying content

---

### genesis-research
**Location**: `.codex/skills/genesis-research/`

**Purpose**: Feature research and best-practice analysis (Codex-only)

**Features**:
- Solution analysis
- Best-practice research
- Technology evaluation
- Implementation guidance
- Risk assessment

**When to use**: Planning features, evaluating technologies, solving complex problems

**Output**: Research reports, solution recommendations, implementation guides

---

### genesis-debug-guide (NEW v2.1)
**Location**: `.codex/skills/genesis-debug-guide/`

**Purpose**: Systematic debugging for test failures, runtime errors, and production bugs (Codex-only)

**Auto-Triggers After**:
- ✅ `/fix-bug` completes successfully → Auto-verify fix quality
- ✅ Test failures during development → Guide systematic investigation
- ✅ Runtime errors → Guide observability-first troubleshooting

**Debugging Workflow**:
1. **Problem Isolation (RED)**: Reproduce failure consistently
2. **Root Cause Analysis**: Evidence-based investigation
3. **Fix & Verification (GREEN)**: Minimal fix + test verification
4. **Regression Prevention (IMPROVE)**: Add tests for edge cases

**Checklists Provided**:
- `test-failure-debug.md` - Systematic test failure investigation
- `production-bug-debug.md` - Production issue assessment
- `flaky-test-investigation.md` - Intermittent failure debugging

**Playbooks by Bug Type**:
- `unit-test-failures.md` - Unit test specific debugging
- `integration-test-failures.md` - Integration test debugging
- `e2e-test-failures.md` - End-to-end test debugging
- `runtime-errors.md` - Runtime/production error investigation

**Features**:
- Test failure investigation guidance
- Production bug debugging strategies
- Flaky test debugging (5 common patterns)
- Root cause analysis templates
- Debug commands by language (Node.js, Python, PHP, Ruby, Go)
- Observability inspection workflows

**Auto-Verification After /fix-bug**:
1. Fix Verification: Tests pass, no debug code
2. Coverage Check: Bug test exists, fails without fix
3. Regression Prevention: Edge case tests added
4. Investigation Log: Findings documented

**When to use**: 
- After `/fix-bug` (automatic)
- When test fails (manual call)
- When investigating production bugs (manual call)
- When test is flaky (manual call)

**Output**: Investigation logs, debug findings, verified fixes, regression prevention tests

**Token Savings**: Common patterns documented (reuse, don't re-research)

---

### genesis-release
**Location**: `.codex/skills/genesis-release/`

**Purpose**: Manage releases and deployments (Codex-only)

**Features**:
- Version management
- Changelog generation
- Release validation
- Deployment coordination
- Rollback procedures

**When to use**: Release preparation, version management, deployment

**Output**: Release notes, deployment scripts, version files

---

## Skill Selection Matrix

### By Task Type

| Task | Skills to Use |
|------|---|
| New feature | `/init` → `planning-skill` → `api-contract-skill` → implement |
| Bug fix | `genesis-harness /fix-bug` → reproduce → fix → test |
| API work | `api-contract-skill` (FIRST) → implement → test |
| UI design | `genesis-new-design` or `genesis-upgrade-design` |
| Refactoring | `codebase-map-skill` → `architecture-skill` → implement |
| Testing | `harness-engineering-skill` → test-first workflow |
| Documentation | `docs-skill` after feature complete |
| Release | `release-skill` before shipping |

### By Role

**Frontend Developer**:
- `genesis-new-design` / `genesis-upgrade-design`
- `ui-ux-test-skill`
- `api-contract-skill`
- `harness-engineering-skill`

**Backend Developer**:
- `architecture-skill`
- `api-contract-skill` (FIRST for APIs)
- `pipeline-orchestration-skill`
- `ai-provider-skill` (if AI features)

**Tech Lead**:
- `genesis-harness` (orchestration)
- `planning-skill`
- `architecture-skill`
- `codebase-map-skill`

**QA Engineer**:
- `harness-engineering-skill`
- `ui-ux-test-skill`
- `api-contract-skill` (validation)

---

## Skill Dependencies

```
genesis-harness (entry point)
│
├─ planning-skill (plan work)
│  ├─ architecture-skill (design)
│  └─ codebase-map-skill (analyze)
│
├─ api-contract-skill (MUST RUN FIRST for APIs)
│  └─ harness-engineering-skill (test)
│
├─ design-spec-skill (UI work)
│  └─ genesis-new-design / genesis-upgrade-design
│
├─ pipeline-orchestration-skill (AI workflows)
│  └─ ai-provider-skill (models)
│
└─ release-skill (deployment)
   └─ docs-skill (documentation)
```

---

## Quick Reference Commands

### Start New Feature
```bash
Use $genesis-harness
/new-feature description of what you want to build
```

### Fix Bug
```bash
Use $genesis-harness
/fix-bug description of the bug
```

### Design New UI
```bash
Use $genesis-new-design
[describe the page/component you want]
```

### Plan Complex Work
```bash
Use $planning-skill
Plan: [detailed description of work]
```

### Create API Contract
```bash
Use $api-contract-skill
New endpoint: [method] /path/to/resource
```

### Orchestrate AI Pipeline
```bash
Use $pipeline-orchestration-skill
Pipeline: [describe the workflow]
```

---

## Skill Configuration

Each skill lives in `.codex/skills/<skill-name>/` and contains:

```
skill-name/
├── SKILL.md              # Skill definition and parameters
├── templates/            # Templates for this skill
├── examples/             # Example outputs
├── checklists/          # Verification checklists
└── docs/                # Detailed documentation
```

**To use**: Reference skill name with `$skill-name` or invoke via agent commands.

**To customize**: Edit `SKILL.md` in the skill directory.

---

## Skill Invocation Priority

**For best results, follow this order:**

1. **Always start with** `genesis-harness /init` or `/plan`
2. **For APIs** use `api-contract-skill` BEFORE implementation
3. **For design** use `genesis-new-design` or `genesis-upgrade-design`
4. **For complex work** use `planning-skill` → `architecture-skill`
5. **For testing** use `harness-engineering-skill` throughout
6. **Before release** use `release-skill` → `docs-skill`

---

## Troubleshooting

**Skill not found?**
- Check `.codex/skills/` directory exists
- Run `./scripts/install.sh` to reinstall
- Verify `CODEX_HOME` environment variable

**Skill output not meeting expectations?**
- Check skill version in `.codex/skills/<skill-name>/SKILL.md`
- Review examples in `<skill-name>/examples/`
- Check checklists in `<skill-name>/checklists/`

**Need to create new skill?**
- Follow template in `<skill-name>/SKILL.md`
- Add templates, examples, checklists
- Document in this index
