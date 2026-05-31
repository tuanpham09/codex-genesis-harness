---
name: api-sync-skill
description: Automatic API contract synchronization. Detects API changes in implementation, updates API_CONTRACTS.md, regenerates test contracts, and maintains backward compatibility documentation. Use after API-related implementation or when contracts drift from actual code.
---

# API Sync Skill

## Purpose

Keep API contracts synchronized with actual implementation. Detect changes, update contracts, regenerate tests, and document breaking changes automatically.

## When to use

Use after API-related implementation when:
- New endpoints added
- Endpoint behavior changed
- Request/response schemas modified
- Error handling updated
- Authentication/authorization changed
- Deprecated endpoints need removal

## When NOT to use

Do not use for read-only API documentation or when contract-first design hasn't been completed yet.

## Inputs required

- Changed implementation files (API routes, controllers, handlers)
- Current API_CONTRACTS.md file
- Test suite location
- Breaking change impact assessment

## Outputs required

- Updated API_CONTRACTS.md with all changes
- Updated API test contracts
- Test code reflecting new contracts
- Migration guide for breaking changes (if applicable)
- Backward compatibility documentation

## Required tests

- Contract validation tests (request/response schemas)
- API integration tests updated
- Backward compatibility tests (if versioning)
- Error handling tests

## Required fixtures

- Updated endpoint fixtures
- Request/response examples
- Error scenario fixtures
- Edge case payloads

## Required contract updates

- API_CONTRACTS.md (primary)
- Versioning info (if breaking changes)
- Deprecation notices (if applicable)
- Migration guide (if breaking changes)

## Required codebase map updates

- `.codebase/API_CONTRACTS.md` - complete update
- `.codebase/CURRENT_STATE.md` - note API changes
- `.codebase/KNOWN_PROBLEMS.md` - document migration issues
- `.codebase/EVOLUTION_PLAN.md` - next API phases

## Token saving rules

Extract schemas programmatically; don't paste entire files. Focus on deltas from previous contracts. Link to test fixtures rather than duplicating examples.

## Acceptance criteria

- API contracts match actual implementation
- All endpoints documented with schemas
- Breaking changes clearly marked
- Test contracts generated and passing
- Migration paths documented for breaking changes
- No contract drift validation passing

## Common mistakes

- Skipping breaking change documentation
- Not updating test contracts in parallel
- Leaving old endpoints undocumented
- Forgetting error response contracts
- Not validating backward compatibility

## Recovery workflow

If contracts drift or sync fails:
1. Read current API_CONTRACTS.md
2. Extract actual endpoint schemas from implementation
3. Identify changes and breaking status
4. Update contracts with full changelog
5. Regenerate test contracts
6. Validate all tests pass
7. Document migration guide if needed

---

## Workflow: API Change Detection & Sync

### Step 1: Detect API Changes

Identify which files contain API code:

```
Scan for:
  ├─ src/api/**
  ├─ src/**/route.ts, routes.ts
  ├─ src/**/controller.ts
  ├─ src/**/endpoint.ts
  └─ src/**/handler.ts
```

For each file, extract:
- HTTP method (GET, POST, PUT, DELETE, PATCH)
- Route/path
- Request schema (params, query, body)
- Response schema (success, error)
- Status codes
- Authentication requirements
- Rate limiting or other middleware

### Step 2: Compare Against Current Contract

```
For each endpoint:
  New? → Add to contract
  Modified? → Mark change and version
  Deleted? → Mark as deprecated
  Unchanged? → Keep as-is
```

### Step 3: Generate Updated Contracts

```json
{
  "endpoints": [
    {
      "id": "endpoint-id",
      "method": "POST",
      "path": "/api/v1/resource",
      "description": "Create a new resource",
      "version": "1.0",
      "breaking_changes_from": [],
      "request": {
        "body": { /* schema */ },
        "query": { /* schema */ },
        "headers": { /* required headers */ }
      },
      "responses": {
        "200": { /* success schema */ },
        "400": { /* error schema */ },
        "401": { /* auth error */ }
      },
      "auth_required": true,
      "rate_limit": "100/hour"
    }
  ]
}
```

