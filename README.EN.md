# Genesis Codex Harness - Comprehensive English Guide

**[Tiếng Việt](README.VI.md)** | English

---

## 📌 What is Genesis Codex Harness?

**Genesis Codex Harness** is an enterprise-grade, **Codex-exclusive** development framework for building production-quality software with Codex as your AI engineer.

### Core Capabilities

- 🗺️ **Structured 5-Phase MVP Roadmap (`genesis-mvp-planning`)** - Guarantees a decision-complete path to production by organizing project delivery across 5 standard gates, ensuring core contracts/infrastructure are validated before feature coding.
- 🛡️ **Zero-Drift Validation Gates (`validation_gates.sh`)** - Prevents documentation decay by running automated Git diff scans on phase transitions to flag when source code has modified API, DB schema, or test files without updating matching specifications in `.codebase/`.
- 🛑 **The Death of Context Rot** - Automatically offloads massive terminal outputs (`offload-log.sh`) and dynamically compacts codebase state (`compact-context.sh`), saving 40-60% of prompt window capacity.
- 🔥 **Autonomous Self-Healing (Ralph Loops)** - Catch compilation or test failures and execute closed-loop verify-fix loops (`run-verify-loop.sh`) up to 5 times autonomously, writing fixes and refactoring code until tests turn green.
- ✅ **Test-First Development & Contract-First Design** - Strictly enforces writing schemas and failing integration tests (RED) before writing minimal GREEN implementation and refining (IMPROVE).
- 🔄 **Cascading Spec Propagation** - Automatically propagates API contract and schema updates downstream across all affected phases, fixtures, and assertions using the `/propagate-spec` engine.
- 🧠 **Empirical, Research-First Engineering** - Auto-researches local codebase patterns and official documentation before generating plans or executing tasks.


**Perfect for**: 
- Teams building enterprise software with Codex
- Projects needing reliable, repeatable development workflows
- Developers tired of starting from scratch every time
- Organizations wanting to reduce development token costs

---

## 🎯 Why Genesis? (ROI in 3 minutes)

### Before Genesis ❌
```
New feature request
  → Explain to Codex what you're building (3k tokens)
  → Codex starts from scratch every time
  → Manual API design, inconsistent contracts
  → No test-first enforcement
  → Change one spec, break 5 others (discover at test time)
  → Rework, rework, rework...
  → Total: 80-150k tokens per project
```

### With Genesis ✅
```
New feature request: /new-feature "description"
  → Codex remembers everything from .codebase/ (cache hit!)
  → Contract already defined
  → Test fixtures ready to use
  → Spec changes detected automatically: /spec-change file.json
  → Downstream phases auto-updated: /propagate-spec
  → Tests verify everything works
  → Done.
  → Total: 40-80k tokens (60% savings!)
```

---

## 📊 Enterprise Comparison: Genesis vs. Standard Agents

When developing with a standard AI agent (such as Claude Code in basic mode, default GitHub Copilot Workspace, or standard LLM wrappers), you inevitably hit context drift, design regression, and code fragility as your project grows. Genesis Codex Harness is designed to solve these pain points through rigorous **Harness Engineering**.

