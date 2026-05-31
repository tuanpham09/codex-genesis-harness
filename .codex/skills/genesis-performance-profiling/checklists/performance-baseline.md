# Performance Baseline Checklist

Use this checklist every time you capture a performance baseline. Complete every item in order. Do not skip items — each gate exists because a skipped step has caused a bad baseline in the past.

---

## Pre-Baseline: Environment Isolation

### Infrastructure isolation
- [ ] **Test environment is NOT shared with production traffic.** Confirm with ops/SRE that no production routes to this environment.
- [ ] **No deployments are in progress.** Deployments during baseline capture invalidate results. Check CI/CD pipeline status.
- [ ] **No scheduled jobs running.** Check cron schedules and batch job queues. Postpone or disable non-critical jobs for the duration.
- [ ] **Auto-scaling is DISABLED or pinned.** If the environment auto-scales, pin to a fixed instance count for the test. Note the pinned count.
- [ ] **Horizontal pod count is stable.** For Kubernetes: confirm `kubectl get pods` shows all pods Running and Ready. No pending restarts.
- [ ] **Database is not under maintenance.** Confirm no vacuum, reindex, or backup jobs scheduled during the test window.
- [ ] **External dependencies are stubbed or consistent.** Third-party APIs (payment, email, SMS) should be mocked or pointed at their own stable sandbox. Document which ones are mocked.

### Resource baseline snapshot
Before starting any test traffic, record current resource state:
- [ ] CPU utilization < 5% (idle baseline). Command: `top -bn1 | grep "Cpu(s)"`
- [ ] Available memory > 70% of total. Command: `free -m`
- [ ] Disk I/O idle. Command: `iostat -x 1 5`
- [ ] Network utilization < 10 Mbps (background noise). Command: `iftop` or `nethogs`
- [ ] Database connection pool: active connections < 20% of max. Command: `SELECT count(*) FROM pg_stat_activity WHERE state = 'active';`
- [ ] No alerts firing in monitoring stack (Grafana/Datadog). Check alert manager before starting.

### Tool installation verification
- [ ] **k6 installed and correct version** (≥ 0.45): `k6 version`
- [ ] **Artillery installed** (if using): `artillery --version`
- [ ] **Locust installed** (if using): `locust --version`
- [ ] **wrk2 or hey available** (for quick smoke latency): `wrk --version` or `hey --version`
- [ ] **Language profiler available**:
  - Node.js: `clinic --version` or verify `--prof` flag works.
  - Python: `py-spy --version`
  - Go: `go tool pprof` available
- [ ] **jq installed** for JSON result parsing: `jq --version`
- [ ] **Prometheus metrics endpoint reachable**: `curl http://service-host:9090/metrics | head -20`

### Authentication and connectivity
- [ ] **Test API tokens are valid and not expiring during the test.** Check token TTL — should be > test duration + 30 min buffer.
- [ ] **All target endpoints reachable from test runner.** Run `curl -s -o /dev/null -w "%{http_code}" http://target-host/api/health` for each endpoint.
- [ ] **DNS resolves correctly from test runner.** Run `dig target-host` and confirm A record.
- [ ] **TLS certificate is valid** (not expired): `echo | openssl s_client -connect target-host:443 2>/dev/null | openssl x509 -noout -dates`

---

## Baseline Measurement Protocol

### What to measure

For every endpoint in scope, capture the following metrics in each run:

| Metric | Description | Unit | How to capture |
|--------|-------------|------|----------------|
| `p50_ms` | Median response time | milliseconds | k6 `http_req_duration{p:50}` |
| `p95_ms` | 95th percentile response time | milliseconds | k6 `http_req_duration{p:95}` |
| `p99_ms` | 99th percentile response time | milliseconds | k6 `http_req_duration{p:99}` |
| `throughput_rps` | Requests per second at peak | req/s | k6 `http_reqs` counter ÷ duration |
| `error_rate_pct` | HTTP 4xx/5xx rate | percentage | k6 `http_req_failed` rate |
| `memory_start_mb` | Process heap at test start | megabytes | Prometheus `process_resident_memory_bytes` |
| `memory_end_mb` | Process heap at test end | megabytes | Prometheus `process_resident_memory_bytes` |
| `memory_delta_mb` | Heap growth during test | megabytes | `memory_end - memory_start` |
| `cpu_avg_pct` | Average CPU utilization during test | percentage | Prometheus `process_cpu_seconds_total` rate |
| `db_query_p95_ms` | Database query 95th percentile | milliseconds | `pg_stat_statements` or slow query log |
| `connection_pool_wait_ms` | Connection pool wait time | milliseconds | App-level metrics or APM |

### How many runs

| Situation | Minimum runs | Notes |
|-----------|-------------|-------|
| Initial baseline | 5 runs | Discard first (JIT warm-up). Average remaining 4. |
| Daily CI check | 3 runs | Acceptable for regression gating if environment is consistent. |
| Before/after comparison | 5 runs each | Must use identical conditions. Run same day if possible. |
| After major optimization | 5 runs | Document before re-running to confirm stability. |
| Incident reproduction | 1 run (controlled) | Enough to confirm reproduction; document variance. |

