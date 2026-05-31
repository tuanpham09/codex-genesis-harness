# API Sync Template

## Endpoint Change Report

### Metadata

- **Feature/Change**: _[Name]_
- **Date**: _YYYY-MM-DD_
- **Author**: _Name_
- **Breaking Changes**: ☐ Yes / ☐ No
- **Version Impact**: ☐ Patch / ☐ Minor / ☐ Major

---

## Changed Endpoints

### [1] NEW ENDPOINT

```
Method: GET
Path: /api/v1/resource
Status: NEW in v1.0
```

**Request:**
```json
{
  "query": {
    "page": "number (optional, default: 1)",
    "limit": "number (optional, default: 20)"
  }
}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "created_at": "ISO-8601 timestamp"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing authentication
- `500 Server Error`: Internal server error

**Auth Required:** Yes - Bearer token in `Authorization` header

**Rate Limit:** 100 requests/hour per API key

---

### [2] MODIFIED ENDPOINT

```
Method: POST
Path: /api/v1/resource
Status: MODIFIED in v1.2
Previous Version: v1.1
```

**Changes:**
```diff
- Removed field: `legacy_field`
+ Added field: `new_field` (required)
- Changed: `status` enum values
```

**Request (v1.2):**
```json
{
  "name": "string (required)",
  "email": "string (required, email format)",
  "new_field": "string (required)",
  "optional_data": "object (optional)"
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "new_field": "string",
  "created_at": "ISO-8601 timestamp",
  "status": "active | inactive | pending"
}
```

**Breaking Changes:**
- ✗ `legacy_field` removed - clients using this will break
- ✓ `new_field` required - endpoint will reject requests without it
- ✓ `status` values changed - parsing logic needs update

---

### [3] DEPRECATED ENDPOINT

```
Method: DELETE
Path: /api/v1/resource/{id}
Status: DEPRECATED
Removal Date: 2026-09-30
Replacement: DELETE /api/v2/resource/{id}
```

**Deprecation Notice:**
```
⚠️  This endpoint will be removed on 2026-09-30
📌 Use DELETE /api/v2/resource/{id} instead
📚 Migration guide: see MIGRATION_GUIDE.md
```

---

## Breaking Changes Summary

| Change | Impact | Migration | Deadline |
|--------|--------|-----------|----------|
| `legacy_field` removed | High | Remove from request | 2026-07-15 |
| `status` values changed | Medium | Update enum parsing | 2026-08-15 |
| v1 endpoints deprecated | High | Switch to v2 | 2026-09-30 |

---

## Test Contract Updates

### New Tests Required

```javascript
describe('New Endpoints', () => {
  it('GET /api/v1/resource with pagination', () => {
    // Test new endpoint
  })
})

describe('Modified Endpoints', () => {
  it('POST /api/v1/resource with new_field', () => {
    // Test modified endpoint with new field
  })

  it('POST /api/v1/resource rejects requests without new_field', () => {
    // Test validation
  })
})

describe('Deprecated Endpoints', () => {
  it('DELETE /api/v1/resource/{id} shows deprecation warning', () => {
    // Test deprecation notice in response headers
  })
})
```

### Tests to Remove/Update

- [ ] Remove tests for `legacy_field`
- [ ] Update status enum tests
- [ ] Mark v1 deletion tests as deprecated

---

## Documentation Updates

- [ ] README.md - API section updated
- [ ] API_CONTRACTS.md - all endpoints documented
- [ ] MIGRATION_GUIDE.md - created (if breaking changes)
- [ ] CHANGELOG.md - entry added
- [ ] Examples - all code samples updated

---

## Migration Guide (if applicable)

### For Clients Using Removed Fields

**OLD CODE:**
```javascript
const result = await api.post('/api/v1/resource', {
  name: 'Test',
  legacy_field: 'value'
})
```

**NEW CODE:**
```javascript
const result = await api.post('/api/v1/resource', {
  name: 'Test',
  new_field: 'value'  // Required
  // legacy_field: removed
})
```

### Backward Compatibility (v1 to v2)

**Timeline:**
- 2026-06-01: v2 available, v1 still active
- 2026-07-15: All clients should migrate
- 2026-08-15: v1 marked for deletion
- 2026-09-30: v1 endpoints removed

**Check:**
```bash
# See which endpoints are in use
curl -H "Authorization: Bearer TOKEN" \
  https://api.example.com/admin/usage/v1-endpoints
```

---

## Acceptance Checklist

### Code Changes
- [ ] Implementation matches contract
- [ ] Request validation matches schema
- [ ] Response format matches schema
- [ ] All error codes returned
- [ ] Auth checks implemented

### Testing
- [ ] New endpoint tests pass
- [ ] Modified endpoint tests pass
- [ ] Deprecated endpoint tests pass
- [ ] Error handling tests pass
- [ ] Integration tests pass
- [ ] Coverage ≥ 80%

### Documentation
- [ ] API_CONTRACTS.md updated
- [ ] Examples match new contract
- [ ] Migration guide created
- [ ] CHANGELOG entry added
- [ ] Deprecation notices added

### Deployment
- [ ] Code review approved
- [ ] All tests passing
- [ ] Documentation verified
- [ ] Ready for release

---

**Status**: ☐ Complete / ☐ In Progress / ☐ Blocked  
**Blocker**: _if applicable_  
**Owner**: _Name_  
**Reviewed By**: _Name_
