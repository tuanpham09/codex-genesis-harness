---
name: genesis-performance-profiling
description: "Automate performance baseline measurement, profiling playbook generation, load test orchestration, and before/after regression comparison. Use when performance matters or regressions are suspected."
---

# genesis-performance-profiling

## Purpose

The `genesis-performance-profiling` skill automates the full lifecycle of performance engineering for software systems. It captures quantified baselines (p50/p95/p99 latency, throughput, error rate, memory), generates language-specific profiling playbooks (Node.js, Python, Go), produces load test configurations for k6, Artillery, and Locust, performs before/after regression detection with statistical confidence, and generates prioritized optimization recommendations.

This skill transforms performance work from ad-hoc investigation into a repeatable, evidence-based engineering discipline. Every phase produces artifacts that feed the next, creating a closed loop of measure → profile → optimize → validate.

**Core philosophy**: You cannot optimize what you have not measured. You cannot trust improvements without a before/after comparison against a stable baseline. Every performance claim must be backed by data captured under controlled conditions.

---

## When to use

Use `genesis-performance-profiling` when:

- A new service or endpoint is approaching production and you need an established baseline before the first release.
- A pull request introduces changes to hot paths (database queries, serialization, caching, network calls) and regression detection is required before merge.
- Users or monitors are reporting latency increases, timeout spikes, or memory growth over time.
- You are planning a scaling event (traffic surge, new region, batch job expansion) and need to know current headroom.
- A post-mortem identified a performance incident and you need to reproduce, measure, and fix the root cause with evidence.
- Sprint planning includes performance-related tickets and you need load test specifications, thresholds, and acceptance criteria defined before implementation starts.
- You are evaluating competing implementation strategies (e.g., Redis vs in-process cache) and need a fair comparison under realistic load.
- Continuous integration pipelines need performance gates (p95 < N ms) enforced automatically on every merge.
- An SLA or SLO is at risk and you need to quantify how far off the system currently is.

---

## When NOT to use

Do NOT use `genesis-performance-profiling` when:

- The system under test has no stable environment for isolation. Running profiling against shared staging with random background noise produces unreliable baselines. Fix the environment first.
- The feature is a pure UI or purely declarative config change with no server-side hot path impact. Use `genesis-ui-ux-test` instead.
- You need to profile security properties (rate limiting correctness, auth bypass). Use the API contract skill for correctness, not this skill.
- You only need a one-off micro-benchmark of a single pure function with no I/O. Use language-native benchmarking (e.g., `go test -bench`) directly without this skill's overhead.
- The codebase is in early prototype stage (< 20% of features implemented). Premature optimization at this stage wastes engineering time. Use this skill after the architecture stabilizes.
- You do not yet have a definition of "acceptable performance" (SLA/SLO targets). Run `genesis-planning` first to establish targets, then return to this skill.

---

## Inputs required

Before invoking this skill, gather or confirm the following inputs:

### Environment inputs
- **Target environment URL or host**: The base URL or hostname of the system under test (e.g., `https://api.staging.example.com`).
- **Environment isolation confirmation**: Is the environment isolated from production traffic? Is background load minimal and stable?
- **Deployment version / commit SHA**: Exact version being profiled so results can be correlated to code.

### Endpoint / workload definition
- **Endpoint list**: All endpoints or operations to include in the baseline (method + path + example payload).
- **Realistic request payload samples**: Representative inputs (not trivial or edge-case payloads that bypass real code paths).
- **Authentication credentials / tokens**: Valid test credentials for authenticated endpoints.
- **Concurrency target**: Expected concurrent users or requests per second in production (used to size load test).

### Performance targets (SLO inputs)
- **p50 latency target** (e.g., ≤ 50 ms): Median response time acceptable in production.
- **p95 latency target** (e.g., ≤ 200 ms): 95th percentile threshold (the primary SLA boundary for most web APIs).
- **p99 latency target** (e.g., ≤ 500 ms): 99th percentile threshold (used for SLO error budget).
- **Throughput target** (e.g., ≥ 500 req/s): Minimum acceptable requests per second at peak.
- **Error rate target** (e.g., < 0.1%): Maximum acceptable HTTP 4xx/5xx error rate.
- **Memory growth limit** (e.g., < 50 MB over 10 min): Acceptable heap growth under sustained load (used for leak detection).

