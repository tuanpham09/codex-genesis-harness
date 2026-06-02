# Phase 0: Foundation

## Goal

Complete project documentation, validate product intent, and establish the planning framework. **No feature implementation in this phase.**

## Scope

Documentation only:
- [ ] Confirm PROJECT.md details
- [ ] Complete REQUIREMENTS.md
- [ ] Document ARCHITECTURE.md
- [ ] Document STACK.md
- [ ] Define CONVENTIONS.md
- [ ] Create base diagrams
- [ ] Establish baseline quality score

## Dependencies

None. This is the foundation.

## Tasks

- [ ] Read `.planning/PROJECT.md` - confirm product intent
- [ ] Read `.planning/REQUIREMENTS.md` - validate requirements
- [ ] Complete STACK.md with all tech details and versions
- [ ] Document ARCHITECTURE.md from codebase analysis
- [ ] Extract CONVENTIONS.md from existing code patterns
- [ ] Identify and document PITFALLS.md
- [ ] Create system-context.mmd diagram
- [ ] Create container-architecture.mmd diagram
- [ ] Create database-erd.mmd (if applicable)
- [ ] Create deployment-flow.mmd diagram
- [ ] Create initial QUALITY_SCORE.md
- [ ] Verify all `.planning/` structure exists
- [ ] Run project verification (tests, builds, etc.)
- [ ] Document decision: "Phase 0 complete, ready for Phase 1 planning"

## Acceptance Criteria

- [x] `.planning/` directory structure created
- [ ] PROJECT.md completed with product details
- [ ] REQUIREMENTS.md documented
- [ ] STACK.md has all tech versions
- [ ] ARCHITECTURE.md describes system boundaries
- [ ] Diagrams are created
- [ ] No critical TBDs remain in core docs
- [ ] Team confirms understanding of project scope
- [ ] All verification checks pass

## Verification

```sh
# Verify structure
test -d .planning/phases/00-foundation && echo "✓ Phase folder exists"

# Check core docs are not just TBD
for file in PROJECT REQUIREMENTS STACK ARCHITECTURE CONVENTIONS; do
  if grep -q "^## " .planning/$file.md && ! grep -q "TBD$" .planning/$file.md; then
    echo "✓ .planning/$file.md has content"
  fi
done

# List all diagrams
ls -la .planning/diagrams/*.mmd | wc -l
```

## Risk & Rollback

**Risk**: Documentation may be incomplete or inaccurate.

**Rollback**: This is a documentation phase. If docs need revision, simply edit the `.planning/*.md` files directly. No code changes to rollback.

## Notes

This phase is setup only. Feature phases start in Phase 1 after Foundation is complete and requirements are confirmed.
