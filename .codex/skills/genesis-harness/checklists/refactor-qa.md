# Refactor Q&A Checklist

**Purpose**: Structured questionnaire for planning code refactors to avoid scope creep and ensure clarity.

**Status**: MANDATORY - Complete before creating refactor plan.

## Refactor Goals & Scope

- [ ] **Primary goal clearly stated**:
  - Performance improvement? (which metrics?)
  - Code quality/readability?
  - Architecture simplification?
  - Tech debt reduction?
  - Preparation for new feature?
  - Remove deprecated code?

- [ ] **Scope boundaries defined**:
  - Exactly which modules/files are in scope?
  - What is explicitly NOT being refactored?
  - Why these boundaries?

- [ ] **Success Criteria measurable**:
  - Performance: specific metrics (latency, memory, throughput)?
  - Quality: complexity reduction targets?
  - Lines of code reduction targets?
  - Test coverage maintained/improved?

## Impact Assessment

- [ ] **Risk Level assessed**:
  - Low risk (isolated, well-tested)?
  - Medium risk (touches multiple areas)?
  - High risk (core/critical system)?

- [ ] **Affected Systems identified**:
  - Which modules/components use this code?
  - Public APIs that might change?
  - Dependent code that needs updates?
  - Cross-team dependencies?

- [ ] **Breaking Changes evaluated**:
  - Does this change public API?
  - Will clients need updates?
  - Backward compatibility strategy?
  - Deprecation path if needed?

- [ ] **Data/State Concerns**:
  - Does this handle state/persistence?
  - Migration strategy if data format changes?
  - Existing data compatibility?

## Technical Approach

- [ ] **Refactor Strategy decided**:
  - Big bang replacement or incremental?
  - Parallel implementation then cut over?
  - Feature flag strategy?
  - Gradual migration approach?

- [ ] **Alternatives considered**:
  - Why this approach over others?
  - Tradeoffs understood?
  - Reversibility of changes?

- [ ] **Dependencies researched**:
  - Library/framework upgrades needed?
  - New patterns or tools to learn?
  - Compatibility concerns?

## Testing & Verification

- [ ] **Test Coverage analyzed**:
  - Current coverage percentage?
  - Coverage targets after refactor?
  - Tests to add during refactor?

- [ ] **Regression Testing planned**:
  - Which tests must pass?
  - Integration test scenarios?
  - Performance benchmarks to run?
  - Smoke tests for quick validation?

- [ ] **Manual Testing scenarios**:
  - Key user flows to validate?
  - Edge cases to verify?
  - Environment-specific tests (prod-like)?

## Performance & Quality Metrics

- [ ] **Current metrics captured**:
  - Baseline performance measured?
  - Code quality metrics (complexity, duplication)?
  - Build time benchmarks?

- [ ] **Target metrics defined**:
  - Expected performance improvement %?
  - Complexity reduction targets?
  - Build time targets?

- [ ] **Monitoring plan**:
  - How will we track post-refactor metrics?
  - Alerts for regressions?
  - A/B testing if applicable?

## Timeline & Effort

- [ ] **Effort estimated**:
  - Estimated hours/days?
  - Complexity assessment?
  - Blocking dependencies?

- [ ] **Schedule considered**:
  - Can this be done incrementally?
  - Best time in release cycle?
  - Sprint capacity available?

- [ ] **Rollback plan**:
  - How long to rollback if needed?
  - Can we run A/B test?
  - Version compatibility concerns?

## Stakeholder Alignment

- [ ] **Team consensus**:
  - Tech lead approved?
  - Code owners agree this is needed?
  - Architecture team aligned?

- [ ] **Priority confirmed**:
  - Product owner informed?
  - This won't block feature work?
  - Business case documented?

- [ ] **Knowledge sharing**:
  - Team trained on new patterns?
  - Documentation updated?
  - Code review guidelines updated?

## Documentation & Communication

- [ ] **Refactor Plan documented**:
  - Current state architecture?
  - Target state architecture?
  - Migration path clearly described?

- [ ] **Design Decision recorded**:
  - ADR created explaining refactor?
  - Links to discussions/research?
  - Why-decisions documented?

- [ ] **Communication plan**:
  - Stakeholders notified?
  - Progress updates planned?
  - Release notes prepared?

## Code Quality Standards

- [ ] **Code Quality Checklist**:
  - Follows team conventions?
  - No hardcoded values?
  - Proper error handling?
  - Comprehensive logging?
  - Immutable patterns used?

- [ ] **Security considerations**:
  - No security regressions?
  - Secrets handling correct?
  - Access control maintained?

- [ ] **Performance considerations**:
  - Efficiency improvements realized?
  - No performance regressions?
  - Caching used appropriately?

---

## Usage

Use this checklist **before** calling `/plan refactor`:

```
1. Read this checklist completely
2. Answer all questions
3. Get stakeholder alignment on scope
4. Capture current metrics
5. Define success criteria
6. Create implementation plan
7. Execute incrementally with verification
```

## Pre-Refactor Checklist

Before starting actual refactoring:
- [ ] All tests passing in current state?
- [ ] Current metrics captured/documented?
- [ ] Feature branch created?
- [ ] Notification sent to team?
- [ ] Rollback plan documented and tested?

## Refactor Type

Choose one:
- [ ] Performance optimization
- [ ] Code quality improvement
- [ ] Architecture simplification
- [ ] Tech debt reduction
- [ ] Pattern standardization
- [ ] Library/framework upgrade
- [ ] Other: _specify_

---

**Checklist Completed**: ☐  
**Date**: _YYYY-MM-DD_  
**Lead**: _Name_  
**Reviewers**: _Names_