### Toolchain inputs
- **Language/runtime**: Node.js, Python, Go, Java, etc. (determines which profiling tools to invoke).
- **Load test tool preference**: k6, Artillery, or Locust (if none specified, default to k6).
- **Monitoring stack**: Prometheus + Grafana, Datadog, CloudWatch, etc. (used to correlate metrics).
- **Database type** (if applicable): PostgreSQL, MySQL, MongoDB, Redis (used for query analysis phase).

### Regression detection inputs (for before/after comparison)
- **Baseline artifact path**: Path to previously captured `PERF_BASELINE.json` (for regression checks).
- **Regression threshold**: Percentage increase that constitutes a regression (default: p95 increase > 20% = regression flag).

---

## Outputs required

This skill produces the following artifacts, stored in the project's `observability/` or specified output directory:

### Phase 1 outputs
- `PERF_BASELINE.json`: Machine-readable baseline with all metrics per endpoint (p50, p95, p99, throughput, error rate, memory snapshots).
- `PERF_BASELINE_REPORT.md`: Human-readable baseline summary with context (environment, version, date, conditions).

### Phase 2 outputs
- `profiling-playbook.md`: Step-by-step profiling instructions customized to the detected language/runtime.
- `profile-results/`: Directory containing raw profiling output (flame graphs, heap snapshots, pprof files).
- `BOTTLENECK_ANALYSIS.md`: Ranked list of identified bottlenecks with evidence (function names, call counts, CPU %, memory allocation sites).

### Phase 3 outputs
- `load-test-config.yml` or `load-test-script.js`: Load test configuration file for the chosen tool (k6/Artillery/Locust).
- `load-test-results/`: Directory with raw result CSVs and summary JSON from each load test run.
- `LOAD_TEST_REPORT.md`: Summarized load test report with pass/fail against thresholds.

### Phase 4 outputs
- `REGRESSION_REPORT.md`: Before/after comparison table with regression flags. Includes statistical confidence note (sample size, variance).
- `REGRESSION_SUMMARY.json`: Machine-readable diff of all metrics for CI gate consumption.

### Phase 5 outputs
- `OPTIMIZATION_RECOMMENDATIONS.md`: Prioritized list of optimization actions, each with: bottleneck evidence, recommended fix, estimated impact tier (High/Medium/Low), implementation complexity (Easy/Medium/Hard), and validation method.
- Updated `PERF_LOG.md`: Running log of all performance measurements appended with the new run.

---

## Required tests

Before this skill is considered complete for a project, the following tests must pass:

### Baseline capture tests
- [ ] `test/perf/baseline-capture.test.js`: Verifies that baseline capture runs against target endpoints and produces valid `PERF_BASELINE.json` with all required metric fields.
- [ ] `test/perf/baseline-schema.test.js`: Validates `PERF_BASELINE.json` schema (p50, p95, p99, throughput, error_rate, timestamp, environment, version all present and typed correctly).
- [ ] `test/perf/baseline-isolation.test.js`: Verifies environment has < 5% background load before baseline capture begins (pre-flight check).

### Load test tests
- [ ] `test/perf/load-test-config-valid.test.js`: Validates generated load test config is syntactically correct and has all required stages (ramp-up, peak, ramp-down).
- [ ] `test/perf/load-test-thresholds.test.js`: Verifies that generated thresholds match the provided SLO inputs.
- [ ] `test/perf/load-test-execution.test.js`: Smoke test run (10 VUs, 30 seconds) completes without tool error.

### Regression detection tests
- [ ] `test/perf/regression-detection.test.js`: Given two baseline JSONs (before/after), correctly identifies regressions above the threshold and produces accurate `REGRESSION_REPORT.md`.
- [ ] `test/perf/regression-false-positive.test.js`: Verifies that metric changes within natural variance (< 5% difference) are NOT flagged as regressions.

### Profiling tests
- [ ] `test/perf/profiling-playbook-valid.test.js`: Verifies that the generated profiling playbook contains valid shell commands for the detected language runtime.

### Contract fixtures
All tests must pass against fixtures in `fixtures/performance/`:
- `baseline-expected.json`
- `regression-detection-expected.json`
- `load-test-config-expected.json`

---

