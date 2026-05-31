---
name: genesis-observability-automation
description: "Automate observability architecture, monitoring dashboard config, alerting policy generation, health check automation, and incident response runbook creation. Use to instrument services and prepare for production."
---

# genesis-observability-automation

## Purpose

The `genesis-observability-automation` skill automates the full lifecycle of observability for software services. It generates observability architecture diagrams (metrics/logs/traces topology), produces monitoring dashboard configurations for Grafana, Datadog, and CloudWatch, creates SLO-based alerting policies with escalation chains, automates health check configuration (readiness/liveness probes and SLA validation), and generates incident response runbooks for P0/P1/P2/P3 severity triage, resolution, and post-mortem.

This skill transforms observability from an afterthought into an engineering discipline. Every phase produces production-ready artifacts that integrate with standard monitoring stacks — no manual dashboard clicking, no ad-hoc alert configuration. Observability is code, version-controlled and reviewed like any other engineering artifact.

**Core philosophy**: You cannot operate what you cannot see. You cannot respond to incidents you cannot detect. Observability must be designed before production launch, not retrofitted after the first outage. Every service must expose the three pillars (metrics, logs, traces) before it ships.

---

## When to use

Use `genesis-observability-automation` when:

- A new service is approaching production and needs observability infrastructure before launch. Run this skill as part of the production readiness checklist.
- An existing service is suffering repeated incidents due to lack of visibility (team finds out about problems from users, not monitors).
- You are migrating monitoring stacks (e.g., from custom scripts to Prometheus + Grafana, or from on-prem to Datadog).
- A post-mortem action item is "we need better monitoring" or "we need runbooks" — this skill produces both.
- Sprint planning includes observability-related tickets (dashboard, alert, runbook) and you need to generate them efficiently.
- An SRE or on-call rotation is being established and needs standard runbooks and escalation chains.
- An audit or compliance review requires documented incident response procedures.
- You need to validate that an existing service's observability meets a defined maturity level before certifying it as production-ready.
- A new team member is joining on-call and needs structured runbooks to operate the service safely.

---

## When NOT to use

Do NOT use `genesis-observability-automation` when:

- The service is a prototype or demo that will never go to production. Observability infrastructure has maintenance cost — do not invest it in throwaway code.
- You only need a quick manual alert on a single metric. Use the monitoring tool's UI directly for one-off alerts.
- The service already has mature, well-maintained observability and you only need to add one metric. Add the metric directly rather than regenerating the full architecture.
- You need to diagnose a currently active incident. Use the existing runbooks and monitoring tools. This skill generates runbooks — it does not replace them during an emergency.
- The monitoring stack has not been decided yet. Run `genesis-planning` first to select the monitoring stack, then return to this skill.
- You need network-layer observability (packet capture, flow logs) — this skill covers application-layer observability. Use a dedicated network observability tool (e.g., Wireshark, VPC flow logs) for network-layer issues.

---

## Inputs required

Before invoking this skill, gather or confirm the following inputs:

### Service inputs
- **Service name**: The canonical name of the service (used in all generated config names, e.g., `users-api`).
- **Service language/runtime**: Node.js, Python, Go, Java (determines which instrumentation libraries to include).
- **Service type**: REST API, gRPC service, background worker, streaming service, batch job (determines which RED metrics apply).
- **Service endpoints or operations**: Complete list of endpoints/operations to monitor (with HTTP methods if applicable).
- **Deployment platform**: Kubernetes, ECS, Lambda, Heroku, bare metal (determines probe types and service discovery config).

### Monitoring stack inputs
- **Metrics stack**: Prometheus + Grafana | Datadog | CloudWatch | New Relic | None (select one).
- **Logging stack**: ELK (Elasticsearch + Logstash + Kibana) | Loki + Grafana | Datadog Logs | CloudWatch Logs | None.
- **Tracing stack**: Jaeger | Zipkin | AWS X-Ray | Datadog APM | OpenTelemetry (select one).
- **Alerting tool**: PagerDuty | OpsGenie | Slack | VictorOps | Email (escalation chain target).
- **On-call rotation**: List of team members in the on-call rotation, in order of escalation.

### SLO/SLA inputs
- **Availability SLO** (e.g., 99.9%): What uptime percentage is required? Determines error budget.
- **Latency SLO** (e.g., p95 < 200 ms): What response time is acceptable for 95% of requests?
- **Error rate SLO** (e.g., < 0.1%): What error rate is acceptable?
- **Throughput minimum** (e.g., ≥ 100 RPS): Minimum throughput for the service to be considered operational.

