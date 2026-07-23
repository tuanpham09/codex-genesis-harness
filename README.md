# 🚀 Genesis Codex Harness | The Ultimate Enterprise SDLC Harness for Codex

[![npm version](https://img.shields.io/npm/v/codex-genesis-harness.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/codex-genesis-harness)
[![license](https://img.shields.io/npm/l/codex-genesis-harness.svg?style=flat-square&color=green)](LICENSE)
[![Harness Verification](https://img.shields.io/badge/harness--verification-passed-brightgreen?style=flat-square)](#)
[![Token Savings](https://img.shields.io/badge/token--savings-40%20to%2060%25-blueviolet?style=flat-square)](#)
[![Target Model](https://img.shields.io/badge/model-Codex-orange?style=flat-square)](#)

**Genesis Codex Harness** is an enterprise-grade, **Codex-exclusive** software development lifecycle (SDLC) harness. It converts Codex from a passive, auto-complete assistant into a rigorous, highly disciplined, autonomous AI Software Engineer. It strictly enforces a contract-first design, test-first development (TDD), and persistent codebase memory to ensure high-velocity, zero-regression software delivery.

> [!IMPORTANT]
> **Harness Engineering vs. Basic Prompts**: Unlike standard AI chat wrappers or basic extension scripts that passively output code, Genesis surrounds the AI model with an active **Finite State Machine (FSM) runtime, verification scripts, and automated gates**. This guarantees that the AI cannot drift in design, violate contracts, or suffer from amnesia.

---

## 💖 Support the Project (Donate)

This project is open-source and developed purely out of passion. If you find **Genesis Codex Harness** helpful and it saves you time, you can buy me a coffee to keep the development going:

- **Momo**: `0865814259`
- **PayPal**: *(Coming soon)*

Thank you so much for your support! ❤️

---

## ⚡ Core Pillars at a Glance

*   🗺️ **Structured 5-Phase MVP Roadmap (`genesis-mvp-planning`):** Guarantees a decision-complete path to production. Genesis structures project delivery across 5 standard MVP phases (Foundation/API Core, Auth/Security, Core Features, Integrations, and Production Readiness), ensuring core infrastructure is verified before writing feature code.
*   🛡️ **Zero-Drift Validation Gates (`validation_gates.sh`):** Prevents documentation decay. Validation gates automatically run **Documentation Drift Checks** on state changes, scanning Git changes and alerting you if you modified API, DB schema, test files, or dependencies without updating the matching spec docs in `.codebase/`.
*   🛑 **The Death of Context Rot:** Automatically offloads massive terminal outputs (`offload-log.sh`) and dynamically compacts codebase state (`compact-context.sh`). Your prompt stays clean and sharp even after 100+ continuous development turns.
*   🔥 **Autonomous Self-Healing (Ralph Loops):** Caught a test failure or compiler crash? The harness executes closed-loop **Verify-Fix cycles** (`run-verify-loop.sh`) up to 5 times autonomously, reading errors and refactoring source code until the tests turn green.
*   🧠 **Empirical, Research-First Engineering:** Enforces evidence-based solutions. Genesis runs automated scans of your local codebase patterns and official package repositories *before* writing a single line of plans or implementation code.
*   🔄 **Cascading Spec Propagation:** Change a single schema field or API contract and watch the harness automatically cascade modifications (`/propagate-spec`) across all downstream phases, test fixtures, and integration assertions.

---

## 📚 Language Hubs & Detailed Guides

To cater to all developers, Genesis features separate, highly exhaustive step-by-step handbooks in both languages:

| Language | Primary Link | Content Included |
| :--- | :--- | :--- |
| 🇬🇧 **English** | [README.EN.md](README.EN.md) | Exhaustive runbooks, all 25 skill details, learning paths, & production workflows. |
| 🇻🇳 **Tiếng Việt** | [README.VI.md](README.VI.md) | Cẩm nang chi tiết bằng Tiếng Việt, giải nghĩa 25 skills, quy trình TDD chuẩn. |

---

## 📊 Enterprise Comparison: Genesis vs. Standard AI Agents

When developing with a standard AI assistant (e.g. basic chat tools, default model wrappers, or prompt template libraries), you inevitably hit **context drift, design regression, and code fragility** as the project expands. Below is how the Genesis Harness solves these enterprise-level pain points:

| Feature | Standard AI Agents (Claude Code, basic wrappers, Copilot basic) | Genesis Codex Harness (Active FSM-driven Harness) |
| :--- | :--- | :--- |
| **SDLC Orchestration** | **Ad-hoc / Task-based:** Solves single prompts without an overarching roadmap context. | **Structured 5-Phase MVP Roadmap:** Directs engineering across 5 critical product delivery gates. |
| **Workflow Paradigm** | **Passive (Code-Gen First):** Writes code immediately, skipping testing. | **Strict (Contract-First + TDD):** Contracts first, RED tests, minimal GREEN implementation. |
| **Context Safety** | **Context Rot:** raw logs and full files flood prompt window, causing amnesia. | **Compacted & Clean:** Automated logs offloading (`offload-log`) and dynamic state compaction. |
| **Error Recovery** | **Manual:** Requires copy-pasting terminal errors to request fix. | **Autonomous:** Closed-loop **Verify-Fix self-healing** up to 5 iterations. |
| **Cascading Specs** | **Fragile:** Spec modifications break downstream modules silently. | **Automated:** Cascade propagation (`/propagate-spec`) syncs all assets. |
| **Documentation Sync** | **Document Decay:** Docs quickly drift and become outdated as code changes. | **Zero-Drift Warning Gates:** Scans Git diffs on commit/state transitions to flag stale spec docs. |
| **Token Efficiency** | **High Overhead:** Large uncompressed payloads, 0-10% caching. | **Optimal Caching:** Memory systems and compaction yield **40-60%** savings. |

---

## 🧬 Core Subsystems of the Harness Architecture

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

Genesis is built on five core, state-of-the-art technological breakthroughs that protect and enhance the AI developer:


1. **Context Compaction Engine (`compact-context.sh`)**: Automatically condenses architectural decisions, API states, and task history into `.codebase/context/` when prompt window boundaries are reached, freeing up massive context space while keeping 100% decision recall.
2. **Tool Call Offloading (`offload-log.sh`)**: Intercepts massive terminal outputs (such as verbose test suites or compiler logs) and offloads them to disk log files (`.system_generated/tasks/`), returning a clean, structural status summary back to the model.
3. **Verify-Fix Self-Healing Loop (`run-verify-loop.sh`)**: An autonomous, closed-loop debug engine that captures test failures, reads error output from disk logs, refactors implementation code, and re-runs tests autonomously up to 5 times until the build turns green.
4. **5-Phase MVP Planner (`genesis-planning`)**: Guarantees architectural rigor. Breaks down requirements into 5 standard delivery phases, ensuring core contracts are validated before feature coding.
5. **Documentation Drift Check Validation Gates (`validation_gates.sh`)**: A hook-level scan that alerts the engineer on phase state changes if source code changes are detected without matching spec updates under `.codebase/`.

---

## 🚀 Next-Gen Harness Engineering Upgrades (v0.1.8)

Genesis v0.1.8 introduces six advanced, state-of-the-art tools under `scripts/` to enforce type-safety, automate tests, establish visual-code integrity, protect token consumption, enable self-healing loop memory recall, and provide agile UI iteration:

1. **Visual Architecture AST Sync (`scripts/spec_visual_sync.js`)**: Bidirectional compiler that syncs Mermaid ERD database diagrams (`database-erd.mmd`) to API contracts JSON schemas (`contracts/api/`) and vice-versa, establishing absolute visual-to-code design integrity.
2. **Contract-Driven Test Auto-Generator (`scripts/test_generator.js`)**: Automatically compiles fully executable Mocha/Jest integration test suites in `tests/integration/` directly from your API contracts JSON response schemas, providing instant TDD "RED" skeletons.
3. **AST Contract-Code Integrity Gate (`scripts/contract_integrity_gate.js`)**: Static analysis checker that programmatically validates implementation code properties against API contract JSON schemas at FSM transition boundaries, locking state transitions if data type mismatches or missing properties are detected.
4. **Pre-emptive Prompt Sentinel (`scripts/prompt_sentinel.js`)**: Real-time token budget monitor. Calculates token weights before calling LLM, pre-emptively halting runaway commands, and executing auto-compaction and log pruning when capacity thresholds (e.g. 20k tokens) are crossed.
5. **Self-Healing Lessons-Learned Recall (`scripts/healing_telemetry.js`)**: Telemetry system that records compiler/test failure signatures and applied corrective code edits in `.codebase/failures/lessons_learned.md`. The self-healing loop recalls these recorded fixes on identical error signatures, bypassing iterations to achieve immediate **1-turn recovery**.
6. **Aesthetic Vibe Mode (`VIBE_MODE=1`)**: A dynamic Triage engine that allows the AI to bypass strict PEV loops and TDD blockers exclusively for pure UI/CSS aesthetic changes. Bypassed failures are seamlessly routed to `.codebase/TECH_DEBT.md` for later reconciliation.

### LeanCTX + Optional Local Wrappers

Genesis ships a portable LeanCTX policy at `.codebase/context-policy.json` and exposes it through:

```bash
genesis-harness leanctx
genesis-harness prime
```

`npm install` / `genesis-harness install` seeds the policy into the current project when a project root is detected, and never overwrites an existing custom policy. The `leanctx` command is only for inspection. Public npm usage and CI commands stay portable (`genesis-harness sync`, `genesis-harness docs-gate`, `npm run verify`). If `rtk` is installed locally, Genesis reports it as an optional wrapper for developer machines only; it is not required for npm users.

---

## 🧭 Release v0.1.9

Genesis v0.1.9 turns the harness from a planning scaffold into a resumable runtime bootstrap that can start from a single product idea and carry the first feature slice into implementation.

### Runtime Bootstrap

```bash
# Initialize a blank repo from a user idea
genesis-harness init --platform codex --yes --idea "Build a staff-facing request queue"

# Run deterministic discovery and promote the first feature slice
genesis-harness run \
  --platform codex \
  --yes \
  --idea "Build a concierge booking assistant" \
  --product-approach "Staff-facing tablet dashboard" \
  --primary-user "Front-desk staff" \
  --v1-outcome "Staff can log, prioritize, and resolve guest requests in one queue" \
  --qa-owner "Operations lead" \
  --backend "Node.js" \
  --frontend "React" \
  --database "PostgreSQL" \
  --deployment "Fly.io" \
  --test-strategy "Node integration tests and Playwright smoke tests"

# Resume the active run from disk
genesis-harness resume
genesis-harness add-feature --title "Notify staff" --slug "staff-notifications" --verify-cmd "npm test"
genesis-harness next
genesis-harness complete-feature --verify-cmd "npm test" --evidence "All feature tests passed"
genesis-harness verify-project --verify-cmd "npm run verify" --evidence "Acceptance suite passed"
genesis-harness complete-project --evidence "Release candidate accepted"
genesis-harness pipeline-audit
```

### What Changes

1. **Implicit init from an idea**: Empty repos can be bootstrapped directly from the first product brief.
2. **Discovery & QA phase**: Init now creates `.planning/INIT_QA.md`, a Discovery & QA phase, and `.codebase/PHASE_DEPENDENCY_MAP.md`.
3. **Idea-seeded planning docs**: `PROJECT.md`, `REQUIREMENTS.md`, `STACK.md`, `SUMMARY.md`, `.codebase/CURRENT_STATE.md`, and `.codebase/state.json` are seeded from the user brief when available.
4. **Deterministic `run --idea` pipeline**: Discovery answers can be provided in one command and promoted into an active first feature under `.planning/features/`.
5. **Typed first-slice contracts**: The first feature scaffold can generate API/UI contracts and fixtures under `contracts/api`, `contracts/ui`, `fixtures/api`, and `playwright/fixtures`.
6. **Resumable run artifacts**: `.runs/<session-id>/INPUT.md`, `DISCOVERY.json`, `STATE.json`, and `RESUME.md` persist the active checkpoint.
7. **Stronger verify-gate**: `genesis-harness verify-gate` now runs structural verify, evals, docs-gate, cold-start, package dry-run, and LeanCTX reporting.
8. **End-to-end lifecycle**: Features are queued and verified one at a time; project-wide verification creates a release-ready handoff before final completion.
9. **Durable audit trail**: `.runs/<session-id>/EVENTS.jsonl` records lifecycle events, while `pipeline-audit` detects queue, state, proof, and handoff drift.
10. **Release publishing hardening**: GitHub release/manual publishing now uses npm trusted publishing with provenance instead of long-lived npm tokens or CI-mutated versions.

### Release Readiness Checklist

```bash
npm run verify
npm run eval
npm run pack:check
node bin/genesis-harness.js verify-gate
```

Before tagging, confirm `package.json`, `.codex-plugin/plugin.json`, `VERSION`, `CHANGELOG.md`, and the README version labels all agree.

---

## 📦 Quick Start & Usage

### 1. Installation

```bash
# Global installation
npm install -g codex-genesis-harness@latest

# Verify installation structure
genesis-harness verify
```

### 2. Basic Commands (In Codex Chat)

After installation, simply type standard commands in your Codex chat interface to drive your project:

```text
/genesis-init                   # Initialize project and map FSM states
/new-feature "description"      # Create new feature using strict TDD
/fix-bug "description"          # Fix bug using reproducible test cases
/spec-change contracts/api/*    # Declare specification updates
/propagate-spec                 # Automatically cascade contract updates downstream
/review                         # Audit codebase for quality & standards compliance
/release                        # Prepare semantic release, tags, and changelogs
```

*All commands are strictly enforced to run in a Codex-only, no-switching environment.*

For non-interactive CLI bootstrap, use:

```bash
genesis-harness init --platform codex --yes --idea "<brief>"
genesis-harness run --platform codex --yes --idea "<brief>" \
  --product-approach "<approach>" \
  --primary-user "<user>" \
  --v1-outcome "<smallest useful outcome>" \
  --qa-owner "<owner>" \
  --backend "<runtime>" \
  --frontend "<client>" \
  --database "<storage>" \
  --deployment "<target>" \
  --test-strategy "<tests>"
genesis-harness resume
```

---

## 🏗️ What Gets Installed

```
.codex/skills/
  ├── genesis-harness/                    # Core orchestration and CLI runner
  ├── genesis-new-design/                 # UI/UX new specifications authoring
  ├── genesis-upgrade-design/             # Existing visual audit and upgrade engine
  ├── genesis-api-contract/               # Enterprise API contract designer
  ├── genesis-spec-propagation/           # Automated spec propagation engine
  ├── genesis-planning/                   # 5-Phase MVP roadmap planner
  └── ... (19 more skills, total 25 skills)

.codebase/                                # Persistent repository memory system
contracts/                                # Enterprise API, UI, and Data contracts
fixtures/                                 # Standardized test fixtures
tests/                                    # Integration and unit test suites
playwright/                               # E2E visual and smoke tests
observability/                            # Run records and architectural ADR logs
```

---

## 🔌 MCP Server Configuration (Optional)

To supercharge the agent's research and debugging capabilities, you can optionally configure MCP (Model Context Protocol) servers.
We provide two ways to integrate them:

### Option 1: Global Installation
Run the built-in setup script to install recommended MCPs globally:
```bash
npm run mcp:setup
```
This installs essential MCPs like Puppeteer (Browser/UI tests), GitHub, and SQLite (Vector Memory).

### Option 2: Dynamic Execution (Agent Config)
If you prefer not to install them globally, you can configure your Agent Client (e.g., Claude Desktop, Hermes, Cursor) to run them dynamically. See the `mcp.example.json` file in the repository root for configuration snippets.

## 📊 Project Status & Versioning

- ✅ **Architecture Rating**: `10/10` (Enforced research-first + self-healing + spec-propagation)
- ✅ **Codex-Only Enforcement**: `100%`
- ✅ **Skills Matrix**: 25 fully implemented, structured, and verified skills
- ✅ **Token Caching Savings**: `40% to 60%` verified per enterprise project
- ✅ **Stability & Readiness**: Production Ready (`v0.1.9` - June 2026)

---

## 📄 License & Contributing

Licensed under the [MIT License](LICENSE). Contributions, bug reports, and features are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our TDD contribution workflow.

---

**Genesis Codex Harness** v0.1.9 | June 2026
👉 **[Full English Guide](README.EN.md) | [Tiếng Việt Hướng Dẫn](README.VI.md)**