## Required fixtures

Create and maintain the following fixtures in `fixtures/performance/`:

### `baseline-expected.json`
Complete baseline capture with realistic p50/p95/p99 numbers across multiple endpoints. Must include memory snapshot at t=0 and t=end.

### `regression-detection-expected.json`
Two baseline snapshots (before/after) with:
- One endpoint showing p95 regression (> 20% increase).
- One endpoint showing improvement.
- One endpoint within natural variance (no flag).
Expected output: regression report with correct flag count.

### `load-test-config-expected.json`
Generated k6 script config with:
- Three stages: ramp-up (0→100 VUs over 2 min), peak (100 VUs for 5 min), ramp-down (100→0 VUs over 1 min).
- Thresholds matching SLO inputs.
- Custom metrics: `http_req_duration`, `http_req_failed`.

---

## Required contract updates

When this skill modifies public inputs or outputs, update the following contracts:

- `contracts/performance/baseline-schema.contract.json`: JSON Schema for `PERF_BASELINE.json` structure. Update when new metric fields are added.
- `contracts/performance/regression-report.contract.json`: JSON Schema for `REGRESSION_SUMMARY.json`. Update when regression detection logic changes.
- `contracts/performance/load-test-config.contract.json`: JSON Schema for generated load test config. Update when new test tool templates are added.

Contract update checklist:
1. Bump the contract `version` field.
2. Update `changed_at` to current ISO timestamp.
3. Add a `changelog` entry describing the change.
4. Re-run fixture tests against updated contract.
5. Update `REGRESSION_SUMMARY.json` format if fields change.

---

## Required codebase map updates

After completing a profiling cycle, update the following codebase memory files:

### `.codebase/CURRENT_STATE.md`
- Add entry: `Performance baseline captured: [date] [version] [environment]`.
- Update architecture score if optimizations improved structural quality.

### `.codebase/MODULE_INDEX.md`
- Add entries for any new scripts added to `scripts/perf/`.
- Document new fixture files in `fixtures/performance/`.

### `observability/PERF_LOG.md`
Append new run entry in standard format (see `observability/performance-tracking.md` for format).

---

## Token saving rules

To minimize token usage when running this skill:

1. **Read only relevant files**: Do not load all source files. Identify hot paths from profiling data first, then read only those files.
2. **Summarize baselines, don't embed raw data**: When referencing baseline metrics in planning, cite p95 values only — do not paste full JSON into prompts.
3. **Reuse existing load test configs**: If a load test config exists for the endpoint, diff it against requirements rather than regenerating from scratch.
4. **Profile incrementally**: Do not re-profile functions that have not changed since the last baseline. Use the bottleneck list to scope work.
5. **Batch fixture comparisons**: Compare all endpoint regressions in a single diff pass, not one endpoint at a time.
6. **Skip phase 2 for green baselines**: If all metrics pass SLO targets in phase 1, skip profiling (phase 2) and go straight to phase 5 optimization recommendations (which may be "no action needed").
7. **Cache authentication tokens**: Reuse the same auth token across all load test stages rather than re-authenticating per request.
8. **Compress profile output**: Store only flame graph SVGs and summary CSVs, not raw `.cpuprofile` binary files, in the repository.

---

## Acceptance criteria

A performance profiling cycle is COMPLETE and ACCEPTED when ALL of the following are true:

### Baseline
- [ ] `PERF_BASELINE.json` exists with non-zero values for all required metric fields.
- [ ] Baseline was captured in an isolated environment with background load < 5%.
- [ ] At least 3 measurement runs were averaged to reduce variance.
- [ ] Environment version (commit SHA or image tag) is recorded in the baseline.

### Load test
- [ ] Load test ran for at least 5 minutes at peak concurrency.
- [ ] All stages (ramp-up, peak, ramp-down) completed without tool errors.
- [ ] Results are stored in `load-test-results/` with timestamp.

### Regression detection
- [ ] `REGRESSION_REPORT.md` correctly identifies all regressions above threshold.
- [ ] No false positives (changes within 5% variance are not flagged).
- [ ] Report is machine-readable via `REGRESSION_SUMMARY.json`.

### Profiling (if triggered)
- [ ] At least one bottleneck is identified with function-level evidence (not just "the service is slow").
- [ ] Each bottleneck has a proposed fix in `OPTIMIZATION_RECOMMENDATIONS.md`.

