#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const cli = path.join(repoRoot, "bin", "genesis-harness.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-cli-smoke-"));

function run(args, cwd = tmp) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    env: {
      ...process.env,
      CODEX_HOME: path.join(tmp, "codex-home"),
      GENESIS_HARNESS_HOME: path.join(tmp, "agents-home"),
      GENESIS_HARNESS_SKIP_POSTINSTALL: "1"
    },
    encoding: "utf8"
  });
}

function runPostinstall(initCwd) {
  return execFileSync(process.execPath, [cli, "postinstall"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CODEX_HOME: path.join(initCwd, "codex-postinstall-home"),
      GENESIS_HARNESS_HOME: path.join(initCwd, "agents-postinstall-home"),
      INIT_CWD: initCwd
    },
    encoding: "utf8"
  });
}

fs.mkdirSync(path.join(tmp, ".codebase"), { recursive: true });
fs.mkdirSync(path.join(tmp, ".planning"), { recursive: true });
fs.writeFileSync(path.join(tmp, ".codebase", "CURRENT_STATE.md"), "# Current State: TEST\n");
fs.writeFileSync(path.join(tmp, ".codebase", "API_CONTRACTS.md"), "# API Contracts\n");
fs.writeFileSync(path.join(tmp, ".planning", "SPEC_CHANGELOG.md"), "# Spec Changelog\n");
fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "smoke-fixture" }, null, 2));

run(["install", "--target", "agents"]);
const seededPolicyPath = path.join(tmp, ".codebase", "context-policy.json");
assert(fs.existsSync(seededPolicyPath), "install should seed LeanCTX policy into project .codebase");
const seededPolicy = JSON.parse(fs.readFileSync(seededPolicyPath, "utf8"));
assert.strictEqual(seededPolicy.token_budget, 12000, "seeded LeanCTX policy should use package default");

fs.writeFileSync(
  seededPolicyPath,
  JSON.stringify({ token_budget: 8000, compact_at: 0.7, hard_stop_at: 0.9 }, null, 2)
);
run(["install", "--target", "agents"]);
const preservedPolicy = JSON.parse(fs.readFileSync(seededPolicyPath, "utf8"));
assert.strictEqual(preservedPolicy.token_budget, 8000, "install must not overwrite customized LeanCTX policy");

const postinstallTmp = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-postinstall-smoke-"));
fs.writeFileSync(path.join(postinstallTmp, "package.json"), JSON.stringify({ name: "postinstall-fixture" }, null, 2));
runPostinstall(postinstallTmp);
assert(
  fs.existsSync(path.join(postinstallTmp, ".codebase", "context-policy.json")),
  "postinstall should seed LeanCTX policy when npm exposes INIT_CWD"
);

const pathOutput = run(["path"]);
assert(pathOutput.includes("genesis-harness"), "path should include installed skill paths");

const statusOutput = run(["status"]);
assert(statusOutput.includes("GENESIS HARNESS - STATUS REPORT"), "status should render status report");

const docsOutput = run(["docs"]);
assert(docsOutput.includes("GENESIS HARNESS - DOCUMENTATION REPORT"), "docs should render docs report");

const leanCtxOutput = run(["leanctx"]);
assert(leanCtxOutput.includes("LeanCTX Policy"), "leanctx should render policy report");
assert(leanCtxOutput.includes("Token budget: 8000"), "leanctx should read project policy");
assert(leanCtxOutput.includes("Command wrapper:"), "leanctx should report command wrapper detection");
assert(leanCtxOutput.includes("rtk optional"), "leanctx should treat rtk as optional");
assert(leanCtxOutput.includes("genesis-harness sync"), "leanctx should include portable sync command");

const primeOutput = run(["prime"]);
assert(primeOutput.includes("LeanCTX Policy"), "prime should include LeanCTX policy");
assert(primeOutput.includes("rtk optional"), "prime should document optional wrapper behavior");

const gateOutput = run(["docs-gate"]);
assert(
  gateOutput.includes("Docs sync check passed") || gateOutput.includes("docs sync check is limited"),
  "docs-gate should pass in fixture"
);

run(["sync"]);
const visual = fs.readFileSync(path.join(tmp, ".codebase", "VISUAL_GRAPH.md"), "utf8");
assert(visual.includes("Harness Relationship Map"), "sync should generate harness relationship map");
assert(visual.includes("genesis-harness docs-gate"), "sync graph should include docs-gate");
assert(!visual.includes("Đăng nhập"), "sync graph must not emit stale sample roadmap");
assert(!visual.includes("src/auth.js"), "sync graph must not emit stale sample source path");
assert(visual.includes("```mermaid"), "sync graph should contain mermaid fences");

console.log("cli smoke passed");
