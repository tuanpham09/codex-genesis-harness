# Profiling Playbook

This playbook provides step-by-step profiling instructions for identifying performance bottlenecks across languages and bottleneck types. Follow the decision tree in Phase 2 of the SKILL.md to select the right profiling approach, then use the corresponding section here.

---

## Decision Tree: Select Your Profiling Approach

```
Is CPU > 70% during test?
├── YES → Go to Section 1 (CPU Profiling) for your language
└── NO  → Is memory growing unboundedly over time?
    ├── YES → Go to Section 2 (Memory Profiling)
    └── NO  → Is DB query time > 50% of response time?
        ├── YES → Go to Section 3 (Database Query Analysis)
        └── NO  → Is network latency or connection time high?
            ├── YES → Go to Section 4 (Network I/O Profiling)
            └── NO  → Go to Section 5 (Async Call Stack Tracing)
```

---

## Section 1: CPU Profiling

### 1.1 Node.js CPU Profiling

#### Method A: clinic.js (recommended for web services)

clinic.js produces beautiful flame graphs and auto-detects common Node.js issues.

**Installation:**
```bash
npm install -g clinic
```

**Profile a running server under load:**
```bash
# Terminal 1: Start server under clinic
clinic doctor -- node server.js

# Terminal 2: Apply load while profiling
k6 run --vus 50 --duration 60s load-test.js

# Stop server (Ctrl+C). clinic auto-generates report.
# Open the generated HTML flame graph in browser.
```

**Interpret the output:**
- Red bars = CPU-intensive functions (hot path candidates).
- Blue bars = I/O wait time.
- Look for user-land code (your code) at the top of red stacks, not Node.js internals.
- clinic doctor will show a recommendation panel: "I/O bottleneck detected", "Event loop blocked", etc.

**Profile a specific endpoint:**
```bash
# Use autocannon to generate targeted load
clinic flame -- node server.js &
SERVER_PID=$!
autocannon -c 50 -d 30 http://localhost:3000/api/users
kill $SERVER_PID
```

#### Method B: V8 --prof flag (for precise hot function identification)

```bash
# Run with V8 profiler
node --prof server.js &
SERVER_PID=$!

# Apply load
k6 run --vus 50 --duration 60s load-test.js

# Stop server
kill $SERVER_PID

# Process the profile (creates isolate-*.log files)
node --prof-process isolate-*.log > processed-profile.txt

# Read the output: look for "[Summary]" section
# "ticks" = CPU samples. High tick count = hot path.
grep -A 50 "\[Summary\]" processed-profile.txt
```

**Read the profile output:**
```
Statistical profiling result from isolate-0x...log (1234 ticks)

[Summary]:
   ticks  total  nonlib   name
    456   37.0%  42.1%   LazyCompile: *parseJSON node:internal/deps/undici/...
    234   19.0%  21.6%   LazyCompile: *serialize /app/src/utils/serializer.js:45
    123   10.0%  11.4%   LazyCompile: *getUser /app/src/routes/users.js:23
```

In this example, `serialize` in `serializer.js:45` is your hot path — it's taking 19% of all CPU time.

#### Method C: 0x (flame graph only, minimal overhead)

```bash
npm install -g 0x
0x -- node server.js
# Apply load, then Ctrl+C
# Opens flamegraph.html automatically
```

### 1.2 Python CPU Profiling

#### Method A: py-spy (production-safe, minimal overhead)

py-spy attaches to a running process without modifying the code — safe to use in staging under real load.

**Installation:**
```bash
pip install py-spy
```

**Profile a running process:**
```bash
# Find the PID of your Python service
ps aux | grep python

# Record a flame graph (60 seconds under load)
sudo py-spy record -o flamegraph.svg --pid 12345 --duration 60

# Open flamegraph.svg in a browser
# Wide frames = time spent in that function
# Look for your application code (not stdlib) that is wide
```

**Profile with top-like live view:**
```bash
sudo py-spy top --pid 12345
# Updates every 1 second. Shows which functions are consuming CPU right now.
```

#### Method B: cProfile (for offline/script profiling)

```python
# Wrap the slow function or script:
import cProfile
import pstats
import io

pr = cProfile.Profile()
pr.enable()

# --- your code here ---
result = slow_function(input_data)
# --- end of code ---

pr.disable()

s = io.StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
ps.print_stats(20)  # top 20 functions by cumulative time
print(s.getvalue())
```

**Run and analyze:**
```bash
python -m cProfile -o profile.out your_script.py
python -m pstats profile.out
# In pstats interactive mode:
# sort cumtime    # sort by cumulative time
# stats 20        # show top 20
```

