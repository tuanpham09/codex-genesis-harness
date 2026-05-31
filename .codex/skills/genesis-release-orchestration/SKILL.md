---
name: genesis-release-orchestration
description: "Automate release workflows from semantic versioning through production rollback plans. Detects breaking changes, calculates version bumps, generates deployment runbooks, migration guides, release notes, and approval gates. Reduces 3-5 hour manual release prep to under 30 minutes."
---

# genesis-release-orchestration

## Purpose

Transform manual release management (3-5 hours per release) into automated orchestration (under 30 minutes). Automatically detects semantic version bump needed, generates environment-specific deployment runbooks, produces migration guides for breaking changes, creates rollback procedures, and enforces approval gates based on release risk score.

## When to use

- Before any npm publish, version tag, or production deployment
- After `genesis-spec-propagation` detects breaking changes
- When running `/prep-release`, `/deployment-strategy`, or `/rollback-plan` commands
- When VERSION file is bumped and tests pass
- Before merging release branch to main

## When NOT to use

- For local development builds not intended for release
- For hotfixes that bypass normal release channels (use emergency runbook instead)
- When no code changes since last release (documentation-only releases)

## Inputs required

- Current VERSION file content (e.g., `v2.4.1`)
- List of all changes since last release tag
- `SPEC_CHANGELOG.md` entries (breaking changes source)
- Deployment environment config (dev/staging/prod)
- Consumer list from contracts (for migration impact assessment)

## Outputs required

- Proposed semantic version (e.g., `v2.4.1 → v3.0.0`)
- Deployment risk score (1-10) with justification
- Environment-specific runbooks (dev/staging/prod)
- Deployment strategy document (blue-green/canary/rolling)
- Release notes with breaking change warnings
- Consumer migration guides (per breaking change)
- Rollback procedure document
- Pre/post deployment checklists
- Release approval status

## Required tests

- All tests passing at 80%+ coverage before release approval
- Smoke test suite passing in staging before production runbook
- Contract compatibility check (no unmitigated breaking changes)
- Rollback procedure dry-run validation

## Required fixtures

- `fixtures/release/version-bump-expected.json` — semantic version decision
- `fixtures/release/deployment-strategy-expected.json` — strategy selection
- `fixtures/release/release-readiness-expected.json` — pre-release gate

## Required contract updates

- Update `contracts/agents/ReleaseOrchestrator/` when release workflow changes
- Update `SPEC_CHANGELOG.md` with release entry
- Update VERSION file with new version number

## Required codebase map updates

- `.codebase/CURRENT_STATE.md`: Record release version + date
- `.codebase/KNOWN_PROBLEMS.md`: Document any release blockers
- `.codebase/EVOLUTION_PLAN.md`: Update next release milestones

## Token saving rules

