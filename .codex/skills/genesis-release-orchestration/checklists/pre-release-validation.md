# Pre-Release Validation Checklist

**Purpose**: Verify release readiness before deployment approval  
**Duration**: 10-15 minutes  
**Risk**: Critical - must pass all checks for approval  

---

## Section 1: Version & Changelog Verification (5 min)

- [ ] **VERSION file updated correctly**
  - Current version in `/VERSION` matches git tag format (v{MAJOR}.{MINOR}.{PATCH})
  - Version bump follows semantic versioning (breaking→major, feature→minor, patch→patch)
  - No pre-release suffixes without approval (v2.5.0-rc1, etc.)

- [ ] **Changelog entry exists**
  - Entry in `SPEC_CHANGELOG.md` for this version
  - Changelog includes: ✨Added, 🔄Changed, 🐛Fixed, ⚠️Deprecated, 🗑️Removed, 🔐Security
  - All breaking changes prominently listed
  - Migration guide links included for breaking changes
  - Release date documented

- [ ] **Git tags match release version**
  - Tag format: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., v2.5.0)
  - Tag annotation includes breaking change summary
  - Tag created on correct commit (HEAD of main branch)

---

## Section 2: Code Quality & Testing (5 min)

- [ ] **Test coverage 80%+ verified**
  - Run test suite: All tests pass
  - Coverage report generated: 80%+ threshold met
  - Critical paths have >90% coverage
  - No skipped tests (`.skip()` calls removed)
  - E2E tests passing (Phase 5 validation)

- [ ] **No critical errors in logs**
  - Linting passes: No errors, only warnings acceptable
  - Type checking passes: All types resolved
  - Security scan passing: No vulnerabilities found
  - Dependency audit clean: No high-risk dependencies

- [ ] **Build artifacts valid**
  - Docker image builds successfully
  - All layers optimized (no bloat)
  - Image pushed to registry successfully
  - SHA hash recorded for deployment traceability

---

## Section 3: Breaking Changes & Migration (10 min)

- [ ] **All breaking changes documented**
  - `SPEC_CHANGELOG.md` lists each breaking change:
    * What changed (old vs new)
    * Why it changed
    * Consumer impact
    * Migration deadline
  - Count: N breaking changes documented

- [ ] **Migration guides complete** (required if breaking changes >0)
  - Guide for each breaking change with:
    * Before/after code examples (3+ languages)
    * Step-by-step migration instructions
    * Common pitfalls section
    * Troubleshooting FAQ
    * Support contact info
  - Migration guides linked in:
    * Release notes
    * API documentation
    * Consumer communication template

- [ ] **Affected consumers identified & notified**
  - Identified: N clients/services affected
  - Notified: Consumer list reviewed and approved
  - Communication template prepared (email + Slack + in-app banner)
  - Support team briefed on incoming migration questions

- [ ] **Deprecation timeline clear** (for gradual migration)
  - If using deprecation period:
    * Current version: v2.x (old API still works)
    * Deadline version: v3.0 (old API removed)
    * Timeline: N months to migrate
  - Example: "Old endpoint deprecated in v2.5, removed in v3.0 (6-month timeline)"

---

## Section 4: Deployment Readiness (5 min)

- [ ] **Deployment runbooks prepared**
  - Runbook exists for: dev, staging, production
  - Each runbook includes:
    * Pre-deployment steps (DB migrations, config validation)
    * Deployment steps (build, push, deploy, restart)
    * Post-deployment verification (health checks, smoke tests)
    * Rollback procedure (trigger conditions, steps)
  - Runbooks reviewed by ops team

- [ ] **Health checks configured**
  - Liveness probe configured: /health (returns 200)
  - Readiness probe configured: /ready (checks dependencies)
  - Metrics endpoint configured: /metrics (Prometheus format)
  - Smoke test scenarios defined (3+ critical workflows)

