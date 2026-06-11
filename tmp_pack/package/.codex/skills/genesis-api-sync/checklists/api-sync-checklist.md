# API Sync Checklist

**Use this after implementing API changes to verify sync is complete.**

## Pre-Sync Verification

- [ ] Implementation matches planned contract
- [ ] All tests passing
- [ ] Code review approved
- [ ] No TODOs or incomplete sections

## Contract Detection

- [ ] Run API endpoint scanner
  ```bash
  ./scripts/extract-api-contracts.sh
  ```
- [ ] Compare with current API_CONTRACTS.md
- [ ] Identify new/modified/deprecated endpoints
- [ ] Log all changes

## Breaking Change Assessment

For each changed endpoint:
- [ ] Does it break existing client code?
- [ ] Do request parameters change? (required fields added?)
- [ ] Do response fields change? (removed or changed structure?)
- [ ] Do error codes change?
- [ ] Does authentication requirement change?

**Result: List all breaking changes**

## Contract Update

- [ ] Add new endpoints to API_CONTRACTS.md
- [ ] Update modified endpoints with version info
- [ ] Mark deprecated endpoints with removal date
- [ ] Document all breaking changes
- [ ] Add migration guide if needed
- [ ] Update version number in contract

## Test Contract Generation

- [ ] Generate request/response validation schemas
- [ ] Create test fixtures for new endpoints
- [ ] Update test fixtures for modified endpoints
- [ ] Create deprecation warning tests
- [ ] Add error handling tests
- [ ] Add edge case tests

## Test Execution

- [ ] All API tests passing
- [ ] Contract validation tests passing
- [ ] Integration tests passing
- [ ] Backward compatibility tests (if v2+)
- [ ] Coverage report generated (target: 80%+)

## Documentation Updates

- [ ] API_CONTRACTS.md complete and accurate
- [ ] Examples updated
- [ ] Migration guide created (if breaking changes)
- [ ] README API section updated
- [ ] CHANGELOG.md entry added
- [ ] Version bumped (major/minor/patch)

## Codebase State Update

- [ ] .codebase/CURRENT_STATE.md updated
- [ ] .codebase/API_CONTRACTS.md verified matches
- [ ] .codebase/DEPENDENCY_GRAPH.md checked (new deps?)
- [ ] .codebase/KNOWN_PROBLEMS.md updated if issues found

## Migration Path Documentation

If breaking changes:
- [ ] Old endpoints documented as deprecated
- [ ] Removal timeline specified
- [ ] Migration steps documented
- [ ] Code examples provided for migration
- [ ] Timeline communicated to stakeholders

## Final Verification

- [ ] All changes tracked in git
- [ ] No uncommitted files
- [ ] PR description written with contract changes
- [ ] All checklists marked complete
- [ ] Ready for code review

## Sign-Off

- [ ] **API Owner**: ☐ Approved
- [ ] **Technical Lead**: ☐ Approved
- [ ] **QA**: ☐ Tested

---

**Date Completed**: _YYYY-MM-DD_  
**Completed By**: _Name_
