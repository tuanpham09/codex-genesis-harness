# Feature Registry

> **Nguồn sự thật duy nhất** cho tất cả tính năng của Genesis Codex Harness.  
> Schema: [`contracts/features/registry-schema.json`](../contracts/features/registry-schema.json)  
> **RULE**: Mỗi feature phải có `verify_cmd` — lệnh thực thi xác nhận tính năng hoạt động.

## Status Definitions

| Status | Ý nghĩa |
|---|---|
| `planned` | Đã xác định scope, chưa implement |
| `in-progress` | Đang được implement trong phiên hiện tại |
| `done` | Code xong, chưa chạy verification gate |
| `verified` | Đã có CLI evidence — verification passed |
| `deprecated` | Không còn được duy trì |

---

## Feature Table

| id | status | title | verify_cmd | skill |
|---|---|---|---|---|
| F001 | verified | Skill system — 25 packaged Codex skills | `bash scripts/verify.sh` | genesis-harness |
| F002 | verified | CLI binary `genesis-harness` với install/uninstall/status/docs | `node tests/integration/cli-smoke.test.js` | genesis-harness |
| F003 | verified | LeanCTX context budget policy seeding | `bash scripts/run-evals.sh` | genesis-harness |
| F004 | verified | Beads memory system (remember/recall/forget/prime) | `bash scripts/run-evals.sh` | genesis-harness |
| F005 | verified | Mermaid VISUAL_GRAPH.md sync gate | `bash scripts/run-evals.sh` | genesis-harness |
| F006 | verified | docs-gate hook (check-docs-sync.sh) | `node bin/genesis-harness.js docs-gate` | genesis-harness |
| F007 | verified | PEV Loop enforcement (Plan → Execute → Verify) | `bash scripts/verify.sh` | genesis-harness-engineering |
| F008 | verified | Contract system (api/agents/events/ui) | `bash scripts/verify.sh` | genesis-api-contract |
| F009 | verified | TDD workflow (Red → Green → Refactor) | `node tests/unit/feature_registry.test.js` | genesis-test-driven-development |
| F010 | verified | Verification-before-completion gate | `bash scripts/verify.sh` | genesis-verification-before-completion |
| F011 | verified | git worktrees isolation for dangerous changes | `bash scripts/verify.sh .codex/skills/genesis-using-git-worktrees` | genesis-using-git-worktrees |
| F012 | verified | Observability schema + live data (L11) | `node tests/unit/feature_registry.test.js` | genesis-observability-automation |
| F013 | verified | Feature Registry as harness primitive (L08) | `node tests/unit/feature_registry.test.js` | genesis-harness-engineering |
| F014 | verified | npm pack / tarball smoke test | `bash scripts/run-evals.sh` | genesis-release |
| F015 | verified | spec-impact-engine propagation chain | `bash scripts/verify.sh .codex/skills/spec-impact-engine` | spec-impact-engine |
| F016 | verified | Cold-start test automation (L03) | `node scripts/cold-start-check.js` | genesis-harness |
| F017 | planned | Per-session Time-to-First-Verification KPI (L06) | `node bin/genesis-harness.js status --ttfv` | genesis-harness |
| F018 | verified | Scope ledger per task (L07) | `bash scripts/check-scope.sh` | genesis-harness |
| F019 | planned | Demo feature templates (mockup + contract + E2E) | `npx playwright test playwright/e2e/auth/login-screen.spec.js` | genesis-harness-engineering |

---

## Verification Evidence (Last Run)

> Update this section after each CI run.

```
Date: 2026-06-10T08:30:00Z
scripts/verify.sh         → verify passed
scripts/run-evals.sh      → evals passed
genesis-harness verify-gate → passed
```

---

## Adding a New Feature

1. Add a row to the Feature Table above with a **unique `id`** and a **real `verify_cmd`**
2. Set initial status to `planned`
3. Update `.codebase/MODULE_INDEX.md` if new module is introduced
4. Run `node tests/unit/feature_registry.test.js` — must pass before status → `verified`
