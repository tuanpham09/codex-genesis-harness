# Example: Auto-Research Before Implementing WebSocket Notifications

## Scenario

A developer requests a new real-time notification feature using WebSocket. Before any planning begins, genesis-research-first auto-triggers to gather evidence.

## Trigger (Auto)

```
/new-feature "Add real-time notifications with WebSocket"
```

genesis-research-first activates automatically as a PreToolUse hook.

## Research Phase (15 min total)

### Local Documentation (5 min)

```
Checked:
  ✓ .codebase/CURRENT_STATE.md — Stack: Express.js + Node.js 20
  ✓ .codebase/MODULE_INDEX.md  — Found: src/modules/chat/ uses Socket.io
  ✓ .codebase/ARCHITECTURE.md  — Single-server currently, Redis available
  ✓ contracts/api/             — No existing WebSocket contracts
```

### Codebase Patterns (5 min)

```
Found:
  ✓ src/modules/chat/ — Existing Socket.io v4 setup
  ✓ tests/integration/chat.test.ts — Integration test pattern
  ✓ fixtures/agents/ — Socket.io fixture template available
```

### External Best Practices (5 min)

```
Researched:
  ✓ Socket.io docs — Namespace pattern recommended for feature isolation
  ✓ GitHub: socket.io-redis-adapter — 8k stars, maintained
  ✓ Stack Overflow — Scaling Socket.io: Redis pub/sub required for multi-server
```

## Research Note Compiled

**`RESEARCH_WEBSOCKET_2026-05-31.md`**:

```markdown
# Research: WebSocket Real-Time Notifications

## Question
Best implementation for real-time notifications?

## Local Evidence
- Codebase already uses Socket.io for chat (src/modules/chat/)
- Redis is available in infrastructure

## External Evidence
1. Socket.io namespace pattern isolates features well
2. socket.io-redis-adapter enables multi-server scaling

## Recommendation
Extend existing Socket.io setup with /notifications namespace + Redis adapter.

## Risks
- Redis single point of failure (mitigate: graceful degradation)
- Learning curve: Redis adapter config (mitigate: docs available)
```

## Auto-Generated Plan

```
Phase 1: Socket.io /notifications namespace (pattern: src/modules/chat/)
Phase 2: Redis adapter setup + auth middleware
Phase 3: Notification trigger API endpoint
Phase 4: Integration tests + fixtures
```

## Outcome

- ✅ Research complete in 15 min (no guesswork)
- ✅ Existing patterns reused (no reinvention)
- ✅ Risks documented upfront
- ✅ Plan passed to genesis-planning with research context
