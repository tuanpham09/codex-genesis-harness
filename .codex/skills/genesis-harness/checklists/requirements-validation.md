# Requirements Validation Checklist

**Purpose**: Validate that all requirements are clear, complete, and aligned before implementation starts.

**Status**: MANDATORY - Use after Q&A, before creating contracts and tests.

## Completeness Check

- [ ] **All Q&A items answered**:
  - No "TBD" fields remaining?
  - No "Unknown" fields that can be resolved?
  - All dependencies documented?

- [ ] **Requirements are Specific**:
  - "User can upload file" → ✅ "User can upload JPEG/PNG < 5MB to profile"
  - Vague requirements identified and clarified?
  - Units and formats specified (MB, seconds, JSON)?

- [ ] **Requirements are Measurable**:
  - Success can be verified objectively?
  - Metrics and thresholds defined?
  - Acceptance criteria quantified where possible?

- [ ] **Requirements are Achievable**:
  - Technical team believes it's feasible?
  - Skills and knowledge present?
  - Resource constraints acknowledged?
  - Timeline realistic?

- [ ] **Requirements are Relevant**:
  - Aligned with product roadmap?
  - Business value clear?
  - Won't be made obsolete by other work?

## Scope Validation

- [ ] **Scope is bounded**:
  - Clear IN/OUT distinction?
  - Related features NOT in scope documented?
  - Phase 2/future work identified?

- [ ] **No scope creep identified**:
  - Requirements are focused?
  - "Nice to have" separated from "must have"?
  - Dependencies on other features noted?

- [ ] **Edge cases included in scope**:
  - Error cases considered?
  - Boundary conditions documented?
  - Performance edge cases noted?

## Technical Feasibility

- [ ] **Technical approach approved**:
  - Architect reviewed proposed solution?
  - Major technical decisions documented?
  - No unknowns that are blockers?

- [ ] **API/Contract defined**:
  - Input schema clear?
  - Output schema clear?
  - Error responses defined?
  - Breaking changes identified?

- [ ] **Data Model defined**:
  - Database schema changes clear?
  - Backward compatibility strategy defined?
  - Data migration plan if needed?

- [ ] **Dependencies external/internal identified**:
  - External APIs or services needed?
  - Libraries or tools required?
  - Existing modules to integrate with?
  - Build/deployment requirements?

## Acceptance Criteria Validation

- [ ] **Acceptance Criteria are testable**:
  - Each criterion can be verified?
  - Test cases can be written?
  - No subjective criteria ("looks good")?

- [ ] **Acceptance Criteria are complete**:
  - Happy path covered?
  - Error paths included?
  - Edge cases represented?
  - Performance criteria included?

- [ ] **Acceptance Criteria are prioritized**:
  - Must-have criteria clear?
  - Nice-to-have criteria separate?
  - Dependencies between criteria noted?

## Stakeholder Alignment

- [ ] **Product owner approved**:
  - Requirements match product vision?
  - Business value documented?
  - Conflicts with other priorities resolved?

- [ ] **Tech lead/architect approved**:
  - Technical feasibility confirmed?
  - Approach aligns with architecture?
  - Technical risks identified?

- [ ] **No conflicting requirements**:
  - Performance vs. complexity tradeoffs addressed?
  - Security vs. usability resolved?
  - Team capacity confirmed?

## Documentation & Communication

- [ ] **Requirements documented clearly**:
  - User stories well-formed?
  - Acceptance criteria listed?
  - Related documents linked?

- [ ] **Ambiguities resolved**:
  - Team discussed unclear points?
  - Assumptions documented?
  - Glossary for domain terms created?

- [ ] **Team has common understanding**:
  - Walkthrough with key people done?
  - Q&A items captured in writing?
  - No silent disagreements about scope?

## Risk Assessment

- [ ] **Technical risks identified**:
  - Unknown technologies or patterns?
  - Performance risks documented?
  - Integration risks noted?

- [ ] **Business risks identified**:
  - Dependencies on external parties?
  - Market timing risks?
  - Competitive concerns?

- [ ] **Mitigation strategies defined**:
  - Risk reduction tactics identified?
  - Contingency plans for critical risks?
  - Escalation criteria defined?

## Testing & Quality

- [ ] **Test Strategy defined**:
  - Unit test scope?
  - Integration test scenarios?
  - E2E test critical paths?
  - Performance test requirements?

- [ ] **Test Data & Fixtures planned**:
  - What data needed for testing?
  - Edge case datasets created?
  - Load test scenarios defined?

- [ ] **Quality Standards aligned**:
  - Code review criteria?
  - Test coverage target (80%+)?
  - Performance benchmarks?
  - Security standards?

## Sign-Off

- [ ] **Product Owner**: _Name_ ☐ Approved
- [ ] **Tech Lead**: _Name_ ☐ Approved  
- [ ] **Team Lead**: _Name_ ☐ Approved
- [ ] **Any additional stakeholders**: ☐ Approved

## Implementation Readiness

### Ready to Proceed:
- [ ] All Q&A complete
- [ ] All validations passed
- [ ] All stakeholders approved
- [ ] No blockers identified
- [ ] Team ready to start

### If NOT ready:
- [ ] List items preventing readiness
- [ ] Owner assigned for each blocker
- [ ] Timeline to resolve each blocker

---

## Usage

```
After completing feature/bug/refactor Q&A:

1. Run through this validation checklist
2. Address any gaps or concerns
3. Get sign-offs from stakeholders
4. Only then proceed to:
   - Contract definition
   - Test creation
   - Implementation planning
```

## Validation Result

**Status**: ☐ Ready / ☐ Needs Work

**Blockers** (if any):
- _item_
- _item_

**Owner**: _Name_  
**Date**: _YYYY-MM-DD_  
**Next Steps**: _Action items_
