# Deployment Strategy Template

**Release**: v[X.Y.Z]  
**Risk Score**: [N/10]  
**Strategy Selected**: [Blue-Green|Canary|Rolling]  
**Approval Date**: [YYYY-MM-DD]  
**Deployment Window**: [YYYY-MM-DD HH:MM-HH:MM UTC]

---

## Strategy Selection Criteria

**Risk Score 1-2 (LOW)** → Rolling Deployment  
**Risk Score 3-5 (MEDIUM)** → Blue-Green Deployment  
**Risk Score 6-8 (HIGH)** → Canary Deployment  
**Risk Score 9-10 (CRITICAL)** → Canary + Manual approval at each stage

---

## Blue-Green Deployment Strategy

**When to use**: Medium-risk releases (risk 3-5)

### Overview

Two identical production environments:
- **Blue** = Current production (v2.5.3)
- **Green** = New version (v3.0.0)

Traffic is routed to one at a time. If issues occur, switch back instantly.

### Timeline

```
Stage 1: Deploy to Green (5-10 min)
  - Deploy v3.0.0 to green environment
  - Run health checks
  - Verify all systems ready
  - Keep blue (v2.5.3) running

Stage 2: Validate Green (5-10 min)
  - Run smoke tests against green
  - Verify response format correct (if breaking changes)
  - Validate database migrations applied
  - Confirm green ready for traffic

Stage 3: Switch Traffic (1-2 min)
  - Update load balancer: 100% traffic → green (v3.0.0)
  - Blue (v2.5.3) stops receiving traffic but stays running

Stage 4: Monitor Green (1-24 hours)
  - Monitor error rate, latency, resources
  - If issues found: Instant rollback (switch back to blue)
  - If stable after 1-24 hours: Decommission blue, keep only green

Rollback (if needed): <5 seconds
  - Switch traffic: green → blue (instant)
  - No data loss (traffic never split)
```

### Deployment Commands

```bash
# 1. Deploy to green environment
kubectl apply -f deployment-v3.0.0-green.yaml -n production

# 2. Wait for green ready
kubectl rollout status deployment/myapp-green --timeout=10m

# 3. Validate green environment
curl -f https://green-staging.myapp.example.com/health
curl -f https://green-staging.myapp.example.com/api/users/1

# 4. Switch traffic: Load Balancer route 100% to green
aws elbv2 modify-rule --rule-arn arn:aws:elasticloadbalancing:... \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=arn:...green:...,Weight=100}]"

# 5. Monitor for 1-24 hours
watch -n 10 'kubectl top pods -n production'

# 6. If rollback needed: Switch back to blue (instant)
aws elbv2 modify-rule --rule-arn arn:aws:elasticloadbalancing:... \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=arn:...blue:...,Weight=100}]"
```

### Pros & Cons

**Pros**:
- ✅ Zero-downtime deployment
- ✅ Instant rollback (< 5 seconds)
- ✅ Can run parallel tests
- ✅ No traffic splitting complexity

**Cons**:
- ❌ Double infrastructure cost (need 2x environments)
- ❌ Data consistency challenges (2 databases)
- ❌ Not suitable for frequent deployments

---

## Canary Deployment Strategy

**When to use**: High-risk releases (risk 6-8+)

### Overview

Gradually roll out new version to small % of traffic, increasing as confidence grows.

- Stage 1: 1% traffic (1 hour monitoring)
- Stage 2: 10% traffic (2 hours monitoring)
- Stage 3: 50% traffic (4 hours monitoring)
- Stage 4: 100% traffic (24+ hours monitoring)

If issues at any stage: Rollback all traffic to previous version.

### Timeline

```
Stage 1: 1% Traffic Canary (1 hour)
  - Deploy v3.0.0 alongside v2.5.3
  - Route 1% of traffic to v3.0.0
  - Monitor error rate, latency, resource usage
  - Go/No-go decision after 1 hour

Stage 2: 10% Traffic Canary (2 hours)
  - Increase to 10% traffic if Stage 1 passed
  - Monitor for 2 hours (covers lunch rush if applicable)
  - Go/No-go decision after 2 hours

Stage 3: 50% Traffic Canary (4 hours)
  - Increase to 50% traffic if Stage 2 passed
  - Monitor for 4 hours (covers peak traffic periods)
  - Go/No-go decision after 4 hours

Stage 4: 100% Traffic - Full Rollout (24+ hours)
  - Route 100% traffic to v3.0.0
  - Keep v2.5.3 running for 24 hours (instant rollback)
  - Continuous monitoring for 24 hours
  - After 24 hours stable: Decommission v2.5.3

Total deployment: 8+ hours (Stage 1→4)
Rollback window: 24 hours post-complete deployment
```