#### Method C: line_profiler (line-by-line timing)

```bash
pip install line_profiler
```

```python
# Decorate the specific function you want to profile:
@profile
def slow_function(data):
    result = []
    for item in data:           # Line A
        processed = transform(item)  # Line B — this is the hot line
        result.append(processed)
    return result
```

```bash
kernprof -l -v your_script.py
# Output shows time per line:
# Line A: 1.2 ms total (10 hits)
# Line B: 8.9 ms total (10 hits) ← hot line
```

### 1.3 Go CPU Profiling with pprof

#### Method A: HTTP pprof endpoint (for running services)

Add to your service (already included if using `net/http/pprof`):
```go
import _ "net/http/pprof"

// In main():
go func() {
    log.Println(http.ListenAndServe(":6060", nil))
}()
```

**Capture and analyze:**
```bash
# Apply load first (30+ seconds)
k6 run --vus 50 --duration 60s load-test.js &

# Capture 30-second CPU profile
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30

# Browser opens at localhost:8080 with interactive flame graph
# Navigate to "Flame Graph" view
# Look for wide red bars (your hot functions)
```

**Command-line analysis:**
```bash
# Download profile
curl -o cpu.pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Analyze in interactive mode
go tool pprof cpu.pprof
# Commands in pprof:
(pprof) top 10          # Top 10 functions by CPU
(pprof) list ParseJSON  # Show annotated source for ParseJSON
(pprof) web             # Open flame graph in browser
```

#### Method B: Unit test CPU benchmark

```go
func BenchmarkSlowFunction(b *testing.B) {
    data := generateTestData()
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        SlowFunction(data)
    }
}
```

```bash
# Run benchmark with CPU profile
go test -bench=BenchmarkSlowFunction -cpuprofile=cpu.pprof ./...
go tool pprof -http=:8080 cpu.pprof
```

---

## Section 2: Memory Profiling

### 2.1 Node.js Memory Leak Detection

#### Protocol: Heap Snapshot Comparison

Memory leaks are identified by comparing heap snapshots at regular intervals and looking for object counts that grow monotonically.

**Step 1: Enable heap snapshot capture**
```javascript
// Add to your service (NOT in production — introduces overhead):
const v8 = require('v8');
const fs = require('fs');

function takeHeapSnapshot(label) {
  const snapshotStream = v8.writeHeapSnapshot();
  fs.renameSync(snapshotStream, `heap-${label}-${Date.now()}.heapsnapshot`);
  console.log(`Heap snapshot written: heap-${label}`);
}

// Schedule snapshots every 5 minutes
setInterval(() => takeHeapSnapshot('t' + (Date.now() / 60000 | 0)), 5 * 60 * 1000);
```

**Step 2: Apply steady load for 15+ minutes**
```bash
k6 run --vus 30 --duration 15m steady-load.js
```

**Step 3: Collect snapshots at t=0, t=5min, t=10min, t=15min**
You should have: `heap-t0.heapsnapshot`, `heap-t5.heapsnapshot`, `heap-t10.heapsnapshot`, `heap-t15.heapsnapshot`

**Step 4: Analyze in Chrome DevTools**
1. Open Chrome → F12 → Memory tab.
2. Load each `.heapsnapshot` file via "Load" button.
3. Switch to "Comparison" view between snapshots.
4. Sort by "Size Delta" descending.
5. Objects growing monotonically are leak candidates.

**Interpreting the comparison:**
```
Object         | t0 count | t5 count | t10 count | t15 count | Delta
---------------|----------|----------|-----------|-----------|-------
EventEmitter   | 150      | 156      | 163       | 171       | +21   ← growing
Promise        | 200      | 198      | 201       | 199       | stable
UserSession    | 450      | 890      | 1340      | 1800      | +1350 ← LEAK
Buffer         | 80       | 82       | 81        | 80        | stable
```

`UserSession` growing from 450 to 1800 objects over 15 minutes indicates sessions are not being cleaned up.

#### clinic.js Heap Profiling
```bash
clinic heapprofile -- node server.js
# Apply load
# Ctrl+C → generates heap profile HTML
# Shows allocation flame graph: which code paths are allocating memory
```

### 2.2 Python Memory Profiling

```bash
pip install memory-profiler tracemalloc
```

**tracemalloc (built-in, no install needed):**
```python
import tracemalloc
tracemalloc.start()

# --- run the suspect code ---
result = process_data(large_dataset)
# ---

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')
for stat in top_stats[:10]:
    print(stat)  # Shows: filename:line_number: size_kb KiB (count blocks)
```