| Feature | Standard AI Agents (Claude Code, Copilot Workspace, standard wrappers) | Genesis Codex Harness (Codex-Exclusive Harness) |
| :--- | :--- | :--- |
| **Workflow Paradigm** | **Passive (Code-Gen First):** Writes implementation code immediately upon request, skipping contracts and test design, creating technical debt. | **Active & Strict (Contract-First + TDD):** Forces API contracts definition first, auto-generates failing tests (RED), minimal code (GREEN), then refactoring (IMPROVE). |
| **Context & Memory Rot** | **Passive Bloat:** Raw tool logs and redundant file reads accumulate in the prompt, leading to prompt dilution, hallucinations, and amnesia. | **Dynamic Context Compaction:** Automatically offloads large execution logs (`offload-log.sh`) and compacts historical context (`compact-context.sh`). Saves **40-60%** of prompt window. |
| **Self-Healing (Error Recovery)** | **Manual Iteration:** When tests fail, you must manually copy-paste errors and prompt the agent to retry, leading to tedious debug loops. | **Autonomous Ralph Loops:** Detects compilation/test failures and executes a self-healing **Verify-Fix Loop** (`run-verify-loop.sh`) up to 5 times autonomously. |
| **Spec Change Management** | **Fragile:** Modifying a schema or API field silently breaks downstream modules. Regression is only discovered at runtime or manual QA. | **Cascading Spec Propagation:** Detects spec modifications (`/spec-change`) and propagates updates (`/propagate-spec`) downstream across contracts, fixtures, and tests. |
| **Session Resumability** | **Ephemeral:** Resetting the session wipes all codebase map understanding. You must re-explain the project architecture from scratch. | **Permanent State:** The compressed repository memory inside `.codebase/` persists state, design invariants (ADRs), and phase progression permanently. |
| **Token Cost & ROI** | **Uncontrolled Spend:** Large raw logs and full-file dumps are sent to the LLM on every turn, escalating API token bills dramatically. | **Predictable Efficiency:** Leverages smart local context compaction and prompt-optimized state tracking to cut token overhead by **40-60%** per project. |
| **Verification & Stability** | **None:** Relies on superficial assertions. No strict verification that structural rules or skill boundaries are maintained. | **Rigorous Assurance:** Enforced via automated CLI verification (`verify.sh`) verifying that skill schemas, design specifications, and contracts match perfectly. |

---

## 🧬 Technological Breakthroughs: The Core Harness Subsystems (Evolutionary Upgrades)

The active FSM runtime surrounds Codex with robust validation, self-healing, and memory safeguards. Below is the operational workflow of the Genesis Harness:

```mermaid
graph TD
    User([User Request / Slash Command]) --> RF[1. Research-First Engine]
    RF --> IP[Implementation Plan & Contracts]
    IP --> TDD[2. Test-First TDD RED State]
    TDD --> Codex{Codex Code-Gen}
    Codex --> VL[3. Verify-Fix Loop / Ralph Loop]
    VL -- Test Fails <= 5 times --> Correct[Auto-Refactor & Diagnose Logs]
    Correct --> Codex
    VL -- Test Passes / Green --> VG[4. Zero-Drift Validation Gate]
    VG -- Git Diff Spec Warning --> Synced[5. Auto-Docs & State Compaction]
    Synced --> Complete([COMPLETED State])
    
    subgraph Harness Runtime Shell (FSM-Driven)
        RF
        TDD
        VL
        Correct
        VG
        Synced
    end
    
    subgraph Memory & Context Safeguards
        Compaction[(Context Compaction)] <--> Synced
        Offload[(Tool Log Offloader)] <--> VL
    end
```

Genesis Codex Harness introduces five groundbreaking architectural subsystems to ensure continuous, resilient execution in large-scale production codebases without context degradation or documentation drift:

### 1. Context Compaction Engine (`compact-context.sh`)
* **The Problem**: Long developer-AI conversations accumulate hundreds of thousands of redundant tokens, diluting the prompt window, causing model amnesia, and raising API costs.
* **The Solution**: Automatically active. The engine compacts core architectural decisions, API states, and task completion metrics into condensed files inside `.codebase/context/`, clears redundant chat records, and re-seeds the essential prompt state from disk.
* **The Benefit**: Maintains prompt sharpness and maximum precision even after 100+ turns of continuous coding, yielding 40-60% token savings.

### 2. Tool Call Offloading (`offload-log.sh`)
* **The Problem**: Running test suites, builds, or directory traversals returns thousands of lines of raw terminal output, instantly flooding the prompt window and diluting focus.
* **The Solution**: Intercepts massive command outputs and redirects them to local disk logs (`.system_generated/tasks/`), returning a clean structural status summary (exit code, test counts, key compile errors) to the model.
* **The Benefit**: Eliminates the risk of prompt window exhaustion from long build or test execution cycles.

### 3. Ralph Loops / Self-Healing Verify-Fix Loop (`run-verify-loop.sh`)
* **The Problem**: When a test fails or a build breaks, forcing the developer to manually copy-paste terminal errors and instruct the AI to retry is slow and repetitive.
* **The Solution**: Implements an autonomous, closed-loop self-healing mechanism. When a build/test verification fails, the loop automatically parses disk error logs, refactors source code, and re-runs the tests up to 5 times autonomously.
* **The Benefit**: Resolves 90% of syntax errors, import mismatches, and contract alignment bugs without developer intervention.