- [ ] **Database migrations prepared** (if applicable)
  - Migration script exists and tested
  - Backward compatible: Can rollback if needed
  - Zero-downtime approach: Old code works during migration
  - Data integrity verified: No data loss risk
  - Estimated duration: <5 min migration window

- [ ] **Configuration prepared**
  - Config files generated for: dev, staging, prod
  - Environment-specific values validated:
    * Database URLs
    * API keys / secrets (via secrets manager)
    * Feature flags properly set
    * Logging levels appropriate
  - No hardcoded values found

---

## Section 5: Rollback Capability (5 min)

- [ ] **Rollback plan tested**
  - Rollback triggers defined: error rate >5%, latency >2s, health check fail
  - Rollback steps documented and verified
  - Previous version artifacts available: Docker image, config, DB state
  - Rollback time: <5 minutes verified
  - Rollback reverses all changes: code, config, DB state

- [ ] **Deployment strategy matches risk**
  - Risk score calculated: N/10
  - Strategy selected:
    * Low (1-2): Rolling deployment
    * Medium (3-5): Blue-green deployment
    * High (6-8): Canary (1%→10%→50%→100%)
    * Critical (9-10): Scheduled deployment + manual approval at each stage
  - Strategy team-reviewed and approved

- [ ] **Monitoring configured**
  - Dashboard created for deployment monitoring
  - Alerts configured for error rate spike
  - Alert thresholds set: >5% error rate = trigger alert
  - Team on-call for deployment window
  - Escalation path defined

---

## Section 6: Approvals & Sign-Off (5 min)

- [ ] **Required approvals obtained**
  - Risk score: N/10
  - Approval required from:
    * Low (1-2): Tech Lead (or auto-approve)
    * Medium (3-5): Tech Lead + Lead Engineer
    * High (6-8): Tech Lead + Product Lead
    * Critical (9-10): CTO + scheduled window approval
  - All approvers signed off with timestamp

- [ ] **Deployment window scheduled**
  - If breaking changes: scheduled deployment window
  - Team availability: All on-call resources available
  - Communication: Consumers notified of maintenance window (if needed)
  - Rollback team: Same team on standby for 1 hour post-deployment

- [ ] **Documentation complete**
  - Release notes ready (version, what's new, what's fixed, breaking changes)
  - Consumer communication sent (email + Slack + notification)
  - Internal team briefed: engineering, support, ops
  - External status page updated (if consumer-facing)

---

## Red Flags - STOP if any present

❌ **MUST STOP - Do not proceed to deployment**:

- [ ] Test coverage <80% (BLOCKER)
- [ ] Breaking changes undocumented (BLOCKER)
- [ ] Migration guides missing for breaking changes (BLOCKER)
- [ ] Rollback plan untested (BLOCKER)
- [ ] Required approvals missing (BLOCKER)
- [ ] Version bump doesn't match semantic versioning (BLOCKER)
- [ ] Critical errors in logs/build (BLOCKER)
- [ ] Database rollback impossible (HIGH RISK)
- [ ] Consumers not notified of breaking changes (HIGH RISK)

**If STOP condition found**:
1. Identify blocking issue
2. Take corrective action
3. Re-run validation checklist
4. Do not deploy until all checks pass

---

## Sign-Off Template

```
RELEASE: v2.5.0
DATE: 2026-05-31
CHECKED BY: [Name]
APPROVED BY: [Name] (Tech Lead)

Version verification: ✓ PASS
Test coverage: ✓ PASS (82%)
Breaking changes documented: ✓ PASS (2 breaking changes)
Deployment runbook: ✓ PASS
Rollback tested: ✓ PASS
Approvals obtained: ✓ PASS

Risk Score: 6/10 (HIGH - canary deployment)
Status: ✅ APPROVED FOR DEPLOYMENT

Next step: Begin canary deployment (Stage 1: 1% traffic)
Monitoring window: 1 hour
Rollback team: On standby
```