### Optimization (if implemented)
- [ ] A new baseline was captured after optimization.
- [ ] The after-baseline shows measurable improvement vs the before-baseline.
- [ ] The improvement is documented in `PERF_LOG.md`.

### CI gate
- [ ] `REGRESSION_SUMMARY.json` is machine-readable and integrated into the CI pipeline.
- [ ] Builds fail automatically when p95 regression > threshold.

---

## Common mistakes

### Mistake 1: Profiling in production
**Problem**: Running CPU profiling or heap snapshots in production introduces latency and risk.
**Fix**: Always profile in an isolated staging environment that mirrors production configuration.

### Mistake 2: Single-run baselines
**Problem**: A single measurement run captures noise, not signal. Network jitter, GC pauses, and JIT warm-up skew results.
**Fix**: Run at least 3 baseline passes and average results. Discard the first run (warm-up). Use p95/p99, not mean.

### Mistake 3: Profiling the wrong thing
**Problem**: Profiling the entire application when only one endpoint is slow wastes time and produces noisy flame graphs.
**Fix**: Use the baseline to identify the slowest endpoints first (sort by p95 descending), then profile only those hot paths.

### Mistake 4: Load testing with unrealistic traffic patterns
**Problem**: Sending 100% of traffic to one endpoint when production is a mix of 30 endpoints produces misleading results.
**Fix**: Model the load test scenario from production access logs. Use realistic request distribution (Pareto principle: 20% of endpoints often account for 80% of traffic).

### Mistake 5: Ignoring memory leak signals in short tests
**Problem**: Running load tests for < 2 minutes misses memory leaks that only manifest over time (accumulating closures, growing caches).
**Fix**: Include a "soak test" stage of at least 10 minutes with steady load to capture memory growth rate.

### Mistake 6: Conflating p95 improvement with mean improvement
**Problem**: Reporting "average latency improved by 30%" while p95 (the SLA boundary) barely moved or got worse.
**Fix**: Always report and compare p50, p95, and p99 separately. Optimize for the tail (p95/p99), not the mean.

### Mistake 7: Not recording environment conditions in baseline
**Problem**: A baseline captured with 50 MB cache warm gives very different numbers than one captured cold. Can't compare across sessions without context.
**Fix**: Record CPU/memory resource levels, cache state, database row count, and any background jobs running at baseline capture time.

### Mistake 8: Missing ramp-up in load tests
**Problem**: Sending peak traffic instantly (cold start) causes artificial spikes that don't reflect production behavior.
**Fix**: Always include a ramp-up stage (e.g., 0 → peak VUs over 2 minutes) to simulate realistic connection pool warm-up.

### Mistake 9: Treating any regression as a blocker without context
**Problem**: A p95 regression of 2 ms on an endpoint with a 500 ms SLA target is noise, not a regression.
**Fix**: Define regression thresholds as percentages relative to the SLA budget. A 20% increase on a 10 ms target is significant; a 1% increase on a 500 ms target is not.

### Mistake 10: Skipping the after-baseline
**Problem**: Implementing optimizations without re-measuring leaves no evidence the optimization worked.
**Fix**: Always capture a new baseline after optimization. Update `PERF_LOG.md` with before/after values. Never claim performance improved without measurement.

---

## Recovery workflow

Use this workflow when performance profiling encounters errors or produces unexpected results:

### Recovery 1: Load test tool fails to start
```
Symptom: k6/Artillery/Locust exits immediately with error.
Step 1: Check tool is installed at correct version (k6 >= 0.45, Artillery >= 2.0).
Step 2: Validate config syntax (k6: k6 run --dry-run config.js; Artillery: artillery validate config.yml).
Step 3: Test connectivity to target host with curl before running load test.
Step 4: Check for firewall rules blocking the test runner's outbound connections.
Step 5: Reduce concurrency to 1 VU and retry to isolate whether issue is concurrency or connectivity.
```

