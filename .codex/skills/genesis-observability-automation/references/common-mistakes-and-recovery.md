# Observability — Common Mistakes & Recovery Playbook

Tài liệu chi tiết về lỗi phổ biến và cách phục hồi.  
Được gọi bởi `genesis-observability-automation/SKILL.md` → `## Common mistakes` và `## Recovery workflow`.

---

## Common Mistakes

### M1: Alerting on symptoms without causes
Alert trên "CPU > 80%" nhưng CPU cao là triệu chứng, không phải nguyên nhân.  
**Fix**: Alert trên user-facing symptoms (error rate, latency). Pair với runbooks chẩn đoán.

### M2: Alert fatigue from too many low-quality alerts
50 alerts/week — hầu hết là noise. On-call bắt đầu ignore.  
**Fix**: Chỉ dùng SLO-based alerts. Mục tiêu < 5 actionable alerts/week.

### M3: Dashboards without context
Graph đi lên nhưng không biết đó tốt hay xấu.  
**Fix**: Mỗi metric panel phải có reference line hoặc SLA target annotation.

### M4: Missing "long tail" in alerting windows
Alert chỉ fires khi error > 5% trong 5 phút. Slow burn 0.5% trong 48 giờ exhausts budget silently.  
**Fix**: Multi-window alerting: fast burn (1h), medium burn (6h), slow burn (3d).

### M5: Runbooks only the author can follow
Runbook nói "check the logs" không chỉ rõ ở đâu, cách nào.  
**Fix**: Viết cho người junior nhất trong team. Include exact commands, queries, thresholds.

### M6: Health checks that always return 200
`/health` trả 200 dù DB unreachable. K8s vẫn route traffic đến broken pod.  
**Fix**: Health check phải verify actual dependencies. Return 503 nếu dependency unhealthy.

### M7: Observability only in production
Monitoring chỉ ở prod — issues invisible ở staging.  
**Fix**: Deploy cùng observability stack ở staging. Run integration tests vs `/metrics` endpoint.

### M8: Missing trace context in logs
Logs không có `trace_id`/`span_id`. Không thể correlate request across microservices.  
**Fix**: Inject `trace_id` và `span_id` vào mọi log line via OpenTelemetry.

---

## Recovery Playbook

### R1: Metrics not appearing in dashboard
```
Symptom: Dashboard shows "No data" for all panels.
1. Verify service running: kubectl get pods -n [namespace]
2. Check /metrics directly: curl http://service:9090/metrics | grep http_requests_total
3. Check Prometheus scrape config: kubectl describe servicemonitor [name] -n monitoring
4. Check Prometheus targets: Prometheus UI → Status → Targets
5. If in targets but missing: check instrumentation code init order
6. If NOT in targets: check scrape config selector labels
```

### R2: Alert not firing when it should
```
Symptom: Error rate clearly high but no alert.
1. Validate rules: promtool check rules alert-rules.yml
2. Evaluate expression manually: Prometheus UI → Graph
3. Check alert state: Prometheus UI → Alerts
4. If firing but not notifying: check Alertmanager routing
5. Check Alertmanager: kubectl exec alertmanager -- amtool alert
6. Test escalation manually via PagerDuty/OpsGenie UI
```

### R3: Health check causing false pod restarts
```
Symptom: Pods killed by liveness probe though service works.
1. Check probe: kubectl describe pod [pod] | grep -A 10 Liveness
2. Increase timeout if probe queries DB (default 1s often too short)
3. Increase failureThreshold if too aggressive (default 3)
4. Recommended safe config: initialDelaySeconds:30, timeoutSeconds:5, failureThreshold:5
```

### R4: Runbook out of date
```
Symptom: On-call followed runbook but steps don't work.
1. Annotate incorrect step immediately: [OUTDATED: <brief note>]
2. After incident resolved, open PR to correct
3. Re-run corrected steps in test environment
4. Add to post-mortem: "Update runbook [name] step [N]"
```
