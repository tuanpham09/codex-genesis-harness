# Semantic Versioning Automation Playbook

**Purpose**: Automated semantic version calculation with decision rationale  
**Duration**: 15 minutes end-to-end  
**Outcome**: Version bump approved with migration guide generated  

---

## Complete Example: API Evolution v1 → v2 → v3

### **Scenario**: E-Commerce Platform Evolution (3 major releases)

**Timeline**: 
- v1.0 (June 2025): Initial user API
- v2.0 (Sept 2025): Add avatar field, deprecate legacy endpoints
- v3.0 (May 2026): Remove deprecated endpoints, breaking changes

---

## Release v3.0: Breaking Change Propagation

### **Step 1: Analyze Changes Since v2.5** (2 min)

**Current Version**: v2.5.3 (last production release)  
**Git commits since v2.5.3 tag**: 47 commits

**Changes Found**:
1. Removed: `POST /users/:id/avatar` endpoint (deprecated in v2.0)
2. Changed: `GET /users/:id` response format
   - Old: `{ user: { id, name, email, avatar } }`
   - New: `{ data: { id, name, email, avatarUrl } }`
3. Added: `PATCH /users/:id/profile` endpoint (new feature)
4. Fixed: User role permission calculation bug (role-admin query issue)
5. Internal: Refactored database layer (no external behavior change)

**Categorization**:
- BREAKING CHANGES: 2 (endpoint removal, response format change)
- FEATURE CHANGES: 1 (new endpoint)
- BUG FIXES: 1 (permission calculation)
- INTERNAL: 1 (database refactor)

---

### **Step 2: Apply Semantic Versioning Rules** (3 min)

**Rule Decision Tree**:
```
Has BREAKING changes?
  YES → Need MAJOR version bump
  
BREAKING changes:
  - Removed POST /users/:id/avatar (breaking: endpoint gone)
  - Changed response format { user: {...} } → { data: {...} } (breaking: clients can't parse)

Current version: v2.5.3
  MAJOR: 2 → 3
  MINOR: 5 → 0 (reset on major)
  PATCH: 3 → 0 (reset on major)

New version: v3.0.0
```

**Semantic Versioning Logic**:
```
v{MAJOR}.{MINOR}.{PATCH}

MAJOR version bump when:
  - Breaking changes exist (incompatible with current consumers)
  - Examples: Removed endpoint, changed response type, new required field

MINOR version bump when:
  - New optional features added
  - No breaking changes
  - Backward compatible
  - Example: New optional field, new optional endpoint

PATCH version bump when:
  - Bug fixes only
  - No new features
  - No breaking changes
  - Backward compatible
  - Example: Fixed calculation bug, fixed race condition
```

**Version Proposal**: v2.5.3 → v3.0.0 ✅

---

### **Step 3: Risk Assessment & Classification** (4 min)

**Breaking Change #1: Removed Endpoint**
```
What changed: 
  - Endpoint: POST /users/:id/avatar
  - Status: Deprecated in v2.0 (6 months ago)
  - Now: Completely removed

Impact:
  - Clients still calling this endpoint: 2 services affected
    * MobileApp v1.0-1.2 (no longer maintained)
    * LegacyAdminTool (internal, 1 team using)
  
Migration requirement:
  - MobileApp: Must update to v1.3+ (uses new avatar API)
  - AdminTool: Must use PATCH /users/:id/profile instead
  
Timeline:
  - Deprecation warning: Since v2.0 (6 months)
  - Final removal: v3.0 (now)
  - Migration deadline: Must complete before v3.0 deployment

Consumer notification:
  - MobileApp team: Already migrated (v1.3 exists)
  - AdminTool team: Need immediate notification + support
```

**Breaking Change #2: Response Format Changed**
```
What changed:
  - Old format: { user: { id, name, email, avatar } }
  - New format: { data: { id, name, email, avatarUrl } }
  
Impact (ALL CLIENTS affected):
  - 12 API consumers affected:
    * WebApp (prod, 2M users) - HIGH IMPACT
    * Dashboard (internal, 500 users)
    * AdminTool (internal, 100 users)
    * Mobile (v2.0+, 5M users) - HIGH IMPACT
    * Partner integrations (3 external clients) - MEDIUM IMPACT
    * Webhooks (consumers of events)
  
Change details:
  - Field renamed: avatar → avatarUrl (object removed from response)
  - Object structure changed: user {...} → data {...}
  - All clients must update parsing
  
Migration requirement:
  - Old code: `const avatar = response.user.avatar`
  - New code: `const avatarUrl = response.data.avatarUrl`
  - Change type: BREAKING (clients will fail if not updated)
  
Timeline:
  - Response format change: Fully breaking (no deprecation period)
  - Migration deadline: All clients must update BEFORE v3.0 deployment
  - Parallel API strategy: Consider running v2 API (in parallel) during transition?
```

