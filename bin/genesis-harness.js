#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const packageRoot = path.resolve(__dirname, "..");
const skillNames = [
  "genesis-harness",
  "genesis-new-design",
  "genesis-upgrade-design",
  "genesis-architecture",
  "genesis-planning",
  "genesis-codebase-map",
  "genesis-design-spec",
  "genesis-api-contract",
  "genesis-ui-ux-test",
  "genesis-harness-engineering",
  "genesis-ai-provider",
  "genesis-pipeline-orchestration",
  "genesis-api-sync",
  "genesis-debug-guide",
  "genesis-docs-automation",
  "genesis-spec-propagation",
  "genesis-performance-profiling",
  "genesis-observability-automation",
  "genesis-research-first",
  "genesis-release",
  "spec-impact-engine",
  "genesis-executing-plans",
  "genesis-test-driven-development",
  "genesis-verification-before-completion",
  "genesis-using-git-worktrees"
];
const legacySkillNames = ["project-genesis-harness"];
const sourceRoot = path.join(packageRoot, ".codex", "skills");
const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
const agentsHome = process.env.GENESIS_HARNESS_HOME || path.join(process.env.HOME || "", ".agents");
const legacySkillsRoot = path.join(codexHome, "skills");
const agentsSkillsRoot = path.join(agentsHome, "skills");

function usage(exitCode = 0) {
  const text = `
Project Genesis Harness

Usage:
  genesis-harness install [--target agents|legacy|both]
  genesis-harness verify [--target agents|legacy|both]
  genesis-harness uninstall [--target agents|legacy|both]
  genesis-harness path
  genesis-harness status                 Show implementation status & skills inventory
  genesis-harness docs                   Show API contracts & documentation sync report
  genesis-harness docs-gate              Run pre-commit documentation drift checks
  genesis-harness verify-gate            Run ALL verification gates before claiming done (L09 blocker)
  genesis-harness cold-start             Run automated cold-start L03 checklist
  genesis-harness remember [cat] "<msg>" Remember a persistent project fact/insight (Bead)
  genesis-harness recall [query]         Recall and search remembered project facts
  genesis-harness forget <id>            Forget/delete a fact by its unique 6-char ID
  genesis-harness prime                  Generate the token-minimized Agent Priming Prompt
  genesis-harness leanctx                Show token budget policy and portable command guidance
  genesis-harness view-mockup [slug]      Interactive console UI to search & view mockups
  genesis-harness mcp                    Interactive MCP installer
  genesis-harness sync                   Compress and sync codebase context (AST/Regex)
  genesis-harness setup-hooks            Install auto-sync git pre-commit hook
  genesis-harness heal <command>         Run test & print agent directive on failure

Environment:
  CODEX_HOME=/custom/.codex  Override Codex home
  GENESIS_HARNESS_HOME=/custom/.agents  Override modern skills home
  GENESIS_HARNESS_SKIP_POSTINSTALL=1  Skip npm postinstall auto-install
  GENESIS_HARNESS_COMMAND_WRAPPER=rtk  Optional local command wrapper override
  GENESIS_HARNESS_DISABLE_RTK=1  Disable automatic rtk detection
`;
  console.log(text.trim());
  process.exit(exitCode);
}

function fail(message) {
  console.error(`genesis-harness: ${message}`);
  process.exit(1);
}

function ensureSource() {
  for (const skillName of skillNames) {
    const skillFile = path.join(sourceRoot, skillName, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      fail(`missing packaged skill at ${skillFile}`);
    }
  }
}

function parseTarget(args, fallback = "both") {
  let target = fallback;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target") {
      target = args[i + 1];
      i++;
      continue;
    }
    usage(2);
  }
  if (!["agents", "legacy", "both"].includes(target)) usage(2);
  return target;
}

function targetRoots(target) {
  if (target === "agents") return [agentsSkillsRoot];
  if (target === "legacy") return [legacySkillsRoot];
  return [agentsSkillsRoot, legacySkillsRoot];
}

function copySkills({ quiet = false, target = "both" } = {}) {
  ensureSource();
  for (const root of targetRoots(target)) {
    fs.mkdirSync(root, { recursive: true });
    for (const skillName of skillNames) {
      const sourceDir = path.join(sourceRoot, skillName);
      const dir = path.join(root, skillName);

      if (fs.existsSync(dir)) {
        const backupParent = path.join(root, "..", "backups");
        fs.mkdirSync(backupParent, { recursive: true });
        const backupDir = path.join(backupParent, `${skillName}.backup.${timestamp()}`);
        fs.renameSync(dir, backupDir);
        if (!quiet) console.log(`Existing skill backed up to: ${backupDir}`);
      }

      fs.cpSync(sourceDir, dir, { recursive: true });
      chmodScripts(path.join(dir, "scripts"));

      if (!quiet) console.log(`Installed ${skillName} to: ${dir}`);
    }
  }

  if (!quiet) console.log("Restart Codex, then invoke: Use $genesis-harness");
}

function shouldSeedProjectRoot(rootPath) {
  if (!rootPath) return false;
  const resolvedRoot = path.resolve(rootPath);
  if (resolvedRoot === packageRoot) return false;
  const markers = [
    "package.json",
    "AGENTS.md",
    "pyproject.toml",
    "Cargo.toml",
    "go.mod",
    ".git",
    ".codebase"
  ];
  return markers.some(marker => fs.existsSync(path.join(resolvedRoot, marker)));
}

function seedLeanCtxPolicy(rootPath = process.cwd(), { quiet = false } = {}) {
  if (!shouldSeedProjectRoot(rootPath)) return false;

  const sourcePolicy = path.join(packageRoot, ".codebase", "context-policy.json");
  if (!fs.existsSync(sourcePolicy)) return false;

  const codebaseDir = path.join(rootPath, ".codebase");
  const targetPolicy = path.join(codebaseDir, "context-policy.json");
  fs.mkdirSync(codebaseDir, { recursive: true });

  if (fs.existsSync(targetPolicy)) {
    if (!quiet) console.log(`[genesis-harness] LeanCTX policy already exists: ${targetPolicy}`);
    return false;
  }

  fs.copyFileSync(sourcePolicy, targetPolicy);
  if (!quiet) console.log(`[genesis-harness] LeanCTX policy installed: ${targetPolicy}`);
  return true;
}

function resolvePostinstallProjectRoot() {
  const initCwd = process.env.INIT_CWD;
  if (shouldSeedProjectRoot(initCwd)) return initCwd;
  if (shouldSeedProjectRoot(process.cwd())) return process.cwd();
  return null;
}

function uninstallSkills(target = "both") {
  for (const root of targetRoots(target)) {
    for (const skillName of [...skillNames, ...legacySkillNames]) {
      const dir = path.join(root, skillName);
      if (!fs.existsSync(dir)) {
        console.log(`Skill is not installed at: ${dir}`);
        continue;
      }
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`Removed: ${dir}`);
    }
  }
}

function verifySkill(target = "both") {
  const verifyScript = path.join(packageRoot, "scripts", "verify.sh");
  if (!fs.existsSync(verifyScript)) fail(`missing verify script at ${verifyScript}`);
  const bash = resolveBash();

  for (const root of targetRoots(target)) {
    for (const skillName of skillNames) {
      const result = spawnSync(bash, [verifyScript, path.join(root, skillName)], {
        stdio: "inherit",
        env: process.env
      });
      if (result.status) process.exit(result.status);
    }
  }
}

