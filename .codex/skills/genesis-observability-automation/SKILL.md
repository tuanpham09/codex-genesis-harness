---
name: genesis-observability-automation
description: "Automate observability architecture, monitoring dashboard config, alerting policy generation, health check automation, and incident response runbook creation. Use to instrument services and prepare for production."
---

# genesis-observability-automation

## Purpose

Automates the full lifecycle of observability for software services: generates architecture diagrams (metrics/logs/traces topology), monitoring dashboard configs, SLO-based alerting policies, health check configuration, and incident response runbooks.

**Core philosophy**: You cannot operate what you cannot see. Observability must be designed before production launch. Every service must expose three pillars (metrics, logs, traces) before shipping.

---

## When to use

- A new service approaching production needs observability before launch.
- A service suffering repeated incidents due to lack of visibility.
- Migrating monitoring stacks (e.g., from scripts to Prometheus + Grafana).
- Post-mortem action items include "we need better monitoring" or "we need runbooks."
- Sprint planning includes observability tickets (dashboard, alert, runbook).
- An SRE or on-call rotation is being established and needs standard runbooks.

---

## When NOT to use

- Prototype or demo that will never go to production.
- Quick manual alert on a single metric (use the monitoring tool UI directly).
- Service already has mature observability and only needs one added metric.
- During an active incident (use existing runbooks — this skill generates them, not replaces them).
- Monitoring stack not decided yet (run `genesis-planning` first).

---

## Inputs required

| Category | Required inputs |
|---|---|
| Service | name, language/runtime, type, endpoints/operations, deployment platform |
| Monitoring stack | metrics (Prometheus/Datadog/CloudWatch), logging, tracing, alerting tool |
| SLO/SLA | availability %, latency SLO, error rate SLO, throughput minimum |
| Incident response | escalation chain, communication channels, service dependencies, rollback procedure |

---

## Outputs required

| Phase | Outputs |
|---|---|
| Phase 1 | `observability-architecture.md`, `instrumentation-guide.md` |
| Phase 2 | `dashboards/service-overview.json`, `service-details.json`, `slo-tracking.json` |
| Phase 3 | `alerts/alert-rules.yml`, `escalation-chain.yml`, `alert-silence-template.md` |
| Phase 4 | `health-checks/readiness-probe.yml`, `liveness-probe.yml`, `health-endpoint-spec.md` |
| Phase 5 | `runbooks/p0-runbook.md`, `p1-runbook.md`, `p2-runbook.md`, `post-mortem-template.md`, `INCIDENT_LOG.md` |

See `references/workflow-phases.md` for per-phase implementation detail.

---

## Required tests

- `test/observability/instrumentation.test.js` — verifies `/metrics` endpoint exports RED metrics
- `test/observability/health-endpoint.test.js` — verifies `/health`, `/readiness`, `/liveness` schemas
- `test/observability/structured-logging.test.js` — verifies all logs are valid JSON with required fields
- `test/observability/dashboard-schema.test.js` — validates Grafana dashboard JSON schema
- `test/observability/alert-rules-valid.test.js` — validates Prometheus alert rules with `promtool`

All tests must pass against fixtures in `fixtures/observability/`.

---

## Required fixtures

- `fixtures/observability/monitoring-config-expected.json`
- `fixtures/observability/alert-policy-expected.json`
- `fixtures/observability/incident-runbook-expected.json`

---

## Required contract updates

Update when outputs change:
- `contracts/observability/dashboard-schema.contract.json`
- `contracts/observability/alert-rule-schema.contract.json`
- `contracts/observability/health-endpoint.contract.json`
- `contracts/observability/agent-run-schema.json` (harness-level observability schema)

Contract update procedure: bump `version`, set `changed_at`, add `changelog` entry, re-run fixture tests.

---

## Required codebase map updates

After completing observability setup:
- `.codebase/CURRENT_STATE.md`: add `Observability: [service] instrumented [date]`
- `.codebase/MODULE_INDEX.md`: add entries for dashboard JSON, alert rule, runbook files
- `observability/INCIDENT_LOG.md`: initialize with service name + `No incidents yet`

---

## Token saving rules

1. If a dashboard exists, diff it against requirements — do not regenerate the whole dashboard.
2. Generate only runbooks for severity levels that apply (simple internal tool: P1/P2 only).
3. Base new alert rules on `templates/alerting-policy-template.md` — fill thresholds, not structure.
4. Reference `observability-architecture.md` by name in prompts, not by embedding it.
5. Generate all Grafana panels in one pass — do not loop back for individual panels.
6. Skip tracing config if no tracing stack selected.
7. Use compact JSON for dashboard fixtures to reduce token consumption.

---

## Acceptance criteria

**Instrumentation**: `/metrics` endpoint exports `requests_total`, `request_duration_seconds`, `request_errors_total`. Logs are structured JSON with `timestamp`, `level`, `service`, `trace_id`.

**Dashboards**: RED metrics (Rate, Errors, Duration) + Saturation panels. SLO tracking panel shows error budget remaining.

**Alerts**: SLO burn rate alerts for 1h/6h/24h/3d windows. All alerts have `severity`, `runbook_url`, `description`. Escalation chain test-fired end-to-end.

**Health checks**: `/health` → 200 OK. `/readiness` → checks actual dependencies. K8s probes configured.

**Runbooks**: P1 runbook covers detection/triage/escalation/resolution/post-mortem. Linked from alert `runbook_url`. Reviewed by on-call team.

---

## Common mistakes

See `references/common-mistakes-and-recovery.md` for the full list of 8 mistakes with fixes.

**Top 3**:
- M1: Alerting on symptoms (CPU high) not user-facing signals (error rate, latency)
- M4: Missing multi-window alerting — slow burn exhausts budget without triggering alert
- M6: Health checks always returning 200 even when dependencies are down

---

## Recovery workflow

See `references/common-mistakes-and-recovery.md` for the full recovery playbooks R1–R4.

**Quick reference**:
- R1: Metrics missing → check `/metrics` endpoint, Prometheus targets, scrape config labels
- R2: Alert not firing → `promtool check rules`, check Alertmanager routing
- R3: False pod restarts → increase `timeoutSeconds` and `failureThreshold` in liveness probe
- R4: Runbook outdated → annotate `[OUTDATED]`, fix post-incident, re-run in test environment