- Read VERSION file and SPEC_CHANGELOG.md only (don't re-scan full codebase)
- Summarize breaking changes as count + type, not full text
- Reuse risk score calculation from impact analysis (don't recalculate)
- Template runbooks from existing templates, fill variables only
- Link to existing migration guides instead of regenerating

## Acceptance criteria

- Semantic version correctly calculated from change types
- Risk score matches breaking change count and deployment complexity
- Runbooks include pre/deployment/post/rollback sections
- All breaking changes have consumer migration guides
- Release notes accurately reflect all changes
- Approval gate matches risk score (auto/lead/tech-lead/CTO)
- Rollback procedure tested and documented

## Common mistakes

- Skipping migration guides for breaking changes
- Using rolling deployment for high-risk (>6) releases (use canary instead)
- Forgetting to check consumer compatibility before release
- Publishing without verifying rollback procedure is valid
- Marking release as approved before 80%+ test coverage confirmed

## Recovery workflow

If release fails after deployment:
1. Execute rollback runbook immediately (target: under 5 min)
2. Verify all health checks pass post-rollback
3. Document incident in `.codebase/KNOWN_PROBLEMS.md`
4. Root cause analysis: which validation gate missed the issue?
5. Add regression test or gate to prevent recurrence
6. Increment PATCH version for the fix release

---

## Core Capability

Transform manual release management (3-5 hours per release) into automated orchestration (5-10 minutes per release) with:

✅ **Semantic Versioning Automation** - Detect breaking/feature/patch changes, auto-calculate version bump  
✅ **Deployment Strategy Generation** - Auto-generate blue-green, canary, rolling deployment plans  
✅ **Breaking Change Detection** - Identify all breaking changes across phases, auto-flag for communication  
✅ **Migration Guide Generation** - Auto-compile migration guides for consumers  
✅ **Rollback Plan Automation** - Generate step-by-step rollback procedures  
✅ **Deployment Runbook Generation** - Auto-create environment-specific runbooks  
✅ **Production Health Check Automation** - Generate pre/post deployment verification steps  
✅ **Release Notes Generation** - Auto-compile comprehensive release notes from changelog  
✅ **Environment-Specific Config** - Auto-generate config for dev/staging/prod with validation  
✅ **Deployment Approval Gate** - Enforce manual review for high-risk releases  

---

## When to Use

**Auto-triggers**:
- ✅ After `/release` command (manual trigger in CLI)
- ✅ Auto-triggered when VERSION file bumped + tests pass

**Manual invocation**:
- `/prep-release [version]` - Prepare release artifacts
- `/deployment-strategy [env]` - Generate deployment plan
- `/validate-release` - Verify release readiness
- `/create-runbook [env]` - Generate runbook for environment
- `/rollback-plan` - Generate rollback procedure
- `/release-notes` - Compile release notes

---

## 5-Phase Workflow (120 min execution)

### **Phase 1: Version Detection & Semantic Versioning** (15 min)

**Input**: Current VERSION file + all code changes since last release

**Process**:
1. Parse current version (e.g., v2.4.1)
2. Analyze all changes since last tag:
   - Extract breaking changes from SPEC_CHANGELOG.md
   - Extract new features from SPEC_CHANGELOG.md
   - Extract bug fixes from SPEC_CHANGELOG.md
3. Apply semantic versioning rules:
   - BREAKING → Major version bump (v2.x.x → v3.0.0)
   - FEATURE (new optional) → Minor version bump (v2.x.x → v2.5.0)
   - BUG_FIX or INTERNAL → Patch version bump (v2.x.x → v2.4.2)
4. Validate version format (MAJOR.MINOR.PATCH)
5. Flag if version bump was manual (verify intentional)

**Output**: Proposed version (e.g., v2.5.0), change summary, breaking change count

**Example**:
```
Current Version: v2.4.1
Changes analyzed:
  - 3 BREAKING changes detected
  - 5 FEATURE changes
  - 2 BUG_FIX changes

Semantic versioning decision:
  - BREAKING changes require MAJOR bump
  - Proposed: v2.4.1 → v3.0.0
  - Reason: 3 breaking changes (incompatible with consumers)

Risk flag: HIGH (major version bump)
Manual review: REQUIRED before proceeding
```

---

### **Phase 2: Impact Analysis & Risk Assessment** (20 min)

**Input**: Proposed version, breaking changes, deployment matrix

**Process**:
1. **Breaking Change Analysis**:
   - Enumerate each breaking change:
     * What changed? (endpoint removed, field type changed, behavior inverted, etc.)
     * Why? (business requirement, security fix, performance)
     * Consumer impact? (which API consumers affected)
     * Mitigation strategy? (hard break, deprecation period, parallel APIs)
   
2. **Consumer Impact Mapping**:
   - Query all registered API consumers (from contracts)
   - Determine compatibility: will each consumer work with new version?
   - Identify clients requiring migration
   - Estimate migration effort per consumer

3. **Deployment Risk Assessment**:
   - Database schema changes? (migrations required)
   - New dependencies? (version compatibility)
   - Infrastructure changes? (scaling, new services)
   - Backward compatibility? (can phase back if needed)
   - Rollback feasibility? (can restore previous state)

4. **Release Complexity Score** (1-10):
   - 1-2: Patch only, low risk (auto-approve possible)
   - 3-5: Minor + some bugs, medium risk (review recommended)
   - 6-8: Major with breaking changes, high risk (manual review required)
   - 9-10: Major with DB migrations + breaking changes, critical risk (CEO sign-off)

5. **Deployment Strategy Selection**:
   - Low risk → Rolling deployment (gradual rollout)
   - Medium risk → Blue-green (instant switchback)
   - High risk → Canary (1% → 10% → 50% → 100%)
   - Critical risk → Canary + manual approval at each step

**Output**: Risk score, impact matrix, recommended deployment strategy, flagged items requiring manual review

**Example**:
```
BREAKING CHANGE ANALYSIS:
  Breaking Change #1: Removed POST /users/:id/avatar endpoint
    → Consumer Impact: 3 clients affected (MobileApp v1.0-1.2)
    → Migration: Clients must use PUT /users/:id instead
    → Migration effort: 2-3 hours per client

  Breaking Change #2: Changed response format { user: {...} } → { data: {...} }
    → Consumer Impact: 12 clients affected (WebApp, Dashboard, Admin)
    → Migration: All clients need response mapping update
    → Migration effort: 2-4 hours per app

DEPLOYMENT RISK SCORE: 8/10 (HIGH RISK)
  - 2 breaking changes (consumer migration required)
  - 8 affected clients/services
  - Requires manual approval before proceeding
  - Recommended: Canary deployment (1% → 10% → 50% → 100%)

RECOMMENDED DEPLOYMENT STRATEGY: Canary
  - Stage 1: Deploy to 1% of traffic (1 hour monitoring)
  - Stage 2: Deploy to 10% of traffic (2 hours monitoring)
  - Stage 3: Deploy to 50% of traffic (4 hours monitoring)
  - Stage 4: Deploy to 100% of traffic (full rollout)
  - Total deployment window: 8 hours

MANUAL REVIEW GATE: REQUIRED
  Reasons:
    ❌ Breaking changes detected (requires consumer notification)
    ❌ High risk score (8/10)
    ❌ Multiple clients affected (8+)
    ❌ Consumer migration required
```

---

### **Phase 3: Deployment Strategy & Runbook Generation** (30 min)

**Input**: Risk assessment, deployment strategy selected, environment config

**Process**:

1. **Generate Deployment Runbook** for each environment:
   - **Pre-Deployment** (10-15 min):
     * Database migration script (if needed)
     * Config validation
     * Dependency check
     * Health check baseline
   - **Deployment** (20-30 min):
     * Docker image build command
     * Container registry push
     * Kubernetes/ECS deployment command
     * Service restart commands
     * DNS/load balancer updates
   - **Post-Deployment Verification** (10-15 min):
     * Health check endpoints
     * Smoke test scenarios
     * Database integrity check
     * Performance baseline validation
   - **Rollback** (5-10 min):
     * Rollback trigger conditions
     * Rollback command
     * Verification steps post-rollback

2. **Generate Deployment Strategy Document**:
   - If Blue-Green:
     * Deploy to Blue environment (parallel prod clone)
     * Verify all health checks
     * Switch routing to Blue
     * Keep Green as instant rollback
   - If Canary:
     * Stages with % traffic allocation
     * Monitoring metrics per stage
     * Go/no-go criteria per stage
   - If Rolling:
     * How many instances per wave
     * Health check between waves
     * Instant rollback if health check fails

3. **Generate Environment-Specific Runbooks**:
   - Development (auto-deploy after tests)
   - Staging (manual approval, full validation)
   - Production (multiple approvals, canary default)

**Output**: 3 environment-specific runbooks, deployment strategy guide, pre/post checklists

---

### **Phase 4: Release Communication & Migration Guides** (25 min)

**Input**: Breaking changes, affected consumers, migration strategies

**Process**:

1. **Generate Release Notes** (for public consumption):
   - Headline: "Version X.Y.Z Released"
   - What's new (new features with examples)
   - What's fixed (bug fixes with descriptions)
   - What's deprecated (old endpoints/fields with timeline)
   - BREAKING CHANGES section (bold, prominent):
     * What changed
     * Why it changed
     * How to migrate
     * Migration deadline
     * Support contact
   - Security fixes (if any)
   - Performance improvements (if any)
   - Known issues (if any)

2. **Generate Migration Guides**:
   - For each breaking change, generate:
     * Before/after code examples
     * Step-by-step migration instructions
     * Common pitfalls and how to avoid
     * Troubleshooting section
     * Support contact information

3. **Generate Consumer Communication Template**:
   - Email template for API consumers
   - Slack notification template
   - In-app banner template (if applicable)
   - FAQ template

**Output**: Release notes, per-consumer migration guides, communication templates, FAQ

---

### **Phase 5: Validation Gate & Approval Workflow** (30 min)

**Input**: All generated artifacts, release readiness checklist

**Process**:

1. **Pre-Release Validation**:
   - ✓ All tests pass? (80%+ coverage)
   - ✓ Version correctly bumped?
   - ✓ CHANGELOG.md updated?
   - ✓ Migration guides created (if breaking)?
   - ✓ Release notes accurate?
   - ✓ Runbooks verified?
   - ✓ Consumer communication drafted?
   - ✓ Rollback plan tested?
   - ✓ Database migrations tested (if applicable)?
   - ✓ Performance metrics baseline established?

2. **Approval Workflow**:
   - Low risk (score 1-2): Auto-approved if all checks pass
   - Medium risk (score 3-5): Requires Lead Engineer approval
   - High risk (score 6-8): Requires Tech Lead + Product Lead approval
   - Critical risk (score 9-10): Requires CTO/VP approval + scheduled deployment window

3. **Create Release Tag**:
   - Tag format: `v{MAJOR}.{MINOR}.{PATCH}`
   - Tag message includes:
     * Summary of changes
     * Breaking changes (if any)
     * Migration guide link
     * Deployment instructions
   - Example: `git tag -a v3.0.0 -m "Major release: breaking API changes with migration guide"`

4. **Generate Release Report**:
   - Version bumped: X.X.X → Y.Y.Y
   - Change breakdown: N breaking, N features, N bugs fixed
   - Risk score: N/10
   - Deployment strategy: [Blue-Green|Canary|Rolling]
   - Approval status: [Approved|Pending|Blocked]
   - Approval chain: Who approved at what time
   - Ready to deploy: Yes/No

**Output**: Release approval status, deployment clearance, git tag created, release report

---

## Supporting Files

### **Checklists** (2 files)

**File 1: pre-release-validation.md** (350+ lines)
- Is version correctly bumped?
- Are all breaking changes documented?
- Do all tests pass (80%+)?
- Are migration guides complete?
- Is deployment runbook tested?
- Are health checks configured?
- Is rollback plan verified?
- Have consumers been notified?
- Is deployment window scheduled?
- Have required approvals been obtained?

**File 2: post-deployment-verification.md** (300+ lines)
- Did deployment succeed?
- Do all health checks pass?
- Is database schema consistent?
- Are metrics within expected range?
- Are error rates normal?
- Are all consumers compatible?
- Can users perform critical workflows?
- Are logs clean (no critical errors)?
- Is rollback still available (if needed)?
- Should we proceed to next stage (if canary)?

---

### **Playbooks** (2 files)

**File 1: semantic-versioning-automation.md** (600+ lines)
- Complete walkthrough of version bump decision
- Breaking change examples (5+ scenarios):
  * Endpoint removal
  * Response format change
  * Field type change
  * Authentication change
  * Database schema change
- Semantic versioning decision tree (breaking→major, feature→minor, patch→patch)
- Real example: API evolution from v1 → v2 → v3 with all breaking changes documented

**File 2: canary-deployment-orchestration.md** (800+ lines)
- Complete canary deployment workflow
- Stage breakdown (1% → 10% → 50% → 100%)
- Monitoring metrics per stage
- Go/no-go decision criteria per stage
- How to handle failures at each stage
- Real example: Rolling out v2.5.0 with new feature + bug fix through all 4 canary stages
- Includes: decision points, rollback triggers, monitoring dashboard setup

---

### **Templates** (2 files)

**File 1: release-runbook-template.md** (500+ lines)
- Pre-deployment: Database migrations, config validation, dependency check
- Deployment: Build, push, deploy, restart
- Post-deployment: Health checks, smoke tests, validation
- Rollback: Trigger conditions, rollback steps, verification

**File 2: deployment-strategy-template.md** (400+ lines)
- Blue-green: Setup, switch, rollback
- Canary: Stages, metrics, decision tree
- Rolling: Wave size, health checks, failure handling

---

### **Observability** (1 file)

**File: release-tracking.md** (500+ lines)
- RELEASE_LOG.md format: date, version, strategy, status, duration, approvals
- release-metrics.csv: structured data for analysis
- Deployment success rate tracking
- Time analysis by phase
- Risk score trends
- Rollback frequency analysis
- Consumer migration tracking
- Query examples for continuous improvement

---

## Feature Capabilities

### **Auto-Detection**

- ✅ Detects semantic version bump needed (breaking/feature/patch)
- ✅ Identifies breaking changes from SPEC_CHANGELOG.md
- ✅ Maps affected API consumers
- ✅ Calculates deployment risk score
- ✅ Recommends deployment strategy

### **Auto-Generation**

- ✅ Generate semantic version number
- ✅ Generate deployment runbook per environment
- ✅ Generate deployment strategy document
- ✅ Generate migration guides for breaking changes
- ✅ Generate release notes with breaking change warnings
- ✅ Generate consumer communication templates
- ✅ Generate rollback procedures
- ✅ Generate pre/post deployment checklists

### **Auto-Validation**

- ✅ Verify all tests pass (80%+ required)
- ✅ Verify version correctly bumped
- ✅ Verify CHANGELOG.md updated
- ✅ Verify migration guides present (if breaking changes)
- ✅ Verify rollback plan tested
- ✅ Verify all approvals obtained
- ✅ Flag risky releases for manual review

### **Auto-Approval**

- ✅ Low-risk patches: auto-approve
- ✅ Medium-risk releases: require Lead Engineer approval
- ✅ High-risk releases: require Tech Lead + Product approval
- ✅ Critical releases: require CTO approval + scheduled window

---

## Integration Points

### **Upstream Dependencies**
- `genesis-spec-propagation` ✅ - Provides breaking change list
- `genesis-docs-automation` ✅ - Provides changelog entries
- `spec-impact-engine` ✅ - Detects phase changes
- `.codebase/SPEC_CHANGELOG.md` ✅ - Breaking change source
- `VERSION` file ✅ - Current version source

### **Downstream Dependencies**
- `genesis-pipeline-orchestration` - Triggers deployment
- `genesis-observability` (Priority 5) - Monitors post-deployment
- CI/CD system (GitHub Actions, GitLab CI, Jenkins)
- Deployment infrastructure (Kubernetes, ECS, Heroku)

---

## Rules & Gates

**CRITICAL**:
- ❌ BREAKING changes ALWAYS require manual review before release
- ❌ NO release without 80%+ test coverage
- ❌ NO release without changelog entry
- ❌ NO release without migration guides (if breaking)
- ❌ NO production deployment without approved runbook
- ❌ NO skipping pre-deployment validation checklist

**Risk Assessment**:
- Score 1-2: Auto-approve (if checks pass)
- Score 3-5: Lead approval required
- Score 6-8: Lead + Product approval required
- Score 9-10: CTO + scheduled deployment window required

**Deployment Strategy**:
- Low risk (1-2) → Rolling deployment
- Medium risk (3-5) → Blue-green deployment
- High risk (6-8+) → Canary deployment with approval gates

---

## Error Codes & Troubleshooting

### **Error: VERSION_MISMATCH**
```
Problem: Version in VERSION file doesn't match semantic versioning rules
Solution: 
  1. Analyze changes since last release
  2. Recalculate version bump (breaking vs feature vs patch)
  3. Update VERSION file
  4. Verify all approvals agree with new version
```

### **Error: BREAKING_CHANGES_NOT_DOCUMENTED**
```
Problem: Breaking changes detected but no migration guide found
Solution:
  1. Add entries to SPEC_CHANGELOG.md for each breaking change
  2. Run genesis-docs-automation to generate migration guides
  3. Have architecture team review migration guides
  4. Update release notes with migration instructions
```

### **Error: CONSUMER_COMPATIBILITY_CHECK_FAILED**
```
Problem: Some consumers incompatible with new version
Solution:
  1. Identify which consumers are affected
  2. Determine if breaking change is avoidable
  3. If avoidable: Revert breaking change, use backwards-compatible approach
  4. If required: Notify consumers, schedule migration window, use canary deployment
```

### **Error: ROLLBACK_PLAN_MISSING**
```
Problem: Can't generate rollback plan for this release
Solution:
  1. Review database migrations (do they have rollback scripts?)
  2. Review config changes (are old configs still available?)
  3. Review deployment artifacts (can previous version be restored?)
  4. If any impossible: Mark release as HIGH RISK, schedule lower traffic deployment
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Release prep time | 5-10 min | ✅ Auto-orchestrated |
| Manual approval time | <1 hour | ✅ Clear criteria |
| Deployment time | <30 min | ✅ Strategy dependent |
| Post-deployment validation | <15 min | ✅ Auto-checklist |
| Rollback time (if needed) | <5 min | ✅ Runbook-driven |
| **Total release cycle** | **<2 hours** | **✅ vs 3-5 hours manual** |
| Breaking change communication | 100% | ✅ Template-driven |
| Consumer migration success | 100% | ✅ Guide-driven |
| Production stability post-release | 99%+ uptime | ✅ Canary strategy |

---

## Time Savings

**Before** (Manual):
- Version decision: 15 min
- Runbook creation: 30 min
- Migration guides: 30 min
- Release notes: 20 min
- Approval coordination: 30 min
- Deployment: 60 min
- Validation: 20 min
- **TOTAL: 3-5 hours (with risk)**

**After** (Genesis orchestrated):
- Version detection: 2 min (auto)
- Runbook generation: 3 min (auto)
- Migration guides: 2 min (auto)
- Release notes: 2 min (auto)
- Approval validation: 1 min (auto)
- Manual review (if needed): 5-15 min
- Deployment: 20-60 min (strategy dependent)
- Validation: 2 min (auto-checklist)
- **TOTAL: 37-90 min (37-50 min faster, 70% reduction)**

---

## Next Phase

After genesis-release-orchestration complete:
- **Priority 4**: genesis-performance-profiling (benchmarking automation)
- **Priority 5**: genesis-observability (monitoring + incident response automation)
- **Target**: 100% harness completeness (10/10 architecture score)

---

**Status**: SKILL DEFINITION COMPLETE  
**Ready for**: Implementation phase (8-10 files creation)  
**Estimated completion**: Priority 3 done → Ready for Priority 4-5
