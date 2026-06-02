# Canary Deployment Orchestration Playbook

**Purpose**: Step-by-step canary deployment workflow for high-risk releases  
**Duration**: 8-12 hours (4 stages, 1-4 hours each)  
**Success Criteria**: Error rate <1%, latency within baseline, no critical issues  

---

## Canary Deployment: Real-World Example

**Release**: v3.0.0 (breaking changes, risk score 7/10)  
**Deployment Date**: May 31, 2026  
**Team Lead**: John Doe  
**Approval**: Tech Lead + Product Lead (both approved May 30)  

---

## Pre-Deployment Checklist (30 min)

**Before 09:30 UTC (30 min before Stage 1)**

- ✅ Team assembled and on-call: Engineering, Ops, Product
- ✅ Deployment runbooks reviewed by ops team
- ✅ Monitoring dashboards created and live
- ✅ Alerts configured (error rate >5%, latency spike >2s)
- ✅ Rollback procedures rehearsed
- ✅ Consumer notification sent (email + Slack + status page)
- ✅ Database migrations tested and ready
- ✅ Previous version available for instant rollback
- ✅ Load balancer configured for canary (1% traffic ability)
- ✅ All approvals documented

**Go/No-Go Decision**: 09:30 UTC
- Team lead: "All checks pass, proceeding to Stage 1"
- Timestamp: 2026-05-31 09:30:00 UTC
- Team confirms: Ready to deploy

---

## Stage 1: 1% Traffic Canary (10:00-11:00 UTC)

**Objective**: Validate v3.0.0 works on minimal traffic before larger rollout

### **Deployment (10:00 UTC - 5 min)**

```bash
# 1. Deploy v3.0.0 to isolated cluster
kubectl apply -f deployment-v3.0.0.yaml

# 2. Wait for pods to be Ready
kubectl get pods -w
# All pods: Running (Ready 1/1)

# 3. Configure load balancer to route 1% traffic to v3.0.0
# 99% → v2.5.3 (stable)
#  1% → v3.0.0 (canary)

aws elbv2 modify-rule --rule-arn <arn> \
  --conditions Field=path-pattern,Values="/api/*" \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=1},{TargetGroupArn=<v2-tg>,Weight=99}]"

echo "✅ Deployment complete: 1% traffic to v3.0.0"
```

### **Monitoring (10:05-11:00 UTC - 55 min)**

**Metrics to watch every 5 minutes**:

| Metric | Target | Alert Threshold | Status |
|--------|--------|-----------------|--------|
| Error Rate (5xx) | <0.1% | >1% | 🟢 0.08% |
| Response Time P95 | <200ms | >300ms | 🟢 185ms |
| Response Time P99 | <500ms | >750ms | 🟢 420ms |
| Database Connections | Stable | Growing | 🟢 Stable |
| CPU Usage | <70% | >80% | 🟢 45% |
| Memory Usage | <80% | >85% | 🟢 62% |
| Request Count | Normal | 2x spike | 🟢 Normal |
| Timeout Errors | 0 | >0 | 🟢 0 |

**Monitoring dashboard**:
```
Time: 10:05 UTC → Error rate: 0.08% ✓ | Latency P95: 185ms ✓
Time: 10:10 UTC → Error rate: 0.09% ✓ | Latency P95: 189ms ✓
Time: 10:15 UTC → Error rate: 0.07% ✓ | Latency P95: 182ms ✓
...
Time: 10:55 UTC → Error rate: 0.08% ✓ | Latency P95: 186ms ✓

✅ Stage 1 monitoring complete: All metrics green
```

**Sample errors seen** (all acceptable):
```
- 3 timeouts (normal, <0.01%)
- 2 authentication errors (client misconfigured, expected)
- 1 database connection pool exhaustion (expected on first requests)

ANALYSIS: All errors are non-critical. No signs of API format issues.
```

### **Consumer Feedback (10:00-11:00 UTC)**

**Slack #api-v3-migration channel**:
```
10:15 - MobileApp team: "v3.0.0 working fine, receiving 1% of traffic"
10:20 - WebApp team: "No errors seen in our logs, data parsing works"
10:45 - Dashboard team: "Response format change working as expected"

✅ No consumer complaints reported during Stage 1
```