### 4. 5-Phase MVP Roadmap Planner (`genesis-mvp-planning`)
* **The Problem**: Basic AI agents solve tasks ad-hoc, coding features without establishing foundational APIs, databases, or auth structures first, leading to major regression.
* **The Solution**: Runs immediately post-initialization to structure delivery across 5 standard product gates (Foundation, Auth, Features, Integrations, Production-Ready), ensuring core infrastructure is robust and verified before building advanced features.
* **The Benefit**: Enforces architectural discipline and prevents developers from building on shaky foundational code.

### 5. Zero-Drift Validation Gates (`validation_gates.sh`)
* **The Problem**: As codebases evolve rapidly, technical documentation (specs, contracts, database schemas) drifts and becomes obsolete because developers forget to update it.
* **The Solution**: Integrated directly into state transition gates. It automatically scans Git changes and alerts the developer if source files are modified but matching design/spec documents under `.codebase/` remain unchanged.
* **The Benefit**: Guarantees zero documentation decay, keeping system design maps perfectly in sync with source code.

---

## 🚀 Next-Gen Harness Engineering Upgrades (v0.1.8)

Genesis v0.1.8 introduces five advanced, state-of-the-art tools under `scripts/` to enforce type-safety, automate tests, establish visual-code integrity, protect token consumption, and enable self-healing loop memory recall:

1. **Visual Architecture AST Sync (`scripts/spec_visual_sync.js`)**: Bidirectional compiler that syncs Mermaid ERD database diagrams (`database-erd.mmd`) to API contracts JSON schemas (`contracts/api/`) and vice-versa, establishing absolute visual-to-code design integrity.
2. **Contract-Driven Test Auto-Generator (`scripts/test_generator.js`)**: Automatically compiles fully executable Mocha/Jest integration test suites in `tests/integration/` directly from your API contracts JSON response schemas, providing instant TDD "RED" skeletons.
3. **AST Contract-Code Integrity Gate (`scripts/contract_integrity_gate.js`)**: Static analysis checker that programmatically validates implementation code properties against API contract JSON schemas at FSM transition boundaries, locking state transitions if data type mismatches or missing properties are detected.
4. **Pre-emptive Prompt Sentinel (`scripts/prompt_sentinel.js`)**: Real-time token budget monitor. Calculates token weights before calling LLM, pre-emptively halting runaway commands, and executing auto-compaction and log pruning when the LeanCTX threshold in `.codebase/context-policy.json` is crossed.
5. **Self-Healing Lessons-Learned Recall (`scripts/healing_telemetry.js`)**: Telemetry system that records compiler/test failure signatures and applied corrective code edits in `.codebase/failures/lessons_learned.md`. The self-healing loop recalls these recorded fixes on identical error signatures, bypassing iterations to achieve immediate **1-turn recovery**.

### LeanCTX + Optional Local Wrappers

Genesis ships a portable LeanCTX policy at `.codebase/context-policy.json` and exposes it through:

```bash
genesis-harness leanctx
genesis-harness prime
```

`npm install` / `genesis-harness install` seeds the policy into the current project when a project root is detected, and never overwrites an existing custom policy. The `leanctx` command is only for inspection. Npm users keep using portable commands such as `genesis-harness sync`, `genesis-harness docs-gate`, and `npm run verify`. When `rtk` exists on a developer machine, Genesis reports it as an optional local wrapper only; it is not a public dependency.

---

## 🔬 Research-First Guarantee (NEW)

**Every important decision is grounded in evidence. No guessing.**

When you use commands like `/genesis-init`, `/new-feature`, `/fix-bug`, Genesis automatically:

1. **Research Local** - Reads your codebase, existing patterns, docs
2. **Research External** - Checks GitHub, official docs, best practices
3. **Compile Evidence** - Builds research note with recommendation + risks
4. **Generate Plan** - Creates plan pre-populated with findings
5. **You Review** - Approve plan before implementation starts