**Risk Score Calculation**:
```
Scoring matrix (1-10):
  1-2: Patch only, no breaking changes (LOW)
  3-5: Minor + some fixes, minimal breaking (MEDIUM)
  6-8: Major + significant breaking changes (HIGH)
  9-10: Multiple major breaking + complex migration (CRITICAL)

This release:
  - BREAKING changes: 2 (heavy weight: 5 points)
  - Affected consumers: 12+ (heavy weight: 2 points)
  - Migration complexity: HIGH (field rename + structure change: 1 point)
  - Timeline pressure: Moderate (6-month deprecation warning: -1 point)
  
RISK SCORE: 7/10 (HIGH RISK)
```

**Risk Classification**: ⚠️ **HIGH RISK - Requires manual approval + staged deployment**

---

### **Step 4: Generate Migration Guides** (4 min)

**Migration Guide #1: Avatar Field Removal**

```markdown
# Migration Guide: Avatar Endpoint Removal (v3.0)

## What Changed
- **Removed**: `POST /users/:id/avatar` endpoint
- **Reason**: Replaced by `PATCH /users/:id/profile` (v2.0)
- **Timeline**: Deprecated for 6 months, removed in v3.0

## Who is affected
- Services using `POST /users/:id/avatar`
- Current: MobileApp (v<1.3), AdminTool

## Migration Steps

### Before (Old Code - v2.5):
```javascript
// Upload user avatar
async function updateAvatar(userId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/users/${userId}/avatar`, {
    method: 'POST',
    body: formData
  });
  
  return response.json(); // { avatar: "url..." }
}
```

### After (New Code - v3.0):
```javascript
// Upload user profile (includes avatar)
async function updateProfile(userId, updates) {
  const response = await fetch(`/users/${userId}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  return response.json(); // { data: { avatarUrl: "url..." } }
}

// Usage:
updateProfile(userId, { 
  avatarUrl: 'https://...'
});
```

## Troubleshooting

**Q: I get 404 on POST /users/:id/avatar**
A: This endpoint was removed in v3.0. Use `PATCH /users/:id/profile` instead.

**Q: What's the new response format?**
A: `{ data: { id, name, email, avatarUrl } }` (see response format migration guide)

## Support
Contact: api-support@company.com
Slack: #api-migration
```

**Migration Guide #2: Response Format Change**

```markdown
# Migration Guide: Response Format Change (v3.0)

## What Changed
- **Old**: `{ user: { id, name, email, avatar } }`
- **New**: `{ data: { id, name, email, avatarUrl } }`

## All Affected Endpoints
GET /users  
GET /users/:id  
PATCH /users/:id/profile  
POST /users/:id/register  
(and 5 more endpoints...)

## Migration Steps

### JavaScript / TypeScript

**Before (v2.5)**:
```typescript
const response = await fetch('/users/123');
const { user } = await response.json();
console.log(user.avatar); // "https://..."
```

**After (v3.0)**:
```typescript
const response = await fetch('/users/123');
const { data } = await response.json();
console.log(data.avatarUrl); // "https://..."
```

### Python

**Before**:
```python
response = requests.get('/users/123')
data = response.json()
avatar = data['user']['avatar']
```

**After**:
```python
response = requests.get('/users/123')
data = response.json()
avatar_url = data['data']['avatarUrl']
```

### cURL

**Before**:
```bash
curl https://api.example.com/users/123
# { "user": { "avatar": "https://..." } }
```

**After**:
```bash
curl https://api.example.com/users/123
# { "data": { "avatarUrl": "https://..." } }
```

## Migration Timeline

| Date | Action |
|------|--------|
| 2026-05-31 | v3.0 released |
| 2026-06-07 | Support deadline for v2.5 (7 days) |
| 2026-07-31 | v2.5 sunsets, removed from production |

**Deadlines**:
- ⚠️ Complete migration: Before 2026-06-07 (7 days)
- ⚠️ Final migration: Before 2026-07-31 (sunset date)

## Common Pitfalls

❌ **Mistake #1**: Accessing `response.user` (old format)
```javascript
// This will fail in v3.0:
const name = response.user.name; // undefined

// Correct:
const name = response.data.name;
```

❌ **Mistake #2**: Trying both formats without checking
```javascript
// Don't do this:
const avatar = response.user?.avatar || response.data?.avatarUrl;

// Check API version instead:
const version = response.headers['x-api-version'];
const avatar = version === '3' ? response.data.avatarUrl : response.user.avatar;
```

## Support
Contact: api-support@company.com
Slack: #api-migration
GitHub: github.com/company/api/issues
```

---

### **Step 5: Generate Release Notes** (2 min)

