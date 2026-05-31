# Performance Report Template

Use this template to document every performance profiling cycle. Fill in every section — do not leave placeholders in a committed report. This document becomes the authoritative record of system performance at a point in time.

---

## Report Header

```
Performance Report
==================
Service:          [service name, e.g. "users-api"]
Version:          [commit SHA or image tag, e.g. "abc1234"]
Environment:      [environment name, e.g. "staging-isolated"]
Test type:        [baseline | regression | optimization | incident]
Report date:      [ISO 8601, e.g. "2026-05-31"]
Report author:    [your name or "automated"]
Baseline file:    [path to PERF_BASELINE.json, e.g. "observability/baselines/2026-05-31-v1.4.2.json"]
Prior baseline:   [path to previous baseline if this is a comparison, or "N/A"]
```

---

## Section 1: Baseline Capture Summary

### Environment conditions at capture time

| Condition | Value | Within normal? |
|-----------|-------|----------------|
| Background CPU utilization | X% | ✅ / ❌ (should be < 5%) |
| Available memory | X MB | ✅ / ❌ (should be > 70% free) |
| Database connection pool usage | X% | ✅ / ❌ (should be < 20% of max) |
| Database row count (primary tables) | X rows | Reference only |
| Cache state | warm / cold | Note if cold (first run after restart) |
| Active background jobs | none / [list] | ✅ if none |
| Network utilization (background) | X Mbps | ✅ / ❌ (should be < 10 Mbps) |
| Number of instances / pods | X | Note for scaling context |

### Run summary

| Run # | p50 (ms) | p95 (ms) | p99 (ms) | RPS | Error rate | Status |
|-------|---------|---------|---------|-----|-----------|--------|
| Warm-up (discarded) | — | — | — | — | — | discarded |
| Run 1 | | | | | | recorded |
| Run 2 | | | | | | recorded |
| Run 3 | | | | | | recorded |
| Run 4 | | | | | | recorded |
| Run 5 | | | | | | recorded |
| **AVERAGE** | **XX** | **XX** | **XX** | **XX** | **XX%** | |
| **VARIANCE (%)** | **X%** | **X%** | **X%** | **X%** | | ✅ if < 30% |

### Per-endpoint baseline metrics

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | RPS | Error % | p95 SLA | SLA Status |
|----------|---------|---------|---------|-----|---------|---------|-----------|
| GET /api/users | | | | | | 200 ms | ✅/❌ |
| GET /api/users/:id | | | | | | 200 ms | ✅/❌ |
| POST /api/orders | | | | | | 300 ms | ✅/❌ |
| GET /api/products | | | | | | 150 ms | ✅/❌ |
| POST /auth/login | | | | | | 500 ms | ✅/❌ |

### Memory profile

| Measurement | Value |
|-------------|-------|
| Heap at test start (MB) | |
| Heap at test end (MB) | |
| Heap delta (MB) | |
| RSS at test start (MB) | |
| RSS at test end (MB) | |
| Memory growth rate (MB/min) | |
| Leak suspected? | YES / NO (threshold: > 5 MB/min = suspect) |

---

## Section 2: Test Results Analysis

### Load test execution summary

| Stage | Duration | Concurrency | Completed? | Notes |
|-------|----------|-------------|-----------|-------|
| Smoke | 1 min | 1 VU | YES/NO | |
| Ramp-up | 2 min | 0 → X VUs | YES/NO | |
| Peak | 5-30 min | X VUs | YES/NO | |
| Stress (if run) | 5 min | 2X VUs | YES/NO | |
| Ramp-down | 1 min | X → 0 VUs | YES/NO | |
| Soak (if run) | 30 min | X VUs | YES/NO | |

### Threshold results

| Threshold | Configured | Actual | Result |
|-----------|-----------|--------|--------|
| `http_req_duration p(95)` | < 200 ms | X ms | ✅ PASS / ❌ FAIL |
| `http_req_duration p(99)` | < 500 ms | X ms | ✅ PASS / ❌ FAIL |
| `http_req_failed` | < 1% | X% | ✅ PASS / ❌ FAIL |
| `http_reqs` (min throughput) | ≥ X RPS | X RPS | ✅ PASS / ❌ FAIL |

### Observations during test

Document any anomalies observed during the test execution:

- **Latency spikes**: At [time into test], p95 spiked to X ms for approximately Y seconds. Cause: [known/unknown].
- **Error bursts**: At [time into test], error rate spiked to X% for Y seconds. HTTP status codes observed: [list].
- **Memory anomaly**: Memory grew from X MB to Y MB during [stage]. Drift rate: Z MB/min.
- **Throughput drop**: RPS dropped from X to Y at [time]. Correlates with [event].
- **External dependency issues**: [service] responded slowly / returned errors during [time period].

---