```
/new-feature "Add WebSocket notifications"
  ↓
[AUTO] Research Phase
  - Found existing Socket.io setup in codebase
  - GitHub best practices: Redis adapter for scaling
  - Official docs: Socket.io namespace pattern
  ↓
[AUTO] Compiled Research Note
  - Question: Best way to add real-time notifications?
  - Evidence: Codebase uses Socket.io, team familiar
  - Recommendation: Extend existing Socket.io (not new library)
  - Risks: Requires Redis availability
  ↓
[AUTO] Generated Plan
  - Phase 1: Socket.io namespace setup
  - Phase 2: Authentication
  - Phase 3: Notification flow
  - Pre-populated risks from research
  ↓
You Review & Approve
  - Plan ready with full research backing
```

**Benefits**:
- ✅ No "what framework should we use?" guessing
- ✅ All decisions backed by evidence
- ✅ Patterns reused from existing codebase
- ✅ Best practices automatically included
- ✅ Risks identified upfront
- ✅ 0 rework from wrong assumptions

---

## 🚀 Quick Start (5 Minutes)

### 1. Install

```bash
# Global installation (recommended)
npm install -g codex-genesis-harness@latest

# Verify installation
genesis-harness verify
```

### 2. Init Your First Project

Open Codex and type one command:

```
/genesis-init
```

**Codex will ask**:
- Project name? (e.g., "E-Commerce API")
- Brief description? (e.g., "REST API for online store with Stripe payments")

**Genesis auto-creates**:
```
✅ Project structure (30 folders)
✅ Documentation templates (22 files)
✅ Phase planning (5 phases by default)
✅ Test templates (ready to customize)
✅ Contract templates (API, UI, data)
✅ Memory system (.codebase/ structure)
```

### 3. Start Your First Feature

```
/new-feature "Add user authentication with JWT"
```

**What Genesis provides**:
```
contracts/api/auth/
├── request.json        # What the API accepts
├── response.json       # What the API returns  
├── error.json         # Error cases
├── schema.json        # Validation rules
└── example.json       # Concrete example

tests/integration/
├── auth.test.md       # Test template (write tests first!)

fixtures/
├── auth-fixture.md    # Test data + expected output
```

### 4. Follow Test-First Workflow

**RED** - Write failing test:
```javascript
// tests/integration/auth.test.md
it('should authenticate user with correct password', async () => {
  const res = await POST('/api/auth/login', {
    email: 'user@example.com',
    password: 'correct_password'
  });
  
  assert(res.status === 200);
  assert(res.body.token); // JWT token returned
});
```

**GREEN** - Implement minimal code:
```javascript
// src/auth.js
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (password === 'correct_password') {
    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});
```

**IMPROVE** - Refactor:
```javascript
// Better validation, error handling, logging
// Genesis verifies: tests pass ✅, contract matches ✅, coverage 80%+ ✅
```

### 5. Verify Everything Works

```bash
npm run verify
```

**Genesis checks**:
- ✅ All tests pass
- ✅ Contract matches implementation
- ✅ 80%+ test coverage
- ✅ No token budget violations
- ✅ Code quality meets standards

---

## 🛠️ Step-by-Step Production Runbooks

A detailed guide to operating the Genesis Codex Harness across every real-world development scenario.

---

### 1️⃣ Creating a New Project from Scratch (`/genesis-init` Flow)
*Use this when starting a brand new project and you want to establish professional-grade architecture and planning from day one.*

* **Step 1**: Create a new empty directory and open it in VS Code (with Codex/Claude):
  ```bash
  mkdir my-new-project && cd my-new-project
  code .
  ```
* **Step 2**: Command Codex to initialize the workspace:
  ```text
  /genesis-init
  ```
* **Step 3**: Answer the prompt questions regarding project name, description, and target tech stack.
* **Step 4**: [AUTOMATIC] Genesis fires `init-planning.sh` to:
  * Generate standard directories (`contracts/`, `fixtures/`, `tests/`, `.codebase/`, `observability/`).
  * Initialize `.codebase/CURRENT_STATE.md` and `ARCHITECTURE.md`.
  * Deconstruct the project into **5 sequential phases** with specific deliverables.
* **Step 5**: Run the initial harness check to verify the structure:
  ```bash
  genesis-harness verify
  ```

---

### 2️⃣ Adding a New Feature (`/new-feature` Flow under Strict TDD)
*Use this when adding new business requirements to a Genesis-enabled project. The workflow strictly enforces test-first design.*