```markdown
# Release Notes: v3.0.0

**Released**: May 31, 2026  
**Version**: v3.0.0 (MAJOR release)

## 🎉 What's New

### New Features
- ✨ **New Profile Endpoint**: `PATCH /users/:id/profile` for comprehensive user updates
- ✨ **Improved avatar handling**: `avatarUrl` field with better URL validation
- ✨ **Enhanced permission system**: More granular role-based access control

### 🐛 Bug Fixes
- Fixed: User role permission calculation (was incorrectly denying admin-only access)
- Fixed: Avatar URL edge cases with non-ASCII filenames

### 📚 Documentation
- Added: API migration guide (breaking changes)
- Added: Per-endpoint upgrade instructions
- Added: Code examples in 5+ languages

## ⚠️ BREAKING CHANGES

### 1. Response Format Changed (ALL ENDPOINTS)
**Affects**: All API consumers

**Old Format**:
```json
{ "user": { "id": 1, "name": "John", "avatar": "https://..." } }
```

**New Format**:
```json
{ "data": { "id": 1, "name": "John", "avatarUrl": "https://..." } }
```

**Action required**: Update client code to parse new format  
**Migration guide**: [See Full Migration Guide](https://docs.example.com/v3-migration)  
**Deadline**: Before v3.1 (November 2026)

### 2. Removed Endpoint: POST /users/:id/avatar
**Deprecated since**: v2.0 (October 2025)  
**Removed in**: v3.0 (May 2026)

**Action required**: Use `PATCH /users/:id/profile` instead  
**Migration guide**: [Avatar Endpoint Removal](https://docs.example.com/avatar-migration)

## 🗑️ Deprecated Features
- Field `user.avatar` → use `data.avatarUrl`
- Endpoint structure: `/users/{id}` → now returns `{ data: {...} }`

## 📊 Deployment

**Deployment Strategy**: Canary (High-Risk Release)
- Stage 1: 1% traffic (1 hour)
- Stage 2: 10% traffic (2 hours)
- Stage 3: 50% traffic (4 hours)
- Stage 4: 100% traffic (full rollout)

**Timeline**: 8+ hours total deployment window

## 🆘 Support

**Migration assistance**: api-support@company.com  
**Slack**: #api-v3-migration  
**Status page**: status.example.com  
**Emergency rollback**: Available for 24 hours post-deployment

---
```

---

### **Step 6: Generate Deployment Strategy** (2 min)

```
DEPLOYMENT STRATEGY: Canary (HIGH RISK SCORE 7/10)

Breaking Changes: 2 (major)
Risk Level: HIGH
Recommended Approach: Canary deployment with staged rollout

STAGE 1: 1% Traffic (1 hour)
  Deployment time: 10:00 UTC
  Target: 1% of traffic routed to v3.0
  Monitoring: Continuous
  Alerts: Error rate >5%
  Decision: After 1 hour, go/no-go for Stage 2

STAGE 2: 10% Traffic (2 hours)
  Deployment time: 11:15 UTC
  Target: 10% of traffic
  Monitoring: Continuous
  Alerts: Error rate >5%
  Decision: After 2 hours, go/no-go for Stage 3

STAGE 3: 50% Traffic (4 hours)
  Deployment time: 13:30 UTC
  Target: 50% of traffic
  Monitoring: Continuous
  Alerts: Error rate >2%
  Decision: After 4 hours, go/no-go for Stage 4

STAGE 4: 100% Traffic (Full Rollout)
  Deployment time: 17:45 UTC
  Target: All traffic
  Monitoring: Continue for 24 hours
  Rollback available: For 24 hours post-complete deployment

Total timeline: 8 hours
Team required: On-call for full 8 hours + 24 hours post-deployment monitoring
```

---

### **Step 7: Validation & Approval** (2 min)

**Pre-Release Validation Checklist**:
- ✅ Tests pass (85% coverage)
- ✅ Breaking changes documented (2/2)
- ✅ Migration guides created (2/2)
- ✅ Release notes generated
- ✅ Runbooks prepared (dev, staging, prod)
- ✅ Rollback tested
- ✅ Approval obtained (Tech Lead, Product Lead)

**Approval Chain**:
- ✅ Tech Lead approved: 2026-05-30 15:30 UTC (John Doe)
- ✅ Product Lead approved: 2026-05-30 16:45 UTC (Jane Smith)
- ✅ Deployment window: 2026-05-31 10:00-18:00 UTC

**Status**: ✅ **APPROVED FOR DEPLOYMENT**

---

## Summary: v3.0.0 Release

| Aspect | Value |
|--------|-------|
| **Current Version** | v2.5.3 |
| **New Version** | v3.0.0 |
| **Version Bump Type** | MAJOR (breaking changes) |
| **Breaking Changes** | 2 |
| **Affected Consumers** | 12+ |
| **Risk Score** | 7/10 (HIGH) |
| **Deployment Strategy** | Canary (1%→10%→50%→100%) |
| **Timeline** | 8+ hours |
| **Approval Status** | ✅ APPROVED |
| **Migration Guides** | 2 created |
| **Release Notes** | Generated |

**Ready for**: Canary deployment beginning Stage 1 (1% traffic)
