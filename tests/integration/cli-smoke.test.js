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

function runFailure(args, cwd = tmp) {
  try {
    run(args, cwd);
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`;
  }
  assert.fail(`expected command to fail: ${args.join(" ")}`);
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

const initTmp = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-init-smoke-"));
fs.writeFileSync(path.join(initTmp, "README.md"), "# Blank project\n");
const initOutput = run(["init", "--platform", "codex", "--yes"], initTmp);
assert(initOutput.includes("Initialization Complete"), "init should complete non-interactively");
assert(
  fs.existsSync(path.join(initTmp, ".planning", "STATE.md")),
  "init should create planning state for empty projects"
);
assert(
  fs.existsSync(path.join(initTmp, ".codex", "skills", "genesis-harness", "SKILL.md")),
  "codex init should install packaged skills into the project-local .codex/skills directory"
);
assert(
  !fs.existsSync(path.join(initTmp, "codex-home", "skills", "genesis-harness")),
  "codex init should not write packaged skills into CODEX_HOME"
);
assert(
  !fs.existsSync(path.join(initTmp, "agents-home", "skills", "genesis-harness")),
  "codex init should not write packaged skills into GENESIS_HARNESS_HOME"
);
assert(
  fs.existsSync(path.join(initTmp, ".planning", "phases", "01-discovery-and-qa", "TASKS.md")),
  "init should create a post-foundation discovery phase"
);
assert(
  fs.existsSync(path.join(initTmp, ".codebase", "PHASE_DEPENDENCY_MAP.md")),
  "init should create a phase dependency map"
);
const initState = fs.readFileSync(path.join(initTmp, ".planning", "STATE.md"), "utf8");
assert(
  initState.includes("Run discovery Q&A to confirm product approach and tech stack."),
  "init should route the next step to discovery Q&A"
);
const qaBrief = fs.readFileSync(path.join(initTmp, ".planning", "INIT_QA.md"), "utf8");
assert(qaBrief.includes("tech stack"), "init should seed tech stack QA prompts");
assert(qaBrief.includes("QA sign-off"), "init should seed QA approval prompts");
const roadmap = fs.readFileSync(path.join(initTmp, ".planning", "ROADMAP.md"), "utf8");
assert(roadmap.includes("01 Discovery & QA"), "init should add a discovery phase to the roadmap");

const ideaTmp = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-init-idea-"));
const idea =
  "Build a lightweight meal-planning app for busy families that suggests weekly menus, tracks groceries, and works on mobile first.";
const ideaInitOutput = run(["init", "--platform", "codex", "--yes", "--idea", idea], ideaTmp);
assert(ideaInitOutput.includes("Initialization Complete"), "init with idea should complete");
const projectDoc = fs.readFileSync(path.join(ideaTmp, ".planning", "PROJECT.md"), "utf8");
assert(projectDoc.includes("meal-planning app"), "init with idea should seed project summary from the idea");
const requirementsDoc = fs.readFileSync(path.join(ideaTmp, ".planning", "REQUIREMENTS.md"), "utf8");
assert(requirementsDoc.includes("weekly menus"), "init with idea should seed functional requirements from the idea");
const stackDoc = fs.readFileSync(path.join(ideaTmp, ".planning", "STACK.md"), "utf8");
assert(stackDoc.includes("Mobile-first"), "init with idea should capture stack clues from the idea");
const summaryDoc = fs.readFileSync(path.join(ideaTmp, ".planning", "SUMMARY.md"), "utf8");
assert(summaryDoc.includes("meal-planning app"), "init with idea should carry the idea into the planning summary");
const initQaDoc = fs.readFileSync(path.join(ideaTmp, ".planning", "INIT_QA.md"), "utf8");
assert(initQaDoc.includes(idea), "init with idea should embed the original user brief for QA follow-up");

const runTmp = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-run-idea-"));
const runIdea =
  "Create a concierge booking assistant for boutique hotels that helps staff manage guest requests from a tablet.";
const runOutput = run(
  [
    "run",
    "--platform",
    "codex",
    "--yes",
    "--idea",
    runIdea,
    "--product-approach",
    "Start with a staff-facing web dashboard optimized for tablet use in the lobby.",
    "--primary-user",
    "Front-desk hotel staff",
    "--v1-outcome",
    "Staff can log, prioritize, and resolve guest requests in one queue.",
    "--qa-owner",
    "Operations lead",
    "--backend",
    "Node.js",
    "--frontend",
    "React",
    "--database",
    "PostgreSQL",
    "--deployment",
    "Fly.io",
    "--test-strategy",
    "Node integration tests and Playwright smoke tests",
    "--stack-owner",
    "Tech lead"
  ],
  runTmp
);
assert(runOutput.includes("Run pipeline complete"), "run should complete the bootstrap pipeline");
const runProjectDoc = fs.readFileSync(path.join(runTmp, ".planning", "PROJECT.md"), "utf8");
assert(runProjectDoc.includes("Front-desk hotel staff"), "run should record the primary user");
assert(runProjectDoc.includes("staff-facing web dashboard"), "run should record the chosen product approach");
const runStackDoc = fs.readFileSync(path.join(runTmp, ".planning", "STACK.md"), "utf8");
assert(runStackDoc.includes("Language: Node.js"), "run should fill backend stack details");
assert(runStackDoc.includes("Framework: React"), "run should fill frontend stack details");
const runAdrDoc = fs.readFileSync(path.join(runTmp, ".planning", "decisions", "ADR-001-tech-stack.md"), "utf8");
assert(runAdrDoc.includes("Status: Accepted"), "run should close the tech-stack ADR when answers are provided");
const runInitQaDoc = fs.readFileSync(path.join(runTmp, ".planning", "INIT_QA.md"), "utf8");
assert(runInitQaDoc.includes("Operations lead"), "run should record the QA owner");
assert(runInitQaDoc.includes("Fly.io"), "run should record deployment direction");
const runRequirementsDoc = fs.readFileSync(path.join(runTmp, ".planning", "REQUIREMENTS.md"), "utf8");
assert(
  !runRequirementsDoc.includes("guest requests are handled without context loss"),
  "run should not hard-code a hotel-specific user-story outcome into generic planning docs"
);
assert(
  runRequirementsDoc.includes("the core workflow can be completed without context loss"),
  "run should use a generic user-story outcome in seeded planning docs"
);
const runState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(runState.current_state, "IMPLEMENTATION", "run should advance the bootstrap state into feature execution");
assert(
  runState.pending_tasks.includes("Implement the first feature slice"),
  "run should queue the first implementation slice"
);
assert(runState.active_feature, "run should record the active feature path");
const activeFeatureDir = path.join(runTmp, runState.active_feature);
assert(fs.existsSync(activeFeatureDir), "run should scaffold the active feature directory");
assert(
  fs.existsSync(path.join(activeFeatureDir, "SPEC.md")),
  "run should create a feature specification before implementation"
);
assert(
  fs.existsSync(path.join(activeFeatureDir, "PLAN.md")),
  "run should create a feature plan before implementation"
);
assert(
  fs.existsSync(path.join(activeFeatureDir, "TEST_CONTRACT.md")),
  "run should create a feature test contract before implementation"
);
assert(
  fs.existsSync(path.join(activeFeatureDir, "VERIFICATION.md")),
  "run should create feature verification instructions before implementation"
);
const activeFeatureSpec = fs.readFileSync(path.join(activeFeatureDir, "SPEC.md"), "utf8");
assert(activeFeatureSpec.includes("Front-desk hotel staff"), "run should seed the feature spec with the primary user");
assert(activeFeatureSpec.includes("one queue"), "run should seed the feature spec with the v1 outcome");
const activeFeaturePlan = fs.readFileSync(path.join(activeFeatureDir, "PLAN.md"), "utf8");
assert(activeFeaturePlan.includes("scripts/verify.sh"), "run should seed implementation verification commands");
const activeFeatureContract = fs.readFileSync(path.join(activeFeatureDir, "TEST_CONTRACT.md"), "utf8");
assert(activeFeatureContract.includes("contracts/ui/"), "run should link the feature test contract to generated UI contracts");
assert(activeFeatureContract.includes("contracts/api/"), "run should link the feature test contract to generated API contracts");
const featureIndex = fs.readFileSync(path.join(runTmp, ".planning", "FEATURE_INDEX.md"), "utf8");
assert(featureIndex.includes(path.basename(activeFeatureDir)), "run should register the active feature in FEATURE_INDEX.md");
const generatedUiContractPath = path.join(runTmp, "contracts", "ui", path.basename(activeFeatureDir), "screen-contract.json");
assert(fs.existsSync(generatedUiContractPath), "run should scaffold a UI contract for a UI-capable first feature");
const generatedUiContract = JSON.parse(fs.readFileSync(generatedUiContractPath, "utf8"));
assert(generatedUiContract.contract_id.startsWith("UI-"), "run should generate a typed UI contract id");
assert.strictEqual(generatedUiContract.inputs.route, "/staff-queue", "run should derive a UI route for the first feature");
assert(
  generatedUiContract.outputs.events.some(event => event.name === "onQueueItemSelect"),
  "run should generate UI events tailored to the first feature"
);
const generatedUiFixturePath = path.join(runTmp, "playwright", "fixtures", `${path.basename(activeFeatureDir)}-ui-fixture.md`);
assert(fs.existsSync(generatedUiFixturePath), "run should scaffold a UI fixture for a UI-capable first feature");
const generatedUiFixture = fs.readFileSync(generatedUiFixturePath, "utf8");
assert(generatedUiFixture.includes("/staff-queue"), "run should seed the UI fixture with the derived route");
const generatedApiContractDir = path.join(runTmp, "contracts", "api", path.basename(activeFeatureDir));
assert(fs.existsSync(path.join(generatedApiContractDir, "request.json")), "run should scaffold an API request contract for a backend-capable first feature");
assert(fs.existsSync(path.join(generatedApiContractDir, "response.json")), "run should scaffold an API response contract for a backend-capable first feature");
const generatedApiRequest = JSON.parse(fs.readFileSync(path.join(generatedApiContractDir, "request.json"), "utf8"));
assert.strictEqual(generatedApiRequest.method, "POST", "run should generate an API method for the first feature");
assert.strictEqual(generatedApiRequest.path, "/api/staff-queue/items", "run should derive an API path for the first feature");
const generatedApiResponse = JSON.parse(fs.readFileSync(path.join(generatedApiContractDir, "response.json"), "utf8"));
assert.strictEqual(generatedApiResponse.status, 200, "run should generate an expected successful API status");
assert.strictEqual(generatedApiResponse.body.status, "queued", "run should tailor the API response body to the first feature");
const generatedApiFixturePath = path.join(runTmp, "fixtures", "api", `${path.basename(activeFeatureDir)}-api-fixture.md`);
assert(fs.existsSync(generatedApiFixturePath), "run should scaffold an API fixture for a backend-capable first feature");
const generatedApiFixture = fs.readFileSync(generatedApiFixturePath, "utf8");
assert(generatedApiFixture.includes("/api/staff-queue/items"), "run should seed the API fixture with the derived endpoint");
const runArtifactDir = path.join(runTmp, ".runs", runState.session_id);
assert(
  fs.existsSync(path.join(runArtifactDir, "STATE.json")),
  "run should persist a resumable state artifact for the active session"
);
const runArtifactState = JSON.parse(fs.readFileSync(path.join(runArtifactDir, "STATE.json"), "utf8"));
assert.strictEqual(
  runArtifactState.current_state,
  "IMPLEMENTATION",
  "run artifact state should mirror the active implementation phase"
);
assert(
  fs.existsSync(path.join(runArtifactDir, "DISCOVERY.json")),
  "run should persist discovery answers for later resume"
);
assert(
  fs.existsSync(path.join(runArtifactDir, "RESUME.md")),
  "run should persist a human-readable resume brief"
);
const resumeOutput = run(["resume"], runTmp);
assert(resumeOutput.includes("Resume session:"), "resume should print the active session summary");
assert(resumeOutput.includes(runState.session_id), "resume should reference the active session id");
assert(resumeOutput.includes("IMPLEMENTATION"), "resume should show the current execution state");
assert(
  resumeOutput.includes(path.basename(activeFeatureDir)),
  "resume should reference the active feature directory"
);
assert(
  resumeOutput.includes("Implement the first feature slice"),
  "resume should direct the next implementation task"
);
const featureRegistryPath = path.join(runTmp, ".planning", "FEATURE_REGISTRY.json");
assert(
  fs.existsSync(featureRegistryPath),
  "run should create a machine-readable project feature registry"
);
const projectFeatureRegistry = JSON.parse(fs.readFileSync(featureRegistryPath, "utf8"));
assert.strictEqual(projectFeatureRegistry.features.length, 1, "run should register the first feature");
assert.strictEqual(
  projectFeatureRegistry.features[0].status,
  "in-progress",
  "the scaffolded first feature should enter the execution queue"
);
assert.strictEqual(
  projectFeatureRegistry.project_status,
  "implementation",
  "the project registry should record the implementation lifecycle stage"
);

const secondFeatureTitle = "Notify staff when a guest request changes";
const addFeatureOutput = run(
  [
    "add-feature",
    "--title",
    secondFeatureTitle,
    "--slug",
    "guest-request-notifications",
    "--verify-cmd",
    `${process.execPath} -e "process.exit(0)"`
  ],
  runTmp
);
assert(addFeatureOutput.includes(secondFeatureTitle), "add-feature should report the queued feature");
const registryWithQueue = JSON.parse(fs.readFileSync(featureRegistryPath, "utf8"));
assert.strictEqual(registryWithQueue.features.length, 2, "add-feature should append to the project queue");
assert.strictEqual(registryWithQueue.features[1].status, "planned", "new features should remain planned");
assert(
  fs.existsSync(path.join(runTmp, registryWithQueue.features[1].path, "TASKS.md")),
  "add-feature should create an execution packet for the queued feature"
);

const nextOutput = run(["next"], runTmp);
assert(nextOutput.includes(path.basename(activeFeatureDir)), "next should identify the active feature");
assert(nextOutput.includes("Add the first failing test"), "next should print the next pending action");

const missingEvidenceOutput = runFailure(
  ["complete-feature", "--verify-cmd", `${process.execPath} -e "process.exit(0)"`],
  runTmp
);
assert(
  missingEvidenceOutput.includes("--evidence"),
  "complete-feature should require explicit verification evidence"
);

const completionOutput = run(
  [
    "complete-feature",
    "--verify-cmd",
    `${process.execPath} -e "process.exit(0)"`,
    "--evidence",
    "CLI lifecycle smoke verification passed"
  ],
  runTmp
);
assert(completionOutput.includes("Feature completed"), "complete-feature should report successful completion");
const promotedState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(
  promotedState.current_state,
  "IMPLEMENTATION",
  "complete-feature should keep the project in implementation while queued work remains"
);
assert(
  promotedState.active_feature.includes("guest-request-notifications"),
  "complete-feature should promote the next planned feature"
);
assert(
  promotedState.metrics.time_to_verified_feature_seconds >= 0,
  "complete-feature should record feature lead-time telemetry"
);
const promotedRegistry = JSON.parse(fs.readFileSync(featureRegistryPath, "utf8"));
assert.strictEqual(
  promotedRegistry.features[0].status,
  "verified",
  "complete-feature should move the active feature to verified"
);
assert.strictEqual(
  promotedRegistry.features[0].evidence,
  "CLI lifecycle smoke verification passed",
  "complete-feature should persist verification evidence"
);
assert.strictEqual(
  promotedRegistry.features[1].status,
  "in-progress",
  "complete-feature should promote the next queued feature"
);
const featureIndexAfterCompletion = fs.readFileSync(path.join(runTmp, ".planning", "FEATURE_INDEX.md"), "utf8");
assert(
  featureIndexAfterCompletion.includes(`| ${promotedRegistry.features[0].title} | [x] |`),
  "complete-feature should mark the feature complete in FEATURE_INDEX.md"
);
const lifecycleRunLog = path.join(
  runTmp,
  "observability",
  "agent-runs",
  `${promotedState.session_id}-feature-complete.json`
);
assert(fs.existsSync(lifecycleRunLog), "complete-feature should write an observability run record");
const nextPromotedOutput = run(["next"], runTmp);
assert(nextPromotedOutput.includes(secondFeatureTitle), "next should resolve the promoted feature");

run(
  [
    "complete-feature",
    "--verify-cmd",
    `${process.execPath} -e "process.exit(0)"`,
    "--evidence",
    "Notification feature verification passed"
  ],
  runTmp
);
const verificationState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(
  verificationState.current_state,
  "VERIFICATION",
  "completing the final feature should move the project to verification"
);
assert.strictEqual(verificationState.active_feature, "", "final feature completion should clear active work");

const prematureCompletion = runFailure(["complete-project", "--evidence", "Premature close"], runTmp);
assert(
  prematureCompletion.includes("RELEASE_READY"),
  "complete-project should reject projects that have not passed project verification"
);

const projectVerificationOutput = run(
  [
    "verify-project",
    "--verify-cmd",
    `${process.execPath} -e "process.exit(0)"`,
    "--evidence",
    "Project acceptance suite passed"
  ],
  runTmp
);
assert(projectVerificationOutput.includes("Project verified"), "verify-project should report success");
const releaseReadyState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(
  releaseReadyState.current_state,
  "RELEASE_READY",
  "verify-project should move the project to release readiness"
);
assert(
  fs.existsSync(path.join(runTmp, ".planning", "PROJECT_VERIFICATION.json")),
  "verify-project should persist project-level proof"
);
assert(
  fs.existsSync(path.join(runTmp, ".planning", "IMPLEMENTATION_HANDOFF.md")),
  "verify-project should create a final implementation handoff"
);

const projectCompletionOutput = run(
  ["complete-project", "--evidence", "Release readiness approved"],
  runTmp
);
assert(projectCompletionOutput.includes("Project completed"), "complete-project should close release-ready work");
const completedState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(completedState.current_state, "COMPLETED", "complete-project should close project state");
const historyLength = completedState.history.length;
const eventsPath = path.join(runArtifactDir, "EVENTS.jsonl");
assert(fs.existsSync(eventsPath), "lifecycle transitions should create append-only run events");
const eventCount = fs.readFileSync(eventsPath, "utf8").trim().split("\n").length;
assert(eventCount >= 5, "event history should include queue, feature, verification, and completion transitions");

const repeatedCompletionOutput = run(
  ["complete-project", "--evidence", "Release readiness approved"],
  runTmp
);
assert(repeatedCompletionOutput.includes("already completed"), "complete-project should be idempotent");
const repeatedCompletionState = JSON.parse(fs.readFileSync(path.join(runTmp, ".codebase", "state.json"), "utf8"));
assert.strictEqual(
  repeatedCompletionState.history.length,
  historyLength,
  "idempotent completion should not duplicate state history"
);
assert.strictEqual(
  fs.readFileSync(eventsPath, "utf8").trim().split("\n").length,
  eventCount,
  "idempotent completion should not duplicate lifecycle events"
);

const auditOutput = run(["pipeline-audit"], runTmp);
assert(auditOutput.includes("Pipeline audit passed"), "pipeline-audit should validate the completed lifecycle");

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
