# Example: Auto-Sync Docs After Adding a New API Endpoint

## Scenario

A developer adds a new `POST /api/v1/notifications` endpoint in Phase 3 (backend implementation). After tests pass, genesis-docs-automation automatically detects the change and updates all related documentation.

## Trigger

```
/update-docs
```

Or auto-triggered when `POST /api/v1/notifications` handler passes integration tests.

## Detected Changes

```
Changed files:
  - src/api/handlers/notificationHandler.ts  (Phase 3: backend)
  - contracts/api/Notification/request.json   (Phase 1: contract)
  - tests/integration/notifications.test.ts  (Phase 2: tests)

Doc updates needed:
  - API Reference → Add POST /api/v1/notifications endpoint
  - Architecture Docs → Note notification system added
  - SPEC_CHANGELOG.md → FEATURE entry
  - IMPLEMENTATION_HANDOFF.md → Updated for Phase 4
```

## Auto-Generated Output

**`.docs/API_REFERENCE.md`** updated with:
```markdown
### POST /api/v1/notifications

**Description**: Send a notification to a user

**Parameters**:
- `userId` (string, required): Target user ID
- `message` (string, required): Notification message text
- `type` (string, optional): Notification type (default: "info")

**Response** (201):
{ "id": "uuid", "status": "queued", "createdAt": "..." }
```

**`SPEC_CHANGELOG.md`** auto-appended:
```
[2026-05-31] FEATURE: Added POST /api/v1/notifications endpoint
  - Sends user notifications with optional type classification
  - Tests: tests/integration/notifications.test.ts (8 tests)
```

## Outcome

- ✅ API docs synced in 5 minutes (vs 30 min manual)
- ✅ Changelog entry accurate
- ✅ Cross-phase references validated
- ✅ No TODO markers remaining
