# Example: Setting Up Observability for a New Payment Service

## Scenario

A new `PaymentService` is deployed to staging. Before production release, monitoring, alerting, and structured logging must be configured.

## Trigger

```
/setup-observability PaymentService --env staging
```

Or manually invoked after service deployment.

## Phase 1: Service Inventory

```
Service: PaymentService
Environment: staging
Stack: Node.js + Express + PostgreSQL

Health check endpoints discovered:
  - GET /health → { status: "ok", db: "connected" }
  - GET /ready  → { status: "ready", uptime: 1234 }

Key metrics identified:
  - payment.success_rate (target: >99.5%)
  - payment.latency_p95 (target: <500ms)
  - payment.error_rate (target: <0.5%)
  - db.connection_pool_usage (target: <80%)
```

## Phase 2: Agent Run Logging

**`observability/agent-runs/payment-service-2026-05-31.md`** created:

```markdown
## Agent Run: PaymentService Staging Deployment

Date: 2026-05-31
Service: PaymentService
Phase: Staging observability setup

Decision: Use Prometheus + Grafana (existing stack)
Evidence: Other services already on Prometheus (check MODULE_INDEX.md)
Risk: Prometheus retention only 15 days → add long-term storage

Actions taken:
  - Configured /metrics endpoint
  - Created payment-service dashboard (grafana/dashboards/payment.json)
  - Set alert: payment_error_rate > 1% for 5 min → PagerDuty
```

## Phase 3: Alerts Configured

```yaml
# alerts/payment-service.yaml
- name: PaymentHighErrorRate
  condition: payment_error_rate > 0.01
  window: 5m
  severity: critical
  notification: pagerduty-payments-team

- name: PaymentHighLatency
  condition: payment_latency_p95 > 500
  window: 10m
  severity: warning
  notification: slack-payments-channel
```

## Phase 4: Smoke Test

```
Injecting synthetic failure... payment endpoint returns 500
Alert check: PaymentHighErrorRate fires after 5 min ✅
Notification: PagerDuty receives alert ✅
Dashboard: Error rate spike visible in Grafana ✅
```

## Outcome

- ✅ Health checks monitored with correct thresholds
- ✅ Agent run log created in observability/agent-runs/
- ✅ 2 alerts configured and smoke-tested
- ✅ Incident playbook stub created
- ✅ Observability checklist complete