### Run protocol
1. **Warm-up run** (discard): 30% of peak concurrency for 2 minutes. Do NOT record results.
2. **Wait 1 minute** for connection pools and caches to settle after warm-up.
3. **Measurement run 1**: Full peak concurrency for minimum 5 minutes. Record results.
4. **Wait 2 minutes** between runs to let pools drain and metrics settle.
5. **Measurement runs 2-N**: Repeat steps 3-4.
6. **Post-run snapshot**: Record memory and CPU after all runs complete (check for drift).

### Variance check
After all runs: compute variance. If p95 variance > 30% across runs, the baseline is unreliable.
- Do NOT average an unreliable baseline.
- Investigate the source of variance (see Recovery Workflow in SKILL.md).
- Re-run after fixing the root cause.

---

## Load Test Design Checklist

### Traffic model design
- [ ] **Traffic distribution matches production**. Do not send 100% to one endpoint. Use production access log analysis to determine realistic split. Example: `GET /api/users` = 40%, `GET /api/products` = 30%, `POST /api/orders` = 20%, other = 10%.
- [ ] **Payload sizes match production**. Test with representative payloads (median size from logs). Do not use tiny toy payloads.
- [ ] **Read/write ratio matches production**. If production is 80% reads / 20% writes, the load test must reflect this.
- [ ] **Think time is included** for user-simulation tests (not API microbenchmarks). Add 1–5 second pauses between user actions to simulate real user behavior.
- [ ] **Session state is realistic**. If production users have sessions with history (shopping carts, multi-step forms), simulate stateful user journeys.
- [ ] **Geographic distribution considered**. If production traffic comes from multiple regions, ensure test runner location is not the only factor reducing latency (test from multiple regions for global services).

### Load test stages
Every load test must include these stages:

| Stage | Duration | Concurrency | Purpose |
|-------|----------|-------------|---------|
| Smoke | 1 min | 1 VU | Verify endpoint responds without errors at all |
| Ramp-up | 2 min | 0 → target VUs | Simulate organic traffic growth; avoid cold-start spikes |
| Peak | 5-30 min | Target VUs | Measure steady-state performance at expected load |
| Stress (optional) | 5 min | 2× target VUs | Find breaking point and graceful degradation behavior |
| Ramp-down | 1 min | Target → 0 VUs | Verify graceful connection drain |
| Soak (optional) | 30 min | 50% target VUs | Detect memory leaks, connection pool exhaustion, drift |

---

## Regression Threshold Definitions

Use these thresholds to classify measurement deltas as REGRESSION / STABLE / IMPROVEMENT.

### Latency thresholds

| Tier | SLA target | Regression if p95 increases by | Improvement if p95 decreases by |
|------|-----------|-------------------------------|--------------------------------|
| Real-time (WebSocket, streaming) | < 50 ms | > 10% | > 5% |
| Web API (synchronous REST) | < 200 ms | > 20% | > 10% |
| Internal service (microservice call) | < 100 ms | > 15% | > 10% |
| Background job (async processing) | < 5000 ms | > 30% | > 15% |
| Batch processing | < 60 s | > 25% | > 20% |

### Throughput thresholds

| Tier | Regression if RPS decreases by | Improvement if RPS increases by |
|------|-------------------------------|--------------------------------|
| Web API | > 15% | > 10% |
| Internal service | > 20% | > 15% |
| Batch job | > 25% | > 20% |

### Error rate thresholds (absolute, not relative)

| Tier | SLA target | Flag as CRITICAL if | Flag as WARNING if |
|------|-----------|--------------------|--------------------|
| Payment / financial | < 0.01% | > 0.05% | > 0.01% |
| Web API (standard) | < 0.1% | > 0.5% | > 0.1% |
| Internal service | < 0.5% | > 1% | > 0.5% |
| Background job | < 1% | > 5% | > 1% |

### Memory growth thresholds

| Duration | Acceptable growth | Warning | Leak suspected |
|----------|------------------|---------|----------------|
| 5 min test | < 20 MB | 20-50 MB | > 50 MB |
| 30 min soak | < 50 MB | 50-100 MB | > 100 MB |
| 1 hour soak | < 100 MB | 100-200 MB | > 200 MB |

---

## Post-Optimization Validation Gates

After implementing any optimization, ALL of the following gates must pass before declaring success:

### Gate 1: Improvement confirmation
- [ ] After-baseline p95 is ≥ 10% lower than before-baseline p95 (meaningful improvement, not noise).
- [ ] After-baseline throughput is NOT lower than before-baseline throughput (optimization didn't trade throughput for latency).
- [ ] After-baseline error rate is NOT higher than before-baseline error rate.
- [ ] After-baseline memory delta is NOT higher than before-baseline memory delta.

### Gate 2: SLO compliance
- [ ] All endpoints pass their defined p95 SLA target (not just "better than before").
- [ ] Error rate is below SLA threshold.
- [ ] Throughput meets minimum RPS target.

### Gate 3: Stability
- [ ] Run 3 after-baseline measurements; variance < 15% across runs (optimization is stable, not flaky).
- [ ] Memory does not grow unboundedly over a 10-minute post-optimization soak test.

### Gate 4: Regression check on adjacent endpoints
- [ ] Run regression detection on ALL endpoints in scope, not just the optimized one. Confirm no adjacent regressions were introduced.

### Gate 5: Documentation
- [ ] `PERF_LOG.md` updated with before/after comparison.
- [ ] `OPTIMIZATION_RECOMMENDATIONS.md` marked as implemented with date and commit SHA.
- [ ] `PERF_BASELINE.json` updated with new after-baseline (old baseline archived, not deleted).