function resolveBash() {
  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files\\Git\\usr\\bin\\bash.exe"
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return "bash";
}

function commandExists(commandName) {
  if (!/^[A-Za-z0-9._-]+$/.test(commandName)) return false;
  const result = process.platform === "win32"
    ? spawnSync("where", [commandName], { stdio: "ignore" })
    : spawnSync("sh", ["-c", `command -v ${commandName}`], { stdio: "ignore" });
  return result.status === 0;
}

function detectCommandWrapper() {
  if (process.env.GENESIS_HARNESS_COMMAND_WRAPPER) {
    return {
      command: process.env.GENESIS_HARNESS_COMMAND_WRAPPER,
      source: "GENESIS_HARNESS_COMMAND_WRAPPER"
    };
  }

  if (process.env.GENESIS_HARNESS_DISABLE_RTK === "1") {
    return { command: null, source: "disabled" };
  }

  if (commandExists("rtk")) {
    return { command: "rtk", source: "auto-detected" };
  }

  return { command: null, source: "not detected" };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function defaultContextPolicy() {
  return {
    name: "leanctx-default",
    token_budget: 12000,
    warn_at: 0.6,
    compact_at: 0.7,
    hard_stop_at: 0.85,
    portable_commands: [
      "genesis-harness leanctx",
      "genesis-harness sync",
      "genesis-harness docs-gate",
      "npm run verify",
      "npm run eval"
    ],
    wrapper_policy: "rtk optional when installed locally; public docs and CI must use portable commands.",
    layers: []
  };
}

function loadContextPolicy(rootPath = process.cwd()) {
  const projectPolicy = readJsonIfExists(path.join(rootPath, ".codebase", "context-policy.json"));
  const packagedPolicy = readJsonIfExists(path.join(packageRoot, ".codebase", "context-policy.json"));
  return {
    ...defaultContextPolicy(),
    ...(packagedPolicy || {}),
    ...(projectPolicy || {})
  };
}

function formatCommand(command, wrapper) {
  if (!wrapper.command) return command;
  return `${wrapper.command} ${command}`;
}

function buildLeanCtxReport(rootPath = process.cwd()) {
  const policy = loadContextPolicy(rootPath);
  const wrapper = detectCommandWrapper();
  const tokenBudget = Number(policy.token_budget || 12000);
  const compactAt = Number(policy.compact_at || 0.7);
  const hardStopAt = Number(policy.hard_stop_at || 0.85);
  const lines = [];

  lines.push("# LeanCTX Policy");
  lines.push("");
  lines.push(`- Policy: ${policy.name || "leanctx-default"}`);
  lines.push(`- Token budget: ${tokenBudget}`);
  lines.push(`- Compact at: ${Math.round(tokenBudget * compactAt)} tokens (${compactAt})`);
  lines.push(`- Hard stop at: ${Math.round(tokenBudget * hardStopAt)} tokens (${hardStopAt})`);
  lines.push(`- Command wrapper: ${wrapper.command ? `${wrapper.command} (${wrapper.source})` : `none (${wrapper.source})`} - rtk optional`);
  lines.push(`- Wrapper policy: ${policy.wrapper_policy || "rtk optional; keep public commands portable."}`);
  lines.push("");
  lines.push("## Portable Commands");
  for (const command of policy.portable_commands || []) {
    lines.push(`- \`${command}\``);
  }

  if (wrapper.command) {
    lines.push("");
    lines.push("## Local Wrapper Commands");
    for (const command of policy.portable_commands || []) {
      lines.push(`- \`${formatCommand(command, wrapper)}\``);
    }
  }

  if (Array.isArray(policy.layers) && policy.layers.length > 0) {
    lines.push("");
    lines.push("## Context Layers");
    for (const layer of policy.layers) {
      lines.push(`- ${layer.name}: ${layer.max_tokens || "unbounded"} tokens`);
    }
  }

  lines.push("");
  lines.push("Use LeanCTX by loading core state first, then active context, then deferred references only when needed.");
  return lines.join("\n");
}

function chmodScripts(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const file = path.join(dir, entry);
    if (entry.endsWith(".sh") && fs.statSync(file).isFile()) {
      fs.chmodSync(file, 0o755);
    }
  }
}

function timestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function showStatus() {
  console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
  console.log("\x1b[1m\x1b[36m                     GENESIS HARNESS - STATUS REPORT                  \x1b[0m");
  console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");

  // 1. Current State
  const currentStateFile = path.join(packageRoot, ".codebase", "CURRENT_STATE.md");
  if (fs.existsSync(currentStateFile)) {
    const content = fs.readFileSync(currentStateFile, "utf8");
    console.log("\n\x1b[1m\x1b[32m[+] Repository State (.codebase/CURRENT_STATE.md):\x1b[0m");
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("- ")) {
        console.log("  " + line.trim());
      } else if (line.trim()) {
        console.log("    " + line.trim());
      }
    }
  } else {
    console.log("\n\x1b[1m\x1b[31m[-] Repository State:\x1b[0m .codebase/CURRENT_STATE.md not found.");
  }

  // 2. Active Planning & Task Tracking
  const stateFile = path.join(packageRoot, ".planning", "STATE.md");
  const roadmapFile = path.join(packageRoot, ".planning", "ROADMAP.md");
  if (fs.existsSync(stateFile) || fs.existsSync(roadmapFile)) {
    console.log("\n\x1b[1m\x1b[32m[+] FSM Active Planning & Task Tracking (.planning/):\x1b[0m");
    if (fs.existsSync(stateFile)) {
      console.log("  \x1b[1m- Current Execution State (.planning/STATE.md):\x1b[0m");
      const content = fs.readFileSync(stateFile, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.includes("Current project state:") || line.includes("Current phase:") || line.includes("Current feature or bug:") || line.includes("Next task:") || line.includes("Latest verification result:")) {
          console.log(`    ${line.replace("#", "").trim()}`);
        }
      }
    }
    if (fs.existsSync(roadmapFile)) {
      console.log("\n  \x1b[1m- 5-Phase Roadmap Status (.planning/ROADMAP.md):\x1b[0m");
      const content = fs.readFileSync(roadmapFile, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.match(/^-\s*\[[ x~!]\]/)) {
          console.log(`    ${line.trim()}`);
        }
      }
    }
  } else {
    console.log("\n\x1b[1m\x1b[33m[-] FSM Active Planning:\x1b[0m No active .planning/ session found. Run `/genesis-init` in Codex to initialize.");
  }

  // 3. Skills Inventory
  console.log("\n\x1b[1m\x1b[32m[+] Skills Inventory Check (Exactly 25 core skills):\x1b[0m");
  let found = 0;
  let mismatched = 0;
  for (const skillName of skillNames) {
    const skillDir = path.join(sourceRoot, skillName);
    const skillFile = path.join(skillDir, "SKILL.md");
    if (fs.existsSync(skillFile)) {
      found++;
      const content = fs.readFileSync(skillFile, "utf8");
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const name = nameMatch ? nameMatch[1].trim() : "";
      if (name !== skillName) {
        mismatched++;
        console.log(`  \x1b[31m[-] Mismatch:\x1b[0m folder '${skillName}' has frontmatter name '${name}'`);
      }
    } else {
      console.log(`  \x1b[31m[-] Missing:\x1b[0m ${skillName} (SKILL.md not found)`);
    }
  }

  if (found === skillNames.length && mismatched === 0) {
    console.log(`  \x1b[32m✓ Success:\x1b[0m All ${skillNames.length} skill folders perfectly standard and synchronized!`);
  } else {
    console.log(`  \x1b[31m⚠️ Alert:\x1b[0m Found ${found}/${skillNames.length} skills. Mismatches: ${mismatched}.`);
  }

  // 4. Verification Test Run Status
  console.log("\n\x1b[1m\x1b[32m[+] Quick Pipeline Commands:\x1b[0m");
  console.log("  - Run structural checks:   \x1b[33m./scripts/verify.sh\x1b[0m");
  console.log("  - Run regression tests:    \x1b[33m./scripts/run-evals.sh\x1b[0m");
  console.log("  - Run package checks:      \x1b[33mnpm run pack:check\x1b[0m");

  console.log("\n\x1b[1m\x1b[36m======================================================================\x1b[0m\n");
}