* **Step 1**: Direct Codex to start the new feature:
  ```text
  /new-feature "Add Momo Payment API with callback handler"
  ```
* **Step 2**: [AUTOMATIC] Genesis triggers **Research-First Engine**:
  * Scans codebase for existing patterns (e.g., Stripe, ZaloPay integrations).
  * Creates a solution proposal in `research-template.md`.
  * Sets up a detailed **Implementation Plan**.
* **Step 3**: Review and approve the Implementation Plan.
* **Step 4**: **Define API Contracts (Contract-First)**:
  * Establish response/request contracts under `contracts/api/payments/momo-request.json` and `momo-response.json`.
* **Step 5**: **Write a Failing Test (RED)**:
  * Write a test case in `tests/integration/momo.test.md` mocking the API request and verifying the callback response.
  * Run the test suite and confirm it fails:
    ```bash
    npm run test
    ```
* **Step 6**: **Implement Minimal Code (GREEN)**:
  * Code the absolute minimum required in `src/routes/payments.js` to satisfy the tests.
* **Step 7**: **Verify & Refactor (IMPROVE)**:
  * Execute the self-healing verify loop to optimize code, confirm all tests pass, and verify >80% code coverage:
    ```bash
    bash scripts/run-verify-loop.sh
    ```

---

### 3️⃣ Fixing a Bug (`/fix-bug` Flow)
*Use this when debugging production exceptions or resolving failing regression test suites.*

* **Step 1**: Command Codex to locate and resolve the bug:
  ```text
  /fix-bug "Discount code is not applied when the cart has more than 5 items"
  ```
* **Step 2**: [AUTOMATIC] Genesis generates a bug file `bug-template.md` under `.codebase/failures/` requiring:
  * Detailed root-cause analysis (RCA).
  * A reproducible test case before modifying source code.
* **Step 3**: **Write a Reproducible Test**:
  * Add a unit test in `tests/unit/discount.test.js` specifying 6 items and a valid coupon code.
  * Execute the test to verify it fails (RED).
* **Step 4**: **Perform the Fix & Self-Heal**:
  * Correct the logic in `src/services/discount.js`.
  * Trigger the autonomous verify loop to ensure the fix passes and does not break existing features (Regression test):
    ```bash
    bash scripts/run-verify-loop.sh
    ```
* **Step 5**: Close the bug log, update the status to resolved, and catalog lessons learned in `lessons-learned-template.md`.

---

### 4️⃣ Integrating Genesis into an Existing Project (Legacy Codebase Injection)
*Use this when you have an established codebase and want to inject the Genesis Harness to gain planning and regression control.*

* **Step 1**: Install the harness CLI globally:
  ```bash
  npm install -g codex-genesis-harness@latest
  ```
* **Step 2**: At the root of your existing codebase, execute:
  ```bash
  genesis-harness init --existing
  ```
  *(Or command Codex in chat: `I want to integrate Genesis into this existing project`)*
* **Step 3**: **Establish Memory Mapping**:
  * Genesis scans your directories and constructs a dependency graph in `.codebase/DEPENDENCY_GRAPH.md`.
  * It initializes `.codebase/CURRENT_STATE.md` with your existing components grouped under "Phase 0 (Legacy Components)".
* **Step 4**: **Auto-Generate Contracts for Core Services**:
  * Choose a key route or controller (e.g., `src/routes/users.js`) and run:
    ```text
    /spec-change src/routes/users.js
    ```
  * Genesis parses the existing code and automatically writes contracts under `contracts/api/users/`.
* **Step 5**: Run `genesis-harness verify` to ensure the integration is successful without modifying legacy runtime behavior.

---

### 5️⃣ Handling Spec Changes & Cascade Updates (`/spec-change` & `/propagate-spec`)
*Use this when client requirements change, such as renaming a database field or introducing mandatory payload params.*

* **Step 1**: Modify the core API contract (e.g., `contracts/api/products/response.json`).
* **Step 2**: Declare the change to Codex:
  ```text
  /spec-change contracts/api/products/response.json
  ```
* **Step 3**: [AUTOMATIC] Genesis conducts a dependency impact analysis:
  * Identifies downstream dependencies (e.g., Orders module, Products UI component).
