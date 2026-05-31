# Example: Orchestrating a Minor Version Release (v2.4.1 → v2.5.0)

## Scenario

The team has completed sprint work. SPEC_CHANGELOG.md shows 3 new optional features and 2 bug fixes — no breaking changes. A minor version release is required.

## Trigger

```
/prep-release
```

Or auto-triggered when `VERSION` file is bumped and all tests pass.

## Phase 1: Version Detection (2 min auto)

```
Current Version: v2.4.1
Changes since last release:
  - 0 BREAKING changes
  - 3 FEATURE changes (new optional fields)
  - 2 BUG_FIX changes

Semantic versioning decision:
  FEATURE changes → Minor version bump
  Proposed: v2.4.1 → v2.5.0
  Risk level: MEDIUM (new features, no breaking changes)
```

## Phase 2: Risk Assessment (3 min auto)

```
Risk score: 4/10 (MEDIUM)
  - No breaking changes
  - 3 new optional API fields (backward compatible)
  - All 94 tests passing
  - Recommended strategy: Blue-green deployment
```

## Phase 3: Runbook Generated (3 min auto)

**`.docs/releases/v2.5.0-runbook.md`** created with:
- Pre-deployment database migration steps (none needed)
- Docker build + push commands for staging
- Blue-green switch command
- Health check endpoint list
- Rollback command (instant switch back to Green)

## Phase 4: Release Notes Generated (2 min auto)

```markdown
## v2.5.0 — May 31, 2026

### Added
- User profiles now include optional `avatarUrl` field
- API supports `?include=preferences` query parameter
- Notifications support `priority` field (low/medium/high)

### Fixed
- Fixed: User deletion no longer leaves orphaned sessions
- Fixed: Rate limiter correctly resets after 1-hour window
```

## Approval

Risk 4/10 → Lead Engineer approval required (not CTO level).

```
Approval: ✅ [Lead Engineer] @ 14:32 — LGTM
Deployment: Cleared for blue-green deployment
```

## Outcome

- ✅ Version bumped to v2.5.0
- ✅ Runbook generated in 3 minutes
- ✅ Release notes complete
- ✅ Total prep time: ~10 minutes (vs 2+ hours manual)