function showDocsStatus() {
  console.log("\x1b[1m\x1b[35m======================================================================\x1b[0m");
  console.log("\x1b[1m\x1b[35m                 GENESIS HARNESS - DOCUMENTATION REPORT               \x1b[0m");
  console.log("\x1b[1m\x1b[35m======================================================================\x1b[0m");

  // 1. Architecture Summary
  const archFile = path.join(packageRoot, ".codebase", "ARCHITECTURE.md");
  if (fs.existsSync(archFile)) {
    console.log("\n\x1b[1m\x1b[32m[+] System Architecture (.codebase/ARCHITECTURE.md):\x1b[0m");
    const content = fs.readFileSync(archFile, "utf8");
    console.log("  " + content.trim().split("\n").filter(l => l.trim() && !l.startsWith("#")).join("\n  "));
  }

  // 2. API Contracts & Specs
  console.log("\n\x1b[1m\x1b[32m[+] API Contracts & Specs (contracts/api/):\x1b[0m");
  const apiDir = path.join(packageRoot, "contracts", "api");
  if (fs.existsSync(apiDir)) {
    const endpoints = fs.readdirSync(apiDir).filter(f => fs.statSync(path.join(apiDir, f)).isDirectory());
    if (endpoints.length > 0) {
      for (const endpoint of endpoints) {
        console.log(`  - \x1b[1m${endpoint}\x1b[0m`);
        const files = ["request.json", "response.json", "schema.json", "example.json", "error.json"];
        const found = [];
        for (const file of files) {
          if (fs.existsSync(path.join(apiDir, endpoint, file))) {
            found.push(file.replace(".json", ""));
          }
        }
        console.log(`    Files: \x1b[33m${found.join(", ")}\x1b[0m`);

        // Print request structure preview if request.json exists
        const reqPath = path.join(apiDir, endpoint, "request.json");
        if (fs.existsSync(reqPath)) {
          try {
            const req = JSON.parse(fs.readFileSync(reqPath, "utf8"));
            console.log(`    Request: \x1b[90m${JSON.stringify(req).slice(0, 80)}...\x1b[0m`);
          } catch(e) {}
        }
      }
    } else {
      console.log("  No API endpoint contracts defined under contracts/api/.");
    }
  } else {
    console.log("  contracts/api/ directory not found.");
  }

  // 3. Documentation Density
  console.log("\n\x1b[1m\x1b[32m[+] Documentation Density Stats:\x1b[0m");
  const countMd = (dir) => {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    const walk = (d) => {
      for (const f of fs.readdirSync(d)) {
        const full = path.join(d, f);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (f.endsWith(".md")) {
          count++;
        }
      }
    };
    walk(dir);
    return count;
  };

  const codebaseMd = countMd(path.join(packageRoot, ".codebase"));
  const skillsMd = countMd(path.join(packageRoot, ".codex", "skills"));
  console.log(`  - Memory documents (.codebase/):   \x1b[36m${codebaseMd} Markdown files\x1b[0m`);
  console.log(`  - Skill playbooks (.codex/skills/): \x1b[36m${skillsMd} Markdown files\x1b[0m`);

  // 4. Git Documentation Sync Check
  console.log("\n\x1b[1m\x1b[32m[+] Git Documentation Sync Status:\x1b[0m");
  try {
    const diff = spawnSync("git", ["diff", "--name-only", "HEAD"], { encoding: "utf8" });
    const changed = diff.stdout ? diff.stdout.trim().split("\n").filter(Boolean) : [];
    if (changed.length > 0) {
      const codeChanged = changed.filter(f => !f.match(/^(\.planning\/|docs\/|README|AGENTS\.md)/));
      const docsChanged = changed.filter(f => f.match(/^(\.planning\/|docs\/|README|AGENTS\.md)/));
      if (codeChanged.length > 0 && docsChanged.length === 0) {
        console.log("  \x1b[31m⚠️ Warning:\x1b[0m Code files changed but no documentation/planning files updated.");
        console.log(`    Changed code files: \x1b[90m${codeChanged.slice(0, 3).join(", ")}${codeChanged.length > 3 ? "..." : ""}\x1b[0m`);
      } else {
        console.log("  \x1b[32m✓ Synchronized:\x1b[0m Code and documentation changes are perfectly synchronized!");
      }
    } else {
      console.log("  \x1b[32m✓ Clean:\x1b[0m No uncommitted changes. Documentation is 100% in sync.");
    }
  } catch(e) {
    console.log("  Git status check unavailable.");
  }

  console.log("\n\x1b[1m\x1b[35m======================================================================\x1b[0m\n");
}

const beadsPath = path.join(packageRoot, ".codebase", "beads.json");

function getGitCommit() {
  try {
    const git = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
    if (git.status === 0 && git.stdout) {
      return git.stdout.trim();
    }
  } catch (e) {}
  return "no-git";
}

function readBeads() {
  if (!fs.existsSync(beadsPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(beadsPath, "utf8")) || [];
  } catch (e) {
    return [];
  }
}

function writeBeads(beads) {
  const codebaseDir = path.dirname(beadsPath);
  if (!fs.existsSync(codebaseDir)) {
    fs.mkdirSync(codebaseDir, { recursive: true });
  }
  fs.writeFileSync(beadsPath, JSON.stringify(beads, null, 2), "utf8");
}

function generateUniqueId(beads) {
  const existing = new Set(beads.map(b => b.id));
  while (true) {
    const id = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    if (!existing.has(id)) return id;
  }
}

