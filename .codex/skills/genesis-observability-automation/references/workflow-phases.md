# Observability — Phase-by-Phase Workflow

Tài liệu chi tiết từng giai đoạn triển khai observability.  
Được gọi bởi `genesis-observability-automation/SKILL.md` → `## Workflow Detail: Phase-by-Phase Execution`.

---

## Phase 1: Observability Architecture Generation

**Goal**: Thiết kế và tài liệu hoá toàn bộ topology observability trước khi viết bất kỳ config nào.

### Architecture components

| Pillar | Component | Purpose |
|--------|-----------|---------|
| Metrics | Prometheus / Datadog Agent | Scrape and store numeric time-series |
| Metrics | Grafana / Datadog Dashboards | Visualize and alert on metrics |
| Logs | Structured logging library | Produce machine-readable log events |
| Logs | Log aggregator (Loki/ELK/CloudWatch) | Collect and index logs |
| Logs | Kibana/Grafana/Datadog | Search and visualize logs |
| Traces | OpenTelemetry SDK | Instrument service for tracing |
| Traces | Jaeger/Zipkin/Datadog APM | Collect and visualize traces |

### Service instrumentation by language

- **Node.js**: `prom-client` (metrics), `winston`/`pino` (structured logs), `@opentelemetry/sdk-node` (traces).
- **Python**: `prometheus_client` (metrics), `structlog`/`python-json-logger` (logs), `opentelemetry-sdk` (traces).
- **Go**: `prometheus/client_golang` (metrics), `zap`/`logrus` (logs), `go.opentelemetry.io/otel` (traces).

---

## Phase 2: Dashboard Generation

**Required panels (RED metrics)**:
- **Rate**: Requests per second (total and per endpoint)
- **Errors**: Error rate percentage (4xx and 5xx separately)
- **Duration**: Response time as histogram with p50, p95, p99

**SATURATION metrics**:
- **CPU**: Process CPU utilization %
- **Memory**: Heap and RSS memory
- **Connection pool**: Active connections vs. pool limit
- **Queue depth**: Job queue length (background workers)

See `templates/monitoring-dashboard-template.md` for complete Grafana JSON scaffold.

---

## Phase 3: Alerting Policy Generation

**SLO-based alert thresholds (99.9% availability = 43.8 min/month error budget)**:

```
Fast burn (1h):   error_rate > 2%   → P1 page immediately
Medium burn (6h): error_rate > 0.5% → P2 business hours
Slow burn (3d):   error_rate > 0.1% → Slack + ticket
```

See `templates/alerting-policy-template.md` for complete Prometheus alerting rules.

---

## Phase 4: Health Check Automation

**Standard health endpoint specification**:
- `GET /health`     → 200 always (load balancer basic routing)
- `GET /readiness`  → 200 if dependencies healthy, 503 if not
- `GET /liveness`   → 200 if process alive + event loop not stuck
- `GET /metrics`    → Prometheus text format

---

## Phase 5: Incident Response Runbook Generation

**Runbook structure requirements** (every runbook must have):
Severity definition → Detection signals → Triage steps (with commands) → Escalation triggers → Resolution steps → Rollback procedure → Communication templates → Post-mortem checklist.

See `playbooks/incident-triage-playbook.md` for complete P0/P1/P2/P3 runbooks.