### Recovery 2: Baseline metrics are wildly variable (high variance)
```
Symptom: p95 varies by > 50% across runs (e.g., 100 ms in run 1, 300 ms in run 2).
Step 1: Check for background jobs running on the test environment (cron jobs, backups, deployments).
Step 2: Check database connection pool exhaustion (look for connection wait time in DB metrics).
Step 3: Increase warm-up period (run 5 min of steady traffic before capturing baseline).
Step 4: Check if JVM/Node.js JIT is still warming up (first 60 seconds of traffic is noisiest).
Step 5: If variance persists, capture median of 5 runs instead of 3. Document the high variance in the baseline.
```

### Recovery 3: Regression detected but no code changes were made
```
Symptom: After baseline shows regression vs before baseline, but the diff shows no relevant code changes.
Step 1: Compare environment conditions: CPU allocation, memory, database size, cache state between runs.
Step 2: Check if a dependency was upgraded between runs (package-lock.json or go.sum diff).
Step 3: Check database table growth (more rows = slower full scans; verify EXPLAIN ANALYZE results).
Step 4: Check if infrastructure auto-scaling reduced instance count (same RPS on fewer resources = regression).
Step 5: Re-run both baselines in identical conditions on the same day to confirm regression is real.
```

### Recovery 4: Profiling tool does not produce useful output
```
Symptom: Flame graph is flat (no clear hot path), heap snapshot shows no obvious leak.
Step 1: Verify the profiler is attached to the correct process PID (not a child/worker process).
Step 2: For Node.js cluster mode: attach profiler to worker processes, not the master.
Step 3: Increase profiling duration (minimum 60 seconds under load for meaningful CPU profile).
Step 4: Check if the bottleneck is I/O-bound (not CPU-bound): CPU profile will show idle time. Switch to async call tracing.
Step 5: For memory leaks: take heap snapshots at t=0, t=5min, t=10min and compare object counts, not just total size.
```

### Recovery 5: Load test results do not match production incident
```
Symptom: Load test shows p95 = 50 ms but production incident showed p95 = 2000 ms.
Step 1: Compare concurrency: production may have had 10x more concurrent users than the test.
Step 2: Compare payload size: test may be using small payloads while production had large uploads/responses.
Step 3: Check for database connection pool limits (not hit in test but hit in production).
Step 4: Check for third-party API calls that are mocked in test but real in production (external payment APIs, etc.).
Step 5: Replay production traffic logs (not synthetic load) using a tool like GoReplay or Shadowtraffic.
```

### Recovery 6: Optimization made things worse
```
Symptom: After-baseline shows p95 regression compared to before-baseline.
Step 1: Revert the optimization immediately (git revert).
Step 2: Re-run baseline to confirm revert restored original performance.
Step 3: Analyze the optimization failure: cache invalidation bug? Race condition? Increased serialization overhead?
Step 4: Profile the regressed version specifically to find the new bottleneck introduced.
Step 5: Redesign the optimization addressing the root cause. Add a unit test for the scenario that failed.
```

---

## Workflow Detail: Phase-by-Phase Execution

### Phase 1: Performance Baseline Capture

**Goal**: Establish a quantified, reproducible performance baseline before any optimization work.

**Step 1.1 — Environment validation**
```bash
# Check environment isolation
curl -s http://target-host/health | jq .
# Verify background CPU < 5%
top -bn1 | grep "Cpu(s)"
# Check memory free
free -m
```

**Step 1.2 — Warm-up run (discard results)**
Run 2 minutes of moderate traffic (30% of peak concurrency) to warm up:
- JVM/V8 JIT compiler caches
- Database connection pools
- OS-level TCP connection reuse
- CDN/cache layer

**Step 1.3 — Measurement runs (3× minimum)**

For each run, capture:

| Metric | Tool | Sample command |
|--------|------|----------------|
| p50 latency | k6 / wrk | `k6 run --vus 50 --duration 5m script.js` |
| p95 latency | k6 / wrk | Included in k6 output (`http_req_duration{p:95}`) |
| p99 latency | k6 / wrk | Included in k6 output (`http_req_duration{p:99}`) |
| Throughput (req/s) | k6 / wrk | `http_reqs` counter ÷ duration |
| Error rate | k6 | `http_req_failed` rate |
| Memory (heap) | process metrics | Prometheus `process_resident_memory_bytes` |
| CPU % | process metrics | Prometheus `process_cpu_seconds_total` |
| DB query time | pg_stat_statements | `total_time / calls` |

