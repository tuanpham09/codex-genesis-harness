# Post-Deployment Verification Checklist

**Purpose**: Verify deployment success and stability post-deployment  
**Duration**: 10-15 minutes per stage  
**Risk**: Critical - must verify before next canary stage or production acceptance  

---

## Section 1: Deployment Completion Verification (5 min)

- [ ] **Deployment completed successfully**
  - All pods/containers running: `kubectl get pods` shows all Ready
  - New version deployed: Verify version in logs/status endpoint
  - Previous version stopped: Old containers terminated
  - Deployment time recorded: Under <30 min target
  - No deployment errors: Check CI/CD logs for failures

- [ ] **Database state consistent**
  - Migrations completed: No pending migrations
  - Data integrity: Sample data queries return expected values
  - Rollback point saved: Previous database state available if needed
  - No connection errors: Application connects to database successfully

- [ ] **Configuration deployed correctly**
  - Environment-specific config loaded: Correct database, API keys
  - Feature flags set correctly: New features enabled/disabled as intended
  - Secrets loaded: No "secret not found" errors in logs
  - Logging configured: Logs at appropriate level (not DEBUG in prod)

---

## Section 2: Health Check Validation (5 min)

- [ ] **Liveness checks passing**
  - Endpoint: GET /health returns 200 OK
  - Response time: <500ms
  - Response body includes version: Confirm v2.5.0 deployed
  - Check frequency: Every 10 seconds (configurable)

- [ ] **Readiness checks passing**
  - Endpoint: GET /ready returns 200 OK
  - Database connection: Verified in response
  - Cache connection: Verified (if used)
  - External service connectivity: Verified
  - All dependencies healthy

- [ ] **Service discovery updated**
  - Load balancer sees new instances: In rotation
  - DNS resolves to new IPs: No stale DNS
  - Service mesh updated: Istio/Envoy routes to new version
  - No connection refused errors: Services can reach each other

---

## Section 3: Smoke Tests & Critical Workflows (10 min)

- [ ] **Critical workflow #1: User authentication**
  - Login successful: User can authenticate
  - Session created: Token generated and valid
  - Session persists: Token valid across requests
  - Logout works: Session properly cleared

- [ ] **Critical workflow #2: API response format** (if breaking changes)
  - Response structure matches new format: { data: {...} } not { user: {...} }
  - Required fields present: All documented fields in response
  - Optional fields handled: Backward compatibility (if version allows)
  - Error responses use new format: Consistent across all endpoints

- [ ] **Critical workflow #3: Database writes & reads**
  - Create operation works: New data persisted
  - Read operation works: Can retrieve created data
  - Update operation works: Data can be modified
  - Delete operation works: Data removal works
  - No data corruption: Integrity constraints honored

- [ ] **Critical workflow #4: Third-party integrations**
  - External API calls succeed: Payment processor, email service, etc.
  - Webhooks received: Third parties can call back into service
  - Error handling: Graceful failure if third party unavailable
  - Retry logic: Automatic retries working for transient failures

- [ ] **Critical workflow #5: Backward compatibility** (for minor versions)
  - Old API endpoints still work: If not broken
  - Old response format accepted: Where supported
  - Deprecated endpoints return warning: Clear guidance to migrate
  - Migration timeline respected: Old version still functional

---

## Section 4: Performance & Baseline Metrics (5 min)

- [ ] **Response time metrics**
  - P50 latency: Baseline ± 10% (healthy)
  - P95 latency: Baseline ± 10% (acceptable)
  - P99 latency: Baseline ± 20% (watch but acceptable)
  - Median within SLA: <200ms for UI endpoints

- [ ] **Error rate metrics**
  - 5xx errors: <0.1% (critical threshold 1%)
  - 4xx errors: Normal range (expected user errors)
  - Timeout errors: <0.01%
  - No error spike: Consistent with pre-deployment baseline

- [ ] **Resource usage metrics**
  - CPU usage: <70% (healthy, room for spike)
  - Memory usage: <80% (healthy, no memory leaks)
  - Disk usage: <80% (logs not filling disk)
  - Network saturation: <60% (room for growth)

- [ ] **Throughput metrics**
  - Requests per second: Matching pre-deployment baseline
  - No request queue buildup: Processing without delays
  - Connections active: Stable count (not growing indefinitely)
  - Cache hit rate: Expected % (if applicable)

---

## Section 5: Error Log Analysis (5 min)

- [ ] **No critical errors**
  - Exception rate: 0 or expected baseline
  - Stack traces: Review any new errors (expected after deployment)
  - Database errors: No connection failures or constraint violations
  - Timeout errors: <0.01%

- [ ] **No security alerts**
  - Authentication failures: Normal rate (not spike)
  - Authorization failures: Expected for denied access
  - Suspicious patterns: No signs of attack or abuse
  - Invalid requests: Normal rate (not DDoS)

