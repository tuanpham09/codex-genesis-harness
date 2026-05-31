# Migration Guide Template

## File: docs/migration-{VERSION1}-to-{VERSION2}.md

**Use this template** when creating a migration guide for breaking changes.

---

# Migration Guide: API v{OLD} → v{NEW}

## 📋 Overview

Brief explanation of what changed and why. Keep it to 1-2 sentences.

> **In v{NEW}**, we've redesigned the User API to be more RESTful and support new features like avatars and user preferences. This guide helps you migrate from v{OLD} in just a few minutes.

---

## 🎯 What's Changing

### Summary of Changes

- **Removed**: List fields/endpoints being removed
- **Renamed**: List renamed fields/endpoints
- **Changed**: List structural changes
- **Added**: List new optional features (usually not breaking)

---

## 📊 Detailed Changes

### Change 1: Removed `avatar` Field

**What changed**:
```diff
- "avatar": "/avatars/john.jpg"
+ "avatarUrl": "https://cdn.example.com/avatars/john.jpg"
```

**Why**: 
- CDN-based URLs are more flexible
- URL format validation is clearer
- Better separation of concerns (CDN vs application)

**Impact**:
- Code accessing `user.avatar` will break
- Need to update to `user.avatarUrl`
- Affects: Frontend, mobile clients, backend integrations

**Timeline**:
- **v{OLD}.0** (Current): Deprecated - both fields available for compatibility
- **v{NEW}.0** (January 15): Removed completely

---

### Change 2: Renamed Endpoint `/api/users/:id/profile` → `/api/users/:id`

**What changed**:
```diff
- GET /api/users/:id/profile
+ GET /api/users/:id
```

**Why**: Simplify endpoint structure and follow REST conventions

**Impact**: Old endpoint URL will return 404

**Timeline**: Removed immediately in v{NEW}

---

## 🚀 How to Migrate

### Prerequisites

Before starting, you need:
- Node.js 16+ or Python 3.9+
- API client version {NEW}.0 or higher
- 15 minutes of uninterrupted time

### Step 1: Update Client Library (5 min)

Replace the old client with the new version:

```bash
# NPM
npm install @example/api-client@{NEW}.0.0

# Pip
pip install example-api-client=={NEW}.0.0

# Yarn
yarn add @example/api-client@{NEW}.0.0
```

### Step 2: Identify Breaking Changes in Your Code (3 min)

Search for all usages of deprecated fields:

```bash
# Find all references to 'avatar' field
grep -r "\.avatar" src/
grep -r "user\.avatar" src/
grep -r "'avatar'" src/

# Find all calls to old endpoint
grep -r "/api/users/.*/profile" src/
grep -r "users/profile" src/
```

### Step 3: Update Field References (5 min)

Replace all references to the removed field:

**Before**:
```javascript
const userAvatar = user.avatar;
const displayUrl = user.avatar;
```

**After**:
```javascript
const userAvatar = user.avatarUrl;  // New field name
const displayUrl = user.avatarUrl;  // New field name
```

**UI Example**:
```html
<!-- Before -->
<img src="https://cdn.example.com{{ user.avatar }}" />

<!-- After -->
<img src="{{ user.avatarUrl }}" />
```

### Step 4: Update API Calls (5 min)

Replace old endpoints with new ones:

**Before**:
```javascript
const profile = await client.get(`/api/users/${userId}/profile`);
```

**After**:
```javascript
const profile = await client.get(`/api/users/${userId}`);
```

### Step 5: Test Your Changes (5 min)

Run your test suite to ensure everything works:

```bash
npm test
# or
pytest
```

Expected: All tests pass ✅

### Step 6: Deploy (5 min)

Deploy your changes in normal flow:

```bash
git add .
git commit -m "chore: migrate to API v{NEW}"
git push
# Deploy as usual...
```

---

## 📝 Code Examples

### Example 1: Fetch User Profile

