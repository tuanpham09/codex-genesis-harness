# Worked Example: Profiling a Slow /api/users Endpoint

**Scenario**: The `GET /api/users` endpoint in the `users-api` service is taking 450 ms at p95. The SLA target is 200 ms. A customer support ticket reports "the user list is very slow." The team suspects a database issue.

This example walks through the complete cycle: baseline → profile → identify → fix → verify.

---

## Step 1: Capture Baseline

**Environment**: staging-isolated (no production traffic, background CPU < 2%)
**Version**: users-api v1.4.1 (commit: `abc1234`)

```bash
# Run k6 baseline (5 runs, discard first)
k6 run \
  --env BASE_URL=https://api.staging.example.com \
  --env AUTH_TOKEN=$STAGING_TOKEN \
  --vus 50 --duration 5m \
  baseline-check.js
```

**Baseline results (averaged across 4 runs):**

| Endpoint | p50 ms | p95 ms | p99 ms | RPS | Error % | SLA | Status |
|----------|--------|--------|--------|-----|---------|-----|--------|
| GET /api/users | 180 | **450** | 920 | 68 | 0.04 | 200 ms | ❌ FAIL |
| GET /api/users/:id | 15 | 55 | 120 | 312 | 0.01 | 200 ms | ✅ PASS |
| POST /api/orders | 90 | 185 | 380 | 145 | 0.05 | 300 ms | ✅ PASS |

**Finding**: Only `GET /api/users` is failing SLA. Other endpoints are fine. This narrows the scope.

---

## Step 2: Identify Bottleneck Type

**CPU check during load test:**
```bash
# During the 5-min load test, check CPU
top -bn1 | grep "Cpu(s)"
# us=18.3% sy=2.1% id=78.5% — CPU is NOT the bottleneck (only 20% used)
```

**Memory check:**
```bash
# Memory at start vs end
# Start: 256 MB RSS, End: 261 MB — only +5 MB, no leak
```

**DB query analysis:**
```sql
SELECT query, calls, total_time/calls AS avg_ms, rows/calls AS avg_rows
FROM pg_stat_statements
ORDER BY avg_ms DESC
LIMIT 5;
```

Results:
```
query                                          calls  avg_ms   avg_rows
SELECT * FROM users WHERE tenant_id=$1          50    385.2    8500
SELECT * FROM profiles WHERE user_id=$1        4250   0.8      1.0
SELECT * FROM users WHERE tenant_id=$1 ...      50    380.1    8500
```

**Finding**: The `SELECT * FROM users WHERE tenant_id=$1` query is taking **385 ms** on average — that's **85% of the total response time (450 ms)**. And there are also 4,250 calls to `SELECT * FROM profiles WHERE user_id=$1` for just 50 parent queries → **classic N+1 pattern**.

---

## Step 3: Deep Analysis

```sql
-- Run EXPLAIN ANALYZE on the slow query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, p.avatar_url, p.bio
FROM users u
WHERE u.tenant_id = 1
ORDER BY u.created_at DESC
LIMIT 50;
```

Output:
```
Limit  (cost=45234.56..45234.69 rows=50 width=248) (actual time=385.123..385.145 rows=50 loops=1)
  -> Sort  (cost=45234.56..47484.56 rows=900000 width=248) (actual time=385.111..385.125 rows=50 loops=1)
       Sort Key: created_at DESC
       Sort Method: external merge  Disk: 32768kB        ← sorting 32 MB to disk!
       -> Seq Scan on users  (cost=0..20234.00 rows=900000 width=248) (actual time=0.034..120.456 rows=8500 loops=1)
            Filter: (tenant_id = 1)
            Rows Removed by Filter: 841500             ← scanning 850K rows, only 8500 match!
Planning Time: 0.452 ms
Execution Time: 385.312 ms
```

**Root cause identified:**
1. **Sequential scan on 850,000 rows** to find 8,500 belonging to `tenant_id=1`. No index on `tenant_id`.
2. **Sort to disk (32 MB)** because there's no index on `created_at` to support the sort.
3. **N+1 pattern**: Application makes 1 query for users list, then 1 query per user for their profile (50 users = 51 total queries).

