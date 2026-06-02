# Visual Project Graph

## Code Architecture (Dependency Graph)

```mermaid
graph TD
  "tests/unit/contract_integrity_gate.test.js" --> "assert"
  "tests/unit/contract_integrity_gate.test.js" --> "fs"
  "tests/unit/contract_integrity_gate.test.js" --> "path"
  "tests/unit/contract_integrity_gate.test.js" --> "child_process"
  "tests/unit/healing_telemetry.test.js" --> "assert"
  "tests/unit/healing_telemetry.test.js" --> "fs"
  "tests/unit/healing_telemetry.test.js" --> "path"
  "tests/unit/healing_telemetry.test.js" --> "child_process"
  "tests/unit/prompt_sentinel.test.js" --> "assert"
  "tests/unit/prompt_sentinel.test.js" --> "fs"
  "tests/unit/prompt_sentinel.test.js" --> "path"
  "tests/unit/prompt_sentinel.test.js" --> "child_process"
  "tests/unit/spec_visual_sync.test.js" --> "assert"
  "tests/unit/spec_visual_sync.test.js" --> "fs"
  "tests/unit/spec_visual_sync.test.js" --> "path"
  "tests/unit/spec_visual_sync.test.js" --> "child_process"
  "tests/unit/test_generator.test.js" --> "assert"
  "tests/unit/test_generator.test.js" --> "fs"
  "tests/unit/test_generator.test.js" --> "path"
  "tests/unit/test_generator.test.js" --> "child_process"
  "bin/genesis-harness.js" --> "fs"
  "bin/genesis-harness.js" --> "path"
  "bin/genesis-harness.js" --> "child_process"
  "bin/genesis-harness.js" --> "@babel/parser"
  "bin/genesis-harness.js" --> "@babel/traverse"
  "bin/genesis-harness.js" --> "child_process"
```

## Project Roadmap & Features

```mermaid
graph TD
  classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px;
  classDef inprogress fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
  classDef pending fill:#e2e3e5,stroke:#6c757d,stroke-width:2px;
  subgraph Role_0 ["Role: User"]
    Task0["Đăng nhập<br><i>(src/auth.js)</i>"]
    class Task0 completed;
    Task1["Cập nhật Profile<br><i>(src/auth.js, src/db.js)</i>"]
    class Task1 inprogress;
    Task2["Mua hàng"]
    class Task2 pending;
  end
  subgraph Role_1 ["Role: Admin"]
    Task3["Quản lý User"]
    class Task3 completed;
    Task4["Xem thống kê doanh thu"]
    class Task4 pending;
    Task5["Xử lý đơn hàng"]
    class Task5 inprogress;
  end
  subgraph Role_2 ["Role: Analytics"]
    Task6["Xuất báo cáo Excel"]
    class Task6 pending;
    Task7["Tích hợp Google Analytics"]
    class Task7 pending;
    Task8["Dashboard Real-time"]
    class Task8 inprogress;
  end
  Task0 --> Task1
  Task0 --> Task2
  Task2 --> Task4
  Task2 --> Task5
  Task4 --> Task6
```

