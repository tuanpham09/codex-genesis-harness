#!/usr/bin/env node
"use strict";

/**
 * feature_registry.test.js
 * L08 – Feature List as Harness Primitive
 * L11 – Observability Bên Trong Harness
 *
 * Tests must FAIL before implementation (Red phase).
 * Run: node tests/unit/feature_registry.test.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

// ─────────────────────────────────────────────────────────────────────────────
// L08 — Feature Registry checks
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY_PATH = path.join(repoRoot, "features", "REGISTRY.md");
const REGISTRY_SCHEMA_PATH = path.join(repoRoot, "contracts", "features", "registry-schema.json");

// Test 1: features/REGISTRY.md phải tồn tại
assert(
  fs.existsSync(REGISTRY_PATH),
  "L08: features/REGISTRY.md must exist as machine-readable feature primitive"
);

// Test 2: REGISTRY.md phải chứa section machine-readable features table
const registryContent = fs.readFileSync(REGISTRY_PATH, "utf8");
assert(
  registryContent.includes("| id |"),
  "L08: REGISTRY.md must have a machine-readable table with 'id' column"
);
assert(
  registryContent.includes("| status |"),
  "L08: REGISTRY.md must have a 'status' column"
);
assert(
  registryContent.includes("| verify_cmd |"),
  "L08: REGISTRY.md must have a 'verify_cmd' column per feature"
);

// Test 3: Mỗi feature phải có trạng thái hợp lệ
const validStatuses = ["planned", "in-progress", "done", "verified", "deprecated"];
const tableRows = registryContent
  .split("\n")
  .filter(line => /^\|\s*F\d+\s*\|/.test(line)); // Only data rows from Feature Table (id starts with F)
assert(
  tableRows.length > 0,
  "L08: REGISTRY.md must have at least one feature entry (id must start with F, e.g. F001)"
);
for (const row of tableRows) {
  const cols = row.split("|").map(c => c.trim()).filter(Boolean);
  if (cols.length < 2) continue;
  const status = cols[1];
  assert(
    validStatuses.includes(status),
    `L08: Invalid status '${status}' in REGISTRY.md — must be one of: ${validStatuses.join(", ")}`
  );
}

// Test 4: contracts/features/registry-schema.json phải tồn tại
assert(
  fs.existsSync(REGISTRY_SCHEMA_PATH),
  "L08: contracts/features/registry-schema.json must exist"
);
const schema = JSON.parse(fs.readFileSync(REGISTRY_SCHEMA_PATH, "utf8"));
assert(schema.version, "L08: registry-schema.json must have a version field");
assert(schema.required_columns, "L08: registry-schema.json must define required_columns");
assert(
  Array.isArray(schema.required_columns) && schema.required_columns.includes("id"),
  "L08: required_columns must include 'id'"
);

// Test 5: REGISTRY.md phải được đề cập trong MODULE_INDEX.md
const moduleIndex = fs.readFileSync(
  path.join(repoRoot, ".codebase", "MODULE_INDEX.md"),
  "utf8"
);
assert(
  moduleIndex.includes("features/REGISTRY.md"),
  "L08: features/REGISTRY.md must be listed in .codebase/MODULE_INDEX.md"
);

// ─────────────────────────────────────────────────────────────────────────────
// L11 — Observability Live Data checks
// ─────────────────────────────────────────────────────────────────────────────

const OBS_SCHEMA_PATH = path.join(repoRoot, "contracts", "observability", "agent-run-schema.json");
const OBS_SAMPLE_PATH = path.join(repoRoot, "observability", "agent-runs", "sample-run.json");
const OBS_FAILURE_SCHEMA_PATH = path.join(repoRoot, "contracts", "observability", "failure-schema.json");
const OBS_FAILURE_SAMPLE_PATH = path.join(repoRoot, "observability", "failures", "sample-failure.json");
const OBS_DECISION_SAMPLE_PATH = path.join(repoRoot, "observability", "decision-logs", "sample-decision.md");

// Test 6: contracts/observability/ phải có agent-run-schema.json
assert(
  fs.existsSync(OBS_SCHEMA_PATH),
  "L11: contracts/observability/agent-run-schema.json must exist"
);
const agentRunSchema = JSON.parse(fs.readFileSync(OBS_SCHEMA_PATH, "utf8"));
assert(agentRunSchema.required_fields, "L11: agent-run-schema.json must define required_fields");
const requiredRunFields = ["session_id", "timestamp", "skill", "phase", "outcome", "evidence"];
for (const field of requiredRunFields) {
  assert(
    agentRunSchema.required_fields.includes(field),
    `L11: agent-run-schema.json must require field '${field}'`
  );
}

// Test 7: observability/agent-runs/ phải có ít nhất 1 sample entry
assert(
  fs.existsSync(OBS_SAMPLE_PATH),
  "L11: observability/agent-runs/sample-run.json must exist as live sample"
);
const sampleRun = JSON.parse(fs.readFileSync(OBS_SAMPLE_PATH, "utf8"));
for (const field of requiredRunFields) {
  assert(
    sampleRun[field] !== undefined,
    `L11: sample-run.json is missing required field '${field}'`
  );
}

// Test 8: contracts/observability/failure-schema.json phải tồn tại
assert(
  fs.existsSync(OBS_FAILURE_SCHEMA_PATH),
  "L11: contracts/observability/failure-schema.json must exist"
);
const failureSchema = JSON.parse(fs.readFileSync(OBS_FAILURE_SCHEMA_PATH, "utf8"));
assert(failureSchema.required_fields, "L11: failure-schema.json must define required_fields");

// Test 9: observability/failures/ phải có sample failure entry
assert(
  fs.existsSync(OBS_FAILURE_SAMPLE_PATH),
  "L11: observability/failures/sample-failure.json must exist"
);

// Test 10: observability/decision-logs/ phải có sample thực tế (không chỉ template)
assert(
  fs.existsSync(OBS_DECISION_SAMPLE_PATH),
  "L11: observability/decision-logs/sample-decision.md must exist as actual decision record"
);
const decisionContent = fs.readFileSync(OBS_DECISION_SAMPLE_PATH, "utf8");
assert(
  !decisionContent.includes("What changed."),
  "L11: sample-decision.md must be a real decision record, not just the blank template"
);

console.log("feature_registry tests passed");