**Step 1.4 — Aggregate and store**

Average the 3 runs (discard outliers > 2σ from mean):
```json
{
  "version": "1.4.2",
  "commit": "abc1234",
  "environment": "staging-isolated",
  "captured_at": "2026-05-31T10:00:00Z",
  "conditions": {
    "background_cpu_pct": 2.1,
    "available_memory_mb": 3840,
    "db_row_count": 150000,
    "cache_state": "warm"
  },
  "endpoints": {
    "GET /api/users": {
      "p50_ms": 45,
      "p95_ms": 180,
      "p99_ms": 420,
      "throughput_rps": 312,
      "error_rate_pct": 0.02,
      "memory_start_mb": 256,
      "memory_end_mb": 261
    }
  }
}
```

### Phase 2: Profiling Playbook Generation

**Goal**: Identify the exact code-level bottlenecks causing elevated latency or memory growth.

**Decision tree: which profiling type to use**

```
Is p95 > SLA target?
  YES → Is CPU consistently > 70%?
    YES → CPU profiling (flame graph)
    NO  → Is memory growing over time?
      YES → Memory profiling (heap snapshot)
      NO  → Is DB query time > 50% of response time?
        YES → Query analysis (EXPLAIN ANALYZE, slow query log)
        NO  → Network I/O analysis (connection pooling, DNS, TLS handshake)
  NO  → No profiling needed. Proceed to Phase 5 (recommendations: maintain current state).
```

See `playbooks/profiling-playbook.md` for tool-specific instructions.

### Phase 3: Load Test Config Generation

**Goal**: Generate a reproducible, parameterized load test that can be run in CI and by any team member.

The generated config must define:
- **Smoke test** (1 VU, 1 min): Verify endpoint responds without errors.
- **Load test** (target concurrency, 10 min): Verify system handles expected traffic.
- **Stress test** (2× target concurrency, 5 min): Find the breaking point.
- **Soak test** (target concurrency, 30 min): Detect memory leaks and connection pool exhaustion.

See `playbooks/load-testing-orchestration.md` for complete configs.

### Phase 4: Before/After Comparison + Regression Detection

**Goal**: Quantify the impact of changes (optimizations, refactors, dependency upgrades) relative to the captured baseline.

**Algorithm:**
```
For each endpoint E:
  For each metric M in {p50, p95, p99, throughput, error_rate}:
    delta_pct = (after[E][M] - before[E][M]) / before[E][M] × 100
    
    If M is latency:
      If delta_pct > regression_threshold_pct: REGRESSION
      If delta_pct < -improvement_threshold_pct: IMPROVEMENT
      Else: STABLE
    
    If M is throughput:
      If delta_pct < -regression_threshold_pct: REGRESSION (throughput decreased)
      If delta_pct > improvement_threshold_pct: IMPROVEMENT
      Else: STABLE
    
    If M is error_rate:
      If after[E][M] > error_rate_slo: REGRESSION
      Else: STABLE
```

Default thresholds:
- Latency regression: p95 increased > 20%.
- Throughput regression: throughput decreased > 15%.
- Error rate regression: error rate > 0.1%.
- Improvement threshold: > 10% improvement (must be > natural variance of 5%).

### Phase 5: Optimization Recommendation Generation

**Goal**: Produce a prioritized, actionable list of optimizations ranked by expected impact vs implementation effort.

**Recommendation template:**

```markdown
### [BOTTLENECK-001] Slow database query on /api/users (N+1 pattern)

**Evidence**: EXPLAIN ANALYZE shows sequential scan on `users` table (150,000 rows).
DB query time = 145 ms (81% of total response time).
Identified via: slow query log + pg_stat_statements.

**Recommended fix**: Add composite index on (tenant_id, status, created_at).
Fix N+1 ORM query pattern: use eager loading (`include: ['profile']`).

**Estimated impact**: HIGH — Expected p95 improvement: 100–140 ms (55–78% reduction).

**Implementation complexity**: EASY — Index creation: 1 migration file.
ORM fix: 3 lines of code change.

**Validation method**: Re-run baseline after migration. Confirm p95 ≤ 80 ms.
Run regression-detection phase against new baseline.

**Risk**: Index creation on large table requires `CREATE INDEX CONCURRENTLY` to avoid table lock.
```