### Incident response inputs
- **Escalation chain**: Primary on-call → Secondary on-call → Engineering manager → VP Engineering (with contact info / PagerDuty IDs).
- **Communication channels**: Incident Slack channel, status page URL, customer communication channel.
- **Service dependencies**: What external services does this service depend on? (Used in runbook dependency checks.)
- **Rollback procedure**: How is the service rolled back? (kubectl rollout undo, feature flag, etc.)
- **Business impact**: What is the customer impact if this service is down? (Used for severity classification.)

---

## Outputs required

### Phase 1 outputs
- `observability-architecture.md`: Complete observability topology diagram showing metrics, logs, and traces collection paths, storage, and visualization layers.
- `instrumentation-guide.md`: Service-specific instrumentation instructions (which libraries to add, what to instrument, structured logging format).

### Phase 2 outputs
- `dashboards/service-overview.json`: Grafana dashboard JSON (or Datadog dashboard JSON) with RED metrics panels.
- `dashboards/service-details.json`: Detailed drill-down dashboard with per-endpoint latency histograms, error breakdowns, and resource utilization.
- `dashboards/slo-tracking.json`: SLO/error budget burn rate dashboard.

### Phase 3 outputs
- `alerts/alert-rules.yml`: Prometheus alerting rules (or Datadog monitor configs) with SLO-based thresholds.
- `alerts/escalation-chain.yml`: PagerDuty/OpsGenie escalation policy config.
- `alerts/alert-silence-template.md`: Template for silencing alerts during planned maintenance.

### Phase 4 outputs
- `health-checks/readiness-probe.yml`: Kubernetes readiness probe configuration.
- `health-checks/liveness-probe.yml`: Kubernetes liveness probe configuration.
- `health-checks/health-endpoint-spec.md`: Specification for the `/health`, `/readiness`, and `/metrics` endpoints.

### Phase 5 outputs
- `runbooks/p0-runbook.md`: Production down — all-hands incident runbook.
- `runbooks/p1-runbook.md`: Production degraded — on-call incident runbook.
- `runbooks/p2-runbook.md`: Partial degradation — business hours runbook.
- `runbooks/post-mortem-template.md`: Blameless post-mortem template with 5-whys.
- `INCIDENT_LOG.md`: Running log of all incidents (initialize with this skill, append after each incident).

---

## Required tests

### Architecture tests
- [ ] `test/observability/instrumentation.test.js`: Verifies service exports metrics endpoint at `/metrics` with required metric names (RED metrics + process metrics).
- [ ] `test/observability/health-endpoint.test.js`: Verifies `/health`, `/readiness`, and `/liveness` endpoints return correct schemas and status codes under normal conditions.
- [ ] `test/observability/structured-logging.test.js`: Verifies that all log output is valid JSON with required fields (timestamp, level, service, trace_id).

### Dashboard tests
- [ ] `test/observability/dashboard-schema.test.js`: Validates generated Grafana dashboard JSON against Grafana's schema (all panels have valid datasource refs, correct query syntax).
- [ ] `test/observability/dashboard-completeness.test.js`: Verifies dashboard has all required panels (rate, errors, duration, saturation).

### Alert tests
- [ ] `test/observability/alert-rules-valid.test.js`: Validates Prometheus alert rules YAML with `promtool check rules alert-rules.yml`.
- [ ] `test/observability/alert-threshold-coverage.test.js`: Verifies alert rules cover all required SLO burn rate windows (1h, 6h, 24h, 3d).

### Runbook tests
- [ ] `test/observability/runbook-completeness.test.js`: Verifies each runbook has all required sections (severity definition, triage steps, escalation, resolution, post-mortem).

All tests must pass against fixtures in `fixtures/observability/`.

---

## Required fixtures

- `fixtures/observability/monitoring-config-expected.json`: Prometheus scrape config + Grafana dashboard spec with correct structure.
- `fixtures/observability/alert-policy-expected.json`: SLO-based alert rules with correct threshold calculations.
- `fixtures/observability/incident-runbook-expected.json`: P1 incident runbook with correct structure and all required sections.

---

## Required contract updates

Update the following when this skill's outputs change:

