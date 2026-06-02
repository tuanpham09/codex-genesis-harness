# Performance Tracking Log

This file tracks performance measurements over time. Append a new entry after every profiling cycle. Never delete old entries — they form the historical record. Archive entries older than 6 months to `observability/archive/PERF_LOG_[year].md`.

---

## PERF_LOG.md Format

Each entry must follow this exact format:

```
---
date:        2026-05-31
version:     1.4.2
commit:      abc1234def5678
environment: staging-isolated
test_type:   baseline | regression | optimization | incident
triggered_by: PR #123 | scheduled | incident INC-456 | manual
---

### Summary

[One paragraph describing what was measured, why, and the outcome]

### Metrics (averaged across N runs)

| Endpoint | p50 ms | p95 ms | p99 ms | RPS | Error % | vs previous p95 | Status |
|----------|--------|--------|--------|-----|---------|-----------------|--------|
| GET /api/users | 42 | 165 | 380 | 312 | 0.02 | -8% | ✅ |
| POST /api/orders | 89 | 240 | 510 | 156 | 0.05 | +2% | ✅ |

### Memory profile
- Heap at start: X MB
- Heap at end: X MB  
- Delta: +X MB over Y minutes (rate: Z MB/min)
- Leak assessment: NONE / SUSPECT / CONFIRMED

### Regressions detected
- [none] OR [list with PERF-ID reference]

### Optimizations implemented
- [none] OR [description with before/after]

### Next actions
- [list of follow-up items]
```

---

## Example Entry: Initial Baseline

```
---
date:        2026-05-31
version:     1.4.2
commit:      abc1234def5678
environment: staging-isolated
test_type:   baseline
triggered_by: release-1.4.2 preparation
---

### Summary

Initial baseline captured for release 1.4.2 ahead of production deployment. Five-run protocol with 
warm-up discarded. Environment was fully isolated with background CPU < 2%. All endpoints pass their 
p95 SLA targets. Memory growth was minimal (< 5 MB over 10 minutes). No regressions or anomalies 
detected. System is ready for production release.

### Metrics (averaged across 4 measurement runs)

| Endpoint | p50 ms | p95 ms | p99 ms | RPS | Error % | SLA p95 | Status |
|----------|--------|--------|--------|-----|---------|---------|--------|
| GET /api/users | 42 | 165 | 380 | 312 | 0.02 | 200 ms | ✅ |
| GET /api/users/:id | 18 | 72 | 145 | 489 | 0.01 | 200 ms | ✅ |
| POST /api/orders | 89 | 195 | 420 | 156 | 0.05 | 300 ms | ✅ |
| GET /api/products | 25 | 88 | 180 | 401 | 0.00 | 150 ms | ✅ |
| POST /auth/login | 145 | 320 | 580 | 89 | 0.10 | 500 ms | ✅ |

### Memory profile
- Heap at start: 256 MB
- Heap at end: 261 MB
- Delta: +5 MB over 10 minutes (rate: 0.5 MB/min)
- Leak assessment: NONE (well within acceptable < 5 MB/min threshold)

### Regressions detected
- none (first baseline — no previous baseline to compare)

### Optimizations implemented
- none

### Next actions
- Set this baseline as the production reference. Store at: observability/baselines/v1.4.2-production.json
- Schedule next baseline review for v1.5.0 release
```

---

## Performance Trend Tracking

Use this table to track p95 across releases at a glance:

| Date | Version | GET /api/users p95 | POST /api/orders p95 | Auth p95 | Notes |
|------|---------|--------------------|---------------------|---------|-------|
| 2026-01-15 | 1.0.0 | 450 ms | 380 ms | 520 ms | Initial release |
| 2026-02-20 | 1.1.0 | 420 ms | 350 ms | 500 ms | Minor improvements |
| 2026-03-10 | 1.2.0 | 380 ms | 310 ms | 490 ms | DB indexes added |
| 2026-04-05 | 1.3.0 | 320 ms | 280 ms | 480 ms | Query optimization |
| 2026-05-01 | 1.4.0 | 290 ms | 260 ms | 470 ms | Cache added |
| 2026-05-31 | 1.4.2 | 165 ms | 195 ms | 320 ms | N+1 fix + new indexes |