### **Stage 1 Decision (11:00 UTC)**

**Go/No-Go Decision Meeting**:
- **Metrics**: ✅ All green (error rate 0.08%, latency normal)
- **Errors**: ✅ No critical issues
- **Consumers**: ✅ No complaints
- **Team consensus**: ✅ Ready to proceed

**Decision**: 🟢 **GO to Stage 2**

```
Stage 1 Summary:
  Duration: 1 hour
  Traffic: 1% (≈ 100-200 requests/sec)
  Error rate: 0.08% (PASS - target <1%)
  Latency: Normal, within baseline
  Issues: None
  
Decision: Proceed to Stage 2 (10% traffic)
Time: 11:00 UTC
```

---

## Stage 2: 10% Traffic Canary (11:15-13:15 UTC)

**Objective**: Validate v3.0.0 handles 10x traffic load

### **Deployment (11:15 UTC - 5 min)**

```bash
# Update load balancer weights: 1% → 10%
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=10},{TargetGroupArn=<v2-tg>,Weight=90}]"

echo "✅ Stage 2: 10% traffic to v3.0.0"
```

### **Monitoring (11:20-13:15 UTC - 2 hours)**

**Key metrics every 10 minutes**:

```
Time: 11:20 UTC
  Error rate: 0.09% ✓ (target <1%)
  P95 latency: 192ms ✓ (target <200ms)
  P99 latency: 445ms ✓ (target <500ms)
  Traffic: 1000-1500 req/sec ✓

Time: 11:30 UTC
  Error rate: 0.10% ✓
  P95 latency: 198ms ✓
  P99 latency: 468ms ✓
  Traffic: 1200-1600 req/sec ✓

Time: 12:00 UTC (30 min checkpoint)
  Error rate: 0.08% ✓
  P95 latency: 190ms ✓
  P99 latency: 430ms ✓
  Anomaly: None detected
  
Time: 12:30 UTC (60 min checkpoint)
  Error rate: 0.09% ✓
  P95 latency: 195ms ✓
  P99 latency: 455ms ✓
  CPU usage: 55% ✓ (room for growth)
  
Time: 13:00 UTC (100 min checkpoint)
  Error rate: 0.07% ✓
  P95 latency: 188ms ✓ (trending down - good!)
  P99 latency: 420ms ✓
  Request rate: 1500 req/sec (stable)

Time: 13:15 UTC (Stage 2 end)
  Error rate: 0.08% ✓
  P95 latency: 191ms ✓
  Database connections: Stable (average 45)
  Cache hit rate: 92% ✓
  
✅ Stage 2 complete: All metrics excellent
```

**Issues discovered** (and handled):
```
Time: 11:45 UTC
  Alert: Cache connection pool exhaustion (brief, <1 min)
  Root cause: New connection pooling in v3.0 didn't ramp gradually
  Action: Increase cache connection pool from 50 → 100
  Result: Issue resolved, no downstream impact

Conclusion: Minor configuration tuning, not a blocker
```

### **Stage 2 Decision (13:15 UTC)**

**Decision Criteria Met**:
- ✅ Error rate <1% (actual: 0.08%)
- ✅ Latency within baseline (actual: +5%)
- ✅ No critical issues (1 minor config tuning)
- ✅ 10x traffic handled successfully
- ✅ Consumer feedback positive

**Decision**: 🟢 **GO to Stage 3**

```
Stage 2 Summary:
  Duration: 2 hours
  Traffic: 10% (≈ 1000-1600 requests/sec)
  Error rate: 0.08% (PASS - target <1%)
  Latency: Normal, within baseline
  Issues: 1 minor (config tuning, resolved)
  
Decision: Proceed to Stage 3 (50% traffic)
Time: 13:15 UTC
```

---

## Stage 3: 50% Traffic Canary (13:30-17:30 UTC)

**Objective**: Validate v3.0.0 handles majority traffic load

### **Deployment (13:30 UTC - 5 min)**

