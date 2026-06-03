#!/usr/bin/env node
"use strict";

/**
 * cold-start-check.js
 * L03 – Repository is the Single Source of Truth
 *
 * Automated cold-start test: verifies a brand-new agent can answer the
 * 5 fundamental questions from the repository alone, without external knowledge.
 *
 * Usage: node scripts/cold-start-check.js
 * Exit: 0 = all 5 questions answerable, 1 = gap detected
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

const fail = (msg) => {
  console.error(`cold-start FAIL: ${msg}`);
  process.exit(1);
};

const check = (condition, failMsg) => {
  if (!condition) fail(failMsg);
};

const readFile = (relPath) => {
  const abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) fail(`Required file missing: ${relPath}`);
  return fs.readFileSync(abs, "utf8");
};

console.log("Running cold-start check (L03 — Repo as Source of Truth)...\n");

// ─────────────────────────────────────────────────────────────────────────────
// Q1: What is this project?
// Answer must be findable in AGENTS.md or README.md
// ─────────────────────────────────────────────────────────────────────────────
console.log("Q1: What is this project?");
const agents = readFile("AGENTS.md");
check(
  agents.length > 100,
  "Q1 FAIL: AGENTS.md is too short to answer 'what is this project?'"
);
const readme = readFile("README.md");
check(
  readme.includes("genesis-harness") || readme.includes("Genesis"),
  "Q1 FAIL: README.md does not describe the project by name"
);
console.log("  ✅ Answerable from AGENTS.md + README.md\n");

// ─────────────────────────────────────────────────────────────────────────────
// Q2: How do I run it?
// Answer must be findable in AGENTS.md with npm run commands
// ─────────────────────────────────────────────────────────────────────────────
console.log("Q2: How do I run/verify it?");
check(
  agents.includes("npm run verify") || agents.includes("scripts/verify.sh"),
  "Q2 FAIL: AGENTS.md does not document how to run verification"
);
const pkg = JSON.parse(readFile("package.json"));
check(
  pkg.scripts && pkg.scripts.verify,
  "Q2 FAIL: package.json missing 'verify' script"
);
console.log("  ✅ Answerable from AGENTS.md + package.json\n");

// ─────────────────────────────────────────────────────────────────────────────
// Q3: How do I test it?
// Answer must be findable in TEST_MATRIX.md
// ─────────────────────────────────────────────────────────────────────────────
console.log("Q3: How do I run the tests?");
const testMatrix = readFile(".codebase/TEST_MATRIX.md");
check(
  testMatrix.includes("verify.sh") && testMatrix.includes("run-evals.sh"),
  "Q3 FAIL: TEST_MATRIX.md does not document test commands"
);
check(
  fs.existsSync(path.join(repoRoot, "scripts", "verify.sh")),
  "Q3 FAIL: scripts/verify.sh does not exist"
);
check(
  fs.existsSync(path.join(repoRoot, "scripts", "run-evals.sh")),
  "Q3 FAIL: scripts/run-evals.sh does not exist"
);
console.log("  ✅ Answerable from TEST_MATRIX.md + scripts/\n");

// ─────────────────────────────────────────────────────────────────────────────
// Q4: What is the high-level architecture?
// Answer must be findable in MODULE_INDEX.md + VISUAL_GRAPH.md
// ─────────────────────────────────────────────────────────────────────────────
console.log("Q4: What is the architecture?");
const moduleIndex = readFile(".codebase/MODULE_INDEX.md");
check(
  moduleIndex.includes(".codex/skills/") && moduleIndex.includes("contracts/"),
  "Q4 FAIL: MODULE_INDEX.md does not describe key architectural components"
);
const visualGraph = readFile(".codebase/VISUAL_GRAPH.md");
check(
  visualGraph.includes("```mermaid"),
  "Q4 FAIL: VISUAL_GRAPH.md does not contain a Mermaid architecture diagram"
);
console.log("  ✅ Answerable from MODULE_INDEX.md + VISUAL_GRAPH.md\n");

// ─────────────────────────────────────────────────────────────────────────────
// Q5: Where am I / what's the current state?
// Answer must be findable in CURRENT_STATE.md + state.json
// ─────────────────────────────────────────────────────────────────────────────
console.log("Q5: Where are we / what is the current state?");
const currentState = readFile(".codebase/CURRENT_STATE.md");
check(
  currentState.includes("2026"),
  "Q5 FAIL: CURRENT_STATE.md does not have a current-year timestamp (may be stale)"
);
const stateJson = JSON.parse(readFile(".codebase/state.json"));
check(
  stateJson.current_state,
  "Q5 FAIL: state.json missing 'current_state' field"
);
check(
  stateJson.completed_at || stateJson.active_work,
  "Q5 FAIL: state.json missing completion/active state markers"
);
console.log("  ✅ Answerable from CURRENT_STATE.md + state.json\n");

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log("━".repeat(50));
console.log("cold-start check passed — all 5 questions answerable");
console.log("Repository passes L03: Single Source of Truth test.");