**Trend visualization (ASCII chart — p95 GET /api/users):**
```
450 ─ ●
420 ─   ●
380 ─     ●
320 ─       ●
290 ─         ●
165 ─             ●   ← Current (v1.4.2)
    ─────────────────
    1.0  1.1  1.2  1.3  1.4  1.4.2
```

---

## Regression Detection Queries

### Find all regressions in the log
```bash
grep -n "REGRESSION" observability/PERF_LOG.md
```

### Find all entries for a specific endpoint
```bash
grep -A 20 "GET /api/users" observability/PERF_LOG.md | grep "p95"
```

### Find entries where memory leak was suspected
```bash
grep -B 2 "Leak assessment: SUSPECT\|CONFIRMED" observability/PERF_LOG.md
```

### Extract p95 trend for charting (requires jq and baseline JSONs)
```bash
ls observability/baselines/*.json | sort | while read f; do
  version=$(jq -r '.version' "$f")
  p95=$(jq -r '.endpoints["GET /api/users"].p95_ms' "$f")
  echo "$version: $p95 ms"
done
```

---

## SLA Budget Tracking

Track how much of the SLA "budget" each service version consumes:

| Endpoint | SLA (p95) | Latest p95 | Budget used | Budget remaining | Risk level |
|----------|-----------|-----------|------------|-----------------|-----------|
| GET /api/users | 200 ms | 165 ms | 82.5% | 35 ms (17.5%) | 🟡 MEDIUM |
| GET /api/users/:id | 200 ms | 72 ms | 36% | 128 ms (64%) | 🟢 LOW |
| POST /api/orders | 300 ms | 195 ms | 65% | 105 ms (35%) | 🟢 LOW |
| GET /api/products | 150 ms | 88 ms | 58.7% | 62 ms (41.3%) | 🟢 LOW |
| POST /auth/login | 500 ms | 320 ms | 64% | 180 ms (36%) | 🟢 LOW |

**Risk levels:**
- 🔴 HIGH: > 90% budget used (< 10% headroom). Any regression will breach SLA.
- 🟡 MEDIUM: 75-90% budget used (10-25% headroom). Watch carefully.
- 🟢 LOW: < 75% budget used (> 25% headroom). Comfortable buffer.

---

## Incident Correlation

When a performance incident occurs, link it here for post-mortem reference:

| Incident | Date | Affected endpoints | p95 during incident | Root cause | Resolution | PERF_LOG entry |
|----------|------|-------------------|--------------------|-----------|-----------|----|
| INC-001 | 2026-03-15 | GET /api/users | 3200 ms (16× SLA) | Missing index after schema migration | Added index CONCURRENTLY | 2026-03-15 entry |
| INC-002 | 2026-04-22 | ALL endpoints | 1500 ms | Memory exhaustion (OOM) on 2 of 4 pods | Increased memory limit; fixed memory leak | 2026-04-23 entry |

### Incident-to-optimization pipeline

When an incident reveals a performance root cause:
1. Add entry to this incident correlation table.
2. Create an `OPTIMIZATION RECOMMENDATION` entry in `PERF_LOG.md`.
3. After fix is deployed, add an after-baseline entry showing recovery.
4. Close the incident with a link to the PERF_LOG entry.

---

## Observability Maturity Indicators

Track improvement over time in observability completeness:

| Capability | Current status | Target | Progress |
|-----------|---------------|--------|----------|
| Baseline automation | Manual | Automated on merge | 60% |
| Regression gating in CI | Partial (p95 only) | All metrics | 50% |
| Real-time performance dashboard | Grafana dashboard exists | Alert on breach | 70% |
| Incident → optimization pipeline | Manual | Semi-automated | 30% |
| Soak test automation | Manual | Weekly scheduled | 10% |
| Load test data realism | Synthetic | Production traffic replay | 25% |