```bash
# Update load balancer: 10% → 50%
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=50},{TargetGroupArn=<v2-tg>,Weight=50}]"

echo "✅ Stage 3: 50% traffic split between v3.0.0 and v2.5.3"
```

### **Monitoring (13:35-17:30 UTC - 4 hours)**

**Critical tracking - This is "real-world" load test**:

```
Time: 13:40 UTC (5 min checkpoint)
  Error rate: 0.09% ✓
  P95 latency: 194ms ✓
  Traffic split: 50/50 v3.0.0 / v2.5.3
  
Time: 14:00 UTC (30 min checkpoint)
  Error rate: 0.08% ✓
  P95 latency: 191ms ✓
  Memory usage v3: 68% (growing, but acceptable)
  Database load: Balanced between versions
  
Time: 14:30 UTC (60 min checkpoint)
  Error rate: 0.10% ✓
  P95 latency: 198ms ✓
  Peak traffic: 3000 req/sec (50% to v3.0.0)
  v3.0.0 handling: Excellent
  
Time: 15:00 UTC (90 min checkpoint) - LUNCH RUSH
  Error rate: 0.12% ⚠️ (spike during peak traffic)
  P95 latency: 215ms ⚠️ (spike during peak traffic)
  Traffic surge: 4500 req/sec (peak)
  
  Investigation:
    - v3.0.0 handling peak load: Yes ✓
    - Spike is traffic-related, not version-related
    - v2.5.3 shows same spike (confirms: normal behavior)
    - Autoscaling: Adding 2 more pods
    
Time: 15:10 UTC
  Error rate: 0.09% ✓ (back to normal)
  P95 latency: 196ms ✓ (back to normal)
  Pods: 5 → 7 (autoscale up completed)
  
Time: 15:30 UTC (120 min checkpoint)
  Error rate: 0.08% ✓
  P95 latency: 190ms ✓
  Traffic: Back to 3000 req/sec (post-lunch rush)
  
Time: 16:00 UTC (150 min checkpoint)
  Error rate: 0.08% ✓
  P95 latency: 189ms ✓
  Stability: Excellent for past hour
  
Time: 16:30 UTC (180 min checkpoint)
  Error rate: 0.07% ✓ (trending down)
  P95 latency: 188ms ✓
  Database query times: Stable
  Cache hit rate: 93% ✓
  
Time: 17:15 UTC (225 min checkpoint)
  Error rate: 0.08% ✓
  P95 latency: 190ms ✓
  All systems stable
  
Time: 17:30 UTC (Stage 3 end)
  Error rate: 0.08% ✓
  P95 latency: 191ms ✓
  Total Stage 3 requests: 720,000+ handled by v3.0.0
  Success rate: 99.92%
  
✅ Stage 3 complete: Handled peak traffic successfully
```

**Stage 3 Issues** (none critical):
```
- Minor spike during lunch rush (expected, handled by autoscaling)
- No v3.0.0 specific issues
- Version performing identically to v2.5.3
```

### **Stage 3 Decision (17:30 UTC)**

**Decision Criteria Met**:
- ✅ Error rate maintained <0.1% even during peak (4500 req/sec)
- ✅ Handled 720,000+ requests successfully
- ✅ No version-specific issues
- ✅ Autoscaling working correctly
- ✅ 4-hour stability confirmed

**Decision**: 🟢 **GO to Stage 4 (Full Rollout)**

```
Stage 3 Summary:
  Duration: 4 hours
  Traffic: 50% (≈ 3000 req/sec average, 4500 peak)
  Total requests: 720,000+ handled successfully
  Error rate: 0.08% (PASS - target <1%)
  Peak traffic handled: ✓ Yes
  Issues: None critical
  
Decision: Proceed to Stage 4 (100% traffic - FULL ROLLOUT)
Time: 17:30 UTC
```

---

## Stage 4: 100% Traffic - Full Rollout (18:00-∞)

**Objective**: Complete production rollout, full traffic to v3.0.0

### **Deployment (18:00 UTC - 5 min)**

```bash
# Route 100% traffic to v3.0.0
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=100}]"

echo "✅ Full rollout: 100% traffic to v3.0.0"
echo "✅ v2.5.3 kept running for 24 hours as instant rollback"
```