### Deployment Commands

```bash
# Stage 1: Deploy and route 1% traffic
kubectl apply -f deployment-v3.0.0.yaml -n production
kubectl get pods -w  # Verify ready

# Route 1% traffic to v3.0.0, 99% to v2.5.3
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=1},{TargetGroupArn=<v2-tg>,Weight=99}]"

# Monitor Stage 1 (1 hour)
# ... check error rate, latency, etc.

# Stage 2: Increase to 10%
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=10},{TargetGroupArn=<v2-tg>,Weight=90}]"

# Stage 3: Increase to 50%
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=50},{TargetGroupArn=<v2-tg>,Weight=50}]"

# Stage 4: 100% traffic (full rollout)
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=100}]"

# Rollback (if needed at any stage): Instant switch to previous version
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v2-tg>,Weight=100}]"
```

### Go/No-Go Criteria (At Each Stage)

**GO** if:
- ✅ Error rate <1% (target <0.1%)
- ✅ Latency within baseline (±10%)
- ✅ No critical issues
- ✅ Consumer feedback positive
- ✅ Team lead approves

**NO-GO** (Pause) if:
- ⚠️ Error rate 1-5% (investigate, pause 30 min)
- ⚠️ Latency spike >50% (investigate, may indicate load issue)
- ⚠️ Resource exhaustion (tune, retry)

**ROLLBACK** if:
- ❌ Error rate >5%
- ❌ Complete service unavailability
- ❌ Data corruption
- ❌ Security vulnerability

### Pros & Cons

**Pros**:
- ✅ Low risk (catch issues early)
- ✅ Minimal blast radius at each stage
- ✅ Customer feedback integrated
- ✅ Gradual confidence increase

**Cons**:
- ❌ Slow deployment (8+ hours)
- ❌ Requires careful monitoring
- ❌ Split traffic may hide issues
- ❌ Complex state management (need both versions running)

---

## Rolling Deployment Strategy

**When to use**: Low-risk releases (risk 1-2)

### Overview

Replace instances one-by-one, keeping service available throughout.

- Wave 1: Update 25% of instances (1 hour)
- Wave 2: Update 50% of instances (1 hour)
- Wave 3: Update 75% of instances (1 hour)
- Wave 4: Update 100% of instances (1 hour)

If issue detected: Rollback stops, can reverse changes.

### Timeline

```
Wave 1: 25% Instances (1 hour)
  - Cordoff 25% of instances
  - Deploy v3.0.0 to cordoned instances
  - Verify health checks pass
  - Return instances to rotation
  - Monitor error rate (should be ~0%)

Wave 2: 50% Instances (1 hour)
  - Repeat for next 25%

Wave 3: 75% Instances (1 hour)
  - Repeat for next 25%

Wave 4: 100% Instances (1 hour)
  - Deploy to final 25%
  - All instances now v3.0.0

Total deployment: 4 hours
Rollback: Can stop deployment mid-wave, rollback in progress instances
```

### Pros & Cons

**Pros**:
- ✅ Fast (4 hours vs 8+ hours)
- ✅ Zero-downtime (service always available)
- ✅ Simple implementation
- ✅ Low infrastructure cost

**Cons**:
- ❌ Higher risk (old + new running simultaneously)
- ❌ Harder to rollback (partially deployed state)
- ❌ Can't instantly revert (need to re-deploy)

---

## Monitoring Metrics for All Strategies

**Critical Metrics** (check every 5-10 minutes):

| Metric | Target | Alert |
|--------|--------|-------|
| Error Rate (5xx) | <0.1% | >1% |
| Latency P95 | <200ms | >300ms |
| Latency P99 | <500ms | >750ms |
| CPU Usage | <70% | >80% |
| Memory Usage | <80% | >85% |
| Database Connections | Stable | Growing |
| Request Timeout Rate | <0.01% | >0.05% |

---

## Rollback Procedure (Universal for All Strategies)

```bash
# Immediate: Switch traffic back to previous version
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<prev-tg>,Weight=100}]"

# Verify previous version handling traffic
curl -f http://[prod-url]/health

# Notify stakeholders
# Email: ops-team@company.com
# Slack: #incident-response
# Status page: Updated

# Start investigation
echo "Rollback complete at $(date)" >> INCIDENT.md
```

---

**DEPLOYMENT STRATEGY COMPLETE**
