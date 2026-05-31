# Load Testing Orchestration Playbook

Complete guide to designing, configuring, and running load tests with k6, Artillery, and Locust. Includes ramp-up strategies, threshold configuration, and result interpretation.

---

## Part 1: Load Test Types and When to Use Each

| Test Type | Goal | Duration | Concurrency | Frequency |
|-----------|------|----------|-------------|-----------|
| **Smoke** | Verify endpoint responds at all under minimal load | 1 min | 1 VU | Every deploy |
| **Load** | Verify steady-state performance at expected traffic | 10-30 min | Target VUs | Daily / per PR |
| **Stress** | Find breaking point; observe degradation behavior | 5-10 min | 2-5× target | Weekly |
| **Soak** | Detect memory leaks, connection exhaustion, drift | 30-120 min | 50-75% target | Weekly |
| **Spike** | Simulate sudden traffic burst (flash sale, breaking news) | 2 min | 10× target (instant) | Monthly |
| **Breakpoint** | Find the exact RPS at which the system fails | 30 min | Linear ramp to failure | Pre-launch |

---

## Part 2: k6 Load Test Templates

### 2.1 Complete k6 Script Template

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ──────────────────────────────────────────────────────────
const errorRate = new Rate('custom_error_rate');
const apiResponseTime = new Trend('api_response_time', true); // true = milliseconds

// ─── Test Configuration ──────────────────────────────────────────────────────
export const options = {
  // Stages define the VU (virtual user) ramp pattern
  stages: [
    { duration: '30s', target: 5 },    // Smoke: minimal load
    { duration: '2m',  target: 100 },  // Ramp-up: 0 → 100 VUs over 2 minutes
    { duration: '5m',  target: 100 },  // Peak: sustain 100 VUs for 5 minutes
    { duration: '2m',  target: 150 },  // Stress: push to 150% of target
    { duration: '1m',  target: 0 },    // Ramp-down: drain connections
  ],

  // Thresholds: test FAILS if any threshold is breached
  thresholds: {
    // P95 response time must stay under 200ms
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
    // Error rate must stay under 1%
    'http_req_failed': ['rate<0.01'],
    // Custom error rate under 0.5%
    'custom_error_rate': ['rate<0.005'],
    // Specific endpoint threshold
    'http_req_duration{name:users-list}': ['p(95)<150'],
  },

  // Tags applied to all metrics in this run
  tags: {
    environment: __ENV.ENVIRONMENT || 'staging',
    version: __ENV.APP_VERSION || 'unknown',
    test_type: 'load',
  },

  // Scenarios (advanced: allows mixing multiple test types)
  // Uncomment to use scenario-based config instead of stages:
  // scenarios: { ... }
};

// ─── Test Data ───────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'https://api.staging.example.com';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token-here';

const HEADERS = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Realistic user payloads (sample from production logs)
const TEST_PAYLOADS = [
  { query: 'active', page: 1, limit: 20 },
  { query: 'inactive', page: 2, limit: 20 },
  { query: 'active', page: 1, limit: 50 },
];