- `contracts/observability/dashboard-schema.contract.json`: JSON Schema for generated dashboard configs. Update when new panel types are added.
- `contracts/observability/alert-rule-schema.contract.json`: JSON Schema for alert rule configs. Update when threshold calculation logic changes.
- `contracts/observability/health-endpoint.contract.json`: API contract for `/health`, `/readiness`, `/liveness` endpoints. Update when health check format changes.

Contract update procedure:
1. Bump `version` field.
2. Set `changed_at` to current ISO timestamp.
3. Add `changelog` entry.
4. Re-run fixture tests.
5. Notify any consumers of the contract (teams using the generated configs).

---

## Required codebase map updates

After completing observability setup:

### `.codebase/CURRENT_STATE.md`
- Add: `Observability: [service] instrumented [date]. Stack: [Prometheus|Datadog|CloudWatch].`
- Add: `Runbooks: P0/P1/P2 runbooks generated for [service].`

### `.codebase/MODULE_INDEX.md`
- Add entries for dashboard JSON files, alert rule files, and runbook files.
- Add entries for any new health check endpoints added to the service.

### `observability/INCIDENT_LOG.md`
- Initialize with the service name, observability architecture summary, and `No incidents yet` placeholder.

---

## Token saving rules

1. **Reference existing dashboards**: If a dashboard for this service exists, diff it against requirements — do not regenerate the whole dashboard.
2. **Generate only needed runbooks**: Generate runbooks for the severity levels that apply. A simple internal tool only needs P1/P2 runbooks, not a P0 all-hands procedure.
3. **Reuse alert templates**: Base new alert rules on the existing template in `templates/alerting-policy-template.md`. Fill in thresholds, do not rewrite the structure.
4. **Summarize topology, don't draw ASCII art in prompts**: Reference `observability-architecture.md` by name, not by embedding it in subsequent prompts.
5. **Batch all dashboard panels**: Generate all Grafana panels in one pass. Do not loop back to add individual panels.
6. **Skip tracing config if no tracing stack selected**: If the team has not adopted distributed tracing, skip Phase 1 tracing topology and Phase 2 trace-based panels.
7. **Use compact JSON for dashboard fixtures**: Minify dashboard JSON in fixtures to reduce token consumption in test comparison.

---

## Acceptance criteria

Observability setup is COMPLETE and ACCEPTED when ALL of the following are true:

### Instrumentation
- [ ] Service exports `/metrics` endpoint (Prometheus format) or sends metrics to the configured metrics backend.
- [ ] All RED metrics are present: `requests_total`, `request_duration_seconds`, `request_errors_total`.
- [ ] All logs are structured JSON with: `timestamp`, `level`, `service`, `trace_id`, `span_id`, `message`.
- [ ] Distributed traces are being collected (if tracing stack is configured).

### Dashboards
- [ ] Service overview dashboard exists and is deployed to the monitoring stack.
- [ ] Dashboard shows: Rate (RPS), Errors (error rate %), Duration (p50/p95/p99), Saturation (CPU, memory, connection pool).
- [ ] SLO tracking panel shows current error budget remaining.
- [ ] Dashboard is linked from the service's README or internal wiki.

### Alerts
- [ ] SLO burn rate alerts exist for fast burn (1h/6h windows) and slow burn (24h/3d windows).
- [ ] All alerts have: `severity` label, `runbook_url` annotation, `description` annotation.
- [ ] Escalation chain is configured in the alerting tool (PagerDuty/OpsGenie).
- [ ] At least one alert has been test-fired to verify the escalation chain works end-to-end.

### Health checks
- [ ] `/health` endpoint exists and returns `{"status": "ok"}` with HTTP 200 when healthy.
- [ ] `/readiness` probe is configured in Kubernetes (or equivalent).
- [ ] `/liveness` probe is configured with appropriate failure thresholds.

### Runbooks
- [ ] P1 runbook exists and covers: detection, triage, escalation, resolution, post-mortem.
- [ ] Runbook is linked in all alert `runbook_url` annotations.
- [ ] Runbook has been reviewed by the on-call team and is accessible without production access (stored in wiki or repo).
- [ ] Post-mortem template is ready for use.

---

## Common mistakes

### Mistake 1: Alerting on symptoms without causes
**Problem**: Alert fires on "CPU > 80%" but CPU being high is a symptom, not a cause. On-call engineer doesn't know what to do.
**Fix**: Alert on user-facing symptoms (error rate, latency) and provide runbooks that help diagnose the underlying cause. Pair symptom alerts with diagnostic links.