function rememberFact(arg1, arg2) {
  let category = "general";
  let fact = "";

  if (!arg1) {
    console.error("\x1b[31mError: You must provide a fact/insight to remember.\x1b[0m");
    console.log("Usage: genesis-harness remember [category] \"<fact>\"");
    process.exit(1);
  }

  if (arg2) {
    category = arg1.toLowerCase().trim();
    fact = arg2.trim();
  } else {
    fact = arg1.trim();
  }

  const beads = readBeads();
  const bead = {
    id: generateUniqueId(beads),
    category,
    fact,
    timestamp: new Date().toISOString(),
    git_commit: getGitCommit()
  };

  beads.push(bead);
  writeBeads(beads);

  console.log(`\n\x1b[1m\x1b[32m[+] Remembered (Bead Added):\x1b[0m`);
  console.log(`  \x1b[1mID:\x1b[0m         \x1b[33m[${bead.id}]\x1b[0m`);
  console.log(`  \x1b[1mCategory:\x1b[0m   \x1b[36m${bead.category}\x1b[0m`);
  console.log(`  \x1b[1mFact:\x1b[0m       ${bead.fact}`);
  console.log(`  \x1b[1mGit Commit:\x1b[0m \x1b[90m${bead.git_commit}\x1b[0m\n`);
}

function recallFacts(query) {
  const beads = readBeads();
  if (beads.length === 0) {
    console.log("\n\x1b[33m[-] No remembered facts found in database (.codebase/beads.json).\x1b[0m\n");
    return;
  }

  let filtered = beads;
  if (query) {
    const q = query.toLowerCase().trim();
    filtered = beads.filter(
      b => b.category === q || b.fact.toLowerCase().includes(q) || b.id === q
    );
  }

  console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
  console.log("\x1b[1m\x1b[36m                     GENESIS HARNESS - RECALLED MEMORIES              \x1b[0m");
  console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");

  if (filtered.length === 0) {
    console.log(`\n  No memories found matching: \x1b[31m"${query}"\x1b[0m\n`);
  } else {
    console.log("");
    for (const bead of filtered) {
      console.log(`  • \x1b[1m\x1b[33m[${bead.id}]\x1b[0m [\x1b[36m${bead.category}\x1b[0m] ${bead.fact} \x1b[90m(${bead.git_commit})\x1b[0m`);
    }
    console.log("");
  }
  console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m\n");
}

function forgetFact(id) {
  if (!id) {
    console.error("\x1b[31mError: You must specify a 6-character unique ID to forget.\x1b[0m");
    console.log("Usage: genesis-harness forget <id>");
    process.exit(1);
  }

  const targetId = id.toLowerCase().trim();
  const beads = readBeads();
  const index = beads.findIndex(b => b.id === targetId);

  if (index === -1) {
    console.error(`\x1b[31mError: No remembered fact found with ID [${targetId}].\x1b[0m`);
    process.exit(1);
  }

  const removed = beads.splice(index, 1)[0];
  writeBeads(beads);

  console.log(`\n\x1b[1m\x1b[32m[+] Forgotten (Bead Deleted):\x1b[0m`);
  console.log(`  Successfully removed fact \x1b[33m[${removed.id}]\x1b[0m from category \x1b[36m"${removed.category}"\x1b[0m.\n`);
}

function primeContext() {
  const out = [];
  out.push("# 🤖 AGENT MEMORY PRIMING BOOTSTRAP");
  out.push("");
  out.push("This prompt initializes your active context and project memory to prevent task drift.");
  out.push("");
  out.push("---");
  out.push("");

  // 1. Coordinates
  out.push("## 📍 1. Session Coordinates");
  out.push(`- **Local Time**: ${new Date().toISOString()}`);
  out.push(`- **Workspace Path**: \`${packageRoot}\``);
  const gitCommit = getGitCommit();
  out.push(`- **Git Commit**: \`${gitCommit}\``);
  out.push("");

  // 2. Active FSM State
  out.push("## 🔄 2. Active Execution State");
  const stateFile = path.join(packageRoot, ".planning", "STATE.md");
  if (fs.existsSync(stateFile)) {
    const content = fs.readFileSync(stateFile, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes("Current project state:") || line.includes("Current phase:") || line.includes("Current feature or bug:") || line.includes("Next task:")) {
        out.push(`- ${line.replace("#", "").trim()}`);
      }
    }
  } else {
    // Fallback to .codebase/state.json
    const stateJsonFile = path.join(packageRoot, ".codebase", "state.json");
    if (fs.existsSync(stateJsonFile)) {
      try {
        const stateObj = JSON.parse(fs.readFileSync(stateJsonFile, "utf8"));
        out.push(`- **Current project state**: \`${stateObj.current_state || "INIT"}\``);
      } catch(e) {}
    } else {
      out.push("- *No active planning session is currently running.*");
    }
  }
  out.push("");

  // 3. Active Roadmap (Token-Optimized)
  out.push("## 🗺️ 3. Active & Pending Roadmap Tasks");
  const roadmapFile = path.join(packageRoot, ".planning", "ROADMAP.md");
  if (fs.existsSync(roadmapFile)) {
    const content = fs.readFileSync(roadmapFile, "utf8");
    const lines = content.split("\n");
    let taskCount = 0;
    for (const line of lines) {
      if (line.match(/^-\s*\[[ ~!]\]/)) {
        out.push(`  ${line.trim()}`);
        taskCount++;
      }
    }
    if (taskCount === 0) {
      out.push("  - *All roadmap tasks are currently marked completed or none are active.*");
    }
  } else {
    out.push("- *Roadmap file (.planning/ROADMAP.md) not found.*");
  }
  out.push("");

  // 4. Memory Beads / Persistent Insights
  out.push("## 🧬 4. Memory Beads (Stored Core Insights)");
  const beads = readBeads();
  if (beads.length > 0) {
    for (const bead of beads) {
      out.push(`- **[${bead.id}]** [${bead.category}]: ${bead.fact} *(${bead.git_commit})*`);
    }
  } else {
    out.push("- *No persistent facts or insights have been registered yet.*");
  }
  out.push("");

  // 5. API Contracts Index
  out.push("## 🔌 5. Active API Contracts Map");
  const apiDir = path.join(packageRoot, "contracts", "api");
  if (fs.existsSync(apiDir)) {
    const endpoints = fs.readdirSync(apiDir).filter(f => fs.statSync(path.join(apiDir, f)).isDirectory());
    if (endpoints.length > 0) {
      for (const endpoint of endpoints) {
        out.push(`- Endpoint: \`/api/${endpoint}\``);
      }
    } else {
      out.push("- *No active API endpoints registered.*");
    }
  } else {
    out.push("- *No contracts/api directory found.*");
  }
  out.push("");

  // 6. Zero-Drift Playbook Rules
  out.push("## 🛡️ 6. Zero-Drift Playbook Rules");
  out.push("Always adhere strictly to these operational constraints:");
  out.push("1. **Verify first**: Run `./scripts/verify.sh` to check FSM validation and structure.");
  out.push("2. **Update memory**: Ensure `.codebase/CURRENT_STATE.md` is updated at the end of every turn.");
  out.push("3. **Single source**: Avoid duplicating plans across multi-line markdown logs; use `genesis-harness remember` to store critical project coordinates.");
  out.push("4. **TDD Pattern**: Create or update failing tests in `tests/` before making changes to public behaviors.");
  out.push("");
  out.push("## 🪶 7. LeanCTX Policy");
  out.push(buildLeanCtxReport(process.cwd()));
  out.push("");
  out.push("---");
  out.push("");

  console.log(out.join("\n"));
}

function showLeanCtx() {
  console.log(buildLeanCtxReport(process.cwd()));
}