## Section 3: Before/After Comparison Table

Use this section for regression detection reports. Fill in after running the after-baseline.

### Summary

```
Before baseline: [path] captured [date] at version [X]
After baseline:  [path] captured [date] at version [Y]
Change context:  [description of what changed, e.g. "Added index on users.tenant_id, fixed N+1 query"]
```

### Metric delta table

| Endpoint | Metric | Before | After | Delta | Delta % | Status |
|----------|--------|--------|-------|-------|---------|--------|
| GET /api/users | p50 ms | | | | | ✅/❌/⚠️ |
| GET /api/users | p95 ms | | | | | ✅/❌/⚠️ |
| GET /api/users | p99 ms | | | | | ✅/❌/⚠️ |
| GET /api/users | RPS | | | | | ✅/❌/⚠️ |
| GET /api/users | Error % | | | | | ✅/❌/⚠️ |
| GET /api/users/:id | p50 ms | | | | | ✅/❌/⚠️ |
| GET /api/users/:id | p95 ms | | | | | ✅/❌/⚠️ |
| POST /api/orders | p95 ms | | | | | ✅/❌/⚠️ |

**Legend:**
- ✅ IMPROVEMENT: Latency decreased > 10% OR throughput increased > 10%
- ❌ REGRESSION: Latency increased > 20% OR throughput decreased > 15% OR error rate increased
- ⚠️ STABLE: Change within variance bounds (< 10% either direction)

---

## Section 4: Regression Flag Format

For each regression detected, create one entry in this format:

```
REGRESSION DETECTED
===================
Endpoint:         GET /api/users
Metric:           p95 latency
Before value:     180 ms
After value:      290 ms
Delta:            +110 ms (+61.1%)
Threshold:        +20% = REGRESSION
Severity:         HIGH (exceeded SLA target of 200 ms)

Root cause hypothesis:
[Initial hypothesis — to be confirmed by profiling]
Example: "Added full-text search query may be triggering seq scan on users table."

Evidence:
[What evidence supports this hypothesis?]
Example: "pg_stat_statements shows new query with avg=110ms. Previous query avg=12ms."

Recommended action:
[Immediate recommended action]
Example: "Add GIN index for full-text search. Revert or defer feature until index is in place."

Blocking deployment? YES / NO
[If YES, this must be resolved before the change can be merged/deployed]
```

---

## Section 5: Optimization Recommendation Format

For each identified bottleneck, create one entry:

```
OPTIMIZATION RECOMMENDATION
============================
ID:               PERF-2026-001
Status:           OPEN / IN PROGRESS / IMPLEMENTED / CLOSED
Priority:         P1 (Critical) / P2 (High) / P3 (Medium) / P4 (Low)

Bottleneck:       [What is slow and where]
Example: "N+1 query pattern in GET /api/users — executing 1 + N SELECT queries per request"

Evidence:
- pg_stat_statements: query "SELECT * FROM profiles WHERE user_id=$1" called 50× per /api/users request
- EXPLAIN ANALYZE: Seq Scan on profiles table (50,000 rows per scan)
- DB query time = 380 ms avg (84% of total response time of 450 ms)
- Flame graph: 73% of CPU time in ORM hydration loop

Recommended fix:
[Specific, actionable fix]
Example:
1. Change ORM call from users.findAll() to users.findAll({ include: ['profile'] })
   This replaces 1+N queries with a single LEFT JOIN query.
2. Add index: CREATE INDEX CONCURRENTLY idx_profiles_user_id ON profiles(user_id);

Estimated impact:       HIGH (expected p95 improvement: 300-370 ms, ~70-82% reduction)
Implementation effort:  EASY (3 lines of ORM code + 1 migration)
Risk:                   LOW (index creation is non-blocking with CONCURRENTLY)

Validation method:
1. Run after-baseline with this fix deployed.
2. Confirm p95 ≤ 80 ms (well under 200 ms SLA).
3. Confirm error rate unchanged.
4. Check pg_stat_statements — N+1 query should no longer appear.

Implemented in:   [PR # or commit SHA, filled in after implementation]
After p95:        [measured after implementation]
Improvement:      [% improvement achieved]
Closed date:      [date when confirmed working in production]
```

---

## Report Footer

```
OVERALL ASSESSMENT
==================
SLA compliance:   ALL PASS / X FAILS
Regressions:      X detected (list IDs)
Improvements:     X detected
Open recommendations: X items (list IDs)
Baseline updated: YES / NO (path: ...)
PERF_LOG.md updated: YES / NO
Next review:      [date, typically 1 sprint from now]

Sign-off:
[ ] Performance report reviewed by: ___________
[ ] Regressions dispositioned (fixed or accepted): ___________
[ ] PERF_LOG.md updated: ___________
[ ] Recommendations assigned: ___________
```