### Mistake 2: Alert fatigue from too many low-quality alerts
**Problem**: 50 alerts firing every week, most of which are noise. On-call engineers start ignoring alerts ("boy who cried wolf").
**Fix**: Start with only SLO-based alerts. Achieve < 5 actionable alerts per week. Every alert must have a runbook and a clear action. Regularly review false positive rates.

### Mistake 3: Dashboards without context
**Problem**: Dashboard shows a graph going up but no reference line to know if that's good or bad.
**Fix**: Every metric panel must have a reference line or annotation showing the SLA target, the previous week's baseline, or an absolute threshold. "Is this normal?" should be answerable from the dashboard alone.

### Mistake 4: Missing the "long tail" in alerting windows
**Problem**: Alert only fires when error rate > 5% for 5 minutes. A slow 0.5% burn for 48 hours exhausts the entire monthly error budget without triggering any alert.
**Fix**: Implement multi-window alerting: fast burn (≥ 2% in 1 hour), medium burn (≥ 5% in 6 hours), slow burn (≥ 10% in 3 days). Cover both fast and slow failures.

### Mistake 5: Runbooks that only the original author can follow
**Problem**: Runbook says "check the logs" without specifying where, how, or what to look for. New on-call engineer is lost.
**Fix**: Write runbooks for the most junior person on the rotation. Include exact commands to run, exact queries to execute, and exact thresholds that indicate each diagnosis. Link to the monitoring dashboard directly.

### Mistake 6: Health checks that always return 200
**Problem**: `/health` endpoint returns HTTP 200 even when the database is unreachable. Kubernetes load balancer continues routing traffic to a broken pod.
**Fix**: Health check must verify actual service dependencies. `/readiness` should check DB connectivity, cache connectivity, and any critical downstream dependencies. Return 503 if any dependency is unhealthy.

### Mistake 7: Observability only in production
**Problem**: Monitoring is only set up for production. Issues are invisible in staging and only discovered after production deployment.
**Fix**: Deploy the same observability stack in staging. Run integration tests against the `/metrics` endpoint. Validate alert rules in staging before production.

### Mistake 8: Missing trace context in logs
**Problem**: Logs don't include `trace_id` or `span_id`. When investigating an incident, there's no way to correlate a specific user request across microservices.
**Fix**: Inject `trace_id` and `span_id` into all log lines using OpenTelemetry or manual propagation. This is the #1 enabler of fast incident resolution in distributed systems.

---

## Recovery workflow

### Recovery 1: Metrics not appearing in dashboard
```
Symptom: Dashboard shows "No data" for all panels.
Step 1: Verify service is running: kubectl get pods -n [namespace]
Step 2: Check /metrics endpoint directly: curl http://service-host:9090/metrics | grep http_requests_total
Step 3: Check Prometheus scrape config: kubectl describe servicemonitor [name] -n monitoring
Step 4: Check Prometheus targets: open Prometheus UI → Status → Targets → look for service in targets list
Step 5: If service is in targets but metrics missing: check instrumentation code (is metrics library initialized before first request?)
Step 6: If service is NOT in targets: check Prometheus scrape config selector labels match service labels
```

### Recovery 2: Alert not firing when it should
```
Symptom: Error rate is clearly high but no alert fired.
Step 1: Check Prometheus alert rule with: promtool check rules alert-rules.yml
Step 2: Evaluate the alert expression manually in Prometheus: Prometheus UI → Graph → paste alert expression
Step 3: Check alert state: Prometheus UI → Alerts → find the alert rule → check if it's in "Inactive" state
Step 4: If alert is firing but not notifying: check Alertmanager config and routing rules
Step 5: Check Alertmanager status: kubectl exec -n monitoring alertmanager-pod -- amtool alert
Step 6: Test escalation manually: send a test alert through PagerDuty/OpsGenie UI
```

### Recovery 3: Health check causing false pod restarts
```
Symptom: Pods are being killed by liveness probe even though service is working.
Step 1: Check liveness probe config: kubectl describe pod [pod-name] | grep -A 10 Liveness
Step 2: Check if probe timeout is too short (default is 1s — increase if health check queries DB)
Step 3: Check if failure threshold is too low (default is 3 consecutive failures — may be too aggressive)
Step 4: Check /health endpoint response time under load: does it exceed liveness probe timeout?
Step 5: Fix: increase timeoutSeconds, increase failureThreshold, or optimize the health check endpoint
Step 6: Recommended safe config: initialDelaySeconds: 30, timeoutSeconds: 5, failureThreshold: 5
```