**Before (v{OLD})**:
```javascript
async function getUserProfile(userId) {
  const response = await fetch(`https://api.example.com/api/users/${userId}/profile`);
  const user = await response.json();
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar  // Map old field to internal name
  };
}
```

**After (v{NEW})**:
```javascript
async function getUserProfile(userId) {
  const response = await fetch(`https://api.example.com/api/users/${userId}`);
  const user = await response.json();
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl  // Field already has right name
  };
}
```

### Example 2: Display User Avatar in React

**Before (v{OLD})**:
```jsx
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}/profile`)
      .then(r => r.json())
      .then(data => {
        setUser({
          ...data,
          avatar: data.avatar  // Old field
        });
      });
  }, [userId]);
  
  return (
    <div>
      <h3>{user?.name}</h3>
      <img src={`https://cdn.example.com${user?.avatar}`} />
    </div>
  );
}
```

**After (v{NEW})**:
```jsx
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)  // Updated endpoint
      .then(r => r.json())
      .then(setUser);
  }, [userId]);
  
  return (
    <div>
      <h3>{user?.name}</h3>
      <img src={user?.avatarUrl} />  // New field (full URL)
    </div>
  );
}
```

### Example 3: TypeScript Types

**Before (v{OLD})**:
```typescript
interface User {
  id: number;
  name: string;
  avatar: string;  // Path like "/avatars/john.jpg"
}
```

**After (v{NEW})**:
```typescript
interface User {
  id: number;
  name: string;
  avatarUrl: string | null;  // Full URL or null
}
```

---

## 🆘 Troubleshooting

### Problem: "404 Not Found" on Old Endpoint

**Cause**: Using old endpoint `/api/users/:id/profile`

**Solution**: Change to `/api/users/:id`

```javascript
// ❌ Wrong
await fetch(`/api/users/123/profile`);

// ✅ Correct
await fetch(`/api/users/123`);
```

### Problem: "user.avatar is undefined"

**Cause**: Field was renamed to `avatarUrl`

**Solution**: Update field reference

```javascript
// ❌ Wrong
console.log(user.avatar);

// ✅ Correct
console.log(user.avatarUrl);
```

### Problem: Images Broken After Update

**Cause**: Old field was relative path (`/avatars/john.jpg`), new field is full URL

**Solution**: Remove manual URL building

```javascript
// ❌ Wrong - Building URL from relative path
<img src={`https://cdn.example.com${user.avatar}`} />

// ✅ Correct - avatarUrl is complete
<img src={user.avatarUrl} />
```

### Problem: "Cannot find module" or Import Error

**Cause**: Client library not updated to v{NEW}

**Solution**: Reinstall packages

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Tests Still Failing

**Cause**: Test fixtures not updated

**Solution**: Update test mocks/fixtures

```javascript
// ❌ Old test fixture
const mockUser = {
  id: 1,
  avatar: '/avatars/test.jpg'
};

// ✅ New test fixture
const mockUser = {
  id: 1,
  avatarUrl: 'https://cdn.example.com/avatars/test.jpg'
};
```

---

## 📞 Need Help?

- **Documentation**: https://docs.example.com/api/v{NEW}
- **Email**: support@example.com
- **Slack**: #api-help
- **GitHub Issues**: https://github.com/example/api/issues
- **Community Forum**: https://discuss.example.com

---

## ⏰ Timeline

| Date | Event | Action |
|------|-------|--------|
| **Today** | Migration announced | Review this guide |
| **2 weeks** | Deprecation warning emails sent | Update your code |
| **4 weeks** | Second reminder email | Ensure all changes deployed |
| **6 weeks** | v{OLD}.0 support ends | Requests to old endpoints return 404 |
| **8 weeks** | v{OLD} removed from CDN | Clients must be on v{NEW} |

---

## ✅ Migration Checklist

Use this checklist to track your migration progress:

- [ ] Reviewed "What's Changing" section
- [ ] Updated client library to v{NEW}.0
- [ ] Found all usages of `avatar` field (via grep)
- [ ] Updated all field references to `avatarUrl`
- [ ] Updated old endpoint `/api/users/:id/profile` → `/api/users/:id`
- [ ] Updated test fixtures and mocks
- [ ] Updated TypeScript types (if applicable)
- [ ] Ran test suite - all passing
- [ ] Deployed changes to staging
- [ ] Tested on staging environment
- [ ] Deployed changes to production
- [ ] Monitored for errors in production logs
- [ ] ✅ Migration complete!

---

## 📚 Related Resources

- [API Documentation](https://docs.example.com)
- [API {NEW} Release Notes](https://github.com/example/api/releases/tag/v{NEW}.0.0)
- [Code Examples](https://github.com/example/api-examples)
- [Community Examples](https://discuss.example.com/c/examples)

---

## 🎉 You're Done!

Your application is now running on API v{NEW}. Enjoy the new features and improved performance!

If you encounter any issues, don't hesitate to reach out to our support team.