### **Continuous Monitoring (18:00 UTC → 24 hours)**

**First hour (18:00-19:00 UTC - Critical)**:

```
Time: 18:00 UTC (FULL ROLLOUT)
  Traffic: 100% → v3.0.0
  v2.5.3 kept running (instant rollback available)
  Error rate: 0.08% ✓
  P95 latency: 192ms ✓
  
Time: 18:05 UTC
  Status: Excellent, no issues detected
  Consumer feedback: Positive
  
Time: 18:30 UTC (30 min checkpoint)
  Error rate: 0.08% ✓ (stable)
  P95 latency: 190ms ✓
  Requests: 6000+ req/sec (full production load)
  
Time: 19:00 UTC (60 min checkpoint)
  Error rate: 0.08% ✓ (1 hour at full load)
  All metrics: Excellent
  v2.5.3: Kept running, ready for instant rollback
  
✅ 1 hour at full production load: SUCCESSFUL
```

**24-hour monitoring window (18:00 UTC Day 1 → 18:00 UTC Day 2)**:

- On-call team monitors for 24 hours
- Alerts: Error rate >1%, latency >500ms P95
- Rollback capability: Available for 24 hours
- Post-rollout: v2.5.3 stopped at 18:00 UTC (Day 2)

### **Success Criteria - All Met**

- ✅ 100% traffic routed to v3.0.0
- ✅ Error rate maintained <0.1% at full load
- ✅ Latency within baseline (190ms)
- ✅ No critical issues
- ✅ Consumer feedback positive
- ✅ 24-hour stability confirmed
- ✅ Rollback ready (24-hour window)

---

## Post-Deployment Sign-Off (24 hours later)

```
DEPLOYMENT: v3.0.0 Canary → Full Rollout
DATE: 2026-05-31 18:00 UTC (started) → 2026-06-01 18:00 UTC (complete)
ORCHESTRATED BY: John Doe (Tech Lead)

STAGE RESULTS:
  Stage 1 (1% traffic, 1 hour): ✅ PASS
  Stage 2 (10% traffic, 2 hours): ✅ PASS
  Stage 3 (50% traffic, 4 hours): ✅ PASS
  Stage 4 (100% traffic, 24+ hours): ✅ PASS

METRICS:
  Error rate: 0.08% (target <1%) ✅
  P95 latency: 191ms (target <200ms) ✅
  Peak traffic handled: 4500+ req/sec ✅
  Total requests: 2M+ processed successfully ✅
  Uptime: 99.92% ✅

ISSUES: None critical
ROLLBACK: Not required, v2.5.3 deprecated

STATUS: ✅ v3.0.0 FULLY DEPLOYED AND STABLE

Next step: Stop v2.5.3 at 2026-06-01 18:00 UTC (24 hours post-rollout)
Follow-up: Monitor metrics for 7 days for stability
```

---

## Rollback Scenario (If Issue Found)

**Example**: Error rate spike to 5% at 12:00 UTC during Stage 2

```
Time: 12:00 UTC
  Alert: Error rate >5% triggered
  Decision: ROLLBACK to v2.5.3
  
Rollback execution (< 5 minutes):
  1. Load balancer: Revert 100% traffic back to v2.5.3
  2. Verify: Error rate drops to <0.1%
  3. Verify: All requests processing normally
  4. Notify: Stakeholders of rollback
  5. Investigation: Root cause analysis
  6. Fix: Implement correction
  7. Retry: After fix verified in dev/staging
  
Status: v2.5.3 stable, v3.0.0 investigation ongoing
Timeline: Investigation continues, retry after root cause fixed
```

---

## Success Metrics Achieved

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Error rate | <1% | 0.08% | ✅ |
| Latency P95 | <200ms | 191ms | ✅ |
| Peak traffic | 4000+ req/sec | 4500 req/sec | ✅ |
| Deployment time | <10 hours | 8.5 hours | ✅ |
| Consumer impact | 0% downtime | 0% downtime | ✅ |
| Rollback capability | <5 min | <5 min | ✅ |

**Result**: 🎉 **v3.0.0 SUCCESSFULLY DEPLOYED**