function openFileNatively(filePath) {
  if (process.platform === "win32") {
    const cp = spawnSync("cmd.exe", ["/c", "start", "", filePath], { shell: true });
    return cp.status === 0;
  }
  let cmd = "open";
  if (process.platform === "linux") {
    cmd = "xdg-open";
  }

  const cp = spawnSync(cmd, [filePath]);
  return cp.status === 0;
}

function discoverMockups(rootPath = packageRoot) {
  const mockups = [];
  const featuresDir = path.join(rootPath, ".planning", "features");
  const bugsDir = path.join(rootPath, ".planning", "bugs");

  const scanDir = (dir, type) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
            mockups.push({
              id: `${type}-${entry}-${file}`,
              title: `${type === "feature" ? "[Feature]" : "[Bug]"} ${entry}`,
              folder: entry,
              fileName: file,
              fullPath: path.join(fullPath, file)
            });
          }
        }
      }
    }
  };

  scanDir(featuresDir, "feature");
  scanDir(bugsDir, "bug");
  return mockups;
}

function viewMockupsInteractive(arg) {
  if (arg) {
    if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
      console.log(`\n\x1b[1m\x1b[32m[+] Opening direct file:\x1b[0m ${arg}`);
      openFileNatively(arg);
      return;
    }

    const mockups = discoverMockups();
    const found = mockups.find(m => m.folder === arg || m.id === arg);
    if (found) {
      console.log(`\n\x1b[1m\x1b[32m[+] Opening mockup for ${found.title}:\x1b[0m ${found.fileName}`);
      openFileNatively(found.fullPath);
      return;
    }

    console.error(`\x1b[31mError: No mockup found matching direct path or slug "${arg}".\x1b[0m`);
    process.exit(1);
  }

  const mockups = discoverMockups();
  if (mockups.length === 0) {
    console.log("\n\x1b[33m[-] No mockup images (.png, .jpg, .webp) found under .planning/features/ or .planning/bugs/.\x1b[0m\n");
    return;
  }

  let selectedIndex = 0;
  let currentView = "LIST"; // "LIST" or "DETAIL"

  const renderMenu = () => {
    console.clear();
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
    console.log("\x1b[1m\x1b[36m                GENESIS HARNESS - MOCKUP GALLERY VIEWER               \x1b[0m");
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m\n");

    if (currentView === "LIST") {
      console.log("  \x1b[1mUse Up/Down Arrow to navigate, Right Arrow (or Enter) to view.\x1b[0m");
      console.log("  \x1b[90mPress Esc or Ctrl+C to exit.\x1b[0m\n");
      console.log("  \x1b[1mDISCOVERED SCREENS / MOCKUPS:\x1b[0m");
      console.log("  ------------------------------------------------------------------");

      mockups.forEach((mockup, idx) => {
        if (idx === selectedIndex) {
          console.log(`  \x1b[1m\x1b[36m➔  ${mockup.title} (${mockup.fileName})\x1b[0m`);
        } else {
          console.log(`     \x1b[90m${mockup.title} (${mockup.fileName})\x1b[0m`);
        }
      });
      console.log("  ------------------------------------------------------------------\n");
    } else if (currentView === "DETAIL") {
      const selected = mockups[selectedIndex];
      console.log("  \x1b[1m\x1b[32m[+] LAUNCHED SYSTEM VIEW FOR:\x1b[0m \x1b[1m" + selected.title + "\x1b[0m\n");
      console.log(`  - \x1b[1mMockup File:\x1b[0m  ${selected.fileName}`);
      console.log(`  - \x1b[1mFolder Path:\x1b[0m  ${path.dirname(selected.fullPath)}`);

      let sizeText = "Unknown";
      try {
        const stats = fs.statSync(selected.fullPath);
        sizeText = `${(stats.size / 1024).toFixed(1)} KB`;
      } catch (e) {}
      console.log(`  - \x1b[1mFile Size:\x1b[0m    ${sizeText}`);
      console.log("");
      console.log("  ==================================================================");
      console.log("  \x1b[36m[OS SYSTEM PREVIEW LAUNCHED]\x1b[0m");
      console.log("  The mockup has been opened in your system's native image viewer.");
      console.log("  ==================================================================\n");
      console.log("  \x1b[1m\x1b[33m← Press Left Arrow to go BACK to list.\x1b[0m");
      console.log("  \x1b[90mPress Esc or Ctrl+C to exit.\x1b[0m\n");
    }
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
  };

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const cleanExit = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.clear();
    console.log("\n\x1b[32m[+] Exited Mockup Gallery Viewer.\x1b[0m\n");
    process.exit(0);
  };

  renderMenu();

  process.stdin.on("data", (key) => {
    if (key === "\u0003" || key === "\u001b") {
      cleanExit();
    }

    if (currentView === "LIST") {
      if (key === "\u001b[A") {
        selectedIndex = (selectedIndex - 1 + mockups.length) % mockups.length;
        renderMenu();
      }
      else if (key === "\u001b[B") {
        selectedIndex = (selectedIndex + 1) % mockups.length;
        renderMenu();
      }
      else if (key === "\u001b[C" || key === "\r") {
        currentView = "DETAIL";
        const selected = mockups[selectedIndex];
        openFileNatively(selected.fullPath);
        renderMenu();
      }
    } else if (currentView === "DETAIL") {
      if (key === "\u001b[D") {
        currentView = "LIST";
        renderMenu();
      }
    }
  });
}