// ─── Setup (runs once before test) ───────────────────────────────────────────
export function setup() {
  // Verify the target is reachable before starting the real test
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Target not healthy: ${healthRes.status}`);
  }
  console.log('Target is healthy. Starting load test.');
  return { baseUrl: BASE_URL };
}

// ─── Main VU Function (runs for each VU on each iteration) ───────────────────
export default function(data) {
  const baseUrl = data.baseUrl;

  // ── Scenario: Browse users (most common user journey) ─────────────────────
  // 1. List users
  const payload = TEST_PAYLOADS[Math.floor(Math.random() * TEST_PAYLOADS.length)];
  const listRes = http.get(
    `${baseUrl}/api/users?status=${payload.query}&page=${payload.page}&limit=${payload.limit}`,
    { headers: HEADERS, tags: { name: 'users-list' } }
  );

  apiResponseTime.add(listRes.timings.duration);

  const listOk = check(listRes, {
    'list status 200': (r) => r.status === 200,
    'list body has items': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data) && body.data.length >= 0;
      } catch(e) { return false; }
    },
    'list response time < 200ms': (r) => r.timings.duration < 200,
  });
  errorRate.add(!listOk);

  sleep(1); // Think time: 1 second between actions

  // 2. Get a specific user (simulate user click)
  if (listRes.status === 200) {
    try {
      const users = JSON.parse(listRes.body).data;
      if (users && users.length > 0) {
        const userId = users[0].id;
        const detailRes = http.get(
          `${baseUrl}/api/users/${userId}`,
          { headers: HEADERS, tags: { name: 'user-detail' } }
        );

        check(detailRes, {
          'detail status 200': (r) => r.status === 200,
          'detail has id': (r) => {
            try { return JSON.parse(r.body).id === userId; } catch(e) { return false; }
          },
        });
      }
    } catch(e) {
      console.error('Failed to parse user list:', e.message);
    }
  }

  sleep(2); // Think time before next iteration
}

// ─── Teardown (runs once after test) ─────────────────────────────────────────
export function teardown(data) {
  console.log('Load test complete. Cleaning up.');
}
```

### 2.2 Environment-Specific Config Override

```javascript
// config/staging.js
export const stagingConfig = {
  BASE_URL: 'https://api.staging.example.com',
  stages: [
    { duration: '1m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<300'], // relaxed for staging
    'http_req_failed': ['rate<0.02'],
  },
};

// config/production-canary.js
export const productionCanaryConfig = {
  BASE_URL: 'https://api.example.com',
  stages: [
    { duration: '2m', target: 10 },   // Very conservative for prod canary
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'],
    'http_req_failed': ['rate<0.001'],  // stricter for production
  },
};
```

### 2.3 k6 Scenario-Based Config (Advanced)

```javascript
export const options = {
  scenarios: {
    // Scenario 1: Constant arrival rate (simulates real traffic)
    constant_arrival: {
      executor: 'constant-arrival-rate',
      rate: 100,         // 100 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 150,
    },

    // Scenario 2: Ramping VUs (simulates growing user base)
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      startTime: '5m',  // Start after constant_arrival ends
    },

    // Scenario 3: Spike test (run separately)
    spike: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 500 },  // Instant spike to 500 VUs
        { duration: '1m', target: 500 },
        { duration: '10s', target: 0 },
      ],
      startTime: '12m',  // Start after ramp_up ends
    },
  },
};
```

### 2.4 Running k6

```bash
# Basic run
k6 run load-test.js

# With environment variables
k6 run \
  --env BASE_URL=https://api.staging.example.com \
  --env AUTH_TOKEN=eyJhbGc... \
  --env ENVIRONMENT=staging \
  load-test.js

# Output to JSON for programmatic analysis
k6 run --out json=results/load-test-$(date +%Y%m%d-%H%M%S).json load-test.js

# Output to InfluxDB (for Grafana real-time dashboard)
k6 run --out influxdb=http://localhost:8086/k6 load-test.js

# Dry run (validate script without sending traffic)
k6 run --dry-run load-test.js

# Soak test (override stages)
k6 run --stage 2m:50,30m:50,1m:0 load-test.js
```

---

## Part 3: Artillery YAML Config Template

```yaml
# artillery-config.yml

config:
  target: "https://api.staging.example.com"
  
  # Phases define load pattern
  phases:
    - name: "Warm-up"
      duration: 60        # seconds
      arrivalRate: 5      # new users per second
      
    - name: "Ramp-up"
      duration: 120
      arrivalRate: 5
      rampTo: 50          # ramp from 5 to 50 new users/sec over 2 min
      
    - name: "Peak load"
      duration: 300
      arrivalRate: 50
      
    - name: "Stress test"
      duration: 120
      arrivalRate: 50
      rampTo: 100         # push to 2× target
      
    - name: "Ramp-down"
      duration: 60
      arrivalRate: 100
      rampTo: 0

  # Default HTTP settings
  http:
    timeout: 10           # request timeout in seconds
    pool: 50              # connection pool size
    
  # Default headers for all requests
  defaults:
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer {{ $env.AUTH_TOKEN }}"
      Accept: "application/json"

  # Plugins
  plugins:
    expect: {}            # Enable response assertion plugin
    
  # Threshold configuration
  ensure:
    p95: 200              # p95 must be < 200ms
    p99: 500              # p99 must be < 500ms
    maxErrorRate: 1       # error rate must be < 1%

# Scenarios define the request flows
scenarios:
  - name: "Browse users"
    weight: 40            # 40% of virtual users run this scenario
    flow:
      - get:
          url: "/api/users?status=active&page=1&limit=20"
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: "data"
          capture:
            - json: "$.data[0].id"
              as: "firstUserId"
              
      - think: 1          # 1 second pause
      
      - get:
          url: "/api/users/{{ firstUserId }}"
          ifTrue: "firstUserId"
          expect:
            - statusCode: 200

  - name: "Create order"
    weight: 20            # 20% of virtual users
    flow:
      - post:
          url: "/api/orders"
          json:
            product_id: "{{ $randomString() }}"
            quantity: "{{ $randomInt(1, 5) }}"
            user_id: "user-test-001"
          expect:
            - statusCode: 201
          capture:
            - json: "$.id"
              as: "orderId"
              
      - think: 2
      
      - get:
          url: "/api/orders/{{ orderId }}"
          expect:
            - statusCode: 200

  - name: "Health check only"
    weight: 40            # 40% just check health (background traffic)
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200
```

**Running Artillery:**
```bash
# Install
npm install -g artillery

# Validate config
artillery validate artillery-config.yml

# Quick test (10-second smoke)
artillery quick --count 10 --num 5 https://api.staging.example.com/api/users

# Full test run
artillery run artillery-config.yml

# With environment variables
AUTH_TOKEN=eyJhbGc... artillery run artillery-config.yml

# Generate HTML report
artillery run --output results/report.json artillery-config.yml
artillery report results/report.json  # Opens HTML report in browser
```

---

## Part 4: Locust Scenario Design Pattern

```python
# locustfile.py
import random
import json
from locust import HttpUser, TaskSet, task, between, events
from locust.contrib.fasthttp import FastHttpUser

class UserBrowsingTasks(TaskSet):
    """Simulates a user browsing the platform."""
    
    def on_start(self):
        """Login before starting tasks."""
        response = self.client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test-password"
        })
        if response.status_code == 200:
            self.token = response.json().get("token")
        else:
            self.token = None
    
    @task(5)  # weight: 5x more likely to be chosen than tasks with weight 1
    def list_users(self):
        """Most common action: listing users."""
        page = random.randint(1, 5)
        with self.client.get(
            f"/api/users?status=active&page={page}&limit=20",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/users (list)",  # Group in reports under this name
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if not isinstance(data.get("data"), list):
                    response.failure("Response missing 'data' array")
                else:
                    response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(3)
    def view_user_detail(self):
        """View a specific user profile."""
        user_id = f"user-{random.randint(1, 1000):04d}"
        with self.client.get(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/users/:id (detail)",
            catch_response=True
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            else:
                response.failure(f"Unexpected status {response.status_code}")
    
    @task(1)
    def create_order(self):
        """Create an order (less frequent, higher impact)."""
        with self.client.post(
            "/api/orders",
            json={
                "product_id": f"product-{random.randint(1, 100)}",
                "quantity": random.randint(1, 5),
            },
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/orders (create)",
            catch_response=True
        ) as response:
            if response.status_code == 201:
                response.success()
            else:
                response.failure(f"Create order failed: {response.status_code}")

    @task(1)
    def check_health(self):
        """Simulate health check traffic."""
        self.client.get("/health", name="/health")


class ApiUser(FastHttpUser):
    """Virtual user class. Uses FastHttpUser for high concurrency."""
    tasks = [UserBrowsingTasks]
    wait_time = between(1, 3)  # Random wait 1-3 seconds between tasks
    host = "https://api.staging.example.com"


# ─── Event hooks for custom reporting ─────────────────────────────────────────
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, response, context, exception, **kwargs):
    if exception:
        print(f"Request failed: {name} - {exception}")
    elif response_time > 500:
        print(f"Slow request: {name} took {response_time:.0f}ms")
```

**Running Locust:**
```bash
# Install
pip install locust

# Web UI mode (recommended for interactive testing)
locust -f locustfile.py
# Open http://localhost:8089
# Set: Number of users = 100, Spawn rate = 10/sec, Host = https://api.staging.example.com

# Headless mode (for CI)
locust -f locustfile.py \
  --headless \
  --users 100 \
  --spawn-rate 10 \
  --run-time 10m \
  --host https://api.staging.example.com \
  --csv results/locust \
  --only-summary

# Results: locust_stats.csv, locust_failures.csv, locust_stats_history.csv
```

---

## Part 5: Ramp-Up Strategy by Test Type

| Test Type | Ramp-up | Peak | Ramp-down | Notes |
|-----------|---------|------|-----------|-------|
| Smoke | None | 1 VU, 1 min | None | No ramp needed at 1 VU |
| Load | 2 min | 5-30 min | 1 min | Standard for daily regression |
| Stress | 3 min | 10 min | 2 min | Observe degradation behavior |
| Soak | 2 min | 30-120 min | 2 min | Memory/connection leak detection |
| Spike | 0 (instant) | 2 min | 0 (instant) | Test resilience to sudden burst |
| Breakpoint | Linear over 30 min | Until failure | N/A | Step-increase until system breaks |

---

## Part 6: Go/No-Go Criteria by Percentile

### Pass criteria (all must be met)

| Percentile | Web API | Internal Service | Real-Time | Batch Job |
|-----------|---------|-----------------|-----------|-----------|
| p50 | ≤ 50 ms | ≤ 20 ms | ≤ 10 ms | ≤ 1 s |
| p95 | ≤ 200 ms | ≤ 100 ms | ≤ 50 ms | ≤ 10 s |
| p99 | ≤ 500 ms | ≤ 300 ms | ≤ 100 ms | ≤ 30 s |
| Error rate | < 0.1% | < 0.5% | < 0.01% | < 1% |
| Throughput | ≥ SLO target | ≥ SLO target | ≥ SLO target | ≥ SLO target |

**Decision**: If ANY criterion fails → FAIL. Fix before proceeding to production.

---

## Part 7: Result Interpretation Guide

### Reading k6 Output

```
scenarios: (100.00%) 1 scenario, 100 max VUs, 10m30s max duration
default: 100 looping VUs for 10m0s (gracefulStop: 30s)

✗ http_req_duration.............: avg=145ms  min=12ms   med=89ms   max=2.3s  p(90)=312ms p(95)=456ms ← FAIL (> 200ms)
✓ http_req_failed...............: 0.23%  ✓ 4567  ✗ 11
  http_reqs......................: 4578   7.63/s

Interpretation:
- p95=456ms → SLA breach. This FAILS the p(95)<200 threshold.
- Error rate=0.23% → PASSES the rate<0.01 (1%) threshold.
- Throughput=7.63 RPS → May be too low. Compare to required RPS.
- max=2.3s → Some requests are very slow. Check outliers.
```

### Reading Artillery Output

```
Summary report @ 14:35:23(+0000)
  Scenarios launched: 5000
  Scenarios completed: 4998
  Requests completed: 14994
  Mean response/sec: 49.98
  Response time (msec):
    min: 12
    max: 3421
    median: 95           ← p50 = 95ms ✅ 
    p95: 287             ← p95 = 287ms ❌ (> 200ms SLA)
    p99: 645             ← p99 = 645ms ❌ (> 500ms SLA)
  Scenario counts:
    Browse users: 2002 (40%)
    Create order: 1001 (20%)
    Health check only: 1997 (40%)
  Codes:
    200: 9997
    201: 998
    500: 12             ← 12 server errors (0.08% error rate) ✅
```

### Common Result Patterns and Their Meanings

| Pattern | Meaning | Action |
|---------|---------|--------|
| p95 >> p50 (large gap) | Outlier requests (occasional slow requests) | Profile the slow-path code branch |
| High p99, low p95 | Long tail (extreme outliers only) | Investigate timeouts, GC pauses |
| Error rate spikes at peak | Concurrency limit hit | Check connection pool, thread pool, rate limiter |
| Latency increases over test duration | Memory leak or connection accumulation | Run soak test; take memory snapshots |
| Throughput plateaus before concurrency does | Bottleneck upstream (DB, external API) | Profile dependencies |
| Max latency >> p99 | Extreme outliers (network timeout?) | Check for TCP retransmits, DNS issues |