**Check indexes:**
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'users';
-- Output: pk_users (primary key only)
-- Missing: index on tenant_id, index on created_at
```

---

## Step 4: Implement Fix

**Fix 1: Add missing index** (migration file: `20260531-add-users-tenant-index.sql`)
```sql
-- Non-blocking index creation (CONCURRENTLY means no table lock)
CREATE INDEX CONCURRENTLY idx_users_tenant_created 
  ON users(tenant_id, created_at DESC);
```

**Fix 2: Fix N+1 ORM query** (file: `src/routes/users.js`)
```javascript
// BEFORE (N+1 pattern):
const users = await User.findAll({
  where: { tenant_id: req.tenantId, status: req.query.status },
  order: [['created_at', 'DESC']],
  limit: req.query.limit || 20,
});
// Then for each user: SELECT * FROM profiles WHERE user_id=$1

// AFTER (single JOIN query):
const users = await User.findAll({
  where: { tenant_id: req.tenantId, status: req.query.status },
  order: [['created_at', 'DESC']],
  limit: req.query.limit || 20,
  include: [{
    model: Profile,
    attributes: ['avatar_url', 'bio'],
    required: false,  // LEFT JOIN so users without profiles still appear
  }],
});
```

**Verify fix with EXPLAIN ANALYZE:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.*, p.avatar_url, p.bio
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.tenant_id = 1
ORDER BY u.created_at DESC
LIMIT 50;
```

Output after index:
```
Limit  (cost=0.57..189.23 rows=50 width=248) (actual time=0.089..0.456 rows=50 loops=1)
  -> Index Scan using idx_users_tenant_created on users u  ← Index Scan (not Seq Scan!)
       Index Cond: (tenant_id = 1)
       (... hash join with profiles ...)
Execution Time: 1.234 ms   ← 385ms → 1.2ms (99.7% improvement!)
```

---

## Step 5: Capture After-Baseline

Deploy the fix to staging and re-run the baseline:

```bash
k6 run \
  --env BASE_URL=https://api.staging.example.com \
  --env AUTH_TOKEN=$STAGING_TOKEN \
  --vus 50 --duration 5m \
  baseline-check.js
```

**After-baseline results (averaged across 4 runs):**

| Endpoint | Before p95 | After p95 | Delta | Delta % | SLA | Status |
|----------|-----------|----------|-------|---------|-----|--------|
| GET /api/users | 450 ms | **42 ms** | -408 ms | **-90.7%** | 200 ms | ✅ PASS |
| GET /api/users/:id | 55 ms | 53 ms | -2 ms | -3.6% | 200 ms | ✅ PASS |
| POST /api/orders | 185 ms | 187 ms | +2 ms | +1.1% | 300 ms | ✅ PASS |

**Verification queries:**
```sql
-- N+1 pattern gone — profiles query should no longer appear
SELECT query, calls FROM pg_stat_statements 
WHERE query LIKE '%profiles WHERE user_id%'
ORDER BY calls DESC;
-- Result: 0 rows (query no longer exists!)

-- Main query is now fast
SELECT query, calls, total_time/calls AS avg_ms
FROM pg_stat_statements
WHERE query LIKE '%users WHERE tenant_id%'
ORDER BY avg_ms DESC;
-- Result: avg_ms = 1.2 ms (was 385 ms — 99.7% improvement)
```

---

## Outcome Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| p50 latency | 180 ms | 18 ms | -90.0% |
| p95 latency | 450 ms | 42 ms | -90.7% |
| p99 latency | 920 ms | 95 ms | -89.7% |
| Throughput | 68 RPS | 489 RPS | +619% |
| DB queries per request | 51 (N+1) | 1 (JOIN) | -98% |
| DB query time | 385 ms | 1.2 ms | -99.7% |

**Code changes**: 1 SQL migration file + 3 lines of ORM change.
**Time to fix**: 2 hours (1 hour profiling, 1 hour implementing + verifying).
**SLA compliance**: ✅ PASS (42 ms vs 200 ms SLA target — 79% margin).

---

## PERF_LOG.md Entry for This Cycle

```
---
date:        2026-05-31
version:     1.4.2
commit:      def5678
environment: staging-isolated
test_type:   optimization
triggered_by: Customer complaint (support ticket SUP-1234)
---

Fixed N+1 ORM query and added missing index on users(tenant_id, created_at).
GET /api/users p95 improved from 450 ms to 42 ms (90.7% improvement).
SLA target of 200 ms now comfortably met with 79% margin.
No adjacent endpoint regressions detected.
```