function syncContext() {
  const srcDirs = ['src', 'lib', 'tests', 'bin'];
  const codebaseDir = path.join(process.cwd(), '.codebase');
  const contextFile = path.join(codebaseDir, 'COMPRESSED_CONTEXT.md');
  const visualFile = path.join(codebaseDir, 'VISUAL_GRAPH.md');

  if (!fs.existsSync(codebaseDir)) {
    fs.mkdirSync(codebaseDir, { recursive: true });
  }

  let output = '# Compressed Context & Dependency Graph\n\n';
  let visualOutput = '# Visual Project Graph\n\n';
  const depEdges = [];

  let parser, traverse;
  try {
    parser = require('@babel/parser');
    traverse = require('@babel/traverse').default;
  } catch (e) {
    console.error('[genesis-harness] AST parser dependencies missing. Run: npm install');
    process.exit(1);
  }

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && file !== 'node_modules') {
        walk(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const exportsList = [];
        const importsList = [];
        const relativePath = fullPath.replace(process.cwd() + '/', '');
        const featuresList = [];

        try {
          const ast = parser.parse(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx']
          });

          if (ast.comments) {
            ast.comments.forEach(comment => {
              const match = comment.value.match(/@feature:\s*(.+)/i);
              if (match) {
                featuresList.push(match[1].trim());
              }
            });
          }

          traverse(ast, {
            ExportNamedDeclaration(path) {
              const decl = path.node.declaration;
              if (decl) {
                if (decl.type === 'ClassDeclaration' && decl.id) {
                  exportsList.push('class ' + decl.id.name);
                } else if (decl.type === 'FunctionDeclaration' && decl.id) {
                  exportsList.push('function ' + decl.id.name);
                } else if (decl.type === 'VariableDeclaration') {
                  decl.declarations.forEach(d => {
                    if (d.id) exportsList.push('const ' + d.id.name);
                  });
                }
              }
            },
            ImportDeclaration(path) {
              importsList.push(path.node.source.value);
              depEdges.push(`  "${relativePath}" --> "${path.node.source.value}"`);
            },
            CallExpression(path) {
              if (path.node.callee.name === 'require' && path.node.arguments.length > 0) {
                if (path.node.arguments[0].type === 'StringLiteral') {
                  importsList.push(path.node.arguments[0].value);
                  depEdges.push(`  "${relativePath}" --> "${path.node.arguments[0].value}"`);
                }
              }
            }
          });
        } catch (err) {
          exportsList.push('// AST Parse Error: ' + err.message);
        }

        if (exportsList.length > 0 || importsList.length > 0 || featuresList.length > 0) {
          output += '## ' + relativePath + '\n';
          if (featuresList.length > 0) {
            output += '### Implements Features\n';
            featuresList.forEach(f => output += '- `' + f + '`\n');
          }
          if (exportsList.length > 0) {
            output += '### Exports\n';
            exportsList.forEach(sig => output += '- `' + sig + '`\n');
          }
          if (importsList.length > 0) {
            output += '### Dependencies\n';
            importsList.forEach(imp => output += '- `' + imp + '`\n');
          }
          output += '\n';
        }
      }
    }
  }

  srcDirs.forEach(dir => walk(path.join(process.cwd(), dir)));
  // Generate Visual Graph
  visualOutput += '## Harness Relationship Map\n\n```mermaid\nflowchart LR\n';
  visualOutput += '  manifest[".codex-plugin/plugin.json"] --> skills[".codex/skills/*"]\n';
  visualOutput += '  package["package.json"] --> cli["bin/genesis-harness.js"]\n';
  visualOutput += '  package --> verify["scripts/verify.sh"]\n';
  visualOutput += '  package --> evals["scripts/run-evals.sh"]\n';
  visualOutput += '  cli --> install["install / postinstall"]\n';
  visualOutput += '  cli --> hooks["setup-hooks"]\n';
  visualOutput += '  hooks --> docsgate["genesis-harness docs-gate"]\n';
  visualOutput += '  docsgate --> docsync["check-docs-sync.sh"]\n';
  visualOutput += '  docsgate --> specsync["check-spec-changelog.sh"]\n';
  visualOutput += '  skills --> contracts["contracts/"]\n';
  visualOutput += '  skills --> fixtures["fixtures/"]\n';
  visualOutput += '  skills --> tests["tests/ + playwright/"]\n';
  visualOutput += '  skills --> memory[".codebase/"]\n';
  visualOutput += '  verify --> skills\n';
  visualOutput += '  verify --> contracts\n';
  visualOutput += '  verify --> fixtures\n';
  visualOutput += '  verify --> memory\n';
  visualOutput += '  evals --> install\n';
  visualOutput += '  evals --> cli\n';
  visualOutput += '  evals --> unit["tests/unit/*.test.js"]\n';
  visualOutput += '  evals --> integration["tests/integration/*.test.js"]\n';
  visualOutput += '  evals --> pack["npm pack smoke"]\n';
  visualOutput += '```\n\n';

  visualOutput += '## Skill Workflow Relationships\n\n```mermaid\nflowchart TD\n';
  visualOutput += '  harness["genesis-harness"] --> planning["genesis-planning"]\n';
  visualOutput += '  harness --> research["genesis-research-first"]\n';
  visualOutput += '  planning --> architecture["genesis-architecture"]\n';
  visualOutput += '  planning --> api["genesis-api-contract"]\n';
  visualOutput += '  planning --> design["genesis-design-spec"]\n';
  visualOutput += '  api --> apisync["genesis-api-sync"]\n';
  visualOutput += '  design --> ui["genesis-ui-ux-test"]\n';
  visualOutput += '  api --> specimpact["spec-impact-engine"]\n';
  visualOutput += '  specimpact --> specprop["genesis-spec-propagation"]\n';
  visualOutput += '  specprop --> docs["genesis-docs-automation"]\n';
  visualOutput += '  ui --> verifybefore["genesis-verification-before-completion"]\n';
  visualOutput += '  apisync --> verifybefore\n';
  visualOutput += '  docs --> verifybefore\n';
  visualOutput += '  verifybefore --> release["genesis-release"]\n';
  visualOutput += '  harness --> memorymap["genesis-codebase-map"]\n';
  visualOutput += '  harness --> observability["genesis-observability-automation"]\n';
  visualOutput += '```\n\n';

  visualOutput += '## Code Dependency Hints\n\n```mermaid\nflowchart TD\n';
  if (depEdges.length > 0) {
    visualOutput += depEdges.join('\n') + '\n';
  } else {
    visualOutput += '  Root["No dependencies found"]\n';
  }
  visualOutput += '```\n\n';

  // Parse Roadmap for features and roles
  const roadmapFile = path.join(process.cwd(), '.planning', 'ROADMAP.md');
  if (fs.existsSync(roadmapFile)) {
    visualOutput += '## .planning/ROADMAP.md Derived Feature Status\n\n```mermaid\ngraph TD\n';
    visualOutput += '  classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px;\n';
    visualOutput += '  classDef inprogress fill:#fff3cd,stroke:#ffc107,stroke-width:2px;\n';
    visualOutput += '  classDef pending fill:#e2e3e5,stroke:#6c757d,stroke-width:2px;\n';

    const rmContent = fs.readFileSync(roadmapFile, 'utf8').split('\n');
    const roles = [];
    let currentRoleObj = { title: 'General', tasks: [] };

    let taskIdCounter = 0;
    const allTasksMap = new Map();

    rmContent.forEach(line => {
      if (line.match(/^#+\s+(.+)/)) {
        const title = line.match(/^#+\s+(.+)/)[1].trim();
        // If switching roles, push the current one if it has tasks
        if (currentRoleObj.tasks.length > 0) {
          roles.push(currentRoleObj);
        }
        currentRoleObj = { title: title, tasks: [] };
      } else if (line.match(/^-\s*\[([ xX~!\/])\]\s+(.+)/)) {
        const match = line.match(/^-\s*\[([ xX~!\/])\]\s+(.+)/);
        const statusChar = match[1].toLowerCase();
        let rawName = match[2].trim();
        let dependsOn = [];
        let mappedFiles = [];

        const depMatch = rawName.match(/\(depends_on:\s*(.+?)\)/i);
        if (depMatch) {
          dependsOn = depMatch[1].split(',').map(s => s.trim());
          rawName = rawName.replace(/\(depends_on:\s*.+?\)/i, '').trim();
        }

        const filesMatch = rawName.match(/\(files:\s*(.+?)\)/i);
        if (filesMatch) {
          mappedFiles = filesMatch[1].split(',').map(s => s.trim());
          rawName = rawName.replace(/\(files:\s*.+?\)/i, '').trim();
        }

        const taskId = `Task${taskIdCounter++}`;
        allTasksMap.set(rawName.toLowerCase(), taskId);

        currentRoleObj.tasks.push({
          id: taskId,
          statusChar: statusChar,
          name: rawName,
          dependsOn: dependsOn,
          mappedFiles: mappedFiles
        });
      }
    });
    if (currentRoleObj.tasks.length > 0) {
      roles.push(currentRoleObj);
    }

    if (roles.length === 0) {
      visualOutput += '  Project["Project Roadmap"] --> NoTasks["No tasks found"]\n';
    } else {
      roles.forEach((r, idx) => {
        visualOutput += `  subgraph Role_${idx} ["${r.title}"]\n`;
        r.tasks.forEach(t => {
          let label = `Roadmap task ${t.id.replace('Task', '')}`;
          visualOutput += `    ${t.id}["${label}"]\n`;
          if (t.statusChar === 'x') {
            visualOutput += `    class ${t.id} completed;\n`;
          } else if (t.statusChar === '/' || t.statusChar === '~' || t.statusChar === '!') {
            visualOutput += `    class ${t.id} inprogress;\n`;
          } else {
            visualOutput += `    class ${t.id} pending;\n`;
          }
        });
        visualOutput += `  end\n`;
      });

      // Draw dependencies
      roles.forEach(r => {
        r.tasks.forEach(t => {
          if (t.dependsOn.length > 0) {
            t.dependsOn.forEach(depName => {
              const depId = allTasksMap.get(depName.toLowerCase());
              if (depId) {
                visualOutput += `  ${depId} --> ${t.id}\n`;
              }
            });
          }
        });
      });
    }
    visualOutput += '```\n\n';

    // Đưa Roadmap vào COMPRESSED_CONTEXT.md cho AI đọc (Dạng text thuần)
    output += '\n## Project Planning & Roadmap\n';
    output += rmContent.join('\n') + '\n';
  }

  fs.writeFileSync(contextFile, output);
  fs.writeFileSync(visualFile, visualOutput);
  console.log('[genesis-harness] Context compressed and saved to ' + contextFile);
  console.log('[genesis-harness] Visual Graph saved to ' + visualFile);
}

function setupHooks(rootPath = process.cwd()) {
  if (!rootPath) {
    console.log('[genesis-harness] Project root not detected, skipping hooks setup.');
    return;
  }

  const hooksDir = path.join(rootPath, '.git', 'hooks');
  const preCommitFile = path.join(hooksDir, 'pre-commit');

  if (!fs.existsSync(hooksDir)) {
    console.log('[genesis-harness] Not a git repository, skipping hooks setup.');
    return;
  }

  const hookContent = `#!/bin/sh
# genesis-harness auto-sync
echo "[genesis-harness] Syncing compressed context before commit..."
npx genesis-harness sync
echo "[genesis-harness] Running docs drift gate..."
npx genesis-harness docs-gate
git add .codebase/COMPRESSED_CONTEXT.md .codebase/VISUAL_GRAPH.md 2>/dev/null || true
`;

  if (fs.existsSync(preCommitFile)) {
    const existingContent = fs.readFileSync(preCommitFile, 'utf8');
    if (existingContent !== hookContent) {
      const backupPath = preCommitFile + '.backup.' + Date.now();
      fs.renameSync(preCommitFile, backupPath);
      console.log('[genesis-harness] Existing pre-commit hook backed up to ' + backupPath);
    } else {
      console.log('[genesis-harness] Git hooks already up to date.');
      return;
    }
  }

  fs.writeFileSync(preCommitFile, hookContent);
  fs.chmodSync(preCommitFile, '755');
  console.log('[genesis-harness] Git pre-commit hook installed successfully.');
}

function runDocsGate() {
  const docsSyncScript = path.join(packageRoot, ".codex", "skills", "genesis-harness", "scripts", "check-docs-sync.sh");
  const specChangelogScript = path.join(packageRoot, ".codex", "skills", "genesis-harness", "scripts", "check-spec-changelog.sh");
  const bash = resolveBash();

  if (!fs.existsSync(docsSyncScript)) fail(`missing docs sync gate at ${docsSyncScript}`);

  const docsResult = spawnSync(bash, [docsSyncScript, process.cwd()], {
    stdio: "inherit",
    env: process.env
  });
  if (docsResult.status) process.exit(docsResult.status);

  if (fs.existsSync(path.join(process.cwd(), ".planning", "SPEC_CHANGELOG.md")) && fs.existsSync(specChangelogScript)) {
    const specResult = spawnSync(bash, [specChangelogScript, process.cwd()], {
      stdio: "inherit",
      env: process.env
    });
    if (specResult.status) process.exit(specResult.status);
  }
}

/**
 * runVerifyGate() — L09 Victory Blocker
 *
 * Runs ALL required verification gates in sequence.
 * Agent MUST call this before claiming any task is done.
 * Exits with non-zero if any gate fails — prevents "under-finish" hallucination.
 */
function runVerifyGate() {
  const bash = resolveBash();
  const verifyScript = path.join(packageRoot, "scripts", "verify.sh");
  const evalsScript = path.join(packageRoot, "scripts", "run-evals.sh");
  const coldStartScript = path.join(packageRoot, "scripts", "cold-start-check.js");

  console.log("\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m");
  console.log("\x1b[1m\x1b[36m   GENESIS HARNESS — VERIFY-GATE (L09 Victory Blocker) \x1b[0m");
  console.log("\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m");
  console.log("\x1b[33mRunning all verification gates. Task is NOT done until all pass.\x1b[0m\n");

  const gates = [
    {
      name: "1. Structural verify (verify.sh)",
      run: () => spawnSync(bash, [verifyScript], { stdio: "inherit", env: process.env }).status
    },
    {
      name: "2. Feature registry + observability (feature_registry.test.js)",
      run: () => spawnSync(process.execPath, [
        path.join(packageRoot, "tests", "unit", "feature_registry.test.js")
      ], { stdio: "inherit", env: process.env }).status
    },
    {
      name: "3. Cold-start check (cold-start-check.js)",
      run: () => fs.existsSync(coldStartScript)
        ? spawnSync(process.execPath, [coldStartScript], { stdio: "inherit", env: process.env }).status
        : 0
    },
    {
      name: "4. Unit tests (tests/unit/*.test.js)",
      run: () => {
        const unitDir = path.join(packageRoot, "tests", "unit");
        if (!fs.existsSync(unitDir)) return 0;
        for (const f of fs.readdirSync(unitDir).filter(f => f.endsWith(".test.js"))) {
          const result = spawnSync(process.execPath, [path.join(unitDir, f)], {
            stdio: "inherit", env: process.env
          });
          if (result.status) return result.status;
        }
        return 0;
      }
    }
  ];

  let allPassed = true;
  for (const gate of gates) {
    process.stdout.write(`\n\x1b[33m▶ ${gate.name}\x1b[0m\n`);
    const code = gate.run();
    if (code !== 0) {
      console.log(`\x1b[31m✗ FAILED (exit ${code})\x1b[0m`);
      allPassed = false;
      break; // Stop on first failure
    }
    console.log(`\x1b[32m✓ PASSED\x1b[0m`);
  }

  console.log("\n\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m");
  if (allPassed) {
    console.log("\x1b[1m\x1b[32m✓ ALL GATES PASSED — Task may now be declared DONE.\x1b[0m");
    console.log("\x1b[32mUpdate .codebase/CURRENT_STATE.md and RECOVERY_POINTS.md.\x1b[0m");
  } else {
    console.log("\x1b[1m\x1b[31m✗ VERIFICATION FAILED — Do NOT declare this task done.\x1b[0m");
    console.log("\x1b[31mFix the failing gate, then re-run: genesis-harness verify-gate\x1b[0m");
    process.exit(1);
  }
  console.log("\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m\n");
}

function runColdStart() {
  const coldStartScript = path.join(packageRoot, "scripts", "cold-start-check.js");
  if (fs.existsSync(coldStartScript)) {
    const result = spawnSync(process.execPath, [coldStartScript], { stdio: "inherit", env: process.env });
    process.exit(result.status);
  } else {
    console.error("Cold start script not found.");
    process.exit(1);
  }
}

function healTest(testCommand) {
  if (!testCommand) {
    console.error('[genesis-harness] Missing test command. Usage: genesis-harness heal "npm test"');
    process.exit(1);
  }

  const { execSync } = require('child_process');
  try {
    console.log(`[genesis-harness] Running test: ${testCommand}`);
    execSync(testCommand, { stdio: 'inherit' });
    console.log('[genesis-harness] Tests passed! No healing required.');
  } catch (error) {
    const errorLog = error.stdout ? error.stdout.toString() : error.message;
    const planningDir = path.join(process.cwd(), '.planning');
    if (!fs.existsSync(planningDir)) {
      fs.mkdirSync(planningDir, { recursive: true });
    }
    const logFile = path.join(planningDir, 'LAST_ERROR.log');
    fs.writeFileSync(logFile, errorLog);

    console.log('\\n\\x1b[31m\\x1b[1m[AGENT_DIRECTIVE] TESTS FAILED. READ .planning/LAST_ERROR.log AND IMMEDIATELY EXECUTE genesis-debug-guide TO FIX THE CODE. DO NOT STOP UNTIL TESTS PASS.\\x1b[0m\\n');
    process.exit(1);
  }
}

function mcpSetupInteractive() {
  const options = [
    { name: "@modelcontextprotocol/server-puppeteer", desc: "Browser UI Testing", selected: true },
    { name: "@modelcontextprotocol/server-fetch", desc: "URL Markdown Reader", selected: true },
    { name: "@modelcontextprotocol/server-github", desc: "Repo & PR management", selected: false },
    { name: "@modelcontextprotocol/server-memory", desc: "Knowledge Graph Memory", selected: true },
    { name: "@modelcontextprotocol/server-sqlite", desc: "Vector Memory DB", selected: false }
  ];

  let selectedIndex = 0;

  const renderMenu = () => {
    console.clear();
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
    console.log("\x1b[1m\x1b[36m                GENESIS HARNESS - MCP INSTALLER                       \x1b[0m");
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m\n");
    console.log("  \x1b[1mSelect which MCP Servers you want to install globally.\x1b[0m");
    console.log("  Use \x1b[33mUp/Down Arrow\x1b[0m to navigate.");
    console.log("  Use \x1b[33mSpace\x1b[0m to toggle selection.");
    console.log("  Press \x1b[32mEnter\x1b[0m to confirm and install.");
    console.log("  Press \x1b[90mEsc or Ctrl+C\x1b[0m to cancel.\n");

    options.forEach((opt, idx) => {
      const checkbox = opt.selected ? "\x1b[32m[x]\x1b[0m" : "[ ]";
      const cursor = idx === selectedIndex ? "\x1b[1m\x1b[36m➔\x1b[0m " : "  ";
      const name = idx === selectedIndex ? `\x1b[1m${opt.name}\x1b[0m` : opt.name;
      console.log(`  ${cursor} ${checkbox} ${name.padEnd(50)} \x1b[90m(${opt.desc})\x1b[0m`);
    });
    console.log("\n\x1b[1m\x1b[36m======================================================================\x1b[0m");
  };

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const cleanExit = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.clear();
    console.log("\n\x1b[33m[-] MCP Setup Cancelled.\x1b[0m\n");
    process.exit(0);
  };

  const executeInstall = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.clear();
    const toInstall = options.filter(o => o.selected).map(o => o.name);

    if (toInstall.length === 0) {
      console.log("\n\x1b[33m[-] No MCP servers selected. Exiting.\x1b[0m\n");
      process.exit(0);
    }

    console.log(`\n\x1b[1m\x1b[32m[+] Installing selected MCP servers globally...\x1b[0m\n`);
    const args = ["install", "-g", ...toInstall];
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

    const result = spawnSync(npmCmd, args, { stdio: "inherit", env: process.env });
    if (result.status === 0) {
      console.log(`\n\x1b[1m\x1b[32m✓ Successfully installed MCP servers.\x1b[0m`);
      console.log(`You can now configure your Agent Client to use them. See mcp.example.json.\n`);
    } else {
      console.error(`\n\x1b[1m\x1b[31m[-] Installation failed with status ${result.status}\x1b[0m\n`);
    }
    process.exit(result.status || 0);
  };

  renderMenu();

  process.stdin.on("data", (key) => {
    if (key === "\u0003" || key === "\u001b") { // Ctrl+C or Esc
      cleanExit();
    } else if (key === "\u001b[A") { // Up arrow
      selectedIndex = (selectedIndex - 1 + options.length) % options.length;
      renderMenu();
    } else if (key === "\u001b[B") { // Down arrow
      selectedIndex = (selectedIndex + 1) % options.length;
      renderMenu();
    } else if (key === " ") { // Space
      options[selectedIndex].selected = !options[selectedIndex].selected;
      renderMenu();
    } else if (key === "\r") { // Enter
      executeInstall();
    }
  });
}

