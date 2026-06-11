# Example: Propagating a Breaking API Change Across Phases

## Scenario

The Phase 1 API contract for `GET /api/users/:id` is updated to change the response:

```
Before: { name, email, role }
After:  { id, name, email, roles[] }
```

This is a **BREAKING** change — `role` (string) is replaced by `roles[]` (array).

## Trigger

```
/spec-change .planning/API_DOCS.md
```

Auto-triggered after `/spec-change` completes.

## Phase 1: Change Detection (5 min)

```
Detected: BREAKING change in .planning/API_DOCS.md
  - Removed field: role (string)
  - Added field: roles (array)
  - Affected section: GET /api/users/:id response
```

## Phase 2: Impact Analysis (10 min)

```
Dependency graph traced:
  Phase 2 (Tests):   HIGH — 5 mock assertions use role field
  Phase 3 (Backend): HIGH — response builder must return roles array
  Phase 4 (SDK):     MEDIUM — interface User needs roles: string[]
  Phase 5 (E2E):     LOW — update 2 role-checking scenarios
```

## Phase 3: Auto-Updates Applied (15 min)

- **Phase 2** `tests/api-mocks.test.ts` — Updated `expect(response.role)` → `expect(response.roles[0])`
- **Phase 3** `contracts/api/GetUser/response.json` — Schema updated to include `roles` array
- **Phase 4** `types/api.ts` — `interface User { roles: string[] }` replacing `role: string`
- **Phase 5** `playwright/e2e/user-profile.spec.ts` — Updated 2 role-check assertions

## Migration Guide Generated

```markdown
## BREAKING: role → roles[] in GET /api/users/:id

Migration: Replace `user.role` with `user.roles[0]` for primary role access.
Timeline: Migrate before v3.0.0 release.
```

## Outcome

- ✅ All 4 phases updated automatically
- ✅ Tests re-run and passing
- ✅ Migration guide created
- ✅ SPEC_CHANGELOG.md entry added
- ✅ 45 min manual work → 30 min automated