**memory_profiler decorator:**
```python
from memory_profiler import profile

@profile
def suspect_function(data):
    # memory usage shown line by line
    result = [transform(x) for x in data]  # ← if this line shows big growth
    return result
```

### 2.3 Go Memory Profiling

```bash
# Capture heap profile
curl -o heap.pprof http://localhost:6060/debug/pprof/heap

# Analyze
go tool pprof -http=:8080 heap.pprof
# Navigate to "Flame Graph" and switch to "alloc_space" view
# Look for your code allocating large amounts of memory
```

**Goroutine leak detection:**
```bash
# Check goroutine count over time
curl http://localhost:6060/debug/pprof/goroutine?debug=1 | head -50
# If goroutine count grows over time, you have a goroutine leak
# The output shows the stack trace of each goroutine — look for stuck goroutines
```

---

## Section 3: Database Query Analysis

### 3.1 PostgreSQL: EXPLAIN ANALYZE

**Step 1: Identify slow queries from the slow query log**
```sql
-- Enable slow query logging (in postgresql.conf or via ALTER SYSTEM):
ALTER SYSTEM SET log_min_duration_statement = '100';  -- log queries > 100ms
SELECT pg_reload_conf();

-- Or use pg_stat_statements to find the worst queries:
SELECT 
  query,
  calls,
  total_time,
  total_time / calls AS avg_time_ms,
  rows / calls AS avg_rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

**Step 2: Run EXPLAIN ANALYZE on the worst query**
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, p.avatar_url, p.bio
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.tenant_id = $1
  AND u.status = 'active'
ORDER BY u.created_at DESC
LIMIT 50;
```

**Step 3: Interpret the output**
```
Limit  (cost=1234.5..1235.0 rows=50 width=240) (actual time=456.7..456.9 rows=50 loops=1)
  -> Sort  (cost=1234.5..1259.5 rows=10000 width=240) (actual time=456.6..456.7 rows=50 loops=1)
       Sort Key: u.created_at DESC
       Sort Method: external merge  Disk: 8192kB        ← PROBLEM: sorting to disk
       -> Hash Join  (cost=500.0..800.0 rows=10000 width=240) (actual time=120.0..300.0 rows=10000 loops=1)
            Hash Cond: (p.user_id = u.id)
            -> Seq Scan on profiles p  ...              ← PROBLEM: sequential scan
            -> Seq Scan on users u  ...                 ← PROBLEM: sequential scan
```

**Red flags in EXPLAIN output:**
- `Seq Scan` on large tables → Missing index. Add index on filter/join columns.
- `Sort Method: external merge Disk:` → Sort overflowing to disk. Add index on sort column or increase `work_mem`.
- `Rows Removed by Filter:` very high → Index not selective enough or query not using best index.
- `Loops:` > 1 on expensive steps → N+1 problem. Rewrite as a single JOIN.
- `actual time` much higher than `cost` estimate → Stale statistics. Run `ANALYZE tablename`.

**Step 4: Fix and verify**
```sql
-- Add composite index
CREATE INDEX CONCURRENTLY idx_users_tenant_status_created 
ON users(tenant_id, status, created_at DESC);

-- Re-run EXPLAIN ANALYZE and confirm:
-- Seq Scan changed to Index Scan
-- actual time decreased significantly
```

### 3.2 MySQL: EXPLAIN + Slow Query Log

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- log queries > 100ms
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- Analyze slow query
EXPLAIN FORMAT=JSON
SELECT * FROM users 
WHERE tenant_id = 1 AND status = 'active'
ORDER BY created_at DESC LIMIT 50;

-- Check for missing indexes (type = ALL = full table scan)
-- key = NULL means no index used
-- rows = high number means scanning many rows

-- Add index
ALTER TABLE users ADD INDEX idx_tenant_status_created (tenant_id, status, created_at);
```

### 3.3 MongoDB: Explain and Index Analysis

```javascript
// Find slow queries using explain
db.users.find({
  tenant_id: ObjectId("..."),
  status: "active"
}).sort({created_at: -1}).limit(50).explain("executionStats")

// Look for in executionStats:
// totalDocsExamined >> nReturned → inefficient scan
// executionTimeMillis → total query time
// winningPlan.stage = "COLLSCAN" → no index used (bad)
// winningPlan.stage = "IXSCAN" → index used (good)