- [ ] **Error messages understandable**
  - Error descriptions: Clear and actionable
  - Error codes: Match documentation (if breaking changes)
  - Stack traces: Available for engineering review
  - Correlation IDs: Present for request tracing

---

## Section 6: Consumer Compatibility Check (5 min)

- [ ] **Consumer health verified** (if breaking changes)
  - Known clients connected: Monitoring shows active sessions
  - No authentication errors: Clients authenticated successfully
  - API response handling: Clients processing new format correctly
  - Migration status: Clients on supported versions

- [ ] **No consumer errors**
  - Consumer-specific endpoints: Working (if any)
  - Third-party clients: No connection refused
  - Mobile apps: No crashes reported
  - Web clients: Working across browsers

- [ ] **Feedback mechanisms working**
  - Error reporting: Clients can report issues
  - Support channels: Accessible (email, Slack, support portal)
  - Status page: Updated and accessible
  - Incident escalation: Path clear if issues arise

---

## Section 7: Deployment Strategy Progression (5 min)

**If Canary Deployment**:

- [ ] **Stage decision made** (if canary, proceed to next stage?)
  - Errors acceptable: <1% error rate (go)
  - Performance stable: Within baseline (go)
  - No critical issues: Team agrees safe to proceed (go)
  - Consumer feedback positive: No complaints (go)

  **Decision**:
  - [ ] GO to next stage: 10% traffic
  - [ ] PAUSE: Monitor additional 30 minutes
  - [ ] ROLLBACK: Critical issue found, revert to previous version

**If Blue-Green Deployment**:

- [ ] **Switch decision made**
  - All health checks passing on new (blue) environment
  - Load balancer can switch: DNS/LB config tested
  - Old (green) environment: Still running, ready for instant rollback
  - Consumer requests: Ready to flow to new environment

  **Decision**:
  - [ ] SWITCH: Route traffic from green to blue
  - [ ] PAUSE: Monitor additional 30 minutes
  - [ ] ROLLBACK: Critical issue found, stay on green

**If Rolling Deployment**:

- [ ] **Next wave ready**
  - Current wave: All healthy and verified
  - Next wave: Ready for deployment
  - Health checks: Configured and passing
  - No errors in current wave: Safe to proceed

  **Decision**:
  - [ ] PROCEED: Deploy next wave
  - [ ] PAUSE: Monitor additional 15 minutes
  - [ ] ROLLBACK: Issue found, stop rolling deployment

---

## Section 8: Incident & Rollback Preparation (5 min)

- [ ] **Rollback plan confirmed** (always keep ready)
  - Previous version available: Docker image, config, DB snapshot
  - Rollback steps documented: Clear procedure to revert
  - Team trained: Everyone knows rollback procedure
  - Estimated time: <5 minutes to rollback

- [ ] **Incident response ready**
  - Escalation path: Clear who to notify if issues
  - On-call team: Available for next 1-2 hours
  - Communication channels: Slack, PagerDuty, etc.
  - Status page: Updated if incident occurs

- [ ] **Monitoring alert thresholds**
  - Error rate alert: >5% triggers page
  - Latency alert: >2s P95 triggers page
  - Resource alert: CPU >80% triggers warning
  - Dependency alert: External service down triggers alert

---

## Red Flags - Consider Rollback

🚨 **WARNING - Evaluate rollback**:

- [ ] Error rate >1% (watch)
- [ ] Latency spike >50% above baseline (watch)
- [ ] Any 5xx errors in logs (investigate)
- [ ] Database connection failures (investigate)
- [ ] Consumer complaints (investigate)

❌ **MUST ROLLBACK - Immediate action**:

- [ ] Error rate >5% (ROLLBACK)
- [ ] Complete service unavailability (ROLLBACK)
- [ ] Data corruption detected (ROLLBACK)
- [ ] Security vulnerability discovered (ROLLBACK)
- [ ] Database rollback failed (CRITICAL - escalate)

**If ROLLBACK needed**:
1. Execute rollback procedure immediately
2. Notify stakeholders: Team, consumers, support
3. Investigate root cause
4. Fix issue
5. Re-test before attempting deployment again

---

## Sign-Off Template

```
DEPLOYMENT: v2.5.0 → Canary Stage 1 (1% traffic)
DATE: 2026-05-31 14:30 UTC
VERIFIED BY: [Name]
DURATION: 1 hour monitoring

Health checks: ✓ PASS
Error rate: ✓ PASS (0.08%)
Response time: ✓ PASS (baseline +5%)
Critical workflows: ✓ PASS
Consumers: ✓ PASS

Issues found: None critical

DECISION: ✅ PROCEED TO STAGE 2
  Next: Deploy to 10% traffic
  Monitor: 2 hours
  Go/no-go decision: 16:30 UTC
```
