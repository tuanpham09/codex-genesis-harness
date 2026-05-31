# New Feature Q&A Checklist

**Purpose**: Structured questionnaire to capture all requirements before planning /new-feature.

**Status**: MANDATORY - Complete all fields before /plan is created.

## User Story & Intent

- [ ] **User Story defined**: "As a [who], I want [what] so that [why]"
  - Who is the primary user/actor?
  - What specific action or capability do they need?
  - What outcome or value does this deliver?

- [ ] **Success Criteria clear**: How do we know this feature is working?
  - At least 3 measurable criteria
  - Business metrics or user satisfaction indicators

- [ ] **Out of Scope documented**: What is explicitly NOT included?
  - Related features we're NOT doing now
  - Future enhancements or phases

## Requirements & Constraints

- [ ] **Functional Requirements clear**:
  - Primary use cases (happy path)
  - Secondary use cases
  - Data inputs and outputs

- [ ] **Non-Functional Requirements identified**:
  - Performance expectations (speed, throughput, latency)
  - Scalability requirements
  - Availability/uptime requirements
  - Browser/device support

- [ ] **Dependencies & Integrations mapped**:
  - Does this touch APIs? Which ones?
  - Database schema changes needed?
  - External services involved?
  - Existing modules that will be modified?

- [ ] **Constraints & Limitations noted**:
  - Technical constraints (memory, compute)
  - Business constraints (timeline, budget)
  - Regulatory/compliance constraints
  - Breaking changes or migration requirements?

## Impact & Scope

- [ ] **Affected Systems identified**:
  - Which modules will change? (list by name)
  - Which APIs will change or be added?
  - Which database tables/schemas affected?
  - Frontend routes or pages added/modified?

- [ ] **API Surface Changes**:
  - New endpoints needed?
  - Modified endpoint behavior?
  - Deprecated endpoints?
  - Data contract changes?

- [ ] **Database Changes**:
  - New tables/collections?
  - Schema migrations?
  - Backward compatibility concerns?

- [ ] **UI/UX Changes**:
  - New pages/screens?
  - Modified navigation flows?
  - New user interactions?

## Edge Cases & Error Handling

- [ ] **Edge Cases enumerated**:
  - Boundary conditions (empty, null, max values)
  - Concurrent operations conflicts
  - Network failures or timeouts
  - Permission/authorization scenarios
  - Race conditions or state inconsistencies

- [ ] **Error Scenarios documented**:
  - Invalid input handling
  - Failure recovery strategy
  - User-facing error messages
  - Logging/observability for debugging

## Architecture & Design

- [ ] **Architectural Pattern chosen**:
  - Synchronous vs. asynchronous?
  - Client-side vs. server-side?
  - Real-time vs. eventual consistency?
  - Distributed or monolithic?

- [ ] **Design Decisions recorded** (Why this approach?):
  - What alternatives were considered?
  - Why this one was chosen?
  - Any known tradeoffs?

- [ ] **Performance Considerations**:
  - Caching strategy if needed?
  - Query optimization?
  - Batch processing opportunities?

## Testing Strategy

- [ ] **Test Coverage planned**:
  - Unit tests (which modules?)
  - Integration tests (which interactions?)
  - E2E tests (which user flows?)
  - Target coverage: 80%+ or higher?

- [ ] **Test Data & Fixtures**:
  - What test data do we need?
  - Realistic edge case fixtures?
  - Performance test datasets?

## Rollout & Monitoring

- [ ] **Deployment Strategy**:
  - Staged rollout or all-at-once?
  - Feature flags needed?
  - Rollback plan if issues arise?

- [ ] **Monitoring & Observability**:
  - What metrics should we track?
  - Key logs to monitor?
  - Alert thresholds?

## Sign-Off

- [ ] **Stakeholder confirmation**: Product owner/PM approved?
- [ ] **Tech lead review**: Architecture and scope approved?
- [ ] **No unknowns remaining**: All "TBD" fields resolved?

---

## Usage

Use this checklist **before** calling `/plan` for a new feature:

```
1. Read this checklist
2. Answer every question (or explicitly mark "not applicable")
3. If any field is "TBD" or uncertain, add to "Known Unknowns"
4. Share answers with /plan command
5. /plan creates implementation strategy
```

## Known Unknowns (for this feature)

- [ ] _Add any uncertain items here_

---

**Date**: _YYYY-MM-DD_  
**Author**: _Name_  
**Feature**: _[Feature Name]_
