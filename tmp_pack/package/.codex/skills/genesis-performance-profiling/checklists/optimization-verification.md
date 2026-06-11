# Optimization Verification Checklist

Use this checklist when verifying that a performance optimization is correct, safe, and effective. Run this end-to-end after every optimization implementation — never ship a performance fix without completing all gates.

---

## Pre-Optimization State Capture

### Mandatory — complete BEFORE implementing any optimization

- [ ] **Before-baseline captured and stored.** Path: `observability/baselines/before-[date]-[ticket].json`. This file is immutable — do NOT overwrite after implementation starts.
- [ ] **Bottleneck evidence documented.** The `BOTTLENECK_ANALYSIS.md` has been written with specific function names, call counts, and evidence (flame graph, heap snapshot, query plan). Vague bottlenecks ("the API is slow") are NOT acceptable.
- [ ] **Git branch created.** Optimization work happens on a dedicated branch. Never optimize on `main` directly.
- [ ] **Rollback plan documented.** In `OPTIMIZATION_RECOMMENDATIONS.md`, under the bottleneck entry, there is a rollback procedure (e.g., feature flag disable, migration revert command, previous Docker image tag).
- [ ] **Adjacent system state known.** Confirm which other services call the service being optimized. Know which upstream/downstream endpoints could be affected.
- [ ] **Database schema snapshot taken** (if DB changes are part of the optimization). Record table sizes, index list, and current query plans for all affected queries.
- [ ] **Feature flag prepared** (for high-risk optimizations). If the optimization changes behavior (not just performance), wrap it in a feature flag that can be disabled without a deployment.

### State snapshot commands
Run these and save outputs alongside the before-baseline:

```bash
# Service info
git log --oneline -5 > state-snapshot/git-log.txt
docker inspect service-name > state-snapshot/docker-inspect.json

# Database state
psql -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(tablename::regclass) DESC;" > state-snapshot/table-sizes.txt
psql -c "SELECT indexname, tablename, pg_size_pretty(pg_relation_size(indexname::regclass)) FROM pg_indexes WHERE schemaname='public';" > state-snapshot/indexes.txt

# Current query plans for affected queries
psql -c "EXPLAIN ANALYZE SELECT ..." > state-snapshot/query-plan-before.txt
```

---

## Optimization Implementation Checklist

### Code quality gates
- [ ] **Change is minimal and focused.** The PR diff touches only the files necessary for this specific bottleneck. No unrelated refactors bundled in the same PR.
- [ ] **Unit tests written for the optimization.** If caching was added, there are tests for cache hit, cache miss, and cache invalidation. If a query was changed, there are tests for the new query results.
- [ ] **Existing tests still pass.** Run the full test suite: `npm test` / `pytest` / `go test ./...`. Zero test failures allowed.
- [ ] **No new linter errors.** Run `eslint` / `flake8` / `golangci-lint`.
- [ ] **Memory management verified** (for caching optimizations). Cache has a maximum size limit. Cache has a TTL or eviction policy. Unbounded caches are NOT acceptable.
- [ ] **Error handling preserved.** The optimization does not swallow errors or change error behavior. All original error paths still return correct HTTP status codes.
- [ ] **Concurrency safety checked** (for shared state optimizations). Thread safety / mutex locking reviewed. Race conditions verified absent (`go test -race` for Go; ThreadSanitizer for C/C++).

### Database optimization gates
- [ ] **New indexes created with `CONCURRENTLY`** to avoid table locks in production.
  ```sql
  CREATE INDEX CONCURRENTLY idx_users_tenant_status ON users(tenant_id, status, created_at);
  ```
- [ ] **EXPLAIN ANALYZE run on optimized query** to confirm index is being used (not a sequential scan).
- [ ] **Query result correctness verified.** The optimized query returns the same results as the original query. Run a diff of outputs on representative data sets.
- [ ] **Migration is reversible.** The `down` migration correctly reverts all schema changes.
- [ ] **No N+1 queries introduced.** If ORM eager loading was added, verify it does not over-fetch (loading too many related records).

### Caching optimization gates
- [ ] **Cache key includes all relevant dimensions.** If results vary by tenant, the cache key includes tenant ID. If results vary by user role, the cache key includes role.
- [ ] **Cache invalidation is correct.** When the underlying data changes (write operation), cache is invalidated within defined TTL or immediately.
- [ ] **Thundering herd protection.** For high-traffic cache misses, implement lock-based cache warming (only one request populates the cache; others wait) to avoid a flood of DB queries on cache miss.
- [ ] **Cache TTL is appropriate.** TTL matches the acceptable staleness of the data (e.g., user profile: 5 min is fine; real-time stock price: 0 ms TTL, no cache).
- [ ] **Cache metrics are instrumented.** `cache_hits`, `cache_misses`, and `cache_evictions` counters are exported to monitoring.

---

## Post-Optimization Validation Gates

### Gate 1: Functional correctness (run FIRST — before any performance testing)
- [ ] Run integration test suite against the optimized service. All tests pass.
- [ ] Run manual smoke test against staging: hit the optimized endpoint manually and verify response body is correct.
- [ ] If the optimization changed query behavior, compare a sample of API responses (before vs after) to confirm no data differences.

### Gate 2: Performance improvement confirmation
Run 5 after-baseline measurement runs (same protocol as before-baseline):

- [ ] **p95 latency improved** by ≥ 10% vs before-baseline.
  - Before p95: ___ ms → After p95: ___ ms → Delta: ___% 
  - ✅ PASS if delta ≥ 10% improvement | ❌ FAIL if delta < 10% or regressed