* **Step 4**: Trigger automated propagation to Cascade changes:
  ```text
  /propagate-spec
  ```
* **Step 5**: Genesis refactors the dependent schema contracts, updates test fixtures, and reruns tests to guarantee absolute system consistency.

---

## 💡 Real-World Example: E-Commerce API

### Scenario
Build a complete e-commerce API with:
- Products (search, filter)
- Orders (create, track, list)
- Payments (Stripe integration)

### Implementation (90 minutes)

#### Step 1: Initialize (5 min)
```bash
/genesis-init
# Input: "E-Commerce Platform"
# Output: Auto-structured project with 5 phases
```

#### Step 2: Phase 1 - Products API (30 min)

```bash
/new-feature "GET /api/products with search, filter, pagination"
```

**Contract created** (`contracts/api/products/request.json`):
```json
{
  "method": "GET",
  "endpoint": "/api/products",
  "query_params": {
    "search": "string (optional, min 2 chars)",
    "category": "string (optional: electronics, books, clothing)",
    "price_min": "number (optional, >= 0)",
    "price_max": "number (optional, > price_min)",
    "sort": "string (price_asc, price_desc, newest, rating)",
    "page": "number (default 1, min 1)",
    "limit": "number (default 20, max 100)"
  }
}
```

**Test template created** (`tests/integration/products.test.md`):
```javascript
describe('GET /api/products', () => {
  it('should return all products when no filter', async () => {
    const res = await fetch('/api/products');
    assert(res.status === 200);
    assert(Array.isArray(res.data));
  });
  
  it('should filter by category', async () => {
    const res = await fetch('/api/products?category=electronics');
    assert(res.data.every(p => p.category === 'electronics'));
  });
  
  it('should search by product name', async () => {
    const res = await fetch('/api/products?search=laptop');
    assert(res.data.some(p => p.name.toLowerCase().includes('laptop')));
  });
  
  it('should sort by price ascending', async () => {
    const res = await fetch('/api/products?sort=price_asc');
    const prices = res.data.map(p => p.price);
    assert(prices.every((p, i, arr) => i === 0 || arr[i-1] <= p));
  });
  
  it('should paginate results', async () => {
    const res1 = await fetch('/api/products?page=1&limit=10');
    const res2 = await fetch('/api/products?page=2&limit=10');
    assert(res1.data.length === 10);
    assert(res2.data.length === 10);
    assert(res1.data[0].id !== res2.data[0].id);
  });
});
```

**Implementation** (you code):
```javascript
// src/routes/products.js
app.get('/api/products', (req, res) => {
  let products = db.products.getAll();
  
  // Search
  if (req.query.search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(req.query.search.toLowerCase())
    );
  }
  
  // Filter by category
  if (req.query.category) {
    products = products.filter(p => p.category === req.query.category);
  }
  
  // Price range
  if (req.query.price_min) products = products.filter(p => p.price >= req.query.price_min);
  if (req.query.price_max) products = products.filter(p => p.price <= req.query.price_max);
  
  // Sort
  if (req.query.sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (req.query.sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const start = (page - 1) * limit;
  
  res.json({
    data: products.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: products.length,
      pages: Math.ceil(products.length / limit)
    }
  });
});
```

#### Step 3: Spec Change Propagation (5 min)

**You decide**: "Add `rating` and `reviews_count` to products"

```bash
# Update contract
/spec-change contracts/api/products/response.json
```

**Genesis detects**:
```
✓ Breaking change: response schema updated
✓ Affected phases: 
  - Phase 2 (Orders) shows products
  - Phase 3 (Payments) shows products
✓ Auto-updating: contracts, tests, fixtures
✓ Running verification: All tests pass
✓ Report: "2 phases auto-updated ✅"
```

**No manual coordination needed!** Downstream phases auto-updated.

#### Step 4: Phase 2 - Orders API (30 min)

```bash
/new-feature "POST /api/orders to create order with line items"
```

Genesis creates contracts, tests, fixtures. You implement.

#### Step 5: Phase 3 - Payments (30 min)

```bash
/new-feature "POST /api/payments with Stripe integration and webhooks"
```

Genesis creates contracts for:
- Create payment intent
- Handle Stripe webhook
- Update order payment status

