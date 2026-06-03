# Visual Project Graph

## Harness Relationship Map

```mermaid
flowchart LR
  manifest[".codex-plugin/plugin.json"] --> skills[".codex/skills/*"]
  package["package.json"] --> cli["bin/genesis-harness.js"]
  package --> verify["scripts/verify.sh"]
  package --> evals["scripts/run-evals.sh"]
  cli --> install["install / postinstall"]
  cli --> hooks["setup-hooks"]
  hooks --> docsgate["genesis-harness docs-gate"]
  docsgate --> docsync["check-docs-sync.sh"]
  docsgate --> specsync["check-spec-changelog.sh"]
  skills --> contracts["contracts/"]
  skills --> fixtures["fixtures/"]
  skills --> tests["tests/ + playwright/"]
  skills --> memory[".codebase/"]
  verify --> skills
  verify --> contracts
  verify --> fixtures
  verify --> memory
  evals --> install
  evals --> cli
  evals --> unit["tests/unit/*.test.js"]
  evals --> integration["tests/integration/*.test.js"]
  evals --> pack["npm pack smoke"]
```

## Skill Workflow Relationships

```mermaid
flowchart TD
  harness["genesis-harness"] --> planning["genesis-planning"]
  harness --> research["genesis-research-first"]
  planning --> architecture["genesis-architecture"]
  planning --> api["genesis-api-contract"]
  planning --> design["genesis-design-spec"]
  api --> apisync["genesis-api-sync"]
  design --> ui["genesis-ui-ux-test"]
  api --> specimpact["spec-impact-engine"]
  specimpact --> specprop["genesis-spec-propagation"]
  specprop --> docs["genesis-docs-automation"]
  ui --> verifybefore["genesis-verification-before-completion"]
  apisync --> verifybefore
  docs --> verifybefore
  verifybefore --> release["genesis-release"]
  harness --> memorymap["genesis-codebase-map"]
  harness --> observability["genesis-observability-automation"]
```

## Code Dependency Hints

```mermaid
flowchart TD
  "tests/integration/cli-smoke.test.js" --> "assert"
  "tests/integration/cli-smoke.test.js" --> "fs"
  "tests/integration/cli-smoke.test.js" --> "os"
  "tests/integration/cli-smoke.test.js" --> "path"
  "tests/integration/cli-smoke.test.js" --> "child_process"
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

## .planning/ROADMAP.md Derived Feature Status

```mermaid
graph TD
  classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px;
  classDef inprogress fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
  classDef pending fill:#e2e3e5,stroke:#6c757d,stroke-width:2px;
  subgraph Role_0 ["Role: User"]
    Task0["Roadmap task 0"]
    class Task0 completed;
    Task1["Roadmap task 1"]
    class Task1 inprogress;
    Task2["Roadmap task 2"]
    class Task2 pending;
  end
  subgraph Role_1 ["Role: Admin"]
    Task3["Roadmap task 3"]
    class Task3 completed;
    Task4["Roadmap task 4"]
    class Task4 pending;
    Task5["Roadmap task 5"]
    class Task5 inprogress;
  end
  subgraph Role_2 ["Role: Analytics"]
    Task6["Roadmap task 6"]
    class Task6 pending;
    Task7["Roadmap task 7"]
    class Task7 pending;
    Task8["Roadmap task 8"]
    class Task8 inprogress;
  end
  Task0 --> Task1
  Task0 --> Task2
  Task2 --> Task4
  Task2 --> Task5
  Task4 --> Task6
```

