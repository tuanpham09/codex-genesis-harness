const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const currentStatePath = path.join(repoRoot, ".codebase", "CURRENT_STATE.md");
const repoStatePath = path.join(repoRoot, ".codebase", "state.json");

console.log("Running state metadata contract unit tests...");

const currentState = fs.readFileSync(currentStatePath, "utf8");
const repoState = JSON.parse(fs.readFileSync(repoStatePath, "utf8"));
const allowedStates = new Set([
  "INIT",
  "REQUIREMENTS_GATHERING",
  "PLANNING",
  "IMPLEMENTATION",
  "VERIFICATION",
  "RELEASE_READY",
  "COMPLETED"
]);

const latestSessionMatch = currentState.match(/\*\*Latest Session\*\*: `([^`]+)`/);
assert(latestSessionMatch, "CURRENT_STATE.md should declare the latest session");
assert.strictEqual(
  repoState.session_id,
  latestSessionMatch[1],
  "state.json session_id should match CURRENT_STATE.md"
);

const ttfvMatch = currentState.match(/\*\*Time to First Verification \(TTFV\)\*\*: (\d+)s/);
assert(ttfvMatch, "CURRENT_STATE.md should declare TTFV in seconds");
assert.strictEqual(
  repoState.ttfv_seconds,
  Number(ttfvMatch[1]),
  "state.json ttfv_seconds should match CURRENT_STATE.md"
);
assert(
  repoState._comment_ttfv.includes(`${repoState.ttfv_seconds}s`),
  "state.json TTFV comment should describe the same number of seconds"
);

assert(
  allowedStates.has(repoState.current_state),
  `state.json current_state must be one of: ${Array.from(allowedStates).join(", ")}`
);

const sessionStartedAt = Date.parse(repoState.session_started_at);
assert(!Number.isNaN(sessionStartedAt), "state.json should include a valid session_started_at timestamp");

if (repoState.current_state === "COMPLETED") {
  const completedAt = Date.parse(repoState.completed_at);
  assert(!Number.isNaN(completedAt), "completed state should include a valid completed_at timestamp");
  assert(
    completedAt >= sessionStartedAt,
    "state.json completed_at must not be older than session_started_at"
  );
} else {
  assert(
    !Object.prototype.hasOwnProperty.call(repoState, "completed_at"),
    "active states should not retain a stale completed_at timestamp"
  );
}

for (const transition of repoState.history || []) {
  assert(
    allowedStates.has(transition.from),
    `history transition.from must be a legal state: ${transition.from}`
  );
  assert(
    allowedStates.has(transition.to),
    `history transition.to must be a legal state: ${transition.to}`
  );
}

console.log("state metadata contract tests passed! ✓\n");
