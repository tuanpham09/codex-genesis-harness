const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const reusableVerifyPath = path.join(repoRoot, ".github", "workflows", "reusable-verify.yml");
const docsSyncPath = path.join(repoRoot, ".github", "workflows", "docs-sync.yml");
const publishPath = path.join(repoRoot, ".github", "workflows", "publish-npm.yml");
const registryPath = path.join(repoRoot, "features", "REGISTRY.md");

console.log("Running workflow contract unit tests...");

const reusableVerify = fs.readFileSync(reusableVerifyPath, "utf8");
const docsSync = fs.readFileSync(docsSyncPath, "utf8");
const publishWorkflow = fs.readFileSync(publishPath, "utf8");
const registry = fs.readFileSync(registryPath, "utf8");

assert(
  reusableVerify.includes("workflow_call:"),
  "reusable verify workflow should expose workflow_call"
);
assert(
  reusableVerify.includes("genesis-harness.js verify-gate"),
  "reusable verify workflow should execute the single verify-gate path"
);
assert(
  /actions\/checkout@[0-9a-f]{40}/.test(reusableVerify),
  "reusable verify workflow should pin actions/checkout to a full commit SHA"
);
assert(
  /actions\/setup-node@[0-9a-f]{40}/.test(reusableVerify),
  "reusable verify workflow should pin actions/setup-node to a full commit SHA"
);

assert(
  docsSync.includes("uses: ./.github/workflows/reusable-verify.yml"),
  "docs-sync workflow should delegate verification to the reusable workflow"
);
assert(
  !docsSync.includes("npm test"),
  "docs-sync workflow should not call a non-existent npm test script"
);
assert(
  !docsSync.includes("git push origin"),
  "docs-sync workflow should not auto-push documentation changes from CI"
);

assert(
  publishWorkflow.includes("release:"),
  "publish workflow should publish from a release event"
);
assert(
  publishWorkflow.includes("workflow_dispatch:"),
  "publish workflow should allow manual release runs"
);
assert(
  publishWorkflow.includes("id-token: write"),
  "publish workflow should use OIDC trusted publishing"
);
assert(
  publishWorkflow.includes("npm publish --provenance --access public"),
  "publish workflow should publish with provenance enabled"
);
assert(
  !publishWorkflow.includes("NPM_TOKEN"),
  "publish workflow should not require a long-lived NPM_TOKEN secret"
);
assert(
  !publishWorkflow.includes("npm pkg set"),
  "publish workflow should publish the checked-in release version without rewriting it in CI"
);
assert(
  !publishWorkflow.includes("--tag latest"),
  "publish workflow should avoid forcing prerelease-style CI publishes onto the latest dist-tag"
);

assert(
  registry.includes("| F016 | verified |"),
  "feature registry should mark cold-start automation as verified"
);
assert(
  registry.includes("| F018 | verified |"),
  "feature registry should mark scope ledger verification as verified"
);
assert(
  !registry.includes("| F019 | verified | Demo Feature") || !registry.includes("`npm test`"),
  "feature registry should not claim a verified demo feature with a non-existent npm test command"
);

console.log("workflow contract tests passed! ✓\n");
