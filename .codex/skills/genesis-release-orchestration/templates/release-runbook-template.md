# Release Runbook Template

**Environment**: [Development|Staging|Production]  
**Release Version**: v[X.Y.Z]  
**Release Date**: [YYYY-MM-DD HH:MM UTC]  
**Release Manager**: [Name]  
**Approval Chain**: [List approvers]

---

## Pre-Deployment Phase (30-60 minutes)

### 1. Pre-Deployment Verification (10 min)

**Checklist**:
- [ ] All tests passing (80%+ coverage)
- [ ] Version correctly updated in VERSION file
- [ ] CHANGELOG.md updated with release notes
- [ ] Breaking changes documented (if applicable)
- [ ] Migration guides created (if breaking changes)
- [ ] Database migrations tested in staging
- [ ] Configuration validated for this environment
- [ ] Rollback plan tested and documented
- [ ] Team on-call and ready
- [ ] Status page updated (if applicable)

**Command to verify**:
```bash
# Check tests
npm run test -- --coverage

# Verify version
cat VERSION  # Should show v[X.Y.Z]

# Verify changelog
cat CHANGELOG.md | head -20  # Should have new version entry

# Verify migrations (if applicable)
ls -la db/migrations/  # Check latest migration script
```

### 2. Database Migrations (if applicable, 10-20 min)

**For Development/Staging**:
```bash
# Run migrations
./db/migrate-up.sh

# Verify: Check table structure
psql -d database_dev -c "\d users"

# Verify: Check data integrity
psql -d database_dev -c "SELECT COUNT(*) FROM users"

# Save migration timestamp
echo "Migration completed at $(date)" >> MIGRATION_LOG.md
```

**For Production** (if breaking changes):
- [ ] Backup database created: `db_backup_v[X.Y.Z]_$(date).sql`
- [ ] Backup tested: Can restore from backup
- [ ] Estimated migration time: [X] minutes
- [ ] Data integrity verified post-migration
- [ ] Rollback migration script tested

### 3. Configuration Validation (5-10 min)

**Check environment-specific config**:
```bash
# Verify environment variables loaded
env | grep -E "DATABASE_URL|API_KEY|FEATURE_FLAG"

# Verify secrets available
grep -r "SECRET_KEY" config/ | grep -v "# PLACEHOLDER"

# Verify no hardcoded values
grep -r "hardcoded_value\|TODO_REPLACE\|CHANGE_ME" src/

# Validate config syntax
npm run config:validate
```

**Config checklist**:
- [ ] Database URL correct for environment
- [ ] API keys/tokens available
- [ ] Feature flags set correctly
- [ ] Logging level appropriate (DEBUG in dev, INFO in prod)
- [ ] TLS certificates valid
- [ ] Domain names correct

### 4. Pre-Deployment Approval (5 min)

**Get sign-off from**:
- [ ] Release Manager: Confirmed ready
- [ ] Tech Lead: All checks pass
- [ ] Ops Lead: Infrastructure ready
- [ ] Product (if breaking changes): Consumer communication sent

**Approval timestamp**: [HH:MM UTC]

---

## Deployment Phase (20-60 minutes)

### For Development Environment

```bash
# 1. Build Docker image
docker build -t myapp:v[X.Y.Z] .

# 2. Tag image
docker tag myapp:v[X.Y.Z] myapp:latest

# 3. Stop old container
docker stop myapp-container || true

# 4. Remove old container
docker rm myapp-container || true

# 5. Run new container
docker run -d \
  --name myapp-container \
  --env-file .env.dev \
  -p 3000:3000 \
  myapp:v[X.Y.Z]

# 6. Wait for startup (verify health endpoint)
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "✅ Development deployment complete: v[X.Y.Z]"
```

### For Staging Environment (via Kubernetes)

```bash
# 1. Build and push image to registry
docker build -t registry.example.com/myapp:v[X.Y.Z] .
docker push registry.example.com/myapp:v[X.Y.Z]

# 2. Update deployment
kubectl set image deployment/myapp \
  myapp=registry.example.com/myapp:v[X.Y.Z] \
  -n staging

# 3. Wait for rollout
kubectl rollout status deployment/myapp -n staging --timeout=5m

# 4. Verify pods running
kubectl get pods -n staging -l app=myapp

# 5. Port forward for testing
kubectl port-forward svc/myapp 3000:3000 -n staging

echo "✅ Staging deployment complete: v[X.Y.Z]"
```

### For Production Environment (Blue-Green or Canary)

**Blue-Green**:
```bash
# 1. Build and push to registry
docker build -t registry.example.com/myapp:v[X.Y.Z] .
docker push registry.example.com/myapp:v[X.Y.Z]

# 2. Deploy to "green" environment (parallel to prod)
kubectl apply -f deployment-green-v[X.Y.Z].yaml -n production

# 3. Wait for health checks
kubectl rollout status deployment/myapp-green -n production --timeout=5m

# 4. Verify green environment healthy
curl -f https://green.myapp.example.com/health || exit 1

# 5. Switch traffic: blue (old) → green (new)
# This is typically done via load balancer or DNS switch
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<green-tg>,Weight=100}]"

# 6. Monitor: Keep blue running for instant rollback (1-2 hours)
echo "✅ Production deployment complete: Traffic switched to green (v[X.Y.Z])"
echo "⏱️  Blue environment available for 2 hours for instant rollback"
```

**Canary** (for breaking changes):
```bash
# 1-4: Same as blue-green deployment steps

# 5. Route small % of traffic to new version (canary)
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v3-tg>,Weight=1},{TargetGroupArn=<v2-tg>,Weight=99}]"

# 6. Monitor Stage 1 (1 hour at 1% traffic)
# ... (see canary-deployment-orchestration.md for full stages)
```

---