const command = process.argv[2] || "help";
const args = process.argv.slice(3);

switch (command) {
  case "install":
    copySkills({ target: parseTarget(args, "both") });
    seedLeanCtxPolicy(process.cwd());
    setupHooks();
    break;
  case "postinstall":
    if (process.env.GENESIS_HARNESS_SKIP_POSTINSTALL === "1") {
      process.exit(0);
    }
    copySkills({ quiet: true, target: "both" });
    const postinstallRoot = resolvePostinstallProjectRoot();
    seedLeanCtxPolicy(postinstallRoot, { quiet: true });
    setupHooks(postinstallRoot);
    break;
  case "verify":
    verifySkill(parseTarget(args, "both"));
    break;
  case "uninstall":
    uninstallSkills(parseTarget(args, "both"));
    break;
  case "path":
    for (const root of [agentsSkillsRoot, legacySkillsRoot]) {
      for (const skillName of skillNames) {
        console.log(path.join(root, skillName));
      }
    }
    break;
  case "status":
    showStatus();
    break;
  case "docs":
    showDocsStatus();
    break;
  case "docs-gate":
    runDocsGate();
    break;
  case "remember":
    rememberFact(args[0], args[1]);
    break;
  case "recall":
    recallFacts(args[0]);
    break;
  case "forget":
    forgetFact(args[0]);
    break;
  case "prime":
    primeContext();
    break;
  case "leanctx":
    showLeanCtx();
    break;
  case "view-mockup":
    viewMockupsInteractive(args[0]);
    break;
  case "mcp":
    mcpSetupInteractive();
    break;
  case "sync":
    syncContext();
    break;
  case "setup-hooks":
    setupHooks();
    break;
  case "verify-gate":
    runVerifyGate();
    break;
  case "cold-start":
    runColdStart();
    break;
  case "heal":
    healTest(args.join(" "));
    break;
  case "help":
  case "--help":
  case "-h":
    usage(0);
    break;
  default:
    usage(2);
}
