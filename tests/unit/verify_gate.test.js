const assert = require("assert");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const cli = path.join(repoRoot, "bin", "genesis-harness.js");

console.log("Running verify-gate contract unit tests...");

const output = execFileSync(process.execPath, [cli, "verify-gate"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    GENESIS_VERIFY_GATE_SELF_TEST: "1"
  },
  encoding: "utf8"
});

assert(output.includes("run-evals.sh"), "verify-gate should include eval regression checks");
assert(output.includes("docs-gate"), "verify-gate should include docs drift checks");
assert(output.includes("cold-start"), "verify-gate should include cold-start readiness checks");
assert(output.includes("pack:check"), "verify-gate should include package dry-run checks");
assert(output.includes("leanctx"), "verify-gate should include lean context reporting");

console.log("verify-gate contract tests passed! ✓\n");
