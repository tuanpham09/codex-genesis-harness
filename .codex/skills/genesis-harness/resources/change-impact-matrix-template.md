# Change Impact Matrix

**What docs must be updated when different types of changes are made.**

Use this matrix to identify all docs that need updating for your feature/bug fix.

## Feature: Behavior Changed

**You changed**:
- User-facing behavior
- Acceptance criteria
- Requirement fulfilled

**Update these docs**:
- [ ] `.planning/REQUIREMENTS.md` - Document new requirement
- [ ] `.planning/SPEC_CHANGELOG.md` - Record the change
- [ ] `.planning/STATE.md` - Update current status
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/FEATURE_INDEX.md` - Feature status
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate coverage

---

## Feature: API Changed

**You changed**:
- New endpoints
- Request/response schemas
- Auth mechanism
- Error responses
- Breaking changes

**Update these docs**:
- [ ] `.planning/API_DOCS.md` - Document new/changed endpoints
- [ ] `.planning/REQUIREMENTS.md` - Behavior changes
- [ ] `.planning/INTEGRATIONS.md` - If auth/secrets changed
- [ ] `.planning/SPEC_CHANGELOG.md` - Record API changes with migration notes
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/FEATURE_INDEX.md` - Feature status
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate API coverage

---

## Feature: Database Changed

**You changed**:
- New tables/collections
- Schema modifications
- Data migrations
- Queries/indexes

**Update these docs**:
- [ ] `.planning/ARCHITECTURE.md` - New data models/schema
- [ ] `.planning/diagrams/database-erd.mmd` - Update ERD
- [ ] `.planning/SPEC_CHANGELOG.md` - Record schema changes with migration steps
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate architecture coverage

---

## Feature: UI/UX Changed

**You changed**:
- New screens/pages
- Component structure
- User flows
- Navigation
- Accessibility

**Update these docs**:
- [ ] `.planning/DESIGN.md` - New screens/components/flow
- [ ] `.planning/JOURNEYS.md` - Updated user journeys
- [ ] `.planning/SMOKE_TESTS.md` - New verification paths
- [ ] `.planning/diagrams/system-context.mmd` - If flows changed
- [ ] `.planning/SPEC_CHANGELOG.md` - Record UI changes
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/FEATURE_INDEX.md` - Feature status
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate design coverage

---

## Feature: Architecture Changed

**You changed**:
- Module boundaries
- Service structure
- Dependency direction
- Data flow
- Design patterns

**Update these docs**:
- [ ] `.planning/ARCHITECTURE.md` - New module boundaries, patterns, principles
- [ ] `.planning/diagrams/container-architecture.mmd` - Update architecture diagram
- [ ] `.planning/diagrams/deployment-flow.mmd` - If deployment changed
- [ ] `.planning/CONVENTIONS.md` - New patterns to follow
- [ ] `.planning/decisions/ADR-XXX-*.md` - Create ADR for major decision
- [ ] `.planning/SPEC_CHANGELOG.md` - Record architecture changes
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate architecture score

---

## Feature: Integration Changed

**You changed**:
- New external services
- API keys/secrets
- Webhooks
- Rate limits
- Fallback strategies

**Update these docs**:
- [ ] `.planning/INTEGRATIONS.md` - New services, env vars, failure handling
- [ ] `.planning/STACK.md` - New dependencies
- [ ] `.planning/OBSERVABILITY.md` - New error handling/logs
- [ ] `.planning/SPEC_CHANGELOG.md` - Record integration changes
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate integration coverage

---

## Feature: Configuration/Environment Changed

**You changed**:
- New env variables
- Config files
- Build process
- Runtime environment
- Deployment parameters

**Update these docs**:
- [ ] `.planning/STACK.md` - New commands, env vars, versions
- [ ] `.planning/INTEGRATIONS.md` - New secrets/config
- [ ] `.planning/CONVENTIONS.md` - New rules
- [ ] `.planning/diagrams/deployment-flow.mmd` - If deployment changed
- [ ] `.planning/SPEC_CHANGELOG.md` - Record config changes
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate coverage

---

## Bug Fix: Behavior Corrected

**You fixed**:
- Incorrect behavior
- Edge case handling
- Error recovery

**Update these docs**:
- [ ] `.planning/LESSONS_LEARNED.md` - Document root cause, prevention
- [ ] `.planning/SPEC_CHANGELOG.md` - Record fix
- [ ] `.planning/PITFALLS.md` - Add prevention rule if applicable
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate

---

## Refactor: No Behavior Change

**You changed**:
- Internal code organization
- Performance optimization
- Dependency updates
- Code cleanup

**Update these docs**:
- [ ] `.planning/ARCHITECTURE.md` - If structure clarified
- [ ] `.planning/CONVENTIONS.md` - If patterns improved
- [ ] `.planning/LESSONS_LEARNED.md` - Document why refactor needed
- [ ] `.planning/STATE.md` - Current phase
- [ ] `.planning/SUMMARY.md` - Recent changes
- [ ] `.planning/QUALITY_SCORE.md` - Recalculate maintainability

---

## Always Update

**Regardless of change type, ALWAYS update:**

- [ ] `.planning/STATE.md` - current phase, active feature, next task
- [ ] `.planning/SUMMARY.md` - recent changes, next recommended task
- [ ] `.planning/SPEC_CHANGELOG.md` - date, reason, impacted docs, migration notes
- [ ] `.planning/FEATURE_INDEX.md` or `.planning/bugs/` - status update

**Exception**: Internal refactor with zero behavior change can skip SPEC_CHANGELOG if justified.

---

## How to Use This Matrix

1. **Identify change type** above (Feature: API Changed? Bug Fix? etc.)
2. **Check all boxes** that apply
3. **Update each doc** listed
4. **Verify** with checklist in Definition of Done
5. **Add to SPEC_CHANGELOG.md** as final proof

**If you forget to update a doc**: Spec drift → future bugs → technical debt → expensive rewrites.