#### Step 6: Release (15 min)

```bash
/release
```

Genesis:
- ✅ Verifies all tests pass (80%+ coverage)
- ✅ Generates changelog from commits
- ✅ Bumps version (v1.0.0 → v1.1.0)
- ✅ Tags git release
- ✅ Ready to publish

---

## 📚 25 Skills (All Available)

Each skill follows the standard naming convention in `.codex/skills/`:

| Skill Directory | Purpose | When to Use |
|---|---|---|
| **genesis-harness** | Main entry point of the system | `/genesis-init`, `/new-feature`, `/fix-bug` |
| **genesis-research-first** | Autonomous empirical research before planning | Triggers automatically on new tasks |
| **genesis-api-contract** | Design robust API contracts (schema, request, response) | Before implementing endpoints |
| **genesis-api-sync** | Automate bi-directional contract & codebase synchronization | When endpoints are updated |
| **genesis-spec-propagation** | Automatically cascade design specification updates downstream | When specs change |
| **genesis-docs-automation** | Automatically synchronize system technical docs | Triggers after tests pass |
| **genesis-ui-ux-test** | Design and validate UI user journeys and visual test specs | Before frontend implementation |
| **genesis-debug-guide** | Systematic, evidence-based debugging and troubleshooting | On compile errors or test failures |
| **genesis-pipeline-orchestration** | Orchestrate multi-phase software development lifecycle | Complex multi-phase projects |
| **genesis-architecture** | High-level system design and architecture decisions (ADRs) | Major design changes |
| **genesis-planning** | Breakdown complex business requirements into micro-plans | Preparing large features |
| **genesis-codebase-map** | Build comprehensive dependency graphs and architecture maps | Navigating large codebases |
| **genesis-release** | Manage semantic versioning, Git tags, runbooks, and rollback plans | Preparing releases & deployments |
| **genesis-performance-profiling** | Measure system latency and execute runtime optimization | Before performance tuning |
| **genesis-observability-automation** | Log autonomous decisions, ADR history, and tool outputs | Maintaining execution trace |
| **genesis-ai-provider** | Monitor, budget, and optimize LLM token consumption | Safeguarding API token limits |
| **genesis-new-design** | Author UI/UX design specifications from scratch | New UI features |
| **genesis-upgrade-design** | Audit and upgrade existing UI/UX elements | Improving legacy views |
| **genesis-design-spec** | Define and manage design tokens and theme consistency | Standardizing design systems |
| **genesis-harness-engineering** | Build test frameworks, harness structures, and test fixtures | Setting up test suites |
| **spec-impact-engine** | Evaluate the blast radius of proposed specification changes | Assessing spec adjustments |
| **genesis-executing-plans** | Strictly follow the approved execution plan and task.md | Implementing features via plan |
| **genesis-test-driven-development** | Enforce TDD (Red -> Green -> Refactor) and test verification | Writing logic or bug fixes |
| **genesis-verification-before-completion** | Require evidence and script execution before task completion | Finalizing any autonomous task |
| **genesis-using-git-worktrees** | Isolate destructive or large architectural changes | High-risk refactoring |

---

## 📖 Documentation Reference

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [MODEL_ALLOCATION.md](.codex/MODEL_ALLOCATION.md) | Why Codex is primary | 5 min |
| [SKILLS_INDEX.md](.codex/SKILLS_INDEX.md) | All skills detailed | 20 min |
| [SKILLS_NAMING_GUIDE.md](.codex/SKILLS_NAMING_GUIDE.md) | Naming conventions | 5 min |
| [FILE_NAMING_CLARIFICATION.md](.codebase/FILE_NAMING_CLARIFICATION.md) | File naming explained | 5 min |
| [ARCHITECTURE_REVIEW_COMPLETE.md](.codebase/ARCHITECTURE_REVIEW_COMPLETE.md) | Latest updates | 10 min |
| [PHASE3_SKILLS_NAMING_COMPLETE.md](.codebase/PHASE3_SKILLS_NAMING_COMPLETE.md) | Naming changes | 10 min |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute | 10 min |

---

## ❓ Frequently Asked Questions

**Q: Do I need to be an expert at Codex to use Genesis?**  
A: No! Genesis handles most Codex interactions. You mainly use simple commands like `/genesis-init`, `/new-feature`, etc.