// Add compound index
db.users.createIndex(
  { tenant_id: 1, status: 1, created_at: -1 },
  { background: true }  // non-blocking in older MongoDB; use createIndex in 4.2+
)
```

---

## Section 4: Network I/O Bottleneck Detection

### 4.1 Connection Pool Analysis

**Node.js (using pg pool):**
```javascript
const { Pool } = require('pg');
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });

// Instrument pool events
pool.on('connect', () => metrics.increment('db.connections.new'));
pool.on('acquire', () => metrics.increment('db.connections.acquire'));
pool.on('remove', () => metrics.increment('db.connections.remove'));

// Log when pool is exhausted (waiters > 0)
setInterval(() => {
  const stats = pool.totalCount + ' total, ' + pool.idleCount + ' idle, ' + pool.waitingCount + ' waiting';
  if (pool.waitingCount > 0) console.warn('Pool pressure: ' + stats);
}, 5000);
```

If `waitingCount` is consistently > 0 under load: the pool is a bottleneck. Solutions:
1. Increase pool size (if DB can handle more connections).
2. Reduce query duration (so connections are released sooner).
3. Add read replicas and route reads to them (separate pool).

### 4.2 TLS Handshake Overhead

```bash
# Measure TLS overhead vs. plain HTTP
# Time a single HTTPS request showing breakdown
curl -w "dns: %{time_namelookup}s | connect: %{time_connect}s | tls: %{time_appconnect}s | ttfb: %{time_starttransfer}s | total: %{time_total}s\n" \
  -o /dev/null -s https://api.example.com/api/health

# High time_appconnect = TLS handshake is expensive
# Fix: Enable TLS session resumption / HTTP/2 connection reuse
```

### 4.3 DNS Resolution Profiling

```bash
# Measure DNS resolution time
time dig api.example.com

# If DNS is slow (> 50ms), solutions:
# 1. Use internal DNS (private hosted zone)
# 2. Cache DNS responses in service (respect TTL)
# 3. Use connection keep-alive (avoid repeated DNS per request)
```

---

## Section 5: Real Example — Profiling a Slow REST API Endpoint

**Scenario**: `GET /api/users` is taking 450 ms (p95). SLA is 200 ms. Users are complaining.

### Step 1: Capture baseline
```bash
k6 run --vus 50 --duration 5m - <<EOF
import http from 'k6/http';
export default function() {
  http.get('https://api.staging.example.com/api/users', {
    headers: { 'Authorization': 'Bearer test-token' }
  });
}
export let options = { thresholds: { 'http_req_duration': ['p(95)<200'] } };
EOF
# Result: p95=450ms (FAIL — 2.25× over SLA)
```

### Step 2: CPU profile (30 seconds under load)
```bash
clinic doctor -- node server.js &
k6 run --vus 30 --duration 30s load-test.js
# Result: clinic shows "I/O bottleneck" — not CPU bound
```

### Step 3: Database analysis
```sql
SELECT query, calls, total_time/calls as avg_ms
FROM pg_stat_statements ORDER BY avg_ms DESC LIMIT 5;
-- Result: "SELECT * FROM users WHERE tenant_id=$1" → 380ms avg
-- This query accounts for 84% of response time!
```

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE tenant_id = 1;
-- Result: Seq Scan on users (cost=0..45000) actual time=380ms
-- Table has 500,000 rows. No index on tenant_id!
```

### Step 4: Fix
```sql
CREATE INDEX CONCURRENTLY idx_users_tenant_id ON users(tenant_id);
-- Also fix N+1: application was calling SELECT * FROM profiles WHERE user_id=$1 for each user
-- Fix: JOIN profiles in the main query
```

```javascript
// Before (N+1):
const users = await db.query('SELECT * FROM users WHERE tenant_id=$1', [tenantId]);
for (const user of users.rows) {
  user.profile = await db.query('SELECT * FROM profiles WHERE user_id=$1', [user.id]);
  // → 1 + N queries!
}

// After (single JOIN):
const users = await db.query(`
  SELECT u.*, p.avatar_url, p.bio
  FROM users u
  LEFT JOIN profiles p ON u.id = p.user_id
  WHERE u.tenant_id = $1
`, [tenantId]);
// → 1 query total
```

### Step 5: Verify
```bash
k6 run --vus 50 --duration 5m load-test.js
# Result: p95=42ms (PASS — 79% improvement, well under 200ms SLA)
```

**Summary of findings:**
- Root cause: Missing index on `users.tenant_id` + N+1 query pattern.
- Fix: Added index (1 migration), fixed N+1 (3 lines of code change).
- Before: p95=450 ms. After: p95=42 ms. **Improvement: 90.7%**.
- SLA compliance: ✅ PASS (42ms vs 200ms SLA).
