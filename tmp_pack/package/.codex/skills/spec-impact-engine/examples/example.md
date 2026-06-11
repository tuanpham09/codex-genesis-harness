# Example: Detecting Impact of a Breaking API Change

## Scenario

Phase 1 API contract changes — `GET /api/users/:id` response field `role` (string) is replaced by `roles` (array of strings). This is a breaking change.

## Trigger

```bash
/spec-change .planning/API_DOCS.md
# spec-impact-engine activates automatically
```

Or manually:

```bash
invoke spec-impact-engine
# Parameters:
# changed_files: [".planning/API_DOCS.md"]
# impact_scope: "all"
# auto_update: true
# notify: true
```

## Phase 1: Change Detection

```
Analyzing: .planning/API_DOCS.md

Detected change:
  Type: BREAKING
  Section: GET /api/users/:id → response
  Old: { name, email, role: string }
  New: { id, name, email, roles: string[] }
  Severity: HIGH
  Reason: Field renamed and type changed (string → array)
```

## Phase 2: Dependency Analysis

```
Building dependency graph from .codebase/PHASE_DEPENDENCY_MAP.md...

Phase 2 (Tests):   depends on Phase 1 API ← AFFECTED
Phase 3 (Backend): depends on Phase 1 API ← AFFECTED
Phase 4 (SDK):     depends on Phase 3     ← AFFECTED (transitive)
Phase 5 (E2E):     depends on Phase 4     ← AFFECTED (transitive)
```

## Phase 3: Impact Calculation

```
Impact chain (DFS from Phase 1):

  Phase 2 → MEDIUM: 5 mock assertions use `role` field
  Phase 3 → HIGH:   Response builder returns `role`, not `roles[]`
  Phase 4 → MEDIUM: interface User has `role: string`, not `roles: string[]`
  Phase 5 → LOW:    2 E2E scenarios check for role-based access

Update order: Phase 2 → Phase 3 → Phase 4 → Phase 5
Total estimate: ~2 hours
```

## Phase 4: Auto-Updates Applied

- **Phase 2** `tests/api-mocks.test.ts`:
  - `expect(response.role).toBe('admin')` → `expect(response.roles).toContain('admin')`
- **Phase 3** `contracts/api/GetUser/response.json`:
  - Schema updated: `roles: { type: "array", items: { type: "string" } }`
- **Phase 4** `types/api.ts`:
  - `role: string` → `roles: string[]`
- **Phase 5** `playwright/e2e/user-profile.spec.ts`:
  - Updated 2 role-check assertions

## Impact Report Generated

```
.codebase/IMPACT_REPORT_2026-05-31_14-30-00.md created:
  - 4 phases affected
  - 8 files auto-updated
  - 2 hours timeline impact
  - Migration guide generated: templates/migration-guide.md
```

## SPEC_CHANGELOG.md Entry

```
- 2026-05-31T14:30:00Z | BREAKING | API field role → roles[] in GET /api/users/:id
  Affected: Phase 2, 3, 4, 5 | Auto-updated: yes | Migration guide: IMPACT_REPORT_...
```

## Outcome

- ✅ Breaking change detected immediately
- ✅ All 4 downstream phases auto-updated
- ✅ Tests re-run and passing
- ✅ Migration guide generated
- ✅ 45 min manual discovery + update → 30 min automated