### Recovery 4: Runbook is wrong or out of date
```
Symptom: On-call engineer followed runbook but steps don't work or are inaccurate.
Step 1: Immediately annotate the incorrect step with [OUTDATED: <brief note>] so next person is warned.
Step 2: After incident is resolved, open a PR to correct the runbook.
Step 3: Re-run the corrected runbook steps in a test environment to verify they work.
Step 4: Add incident to post-mortem action items: "Update runbook [name] step [N]."
Step 5: Assign runbook review to the on-call engineer who caught the error.
```

---

## Workflow Detail: Phase-by-Phase Execution

### Phase 1: Observability Architecture Generation

**Goal**: Design and document the complete observability topology before writing any configuration.

**Architecture components to define:**

| Pillar | Component | Purpose |
|--------|-----------|---------|
| Metrics | Prometheus / Datadog Agent | Scrape and store numeric time-series |
| Metrics | Grafana / Datadog Dashboards | Visualize and alert on metrics |
| Logs | Structured logging library | Produce machine-readable log events |
| Logs | Log aggregator (Loki/ELK/CloudWatch) | Collect and index logs |
| Logs | Kibana/Grafana/Datadog | Search and visualize logs |
| Traces | OpenTelemetry SDK | Instrument service for tracing |
| Traces | Jaeger/Zipkin/Datadog APM | Collect and visualize traces |

**Service instrumentation requirements (by language):**
- Node.js: `prom-client` (metrics), `winston` or `pino` (structured logs), `@opentelemetry/sdk-node` (traces).
- Python: `prometheus_client` (metrics), `structlog` or `python-json-logger` (logs), `opentelemetry-sdk` (traces).
- Go: `prometheus/client_golang` (metrics), `zap` or `logrus` (logs), `go.opentelemetry.io/otel` (traces).

### Phase 2: Dashboard Generation

**Required panels for every service dashboard:**

RED metrics (the minimum viable dashboard for any service):
- **Rate**: Requests per second (total and per endpoint).
- **Errors**: Error rate percentage (4xx and 5xx separately).
- **Duration**: Response time as a histogram with p50, p95, p99 lines.

SATURATION metrics (resource utilization):
- **CPU**: Process CPU utilization %.
- **Memory**: Heap and RSS memory.
- **Connection pool**: Active connections vs. pool limit.
- **Queue depth**: (For background workers) — job queue length.

See `templates/monitoring-dashboard-template.md` for complete Grafana JSON scaffold.

### Phase 3: Alerting Policy Generation

**SLO-based alert threshold calculation:**

For a 99.9% availability SLO (monthly error budget = 43.8 minutes):

```
Fast burn alert (1h window):
  Threshold: error_rate > 2% for 1 hour
  Reason: 2% error rate burns 2% of monthly budget per hour = exhausted in 50 hours
  Action: Page on-call immediately (P1)

Medium burn alert (6h window):
  Threshold: error_rate > 0.5% for 6 hours
  Reason: 0.5% × 6h = 3% of monthly budget consumed
  Action: Page on-call (P2 — business hours response acceptable)

Slow burn alert (3d window):
  Threshold: error_rate > 0.1% for 72 hours
  Reason: 0.1% × 72h = 7.2% of monthly budget consumed silently
  Action: Slack notification + ticket creation (investigate next sprint)
```

See `templates/alerting-policy-template.md` for complete Prometheus alerting rules.

### Phase 4: Health Check Automation

**Standard health endpoint specification:**
- `GET /health` → 200 OK always (used by load balancers for basic routing).
- `GET /readiness` → 200 if all dependencies healthy, 503 if any dependency unhealthy.
- `GET /liveness` → 200 if process is alive and event loop is not stuck, 503 if deadlocked.
- `GET /metrics` → Prometheus text format metrics.

### Phase 5: Incident Response Runbook Generation

**Runbook structure requirements:**
Every runbook must have: Severity definition, Detection signals, Triage steps (ordered, with commands), Escalation triggers, Resolution steps, Rollback procedure, Communication templates, Post-mortem checklist.

See `playbooks/incident-triage-playbook.md` for complete P0/P1/P2/P3 runbooks.