- [ ] **Throughput not degraded**: After RPS ≥ 95% of before RPS.
  - Before RPS: ___ → After RPS: ___ → Delta: ___%
  - ✅ PASS if delta ≥ -5% | ❌ FAIL if throughput decreased > 5%
- [ ] **Error rate not increased**: After error rate ≤ before error rate.
  - Before: ___% → After: ___%
  - ✅ PASS if no increase | ❌ FAIL if increased
- [ ] **Memory growth not increased**: After memory delta ≤ before memory delta + 10 MB.
  - Before delta: ___ MB → After delta: ___ MB
  - ✅ PASS if within acceptable range | ❌ FAIL if memory growth increased

### Gate 3: SLO compliance (all targets must be met)
- [ ] p50 ≤ SLA target: ___ ms
- [ ] p95 ≤ SLA target: ___ ms
- [ ] p99 ≤ SLA target: ___ ms
- [ ] Throughput ≥ minimum: ___ RPS
- [ ] Error rate ≤ SLA target: ___%

### Gate 4: Stability (no flakiness)
- [ ] All 5 after-baseline runs show variance < 15% for p95. (Consistent improvement, not a one-off lucky run.)
- [ ] Run a 10-minute mini-soak test at 50% peak concurrency. Memory does not grow > 25 MB over this period.
- [ ] No error rate spikes observed during the soak test.

### Gate 5: Adjacent endpoint regression check
- [ ] Run full regression detection (all in-scope endpoints, not just the optimized one).
  - `REGRESSION_SUMMARY.json` shows 0 regressions on adjacent endpoints.
  - If any adjacent endpoint regressed: STOP, investigate before proceeding.

---

## Go/No-Go Performance Criteria by Tier

### Web API (synchronous REST endpoints)

| Criterion | Go threshold | No-Go threshold |
|-----------|-------------|-----------------|
| p95 latency | ≤ 200 ms | > 300 ms |
| p99 latency | ≤ 500 ms | > 1000 ms |
| Throughput | ≥ 500 RPS per instance | < 300 RPS per instance |
| Error rate | < 0.1% | > 0.5% |
| Memory growth (5 min) | < 20 MB | > 50 MB |

**Decision**: ALL criteria must be Go. One No-Go criterion blocks the optimization deployment.

### Batch Job (async/scheduled processing)

| Criterion | Go threshold | No-Go threshold |
|-----------|-------------|-----------------|
| Job completion time | ≤ defined SLA per batch | > 2× SLA |
| Records processed/sec | ≥ baseline × 0.95 | < baseline × 0.80 |
| Memory peak | < 2 GB | > 4 GB |
| Error rate | < 1% | > 5% |
| CPU utilization | < 80% avg | > 95% sustained |

### Real-Time Services (WebSocket, streaming, event-driven)

| Criterion | Go threshold | No-Go threshold |
|-----------|-------------|-----------------|
| Message latency p95 | ≤ 50 ms | > 100 ms |
| Message latency p99 | ≤ 100 ms | > 200 ms |
| Throughput | ≥ 1000 events/sec per instance | < 500 events/sec |
| Error rate | < 0.01% | > 0.1% |
| Memory growth (30 min) | < 50 MB | > 200 MB |

### Database Layer (query optimization)

| Criterion | Go threshold | No-Go threshold |
|-----------|-------------|-----------------|
| Query p95 | ≤ 10 ms (indexed) | > 50 ms |
| Sequential scans eliminated | 100% of targeted queries | Any targeted query still scanning |
| Index usage confirmed | EXPLAIN ANALYZE shows Index Scan | Seq Scan remains |
| Replication lag | < 100 ms | > 1 s |
| Connection pool wait | < 5 ms | > 50 ms |

---

## Rollback Trigger Conditions

Initiate rollback IMMEDIATELY if any of the following occur in production after deployment:

### Automatic rollback triggers (CI/CD can execute without human approval)
- Error rate exceeds 1% for more than 2 consecutive minutes.
- p95 latency exceeds 2× the before-baseline value for more than 3 minutes.
- Service health check (`/health` or `/readiness`) starts failing.
- Memory RSS exceeds 90% of container limit.
- Database connection pool wait time exceeds 500 ms.

### Human-reviewed rollback triggers (escalate to on-call, decision within 5 min)
- p95 latency exceeds 1.5× before-baseline for more than 5 minutes.
- Error rate between 0.5% and 1% sustained for > 5 minutes.
- New exception type appearing in logs at high frequency (> 100/min).
- Database slow query log showing new queries > 5 seconds.
- External dependency (payment provider, auth service) reporting increased error rates correlated with the deployment.

### Rollback procedure
```bash
# Option 1: Kubernetes rollout undo
kubectl rollout undo deployment/service-name

# Option 2: Feature flag disable (no deployment required)
curl -X PATCH https://flagd-host/flags/perf-optimization-001 \
  -d '{"enabled": false}'

# Option 3: Database migration revert
npm run migrate:down -- --to=<previous-migration-id>
# Or:
psql -f migrations/revert-<optimization>.sql

# Verify rollback
kubectl rollout status deployment/service-name
curl https://service/health
# Run smoke test
k6 run --vus 1 --duration 30s smoke-test.js
```

### Post-rollback actions
- [ ] Confirm error rate returned to pre-optimization baseline within 5 minutes.
- [ ] Confirm p95 latency returned to pre-optimization baseline within 5 minutes.
- [ ] Create incident report documenting: what regressed, what was rolled back, when, by whom.
- [ ] Add to `OPTIMIZATION_RECOMMENDATIONS.md` under the failed optimization: "ATTEMPTED [date] — ROLLED BACK. Reason: [root cause]. Next attempt: [redesign notes]."
- [ ] Schedule post-mortem within 24 hours if production impact was > 5 minutes.