### Step 4: Mark Breaking Changes

If changes break existing clients:

```markdown
## Breaking Changes in v2.0

### Changed: POST /api/v1/resource
- Old: Returns `id`, `name`, `created_at`
- New: Returns `resourceId`, `title`, `timestamp`
- Impact: Clients expecting `id` field will break
- Migration: Map `resourceId` → `id` in client code
- Deadline: Migrate by [date], v1 endpoints removed [date]
```

### Step 5: Generate Test Contracts

Automatically create test schemas:

```javascript
// tests/contracts/api.test.ts
import { apiContracts } from '.codebase/API_CONTRACTS.md'

describe('API Contracts', () => {
  apiContracts.endpoints.forEach(endpoint => {
    it(`${endpoint.method} ${endpoint.path}`, async () => {
      const response = await request(endpoint.method, endpoint.path)
      validateSchema(response, endpoint.responses)
    })
  })
})
```

### Step 6: Document Migration Path

If breaking changes exist:

```markdown
## Migration Guide

### From v1.0 → v2.0

#### Step 1: Update request payloads
```
// OLD
POST /api/v1/resource
{ "name": "Test" }

// NEW
POST /api/v2/resource
{ "title": "Test" }
```

#### Step 2: Update response parsing
```
// OLD
const id = data.id

// NEW
const id = data.resourceId
```

#### Step 3: Timeline
- June 1: v2 available alongside v1
- July 1: Clients should migrate
- August 1: v1 endpoints deprecated
- September 1: v1 endpoints removed
```

---

## Usage in Workflow

### During Feature Implementation

```bash
# 1. Implement API changes
# 2. Write tests with new contract
# 3. Run tests - should pass

# 4. After tests pass, sync contracts:
invoke api-sync-skill

# Parameters:
- changed_files: ["src/api/users.ts", "src/routes/auth.ts"]
- contract_file: ".codebase/API_CONTRACTS.md"
- breaking_changes: true/false
- version_bump: "major/minor/patch"
```

### After Sync Completed

```
✓ API_CONTRACTS.md updated
✓ Breaking changes documented
✓ Test contracts generated
✓ Migration guide created
✓ All tests still passing

→ Ready to merge
```

---

## Skills Integration

Works alongside:
- **planning-skill**: Captures API requirements in plan
- **api-contract-skill**: Defines contracts before implementation
- **design-spec-skill**: Documents API design decisions
- **docs-skill**: Updates README and API docs

---

## Common Patterns

### Pattern: API Versioning

```
OLD (v1)
GET /api/users

NEW (v2)
GET /api/v2/users

Contract update:
- Keep v1 endpoint
- Mark as deprecated
- Point to v2 docs
- Set removal date
```

### Pattern: Endpoint Evolution

```
Phase 1: New parameter added
POST /api/resource → POST /api/resource?newParam=true
Contract: Mark parameter as optional

Phase 2: Parameter required
POST /api/resource?newParam=true
Contract: Mark parameter as required

Phase 3: Old behavior removed
POST /api/resource → now requires newParam
Contract: Break version, update contract

Clients get: 2 quarters to migrate
```

### Pattern: Error Code Addition

```
OLD
POST /api/payment
Error: 400 Bad Request

NEW
POST /api/payment
Errors:
  - 400 Bad Request
  - 402 Payment Required (NEW)
  - 429 Too Many Requests (NEW)

Contract: Document all codes with examples
```

---

## Acceptance Checklist

- [ ] All endpoints extracted from code
- [ ] Request/response schemas defined
- [ ] HTTP methods correct
- [ ] Status codes complete
- [ ] Auth requirements documented
- [ ] Breaking changes identified and marked
- [ ] Test contracts generated
- [ ] All API tests passing
- [ ] Migration guide created (if needed)
- [ ] `.codebase/API_CONTRACTS.md` updated
- [ ] Documentation updated
- [ ] Version number incremented

---

**Last Updated**: 2026-05-30  
**Maintained By**: Genesis Harness Team  
**Version**: 1.0