## Post-Deployment Verification (15-30 minutes)

### 1. Health Check Verification (5 min)

```bash
# Check liveness probe
curl -f http://[app-url]/health
# Expected: 200 OK with version info

# Check readiness probe  
curl -f http://[app-url]/ready
# Expected: 200 OK with dependency status

# Check metrics endpoint
curl -f http://[app-url]/metrics | head -20
# Expected: Prometheus metrics output
```

**Verification checklist**:
- [ ] Liveness endpoint: 200 OK
- [ ] Readiness endpoint: 200 OK
- [ ] Version matches v[X.Y.Z]
- [ ] Database connected: Yes
- [ ] Cache connected: Yes (if applicable)
- [ ] External services: Available

### 2. Smoke Test Scenarios (5-10 min)

**Critical Workflow #1: Authentication**
```bash
# Test login
curl -X POST http://[app-url]/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Expected response:
# { "token": "...", "user": { "id": 1, "email": "test@example.com" } }
```

**Critical Workflow #2: Create & Read Data**
```bash
# Create user
curl -X POST http://[app-url]/api/users \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Read user (verify format is correct for this version)
curl http://[app-url]/api/users/1 \
  -H "Authorization: Bearer [token]"

# Expected for v3.0.0: { "data": { "id": 1, "name": "John" } }
# NOT: { "user": { "id": 1, "name": "John" } }
```

**Critical Workflow #3: Business Logic**
```bash
# Test key business workflow (e.g., payment processing)
curl -X POST http://[app-url]/api/payments \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"amount":99.99,"currency":"USD"}'

# Expected: 200 OK with payment ID
```

**Smoke Test Checklist**:
- [ ] Login works
- [ ] Create resource works
- [ ] Read resource works (new format if applicable)
- [ ] Update resource works
- [ ] Delete resource works
- [ ] Business critical endpoint works
- [ ] Error handling works (test 404, 400, 500 scenarios)

### 3. Database Integrity Check (5 min)

```bash
# Verify database accessible
psql -d [database] -c "SELECT 1"

# Check recent data
psql -d [database] -c "SELECT COUNT(*) FROM users"

# Check for any errors in migration
psql -d [database] -c "SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5"

# Verify no data corruption
psql -d [database] -c "SELECT * FROM users LIMIT 1" | head -10
```

**Database checklist**:
- [ ] Database connection successful
- [ ] Tables present
- [ ] Data accessible
- [ ] No schema errors
- [ ] Data integrity checks pass

### 4. Performance Baseline (5 min)

```bash
# Get baseline metrics
curl http://[app-url]/metrics | grep http_request_duration_seconds | head -10

# Expected: Requests processing in <200ms (P95)
```

**Performance checklist**:
- [ ] Response time: <200ms P95
- [ ] Error rate: <0.1%
- [ ] CPU usage: <70%
- [ ] Memory usage: <80%
- [ ] Cache hit rate: >80% (if applicable)

---

## Rollback Phase (If Needed - < 5 minutes)

### For Development/Staging

```bash
# Get previous version
PREVIOUS_VERSION=$(git tag | sort -V | tail -2 | head -1)

# Stop current version
docker stop myapp-container

# Run previous version
docker run -d \
  --name myapp-container \
  --env-file .env.dev \
  -p 3000:3000 \
  myapp:${PREVIOUS_VERSION}

# Verify rollback successful
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "✅ Rollback to ${PREVIOUS_VERSION} complete"
```

### For Production

```bash
# Revert to previous version immediately
# If Blue-Green: Switch traffic back to blue (original)
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<blue-tg>,Weight=100}]"

# If Canary: Immediately route 100% back to previous version
aws elbv2 modify-rule --rule-arn <arn> \
  --actions Type=forward,TargetGroups="[{TargetGroupArn=<v2-tg>,Weight=100}]"

# Verify rollback
curl -f http://[prod-url]/health

# Notify stakeholders
# Send: Slack message, Status page update, Email to on-call

echo "✅ Rollback to v[PREVIOUS] complete"
echo "🔴 Incident: v[X.Y.Z] deployment ROLLED BACK"
echo "📋 Investigation: See INCIDENT.md"
```

---

## Post-Deployment Monitoring (24 hours)

**First 1 hour (Critical)**:
- [ ] Error rate: Maintain <0.1%
- [ ] Latency: Within 10% of baseline
- [ ] Throughput: Expected level
- [ ] Health checks: Continuous passing
- [ ] Consumer feedback: No critical issues

**24-hour window**:
- [ ] Error rate: Maintain <0.1%
- [ ] Latency: Stable, no spikes
- [ ] All business workflows: Operational
- [ ] Consumer migrations: On track (if breaking changes)
- [ ] On-call team: Standing down after 24 hours

**Checklist**:
- [ ] 1-hour post-deployment: All green
- [ ] 4-hour checkpoint: All green
- [ ] 24-hour checkpoint: Ready to remove rollback capability

---

## Incident Log

**If any issues occur, document**:

```
Time: [HH:MM UTC]
Severity: [LOW|MEDIUM|HIGH|CRITICAL]
Description: [What happened]
Impact: [How many users affected]
Root cause: [Why did it happen]
Action taken: [What was done]
Resolution: [How was it fixed]
Prevention: [How to prevent next time]
```

---

## Sign-Off & Completion

**Deployment Complete**:
- Version deployed: v[X.Y.Z]
- Environment: [Development|Staging|Production]
- Date/Time: [YYYY-MM-DD HH:MM UTC]
- Deployed by: [Name]
- Approvals: [List all approvers]
- All health checks: ✅ PASS
- Smoke tests: ✅ PASS
- Issues: [None / List any]
- Status: ✅ **READY FOR NEXT STAGE**

---

**RUNBOOK COMPLETE**