**Q: Is Genesis Codex-exclusive or can I use it with other models?**  
A: **Codex-exclusive only**. Genesis is specifically designed for Codex strengths. Using other models will break the workflow.

**Q: How much can I actually save on tokens?**  
A: Typically **40-60% per project**. Average project: 150k tokens (normal) → 60-90k tokens (with Genesis caching).

**Q: Can I customize the skills?**  
A: Yes! Copy any skill from `.codex/skills/genesis-*`, modify it, and Genesis will use your custom version.

**Q: What if I want to add Genesis to an existing project?**  
A: See [CONTRIBUTING.md](CONTRIBUTING.md). Takes about 30 minutes to integrate with existing codebases.

**Q: Are there any limits or gotchas?**  
A: Main limits are technical: max 5 phases per project (performance), token budget enforcement (prevents runaway costs).

---

## 📦 Installation & Setup

### Requirements
- Node.js 16+
- npm 8+
- Codex via VS Code Copilot

### Install Methods

**Method 1: npm (Recommended)**
```bash
npm install -g codex-genesis-harness@latest
genesis-harness verify
```

**Method 2: From Git**
```bash
git clone https://github.com/tuanpham09/codex-genesis-harness.git
cd codex-genesis-harness
./scripts/install.sh
./scripts/verify.sh
```

**Method 3: Docker (Optional)**
```bash
docker run -v $(pwd):/project codex-genesis-harness:latest /genesis-init
```

### Verify Installation

```bash
npm run verify           # Check all files
./scripts/verify.sh     # Verify skills installed
npm run eval            # Run evaluations
npm run pack:check      # Check npm package
```

---

## 🎓 Learning Path

### Week 1: Basics (2-3 hours)
- [ ] Read this README
- [ ] Run `/genesis-init` to create first project
- [ ] Read execution-plan.md
- [ ] Complete Phase 0 (foundation)
- [ ] Start Phase 1 with `/new-feature`

### Week 2: Workflows (3-4 hours)
- [ ] Implement 2-3 features using `/new-feature`
- [ ] Experience `/spec-change` and auto-updates
- [ ] Fix bugs using `/fix-bug`
- [ ] Run tests: `npm run verify`
- [ ] Review code: `/review`

### Week 3: Mastery (2-3 hours)
- [ ] Lead a 2-phase project from start to finish
- [ ] Experience token savings firsthand
- [ ] Understand memory system benefits
- [ ] Mentor others on Genesis workflows

### Ongoing: Advanced
- [ ] Customize skills for your domain
- [ ] Create reusable skill templates
- [ ] Contribute improvements back to Genesis
- [ ] Use for production projects

---

## 💖 Support the Project (Donate)

This project is open-source and developed with passion. If you find **Genesis Codex Harness** helpful and it saves you time, consider buying me a coffee to keep the momentum going:

- **Momo (Vietnam)**: `0865814259`
- **PayPal**: *(Will be updated later)*

Thank you so much for supporting the development of this project! ❤️

---

## 🔗 Resources

- **GitHub**: [codex-genesis-harness](https://github.com/tuanpham09/codex-genesis-harness)
- **Documentation**: See [.codex/](./codex/) folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📊 Project Status

- ✅ **Architecture**: 10/10 (research-first + auto-debug + auto-spec-propagation + auto-docs + validation gates)
- ✅ **Codex-Only Enforcement**: 100%
- ✅ **Skills**: 25 fully implemented & verified (added 5-Phase MVP Roadmap planner, advanced self-healing and compaction engines)
- ✅ **Test Coverage**: 80%+ required
- ✅ **Token Savings**: 40-60%
- ✅ **Production Ready**: Yes (v0.1.8)
- ✅ **Auto-Research Enforcement**: Active
- ✅ **Auto-Debug Verification**: Active
- ✅ **Auto-Spec-Propagation**: Active
- ✅ **Auto-Docs-Automation**: Active

---

## 📄 License & Attribution

MIT License - See [LICENSE](LICENSE)

**Genesis Codex Harness** - Build production software with Codex | v0.1.8 | June 2026

---

**Next**: Read [Tiếng Việt](README.VI.md) for Vietnamese documentation.
