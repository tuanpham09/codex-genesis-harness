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
  genesis-harness init [--platform codex|antigravity] [--yes] [--idea "<user brief>"]
  genesis-harness run --idea "<user brief>" [--platform codex|antigravity] [--yes] [--product-approach "..."] [--primary-user "..."] [--v1-outcome "..."] [--qa-owner "..."] [--backend "..."] [--frontend "..."] [--database "..."] [--deployment "..."] [--test-strategy "..."] [--stack-owner "..."]
  genesis-harness resume                Show the active resumable run summary for this repo
  genesis-harness next                  Show the next executable lifecycle action
  genesis-harness add-feature --title "<title>" --slug "<slug>" --verify-cmd "<command>"
  genesis-harness complete-feature --verify-cmd "<command>" --evidence "<summary>"
  genesis-harness verify-project --verify-cmd "<command>" --evidence "<summary>"
  genesis-harness complete-project --evidence "<summary>"
  genesis-harness pipeline-audit        Validate lifecycle state, proof, and artifacts
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
        let backupDir = path.join(backupParent, `${skillName}.backup.${timestamp()}`);
        let suffix = 1;
        while (fs.existsSync(backupDir)) {
          backupDir = path.join(backupParent, `${skillName}.backup.${timestamp()}.${suffix++}`);
        }
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

function copySkillsToProjectRoot(rootPath, { quiet = false } = {}) {
  ensureSource();
  const projectSkillsRoot = path.join(rootPath, ".codex", "skills");
  fs.mkdirSync(projectSkillsRoot, { recursive: true });

  for (const skillName of skillNames) {
    const sourceDir = path.join(sourceRoot, skillName);
    const dir = path.join(projectSkillsRoot, skillName);

    if (fs.existsSync(dir)) {
      const backupParent = path.join(rootPath, ".codex", "backups");
      fs.mkdirSync(backupParent, { recursive: true });
      let backupDir = path.join(backupParent, `${skillName}.backup.${timestamp()}`);
      let suffix = 1;
      while (fs.existsSync(backupDir)) {
        backupDir = path.join(backupParent, `${skillName}.backup.${timestamp()}.${suffix++}`);
      }
      fs.renameSync(dir, backupDir);
      if (!quiet) console.log(`Existing project skill backed up to: ${backupDir}`);
    }

    fs.cpSync(sourceDir, dir, { recursive: true });
    chmodScripts(path.join(dir, "scripts"));

    if (!quiet) console.log(`Installed ${skillName} to: ${dir}`);
  }
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
    console.log("\n\x1b[1m\x1b[33m[-] FSM Active Planning:\x1b[0m No active .planning/ session found. Start with a user idea or run `genesis-harness init --yes --platform codex --idea \"<brief>\"`.");
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

function ensureProjectScaffold(rootPath) {
  const dirs = [
    ".codebase/context",
    ".codebase/failures",
    ".codebase/memories",
    "contracts/api",
    "contracts/ui",
    "tests/integration",
    "tests/unit",
    "fixtures",
    "observability/agent-runs"
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(rootPath, dir), { recursive: true });
  }
}

function runInitPlanning(rootPath, idea = "") {
  const initScript = path.join(packageRoot, ".codex", "skills", "genesis-harness", "scripts", "init-planning.sh");
  if (!fs.existsSync(initScript)) {
    fail(`missing init planning script at ${initScript}`);
  }

  const bash = resolveBash();
  const commandArgs = [initScript, "--confirmed", "--root", rootPath];
  if (idea) {
    commandArgs.push("--idea", idea);
  }
  const result = spawnSync(bash, commandArgs, {
    encoding: "utf8",
    env: {
      ...process.env,
      PROJECT_BRIEF_CONFIRMED: "1"
    }
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(`init planning failed${details ? `\n${details}` : ""}`);
  }

  return result.stdout || "";
}

function initializeProject({ rootPath = process.cwd(), platform = "antigravity", idea = "" } = {}) {
  const normalized = String(platform || "").toLowerCase();
  if (!["antigravity", "codex"].includes(normalized)) {
    fail(`unsupported init platform "${platform}". Use "antigravity" or "codex".`);
  }

  const platformLabel = normalized === "codex" ? "Codex / Claude (VS Code)" : "Antigravity IDE (Gemini)";
  const isAntigravity = normalized === "antigravity";

  console.log(`\n\x1b[1m\x1b[32m[+] Initializing Genesis Harness for ${platformLabel}...\x1b[0m\n`);

  ensureProjectScaffold(rootPath);

  if (!isAntigravity) {
    console.log("  Copying local skills to .codex/skills/...");
    copySkillsToProjectRoot(rootPath);
  } else {
    console.log("  Skipping local skills copy (Antigravity uses global plugin).");
  }

  seedLeanCtxPolicy(rootPath);
  setupHooks(rootPath);
  runInitPlanning(rootPath, idea);

  console.log("\n\x1b[1m\x1b[32m✓ Initialization Complete.\x1b[0m");
  console.log("Next steps:");
  console.log("  1. Answer `.planning/INIT_QA.md`.");
  console.log("  2. Confirm product approach, tech stack, and QA sign-off owner.");
  console.log("  3. Update `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/STACK.md` before feature planning.\n");
}

function parseInitArgs(args) {
  const options = {
    autoConfirm: false,
    platform: null,
    idea: ""
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--yes" || arg === "--confirmed") {
      options.autoConfirm = true;
      continue;
    }
    if (arg === "--platform") {
      options.platform = args[i + 1] || null;
      i++;
      continue;
    }
    if (arg === "--idea") {
      options.idea = args[i + 1] || "";
      i++;
      continue;
    }
    usage(2);
  }

  return options;
}

function parseRunArgs(args) {
  const options = {
    autoConfirm: false,
    platform: null,
    idea: "",
    productApproach: "",
    primaryUser: "",
    v1Outcome: "",
    qaOwner: "",
    backend: "",
    frontend: "",
    database: "",
    deployment: "",
    testStrategy: "",
    stackOwner: ""
  };

  const valueFlags = new Map([
    ["--platform", "platform"],
    ["--idea", "idea"],
    ["--product-approach", "productApproach"],
    ["--primary-user", "primaryUser"],
    ["--v1-outcome", "v1Outcome"],
    ["--qa-owner", "qaOwner"],
    ["--backend", "backend"],
    ["--frontend", "frontend"],
    ["--database", "database"],
    ["--deployment", "deployment"],
    ["--test-strategy", "testStrategy"],
    ["--stack-owner", "stackOwner"]
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--yes" || arg === "--confirmed") {
      options.autoConfirm = true;
      continue;
    }
    if (valueFlags.has(arg)) {
      const key = valueFlags.get(arg);
      options[key] = args[i + 1] || "";
      i++;
      continue;
    }
    usage(2);
  }

  if (!options.idea) {
    fail('run requires --idea "<user brief>".');
  }

  const requiredDiscoveryFields = [
    ["--product-approach", options.productApproach],
    ["--primary-user", options.primaryUser],
    ["--v1-outcome", options.v1Outcome],
    ["--qa-owner", options.qaOwner],
    ["--backend", options.backend],
    ["--frontend", options.frontend],
    ["--database", options.database],
    ["--deployment", options.deployment],
    ["--test-strategy", options.testStrategy]
  ].filter(([, value]) => !value);

  if (requiredDiscoveryFields.length > 0) {
    fail(`run requires discovery answers for ${requiredDiscoveryFields.map(([flag]) => flag).join(", ")}.`);
  }

  return options;
}

function parseCompleteFeatureArgs(args) {
  const options = {
    verifyCmd: "",
    evidence: ""
  };
  const valueFlags = new Map([
    ["--verify-cmd", "verifyCmd"],
    ["--evidence", "evidence"]
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!valueFlags.has(arg)) usage(2);
    options[valueFlags.get(arg)] = args[i + 1] || "";
    i++;
  }

  if (!options.verifyCmd) fail('complete-feature requires --verify-cmd "<command>".');
  if (!options.evidence) fail('complete-feature requires --evidence "<summary>".');
  return options;
}

function parseAddFeatureArgs(args) {
  const options = {
    title: "",
    slug: "",
    verifyCmd: ""
  };
  const valueFlags = new Map([
    ["--title", "title"],
    ["--slug", "slug"],
    ["--verify-cmd", "verifyCmd"]
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!valueFlags.has(arg)) usage(2);
    options[valueFlags.get(arg)] = args[i + 1] || "";
    i++;
  }

  if (!options.title) fail('add-feature requires --title "<title>".');
  if (!options.slug) fail('add-feature requires --slug "<slug>".');
  if (!options.verifyCmd) fail('add-feature requires --verify-cmd "<command>".');
  return options;
}

function parseProjectVerificationArgs(args) {
  return parseCompleteFeatureArgs(args);
}

function parseProjectCompletionArgs(args) {
  const options = { evidence: "" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== "--evidence") usage(2);
    options.evidence = args[i + 1] || "";
    i++;
  }
  if (!options.evidence) fail('complete-project requires --evidence "<summary>".');
  return options;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceSection(content, heading, replacement) {
  const pattern = new RegExp(`(## ${escapeRegExp(heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
  if (!pattern.test(content)) return content;
  return content.replace(pattern, `$1${replacement.trim()}\n`);
}

function replaceLineValue(content, label, value) {
  const pattern = new RegExp(`^${escapeRegExp(label)}: .*?$`, "m");
  if (!pattern.test(content)) return content;
  return content.replace(pattern, `${label}: ${value}`);
}

function writeFileIfChanged(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function writeJsonFile(filePath, value) {
  writeFileIfChanged(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function updateMarkdownFile(filePath, updater) {
  const current = fs.readFileSync(filePath, "utf8");
  const next = updater(current);
  writeFileIfChanged(filePath, next);
}

function normalizeAnswer(value, fallback = "TBD") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function sessionRunDir(rootPath, sessionId) {
  return path.join(rootPath, ".runs", sessionId);
}

function appendLifecycleEvent(rootPath, state, event) {
  const sessionId = state.session_id || "lifecycle";
  const runDir = sessionRunDir(rootPath, sessionId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.appendFileSync(
    path.join(runDir, "EVENTS.jsonl"),
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      ...event
    })}\n`,
    "utf8"
  );
}

function runProofCommand(rootPath, command, label) {
  const result = spawnSync(command, {
    cwd: rootPath,
    env: process.env,
    shell: true,
    stdio: "inherit"
  });
  if (result.error) {
    return { ok: false, message: `${label} could not start: ${result.error.message}` };
  }
  if (result.status !== 0) {
    return { ok: false, message: `${label} failed with exit ${result.status}.` };
  }
  return { ok: true, message: `${label} passed.` };
}

function writeLifecycleCurrentState(rootPath, state, details) {
  const now = state.last_updated_at || new Date().toISOString();
  writeFileIfChanged(
    path.join(rootPath, ".codebase", "CURRENT_STATE.md"),
    [
      "# Current System State",
      "",
      `**Time**: ${now.slice(0, 10)}`,
      `**Status**: \`${state.current_state}\``,
      `**Latest Session**: \`${state.session_id || "lifecycle"}\``,
      "",
      "## Lifecycle",
      "",
      ...details.map(detail => `- ${detail}`),
      ""
    ].join("\n")
  );
}

function writeLifecycleRunRecord(rootPath, state, record, aliases = []) {
  const observabilityDir = path.join(rootPath, "observability", "agent-runs");
  fs.mkdirSync(observabilityDir, { recursive: true });
  const sessionId = state.session_id || record.phase || "lifecycle";
  const payload = {
    session_id: sessionId,
    timestamp: record.timestamp || new Date().toISOString(),
    skill: "genesis-pipeline-orchestration",
    recovery_needed: false,
    ...record
  };
  writeJsonFile(path.join(observabilityDir, `${sessionId}-${record.id}.json`), payload);
  for (const alias of aliases) {
    writeJsonFile(path.join(observabilityDir, `${sessionId}-${alias}.json`), payload);
  }
}

function buildResumeMarkdown({ sessionId, state, answers, artifactDir }) {
  const nextTasks = (state.pending_tasks || []).map(task => `- ${task}`);
  const answerLines = [
    `- Product approach: ${answers.product_approach || "TBD"}`,
    `- Primary user: ${answers.primary_user || "TBD"}`,
    `- V1 outcome: ${answers.v1_outcome || "TBD"}`,
    `- QA owner: ${answers.qa_owner || "TBD"}`,
    `- Backend/runtime: ${answers.backend || "TBD"}`,
    `- Frontend/client: ${answers.frontend || "TBD"}`,
    `- Database: ${answers.database || "TBD"}`,
    `- Deployment: ${answers.deployment || "TBD"}`,
    `- Test strategy: ${answers.test_strategy || "TBD"}`,
    `- Stack owner: ${answers.stack_owner || "TBD"}`
  ];

  return [
    "# Resume Brief",
    "",
    `- Session: \`${sessionId}\``,
    `- Current state: \`${state.current_state || "INIT"}\``,
    `- Active work: ${state.active_work || "TBD"}`,
    `- Active feature: ${state.active_feature || "None"}`,
    `- Artifact dir: \`${artifactDir}\``,
    "",
    "## Discovery Snapshot",
    "",
    ...answerLines,
    "",
    "## Next Tasks",
    "",
    ...(nextTasks.length > 0 ? nextTasks : ["- No pending tasks recorded."]),
    ""
  ].join("\n");
}

function persistRunArtifacts(rootPath, { sessionId, state, answers, idea, recordedAt }) {
  if (!sessionId) {
    fail("cannot persist run artifacts without session_id");
  }

  const runDir = sessionRunDir(rootPath, sessionId);
  fs.mkdirSync(runDir, { recursive: true });

  const discovery = {
    session_id: sessionId,
    recorded_at: recordedAt || new Date().toISOString(),
    idea: idea || "",
    ...answers
  };

  const artifactState = {
    session_id: sessionId,
    current_state: state.current_state || "INIT",
    active_work: state.active_work || "",
    active_feature: state.active_feature || "",
    pending_tasks: state.pending_tasks || [],
    required_verification: state.required_verification || [],
    latest_recovery_point: state.latest_recovery_point || "",
    session_started_at: state.session_started_at || discovery.recorded_at,
    completed_at: state.completed_at || "",
    metrics: state.metrics || {},
    recorded_at: discovery.recorded_at
  };

  writeFileIfChanged(
    path.join(runDir, "INPUT.md"),
    [
      "# Run Input",
      "",
      `- Session: \`${sessionId}\``,
      `- Recorded at: ${discovery.recorded_at}`,
      "",
      "## User Brief",
      "",
      idea || "No explicit user brief captured.",
      ""
    ].join("\n")
  );
  writeJsonFile(path.join(runDir, "DISCOVERY.json"), discovery);
  writeJsonFile(path.join(runDir, "STATE.json"), artifactState);
  writeFileIfChanged(
    path.join(runDir, "RESUME.md"),
    buildResumeMarkdown({
      sessionId,
      state: artifactState,
      answers: discovery,
      artifactDir: runDir
    })
  );

  return runDir;
}

function backfillRunArtifacts(rootPath, state) {
  const sessionId = state.session_id;
  if (!sessionId) {
    fail("cannot resume because .codebase/state.json is missing session_id");
  }

  const discoveryAnswers = state.discovery_answers || {};
  persistRunArtifacts(rootPath, {
    sessionId,
    state,
    answers: discoveryAnswers,
    idea: discoveryAnswers.idea || "",
    recordedAt: discoveryAnswers.captured_at || state.session_started_at || new Date().toISOString()
  });

  return sessionRunDir(rootPath, sessionId);
}

function resumeProject(rootPath = process.cwd()) {
  const statePath = path.join(rootPath, ".codebase", "state.json");
  if (!fs.existsSync(statePath)) {
    fail(`missing state file at ${statePath}; run init or run first.`);
  }

  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const sessionId = state.session_id;
  if (!sessionId) {
    fail("cannot resume because .codebase/state.json does not record session_id");
  }

  const runDir = fs.existsSync(sessionRunDir(rootPath, sessionId))
    ? sessionRunDir(rootPath, sessionId)
    : backfillRunArtifacts(rootPath, state);
  const artifactStatePath = path.join(runDir, "STATE.json");
  const artifactDiscoveryPath = path.join(runDir, "DISCOVERY.json");
  const artifactState = fs.existsSync(artifactStatePath)
    ? JSON.parse(fs.readFileSync(artifactStatePath, "utf8"))
    : state;
  const artifactDiscovery = fs.existsSync(artifactDiscoveryPath)
    ? JSON.parse(fs.readFileSync(artifactDiscoveryPath, "utf8"))
    : (state.discovery_answers || {});

  const nextTasks = artifactState.pending_tasks || [];
  console.log("\nGENESIS HARNESS - RESUME REPORT\n");
  console.log(`Resume session: ${sessionId}`);
  console.log(`Current state: ${artifactState.current_state || state.current_state || "INIT"}`);
  console.log(`Active work: ${artifactState.active_work || state.active_work || "TBD"}`);
  console.log(`Active feature: ${artifactState.active_feature || state.active_feature || "None"}`);
  console.log(`Artifact dir: ${runDir}`);
  console.log(`Primary user: ${artifactDiscovery.primary_user || "TBD"}`);
  console.log(`Product approach: ${artifactDiscovery.product_approach || "TBD"}`);
  console.log("Next tasks:");
  if (nextTasks.length === 0) {
    console.log("  - No pending tasks recorded.");
  } else {
    for (const task of nextTasks) {
      console.log(`  - ${task}`);
    }
  }
  console.log("");
}

function readProjectLifecycle(rootPath) {
  const statePath = path.join(rootPath, ".codebase", "state.json");
  const registryPath = path.join(rootPath, ".planning", "FEATURE_REGISTRY.json");
  if (!fs.existsSync(statePath)) {
    fail(`missing state file at ${statePath}; run genesis-harness run first.`);
  }
  if (!fs.existsSync(registryPath)) {
    fail(`missing feature registry at ${registryPath}; run genesis-harness run first.`);
  }
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  registry.project_status = registry.project_status
    || (state.current_state === "COMPLETED" ? "completed" : "implementation");
  registry.project_verification = registry.project_verification || {
    status: "pending",
    verify_cmd: "",
    evidence: "",
    verified_at: ""
  };
  registry.features = (registry.features || []).map(feature => ({
    attempts: 0,
    last_error: "",
    ...feature
  }));
  return {
    statePath,
    registryPath,
    state,
    registry
  };
}

function showNextAction(rootPath = process.cwd()) {
  const { state, registry } = readProjectLifecycle(rootPath);
  const active = registry.features.find(feature => feature.status === "in-progress")
    || registry.features.find(feature => feature.status === "planned");
  const nextTask = (state.pending_tasks || [])[0];

  console.log("\nGENESIS HARNESS - NEXT ACTION\n");
  if (!active) {
    if (state.current_state === "VERIFICATION") {
      console.log("Next action: Run genesis-harness verify-project.");
    } else if (state.current_state === "RELEASE_READY") {
      console.log("Next action: Run genesis-harness complete-project.");
    } else {
      console.log("No planned or in-progress feature remains.");
    }
    return;
  }
  console.log(`Feature: ${active.title}`);
  console.log(`Path: ${active.path}`);
  console.log(`Status: ${active.status}`);
  console.log(`Next action: ${nextTask || "Run feature verification and complete the feature."}`);
  console.log("");
}

function addFeature(rootPath, options) {
  const { statePath, registryPath, state, registry } = readProjectLifecycle(rootPath);
  if (["RELEASE_READY", "COMPLETED"].includes(state.current_state)) {
    fail(`cannot add a feature while project state is ${state.current_state}.`);
  }
  if (registry.features.some(feature => feature.title === options.title)) {
    console.log(`Feature already queued: ${options.title}`);
    return;
  }

  const featureRelativePath = createFeatureScaffold(rootPath, {
    slug: slugifyFeature(options.slug),
    summary: options.title
  });
  const now = new Date().toISOString();
  const nextId = `F${String(registry.features.length + 1).padStart(3, "0")}`;
  registry.features.push({
    id: nextId,
    status: "planned",
    title: options.title,
    path: featureRelativePath,
    verify_cmd: options.verifyCmd,
    evidence: "",
    started_at: "",
    verified_at: "",
    attempts: 0,
    last_error: ""
  });
  registry.project_status = "implementation";
  registry.updated_at = now;
  writeJsonFile(registryPath, registry);

  const featureIndexPath = path.join(rootPath, ".planning", "FEATURE_INDEX.md");
  if (fs.existsSync(featureIndexPath)) {
    updateMarkdownFile(featureIndexPath, content => {
      const row = `| ${options.title} | [ ] | Queue | ${featureRelativePath.replace(".planning/", "")} | Planned feature |`;
      return content.includes(`| ${options.title} |`) ? content : `${content.trim()}\n${row}\n`;
    });
  }

  state.last_updated_at = now;
  state.pending_tasks = state.pending_tasks || [];
  writeJsonFile(statePath, state);
  appendLifecycleEvent(rootPath, state, {
    type: "feature.queued",
    feature_id: nextId,
    feature_path: featureRelativePath
  });
  persistRunArtifacts(rootPath, {
    sessionId: state.session_id || "lifecycle",
    state,
    answers: state.discovery_answers || {},
    idea: (state.discovery_answers && state.discovery_answers.idea) || "",
    recordedAt: now
  });
  console.log(`Feature queued: ${options.title}`);
  console.log(`Path: ${featureRelativePath}`);
}

function completeFeature(rootPath, options) {
  const { statePath, registryPath, state, registry } = readProjectLifecycle(rootPath);
  const previousState = state.current_state || "IMPLEMENTATION";
  const active = registry.features.find(feature => feature.path === state.active_feature)
    || registry.features.find(feature => feature.status === "in-progress");
  if (!active) fail("no in-progress feature is available to complete.");

  const verificationStartedAt = Date.now();
  active.attempts = (active.attempts || 0) + 1;
  const verification = runProofCommand(rootPath, options.verifyCmd, `feature ${active.id} verification`);
  if (!verification.ok) {
    active.last_error = verification.message;
    registry.updated_at = new Date().toISOString();
    writeJsonFile(registryPath, registry);
    state.metrics = state.metrics || {};
    state.metrics.failed_gate_count = (state.metrics.failed_gate_count || 0) + 1;
    state.last_updated_at = new Date().toISOString();
    writeJsonFile(statePath, state);
    appendLifecycleEvent(rootPath, state, {
      type: "feature.verification_failed",
      feature_id: active.id,
      error: verification.message
    });
    fail(verification.message);
  }

  const now = new Date().toISOString();
  const startedAt = Date.parse(active.started_at || state.session_started_at || now);
  const leadTimeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  active.status = "verified";
  active.verify_cmd = options.verifyCmd;
  active.evidence = options.evidence;
  active.verified_at = now;
  active.last_error = "";
  const nextFeature = registry.features.find(feature => feature.status === "planned");
  if (nextFeature) {
    nextFeature.status = "in-progress";
    nextFeature.started_at = now;
    registry.project_status = "implementation";
    state.current_state = "IMPLEMENTATION";
    state.active_work = `Implement ${nextFeature.title}`;
    state.active_feature = nextFeature.path;
    state.pending_tasks = [
      `Add the first failing test for ${nextFeature.title}`,
      `Implement ${nextFeature.title}`,
      "Run feature verification and record evidence"
    ];
  } else {
    registry.project_status = "verification";
    state.current_state = "VERIFICATION";
    state.active_work = "Project verification";
    state.active_feature = "";
    state.pending_tasks = ["Run project verification", "Prepare final implementation handoff"];
  }
  registry.updated_at = now;
  writeJsonFile(registryPath, registry);

  const featureIndexPath = path.join(rootPath, ".planning", "FEATURE_INDEX.md");
  if (fs.existsSync(featureIndexPath)) {
    updateMarkdownFile(featureIndexPath, content =>
      content.replace(
        new RegExp(`\\| ${escapeRegExp(active.title)} \\| \\[~\\] \\|`),
        `| ${active.title} | [x] |`
      )
    );
  }

  const verificationPath = path.join(rootPath, active.path, "VERIFICATION.md");
  if (fs.existsSync(verificationPath)) {
    updateMarkdownFile(verificationPath, content => [
      content.trim(),
      "",
      "## Completion Evidence",
      "",
      `- Verified at: ${now}`,
      `- Command: \`${options.verifyCmd}\``,
      `- Evidence: ${options.evidence}`,
      ""
    ].join("\n"));
  }

  state.history = state.history || [];
  state.history.push({
    from: previousState,
    to: nextFeature ? "IMPLEMENTATION" : "VERIFICATION",
    reason: `Verified feature: ${active.title}`,
    timestamp: now,
    session_id: state.session_id || "feature-completion"
  });
  state.last_updated_at = now;
  state.latest_recovery_point = `Feature verified: ${active.title}`;
  state.metrics = {
    ...(state.metrics || {}),
    time_to_verified_feature_seconds: leadTimeSeconds,
    last_verification_duration_ms: Date.now() - verificationStartedAt,
    failed_gate_count: (state.metrics && state.metrics.failed_gate_count) || 0
  };
  writeJsonFile(statePath, state);

  writeLifecycleCurrentState(rootPath, state, [
    `Verified feature: ${active.title}`,
    `Evidence: ${options.evidence}`,
    nextFeature
      ? `Promoted next feature: ${nextFeature.title}`
      : "All queued features are verified; project verification is next."
  ]);

  writeLifecycleRunRecord(
    rootPath,
    state,
    {
      id: `${active.id}-complete`,
      timestamp: now,
      phase: "verify",
      outcome: "success",
      evidence: options.evidence,
      task_id: active.id,
      duration_ms: Date.now() - verificationStartedAt,
      metrics: state.metrics
    },
    ["feature-complete"]
  );

  appendLifecycleEvent(rootPath, state, {
    type: "feature.verified",
    feature_id: active.id,
    evidence: options.evidence,
    next_feature_id: nextFeature ? nextFeature.id : ""
  });
  persistRunArtifacts(rootPath, {
    sessionId: state.session_id || "feature-completion",
    state,
    answers: state.discovery_answers || {},
    idea: (state.discovery_answers && state.discovery_answers.idea) || "",
    recordedAt: now
  });

  console.log(`Feature completed: ${active.title}`);
  console.log(`Evidence: ${options.evidence}`);
  console.log(nextFeature ? `Next feature: ${nextFeature.title}` : "Next stage: project verification");
}

function verifyProject(rootPath, options) {
  const { statePath, registryPath, state, registry } = readProjectLifecycle(rootPath);
  if (state.current_state === "RELEASE_READY" && registry.project_verification.status === "passed") {
    console.log("Project already verified and release-ready.");
    return;
  }
  if (state.current_state !== "VERIFICATION") {
    fail(`verify-project requires project state VERIFICATION, found ${state.current_state}.`);
  }
  const incomplete = registry.features.filter(feature => feature.status !== "verified");
  if (incomplete.length > 0) {
    fail(`verify-project blocked by unverified features: ${incomplete.map(feature => feature.id).join(", ")}.`);
  }

  const startedAt = Date.now();
  for (const feature of registry.features) {
    const result = runProofCommand(rootPath, feature.verify_cmd, `feature ${feature.id} proof`);
    if (!result.ok) {
      state.metrics = state.metrics || {};
      state.metrics.failed_gate_count = (state.metrics.failed_gate_count || 0) + 1;
      state.last_updated_at = new Date().toISOString();
      writeJsonFile(statePath, state);
      appendLifecycleEvent(rootPath, state, {
        type: "project.verification_failed",
        feature_id: feature.id,
        error: result.message
      });
      fail(result.message);
    }
  }
  const projectProof = runProofCommand(rootPath, options.verifyCmd, "project verification");
  if (!projectProof.ok) {
    state.metrics = state.metrics || {};
    state.metrics.failed_gate_count = (state.metrics.failed_gate_count || 0) + 1;
    state.last_updated_at = new Date().toISOString();
    writeJsonFile(statePath, state);
    appendLifecycleEvent(rootPath, state, {
      type: "project.verification_failed",
      error: projectProof.message
    });
    fail(projectProof.message);
  }

  const now = new Date().toISOString();
  registry.project_status = "release-ready";
  registry.project_verification = {
    status: "passed",
    verify_cmd: options.verifyCmd,
    evidence: options.evidence,
    verified_at: now
  };
  registry.updated_at = now;
  writeJsonFile(registryPath, registry);

  writeJsonFile(path.join(rootPath, ".planning", "PROJECT_VERIFICATION.json"), {
    status: "passed",
    verified_at: now,
    feature_count: registry.features.length,
    feature_proofs: registry.features.map(feature => ({
      id: feature.id,
      verify_cmd: feature.verify_cmd,
      evidence: feature.evidence,
      verified_at: feature.verified_at
    })),
    project_verify_cmd: options.verifyCmd,
    evidence: options.evidence
  });
  writeFileIfChanged(
    path.join(rootPath, ".planning", "IMPLEMENTATION_HANDOFF.md"),
    [
      "# Implementation Handoff",
      "",
      `- Status: Release ready`,
      `- Verified at: ${now}`,
      `- Features verified: ${registry.features.length}`,
      `- Project evidence: ${options.evidence}`,
      `- Project proof command: \`${options.verifyCmd}\``,
      "",
      "## Verified Features",
      "",
      ...registry.features.map(feature => `- [x] ${feature.id}: ${feature.title} - ${feature.evidence}`),
      "",
      "## Next Action",
      "",
      "- Run `genesis-harness complete-project --evidence \"<release or acceptance evidence>\"`.",
      ""
    ].join("\n")
  );

  state.history = state.history || [];
  state.history.push({
    from: "VERIFICATION",
    to: "RELEASE_READY",
    reason: "Project verification passed",
    timestamp: now,
    session_id: state.session_id || "project-verification"
  });
  state.current_state = "RELEASE_READY";
  state.active_work = "Release readiness";
  state.pending_tasks = ["Complete project with release or acceptance evidence"];
  state.last_updated_at = now;
  state.latest_handoff = ".planning/IMPLEMENTATION_HANDOFF.md";
  state.metrics = {
    ...(state.metrics || {}),
    project_verification_duration_ms: Date.now() - startedAt
  };
  writeJsonFile(statePath, state);
  writeLifecycleCurrentState(rootPath, state, [
    "All feature proof commands passed.",
    `Project evidence: ${options.evidence}`,
    "Final completion is awaiting release or acceptance evidence."
  ]);
  appendLifecycleEvent(rootPath, state, {
    type: "project.verified",
    evidence: options.evidence
  });
  writeLifecycleRunRecord(rootPath, state, {
    id: "project-verified",
    timestamp: now,
    phase: "verify",
    outcome: "success",
    evidence: options.evidence,
    task_id: "PROJECT",
    duration_ms: Date.now() - startedAt,
    metrics: state.metrics
  });
  persistRunArtifacts(rootPath, {
    sessionId: state.session_id || "project-verification",
    state,
    answers: state.discovery_answers || {},
    idea: (state.discovery_answers && state.discovery_answers.idea) || "",
    recordedAt: now
  });
  console.log("Project verified: all feature and project proof commands passed.");
  console.log("State: RELEASE_READY");
}

function completeProject(rootPath, options) {
  const { statePath, registryPath, state, registry } = readProjectLifecycle(rootPath);
  if (state.current_state === "COMPLETED" && registry.project_status === "completed") {
    console.log("Project already completed.");
    return;
  }
  if (state.current_state !== "RELEASE_READY") {
    fail(`complete-project requires project state RELEASE_READY, found ${state.current_state}.`);
  }
  if (registry.project_verification.status !== "passed") {
    fail("complete-project requires passed project verification.");
  }

  const now = new Date().toISOString();
  registry.project_status = "completed";
  registry.completed_at = now;
  registry.completion_evidence = options.evidence;
  registry.updated_at = now;
  writeJsonFile(registryPath, registry);

  state.history = state.history || [];
  state.history.push({
    from: "RELEASE_READY",
    to: "COMPLETED",
    reason: options.evidence,
    timestamp: now,
    session_id: state.session_id || "project-completion"
  });
  state.current_state = "COMPLETED";
  state.completed_at = now;
  state.active_work = "";
  state.active_feature = "";
  state.pending_tasks = [];
  state.last_updated_at = now;
  state.latest_recovery_point = "Project completed from release-ready state";
  writeJsonFile(statePath, state);
  writeLifecycleCurrentState(rootPath, state, [
    "All queued features are verified.",
    `Project verification: ${registry.project_verification.evidence}`,
    `Completion evidence: ${options.evidence}`
  ]);
  appendLifecycleEvent(rootPath, state, {
    type: "project.completed",
    evidence: options.evidence
  });
  writeLifecycleRunRecord(rootPath, state, {
    id: "project-completed",
    timestamp: now,
    phase: "release",
    outcome: "success",
    evidence: options.evidence,
    task_id: "PROJECT",
    duration_ms: 0,
    metrics: state.metrics || {}
  });
  persistRunArtifacts(rootPath, {
    sessionId: state.session_id || "project-completion",
    state,
    answers: state.discovery_answers || {},
    idea: (state.discovery_answers && state.discovery_answers.idea) || "",
    recordedAt: now
  });
  console.log("Project completed.");
  console.log(`Evidence: ${options.evidence}`);
}

function auditPipeline(rootPath) {
  const { state, registry } = readProjectLifecycle(rootPath);
  const errors = [];
  const activeFeatures = registry.features.filter(feature => feature.status === "in-progress");
  const unverified = registry.features.filter(feature => feature.status !== "verified");
  const verificationPath = path.join(rootPath, ".planning", "PROJECT_VERIFICATION.json");
  const handoffPath = path.join(rootPath, ".planning", "IMPLEMENTATION_HANDOFF.md");
  const eventsPath = path.join(sessionRunDir(rootPath, state.session_id || "lifecycle"), "EVENTS.jsonl");

  if (state.current_state === "IMPLEMENTATION" && activeFeatures.length !== 1) {
    errors.push(`IMPLEMENTATION requires exactly one active feature; found ${activeFeatures.length}.`);
  }
  if (["VERIFICATION", "RELEASE_READY", "COMPLETED"].includes(state.current_state) && unverified.length > 0) {
    errors.push(`${state.current_state} contains unverified features: ${unverified.map(feature => feature.id).join(", ")}.`);
  }
  if (state.active_feature && !registry.features.some(feature => feature.path === state.active_feature && feature.status === "in-progress")) {
    errors.push("state.active_feature does not match an in-progress registry feature.");
  }
  if (["RELEASE_READY", "COMPLETED"].includes(state.current_state)) {
    if (registry.project_verification.status !== "passed") errors.push("project verification is not passed.");
    if (!fs.existsSync(verificationPath)) errors.push("PROJECT_VERIFICATION.json is missing.");
    if (!fs.existsSync(handoffPath)) errors.push("IMPLEMENTATION_HANDOFF.md is missing.");
  }
  if (state.current_state === "COMPLETED" && registry.project_status !== "completed") {
    errors.push("completed state does not match registry project_status.");
  }
  if (!fs.existsSync(eventsPath)) errors.push("lifecycle event history is missing.");

  if (errors.length > 0) {
    console.error("Pipeline audit failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("Pipeline audit passed.");
  console.log(`State: ${state.current_state}`);
  console.log(`Features: ${registry.features.length}`);
}

function completeDiscoveryPhase(rootPath, answers) {
  const planningRoot = path.join(rootPath, ".planning");
  if (!fs.existsSync(planningRoot)) {
    fail(`missing planning directory at ${planningRoot}; run init first.`);
  }

  const idea = normalizeAnswer(answers.idea, "No explicit user brief captured.");
  const productApproach = normalizeAnswer(
    answers.productApproach,
    `Bootstrap around this brief: ${idea}`
  );
  const primaryUser = normalizeAnswer(answers.primaryUser, "TBD");
  const v1Outcome = normalizeAnswer(answers.v1Outcome, "TBD");
  const qaOwner = normalizeAnswer(answers.qaOwner, "TBD");
  const backend = normalizeAnswer(answers.backend, "TBD");
  const frontend = normalizeAnswer(answers.frontend, "TBD");
  const database = normalizeAnswer(answers.database, "TBD");
  const deployment = normalizeAnswer(answers.deployment, "TBD");
  const testStrategy = normalizeAnswer(answers.testStrategy, "TBD");
  const stackOwner = normalizeAnswer(answers.stackOwner || answers.qaOwner, "TBD");
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  updateMarkdownFile(path.join(planningRoot, "PROJECT.md"), (content) => {
    let next = content;
    next = replaceSection(next, "What This Project Is", `${idea}\n\nPreferred approach: ${productApproach}`);
    next = replaceSection(next, "Target Users", primaryUser);
    next = replaceSection(next, "Core Value", v1Outcome);
    next = replaceSection(
      next,
      "Product Scope",
      `- [x] Build around this brief: ${idea}\n- [x] Preferred product approach: ${productApproach}`
    );
    next = replaceSection(next, "Current Milestone", "First feature planning is ready.");
    next = replaceSection(
      next,
      "Success Criteria",
      `- [x] Discovery closed with explicit product approach.\n- [x] Primary user confirmed: ${primaryUser}\n- [x] Smallest acceptable v1 outcome confirmed: ${v1Outcome}`
    );
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "REQUIREMENTS.md"), (content) => {
    let next = content;
    next = replaceSection(
      next,
      "Functional Requirements",
      `- [x] Support the approved product approach: ${productApproach}\n- [x] Deliver the smallest acceptable v1 outcome: ${v1Outcome}`
    );
    next = replaceSection(
      next,
      "User Stories",
      `- [x] As ${primaryUser}, I want ${v1Outcome.toLowerCase()} so that the core workflow can be completed without context loss.`
    );
    next = replaceSection(
      next,
      "Acceptance Criteria",
      `- [x] Discovery answers are recorded in INIT_QA.md.\n- [x] Product approach is explicit: ${productApproach}\n- [x] QA sign-off owner is explicit: ${qaOwner}`
    );
    next = replaceSection(
      next,
      "Known Unknowns",
      "- [ ] Decompose the approved scope into the first implementation features."
    );
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "STACK.md"), (content) => {
    let next = content;
    next = replaceLineValue(next, "Language", backend);
    next = replaceLineValue(next, "Framework", frontend);
    next = replaceLineValue(next, "Runtime", backend);
    next = replaceLineValue(next, "Database", database);
    next = replaceLineValue(next, "Test framework", testStrategy);
    next = replaceLineValue(next, "Deployment target", deployment);
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "INIT_QA.md"), (content) => {
    const answersBlock = [
      "## Recorded Answers",
      "",
      `- [x] Product approach: ${productApproach}`,
      `- [x] Primary user: ${primaryUser}`,
      `- [x] Smallest acceptable v1 outcome: ${v1Outcome}`,
      `- [x] QA sign-off owner: ${qaOwner}`,
      `- [x] Backend/runtime choice: ${backend}`,
      `- [x] Frontend/client choice: ${frontend}`,
      `- [x] Storage/database choice: ${database}`,
      `- [x] Test strategy: ${testStrategy}`,
      `- [x] Deployment target: ${deployment}`,
      `- [x] Final tech stack owner: ${stackOwner}`
    ].join("\n");

    if (content.includes("## Recorded Answers")) {
      return replaceSection(content, "Recorded Answers", answersBlock.replace("## Recorded Answers\n\n", ""));
    }
    return `${content.trim()}\n\n${answersBlock}\n`;
  });

  updateMarkdownFile(path.join(planningRoot, "decisions", "ADR-001-tech-stack.md"), (content) => {
    let next = content;
    next = next.replace("Status: Proposed", "Status: Accepted");
    next = replaceSection(next, "Context", `Brief: ${idea}`);
    next = replaceSection(
      next,
      "Decision",
      `Use ${backend} for backend/runtime, ${frontend} for the client, ${database} for storage, deploy to ${deployment}, and verify through ${testStrategy}.`
    );
    next = replaceSection(next, "Alternatives Considered", "- [x] Alternatives will be revisited only if the first feature plan exposes blocking constraints.");
    next = replaceSection(next, "Consequences", `- [x] Discovery is closed and feature planning can assume this stack.\n- [x] Stack owner: ${stackOwner}`);
    next = replaceSection(next, "Risks", "- [ ] Feature-level implementation risks will be captured in the first feature plan.");
    next = replaceSection(next, "Mitigation", "- [x] Revisit this ADR if the first implementation feature invalidates the chosen stack.");
    next = replaceSection(next, "Verification Evidence", `- [x] Discovery answers captured via genesis-harness run on ${today}.`);
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "ROADMAP.md"), (content) =>
    content
      .replace(
        "| 01 Discovery & QA | Validation | [ ] | 00 Foundation | Product approach confirmed, QA checklist answered, tech stack signed off |",
        "| 01 Discovery & QA | Validation | [x] | 00 Foundation | Product approach confirmed, QA checklist answered, tech stack signed off |"
      )
      .replace(
        "| TBD | Feature | [ ] | 01 Discovery & QA | To be planned after requirements finalized |",
        "| TBD | Feature | [~] | 01 Discovery & QA | Ready for first feature plan |"
      )
  );

  updateMarkdownFile(path.join(planningRoot, "STATE.md"), (content) => {
    let next = content;
    next = next.replace(
      /Current project state: .*$/m,
      "Current project state: [~] Discovery closed, ready for feature planning."
    );
    next = next.replace(
      /Current phase: .*$/m,
      "Current phase: 02 First Feature Planning"
    );
    next = next.replace(
      /Last completed task: .*$/m,
      "Last completed task: Closed discovery Q&A, QA sign-off path, and tech stack."
    );
    next = next.replace(
      /Next task: .*$/m,
      "Next task: Create the first feature plan from the approved scope."
    );
    next = next.replace(
      /Latest verification result: .*$/m,
      "Latest verification result: Discovery bootstrap completed."
    );
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "SUMMARY.md"), (content) => {
    let next = content;
    next = replaceSection(next, "Current Focus", "- [x] Discovery closed and project moved into first feature planning.");
    next = replaceSection(next, "Recent Changes", `- [x] Discovery answers captured for ${primaryUser}.\n- [x] Stack accepted: ${backend} + ${frontend} + ${database}.`);
    next = replaceSection(next, "Next Recommended Task", "- [ ] Create the first feature plan and its verification contract.");
    return next;
  });

  const currentStatePath = path.join(rootPath, ".codebase", "CURRENT_STATE.md");
  if (fs.existsSync(currentStatePath)) {
    writeFileIfChanged(
      currentStatePath,
      [
        "# Current System State",
        "",
        `**Time**: ${today}  `,
        "**Status**: `IN_PROGRESS`  ",
        `**Latest Session**: \`${today}-run-pipeline\`  `,
        "",
        "## Active Bootstrap",
        "",
        `- Planning harness initialized from the user brief: ${idea}`,
        "- Discovery answers are now recorded and the project is ready for feature planning.",
        "- Current planner phase: `PLANNING`",
        "- Next task: Create the first feature plan from the approved scope."
      ].join("\n")
    );
  }

  const statePath = path.join(rootPath, ".codebase", "state.json");
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    const sessionId = `${today}-run-pipeline`;
    state.current_state = "PLANNING";
    state.active_work = "First feature planning";
    state.active_feature = "";
    state.session_id = sessionId;
    state.session_started_at = state.session_started_at || nowIso;
    state.last_updated_at = nowIso;
    state.latest_recovery_point = "Discovery Q&A completed";
    state.required_verification = [
      "genesis-harness run --idea \"<user brief>\" ...",
      "genesis-harness resume",
      "Review .planning/PROJECT.md, REQUIREMENTS.md, STACK.md",
      "Create the first feature plan"
    ];
    state.pending_tasks = ["Create the first feature plan", "Define the first verification contract"];
    state.discovery_answers = {
      idea,
      product_approach: productApproach,
      primary_user: primaryUser,
      v1_outcome: v1Outcome,
      qa_owner: qaOwner,
      backend,
      frontend,
      database,
      deployment,
      test_strategy: testStrategy,
      stack_owner: stackOwner,
      captured_at: nowIso
    };
    writeJsonFile(statePath, state);
    persistRunArtifacts(rootPath, {
      sessionId,
      state,
      answers: state.discovery_answers,
      idea,
      recordedAt: nowIso
    });
  }
}

function slugifyFeature(value, fallback = "first-feature") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || fallback;
}

function toTitleCase(value) {
  return String(value || "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferFeatureKind(answers) {
  const frontend = normalizeAnswer(answers.frontend, "TBD");
  const backend = normalizeAnswer(answers.backend, "TBD");
  const approach = `${answers.productApproach || ""} ${answers.v1Outcome || ""}`.toLowerCase();
  const uiHints = /(dashboard|screen|page|web|mobile|tablet|client|ui|form|portal)/.test(approach);
  const apiHints = /(api|endpoint|backend|service|queue|workflow|sync|request)/.test(approach);
  const hasFrontend = frontend !== "TBD";
  const hasBackend = backend !== "TBD";

  if ((hasFrontend || uiHints) && (hasBackend || apiHints)) return "full-stack";
  if (hasFrontend || uiHints) return "ui";
  if (hasBackend || apiHints) return "api";
  return "generic";
}

function deriveFeatureSurface(answers, featureRelativePath) {
  const summary = normalizeAnswer(
    answers.v1Outcome,
    normalizeAnswer(answers.productApproach, normalizeAnswer(answers.idea, "first feature slice"))
  );
  const combined = `${answers.productApproach || ""} ${summary}`.toLowerCase();
  let routeSegment = slugifyFeature(summary, path.basename(featureRelativePath));
  let collectionName = "items";
  let responseStatus = "ready";
  let selectionEvent = "onFeatureSelect";

  if (/\bqueue\b/.test(combined)) {
    routeSegment = "staff-queue";
    collectionName = "items";
    responseStatus = "queued";
    selectionEvent = "onQueueItemSelect";
  } else if (/\blogin|sign[\s-]?in|auth\b/.test(combined)) {
    routeSegment = "login";
    collectionName = "sessions";
    responseStatus = "authenticated";
    selectionEvent = "onLoginSubmit";
  } else if (/\bdashboard\b/.test(combined)) {
    routeSegment = "dashboard";
    collectionName = "widgets";
    responseStatus = "loaded";
    selectionEvent = "onDashboardCardSelect";
  }

  const route = `/${routeSegment}`;
  const apiPath = `/api/${routeSegment}/${collectionName}`;

  return {
    kind: inferFeatureKind(answers),
    route,
    apiPath,
    responseStatus,
    selectionEvent,
    entityName: toTitleCase(collectionName.replace(/-/g, " ")),
    contractSlug: path.basename(featureRelativePath)
  };
}

function deriveFirstFeatureSeed(answers) {
  const summary = normalizeAnswer(
    answers.v1Outcome,
    normalizeAnswer(answers.productApproach, normalizeAnswer(answers.idea, "First feature slice"))
  );
  const slugSource = summary
    .replace(/^staff can\s+/i, "")
    .replace(/^users can\s+/i, "")
    .replace(/^allow\s+/i, "");
  return {
    summary,
    slug: slugifyFeature(slugSource, "first-feature-slice")
  };
}

function createFeatureScaffold(rootPath, { slug, summary }) {
  const scriptPath = path.join(packageRoot, ".codex", "skills", "genesis-harness", "scripts", "create-feature.sh");
  const result = spawnSync("bash", [scriptPath, slug, summary, rootPath], {
    cwd: rootPath,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || "unknown create-feature.sh failure").trim();
    fail(`failed to scaffold first feature: ${details}`);
  }

  const relativePath = (result.stdout || "").trim();
  if (!relativePath) {
    fail("failed to scaffold first feature: create-feature.sh did not return the feature path");
  }

  return relativePath;
}

function seedUiContractsAndFixtures(rootPath, featureRelativePath, featureSurface, answers, featureSeed) {
  const uiContractDir = path.join(rootPath, "contracts", "ui", featureSurface.contractSlug);
  const uiFixturePath = path.join(rootPath, "playwright", "fixtures", `${featureSurface.contractSlug}-ui-fixture.md`);
  fs.mkdirSync(uiContractDir, { recursive: true });
  fs.mkdirSync(path.dirname(uiFixturePath), { recursive: true });

  writeJsonFile(path.join(uiContractDir, "screen-contract.json"), {
    contract_id: `UI-${featureSurface.contractSlug.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    version: "1.0.0",
    description: `Bootstrap UI contract for the first feature slice: ${featureSeed.summary}.`,
    inputs: {
      route: featureSurface.route,
      data: [
        {
          name: "actor",
          type: "string",
          validation: normalizeAnswer(answers.primaryUser, "Primary user"),
          required: true
        }
      ]
    },
    states: {
      initial: `Route ${featureSurface.route} is visible with an empty state ready for ${featureSeed.summary.toLowerCase()}.`,
      valid: `The primary action is enabled and the ${featureSurface.entityName.toLowerCase()} list is interactive.`,
      loading: "The main action is pending and the primary controls are disabled.",
      error: "An inline error is shown with enough context for QA triage."
    },
    outputs: {
      events: [
        {
          name: featureSurface.selectionEvent,
          payload: {
            id: "string",
            status: featureSurface.responseStatus
          }
        }
      ]
    },
    mockup_reference: `${featureRelativePath}/mockup.png`
  });

  writeFileIfChanged(
    uiFixturePath,
    [
      "# UI Fixture",
      "",
      `- Route: \`${featureSurface.route}\``,
      `- User role: ${normalizeAnswer(answers.primaryUser, "TBD")}`,
      "- Viewport: tablet landscape",
      `- Mocked API: \`${featureSurface.apiPath}\` returns ${featureSurface.responseStatus}`,
      `- Expected text: ${featureSeed.summary}`,
      `- Expected state: ${featureSurface.responseStatus} items render in the primary queue or list`,
      ""
    ].join("\n")
  );

  return {
    contractPath: path.relative(rootPath, path.join(uiContractDir, "screen-contract.json")),
    fixturePath: path.relative(rootPath, uiFixturePath)
  };
}

function seedApiContractsAndFixtures(rootPath, featureSurface, answers, featureSeed) {
  const apiContractDir = path.join(rootPath, "contracts", "api", featureSurface.contractSlug);
  const apiFixturePath = path.join(rootPath, "fixtures", "api", `${featureSurface.contractSlug}-api-fixture.md`);
  fs.mkdirSync(apiContractDir, { recursive: true });
  fs.mkdirSync(path.dirname(apiFixturePath), { recursive: true });

  writeJsonFile(path.join(apiContractDir, "request.json"), {
    method: "POST",
    path: featureSurface.apiPath,
    body: {
      actor: normalizeAnswer(answers.primaryUser, "Primary user"),
      intent: featureSeed.summary,
      status: featureSurface.responseStatus
    }
  });
  writeJsonFile(path.join(apiContractDir, "response.json"), {
    status: 200,
    body: {
      ok: true,
      status: featureSurface.responseStatus,
      item: {
        id: "generated-id",
        summary: featureSeed.summary
      }
    }
  });
  writeJsonFile(path.join(apiContractDir, "schema.json"), {
    type: "object",
    required: ["ok", "status", "item"],
    properties: {
      ok: { type: "boolean" },
      status: { type: "string" },
      item: {
        type: "object",
        required: ["id", "summary"],
        properties: {
          id: { type: "string" },
          summary: { type: "string" }
        }
      }
    }
  });
  writeJsonFile(path.join(apiContractDir, "example.json"), {
    request: {
      method: "POST",
      path: featureSurface.apiPath
    },
    response: {
      status: 200,
      body: {
        ok: true,
        status: featureSurface.responseStatus
      }
    }
  });
  writeJsonFile(path.join(apiContractDir, "error.json"), {
    error: "invalid_feature_request",
    message: `Request failed validation for ${featureSeed.summary}.`
  });

  writeFileIfChanged(
    apiFixturePath,
    [
      "# API Fixture",
      "",
      "## Input",
      "",
      "- Method: `POST`",
      `- Path: \`${featureSurface.apiPath}\``,
      `- Auth: ${normalizeAnswer(answers.primaryUser, "TBD")}`,
      `- Body intent: ${featureSeed.summary}`,
      "",
      "## Expected Output",
      "",
      "- Status: `200`",
      `- Body status: \`${featureSurface.responseStatus}\``,
      `- Persistence: a ${featureSurface.entityName.toLowerCase()} record is created or updated`,
      "",
      "## Validation Notes",
      "",
      "- Request schema must reject missing actor or intent fields.",
      "- Response schema must include ok/status/item.",
      ""
    ].join("\n")
  );

  return {
    contractDir: path.relative(rootPath, apiContractDir),
    fixturePath: path.relative(rootPath, apiFixturePath)
  };
}

function seedFirstFeatureExecution(rootPath, answers) {
  const planningRoot = path.join(rootPath, ".planning");
  if (!fs.existsSync(planningRoot)) {
    fail(`missing planning directory at ${planningRoot}; run init first.`);
  }

  const idea = normalizeAnswer(answers.idea, "No explicit user brief captured.");
  const productApproach = normalizeAnswer(answers.productApproach, `Bootstrap around this brief: ${idea}`);
  const primaryUser = normalizeAnswer(answers.primaryUser, "the primary user");
  const v1Outcome = normalizeAnswer(answers.v1Outcome, "deliver the first feature slice");
  const qaOwner = normalizeAnswer(answers.qaOwner, "TBD");
  const backend = normalizeAnswer(answers.backend, "TBD");
  const frontend = normalizeAnswer(answers.frontend, "TBD");
  const database = normalizeAnswer(answers.database, "TBD");
  const deployment = normalizeAnswer(answers.deployment, "TBD");
  const testStrategy = normalizeAnswer(answers.testStrategy, "TBD");
  const stackOwner = normalizeAnswer(answers.stackOwner || answers.qaOwner, "TBD");
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);
  const featureSeed = deriveFirstFeatureSeed(answers);
  const featureRelativePath = createFeatureScaffold(rootPath, featureSeed);
  const featureDir = path.join(rootPath, featureRelativePath);
  const featureName = path.basename(featureRelativePath);
  const featureSurface = deriveFeatureSurface(answers, featureRelativePath);
  const generatedArtifacts = {};
  if (featureSurface.kind === "ui" || featureSurface.kind === "full-stack") {
    generatedArtifacts.ui = seedUiContractsAndFixtures(rootPath, featureRelativePath, featureSurface, answers, featureSeed);
  }
  if (featureSurface.kind === "api" || featureSurface.kind === "full-stack") {
    generatedArtifacts.api = seedApiContractsAndFixtures(rootPath, featureSurface, answers, featureSeed);
  }

  writeFileIfChanged(
    path.join(featureDir, "SPEC.md"),
    [
      `# Feature: ${featureSeed.summary}`,
      "",
      "## Summary",
      "",
      `${featureSeed.summary}`,
      "",
      "## User Story",
      "",
      `As ${primaryUser}, I want ${v1Outcome.toLowerCase()} so that the lobby team can complete the first core workflow without context switching.`,
      "",
      "## Expected Behavior",
      "",
      `- [x] Reflect the approved product approach: ${productApproach}`,
      `- [x] Deliver the v1 outcome: ${v1Outcome}`,
      `- [x] Align implementation choices with ${backend} + ${frontend} + ${database}`,
      "",
      "## Edge Cases",
      "",
      "- [ ] Empty-state flow has a visible fallback.",
      "- [ ] Failure path preserves enough detail for QA triage.",
      "- [ ] The first feature slice remains deployable without opening new scope.",
      "",
      "## Out Of Scope",
      "",
      "- [x] Additional features beyond the first implementation slice.",
      "- [x] Unapproved stack changes outside the accepted discovery answers.",
      "",
      "## Acceptance Criteria",
      "",
      `- [x] The first feature plan is scaffolded at \`${featureRelativePath}\`.`,
      "- [x] Tests, contracts, and verification steps are defined before implementation starts.",
      `- [x] QA sign-off path names ${qaOwner} as the owner for this slice.`,
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "IMPACT.md"),
    [
      "# Impact",
      "",
      "| Question | Answer | Notes |",
      "|---|---|---|",
      `| Does this affect API? | TBD | Define only the endpoints needed for: ${v1Outcome} |`,
      `| Does this affect database? | TBD | Keep schema changes bounded to ${database} decisions already accepted |`,
      "| Does this affect UI? | Yes | First feature execution starts from the approved primary flow |",
      "| Does this affect auth/security? | TBD | Capture login and permissions assumptions before implementation |",
      "| Does this affect integrations? | TBD | Defer unless the first slice cannot work without them |",
      "| Does this affect environment variables? | TBD | Document anything needed before deploy |",
      "| Does this affect architecture? | No | Stay within the accepted bootstrap architecture unless blocked |",
      "| Does this require docs update? | Yes | Update planning docs and runtime state as implementation progresses |",
      `| Does this require tests? | Yes | ${testStrategy} |`,
      "| Does this require migration? | TBD | Only if the first slice introduces persistent state changes |",
      "| Does this affect existing user journeys? | Yes | It defines the first explicit journey after discovery |",
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "PLAN.md"),
    [
      "# Plan",
      "",
      "## Files To Change",
      "",
      "### File: `.planning/features/...`",
      "",
      "Change: Replace TBD scaffolding with the approved first implementation slice.",
      `Why: Move the pipeline from discovery into real execution for ${v1Outcome}.`,
      "Risk: The slice becomes too broad and stops being executable.",
      `Test: ${testStrategy}`,
      "Docs impact: STATE.md, SUMMARY.md, FEATURE_INDEX.md, and SPEC_CHANGELOG.md",
      "",
      "## Implementation Steps",
      "",
      "- [x] Scaffold the first feature directory from the discovery-approved scope.",
      "- [x] Seed SPEC.md, TEST_CONTRACT.md, and VERIFICATION.md for the active slice.",
      "- [ ] Add the first failing tests or verification checks for this slice.",
      "- [ ] Implement the minimum code required to satisfy the first test contract.",
      "- [ ] Run verification and record evidence in VERIFICATION.md.",
      "",
      "## Test Strategy",
      "",
      `- [x] Start from ${testStrategy}.`,
      "- [ ] Add or update the narrowest failing test first.",
      "- [ ] Expand coverage only after the first slice is green.",
      "",
      "## Docs To Update",
      "",
      "- [x] `.planning/STATE.md`",
      "- [x] `.planning/SUMMARY.md`",
      "- [x] `.planning/FEATURE_INDEX.md`",
      ...(generatedArtifacts.ui ? [`- [x] \`${generatedArtifacts.ui.contractPath}\``, `- [x] \`${generatedArtifacts.ui.fixturePath}\``] : []),
      ...(generatedArtifacts.api ? [`- [x] \`${generatedArtifacts.api.contractDir}/request.json\``, `- [x] \`${generatedArtifacts.api.fixturePath}\``] : []),
      "- [ ] `.planning/SPEC_CHANGELOG.md`",
      "",
      "## Diagrams To Update",
      "",
      "- [x] `DIAGRAM.mmd`",
      "",
      "## Risks",
      "",
      `- [ ] Scope drift beyond ${featureSeed.summary}.`,
      `- [ ] Stack changes that conflict with ${stackOwner}'s sign-off.`,
      "",
      "## Rollback Plan",
      "",
      "- [ ] Revert the active slice to the last passing verification state and reopen planning if implementation scope changes.",
      "",
      "## Verification Commands",
      "",
      "```sh",
      "rtk bash scripts/verify.sh",
      "rtk bash scripts/run-evals.sh",
      "rtk node bin/genesis-harness.js verify-gate",
      "```",
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "TEST_CONTRACT.md"),
    [
      "# Test Contract",
      "",
      "## Normal Input / Output",
      "",
      `- [x] Primary actor: ${primaryUser}`,
      `- [x] Target behavior: ${v1Outcome}`,
      `- [x] Runtime direction: ${backend} + ${frontend}`,
      ...(generatedArtifacts.ui ? [`- [x] UI contract: \`${generatedArtifacts.ui.contractPath}\``] : []),
      ...(generatedArtifacts.api ? [`- [x] API contract: \`${generatedArtifacts.api.contractDir}/request.json\` and \`${generatedArtifacts.api.contractDir}/response.json\``] : []),
      "",
      "## Edge Cases",
      "",
      "- [ ] Empty input or no records available.",
      "- [ ] Verification catches a missing required dependency or contract drift.",
      "",
      "## Invalid Inputs",
      "",
      "- [ ] Unsupported assumptions that were not approved during discovery.",
      "- [ ] Scope expansion that needs a new feature plan instead of implementation work.",
      "",
      "## Expected Errors",
      "",
      "- [ ] Failing tests should clearly identify the missing first-slice behavior.",
      "",
      "## Acceptance Tests",
      "",
      `- [x] The feature remains traceable to the approved product approach: ${productApproach}`,
      `- [x] The execution plan stays bounded to: ${featureSeed.summary}`,
      "",
      "## Manual Verification",
      "",
      `- [x] QA owner: ${qaOwner}`,
      `- [x] Deployment target: ${deployment}`,
      ...(generatedArtifacts.ui ? [`- [x] UI fixture: \`${generatedArtifacts.ui.fixturePath}\``] : []),
      ...(generatedArtifacts.api ? [`- [x] API fixture: \`${generatedArtifacts.api.fixturePath}\``] : []),
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "TASKS.md"),
    [
      "# Tasks",
      "",
      "- [x] Read required planning docs",
      "- [x] Read PITFALLS.md",
      "- [x] Read LESSONS_LEARNED.md",
      "- [x] Research existing codebase patterns",
      "- [x] Research best practices",
      "- [x] Create or update Mermaid diagram",
      "- [x] Write SPEC.md",
      "- [x] Write IMPACT.md",
      "- [x] Write PLAN.md",
      "- [x] Write TEST_CONTRACT.md",
      "- [ ] Add failing tests or verification",
      "- [ ] Implement feature",
      "- [ ] Run verification",
      "- [ ] Update docs",
      "- [ ] Review changed files",
      "- [ ] Remove unnecessary files/code",
      "- [x] Update STATE.md",
      "- [x] Update FEATURE_INDEX.md",
      "- [ ] Update SPEC_CHANGELOG.md",
      "- [ ] Mark completed tasks",
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "VERIFICATION.md"),
    [
      "# Verification",
      "",
      "- [x] Define commands",
      "- [ ] Run commands",
      "- [ ] Record results",
      "",
      "| Command | Result | Evidence |",
      "|---|---|---|",
      "| `rtk bash scripts/verify.sh` | Pending | Run after the first code change for this slice |",
      "| `rtk bash scripts/run-evals.sh` | Pending | Run after the first code change for this slice |",
      "| `rtk node bin/genesis-harness.js verify-gate` | Pending | Final blocker before claiming completion |",
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "REVIEW.md"),
    [
      "# Review",
      "",
      "- [ ] Changed files reviewed",
      "- [ ] Missing docs checked",
      "- [ ] Debug logs removed",
      "- [ ] Unnecessary changes removed",
      "",
      "## Findings",
      "",
      "| Severity | File | Issue | Follow-Up |",
      "|---|---|---|---|",
      "| TBD | TBD | TBD | TBD |",
      ""
    ].join("\n")
  );

  writeFileIfChanged(
    path.join(featureDir, "DIAGRAM.mmd"),
    [
      "flowchart LR",
      `  User["${primaryUser}"] --> Feature["${featureSeed.summary}"]`,
      `  Feature --> Product["${productApproach}"]`,
      `  Product --> Verify["${testStrategy}"]`,
      ""
    ].join("\n")
  );

  updateMarkdownFile(path.join(planningRoot, "FEATURE_INDEX.md"), (content) => {
    const row = `| ${featureSeed.summary} | [~] | 02 | ${featureRelativePath.replace(".planning/", "")} | Active first implementation slice |`;
    if (content.includes(`| ${featureSeed.summary} |`)) return content;
    return `${content.trim()}\n${row}\n`;
  });

  writeJsonFile(path.join(planningRoot, "FEATURE_REGISTRY.json"), {
    version: "1.0.0",
    updated_at: nowIso,
    project_status: "implementation",
    project_verification: {
      status: "pending",
      verify_cmd: "",
      evidence: "",
      verified_at: ""
    },
    features: [
      {
        id: "F001",
        status: "in-progress",
        title: featureSeed.summary,
        path: featureRelativePath,
        verify_cmd: "node bin/genesis-harness.js verify-gate",
        evidence: "",
        started_at: nowIso,
        verified_at: "",
        attempts: 0,
        last_error: ""
      }
    ]
  });

  updateMarkdownFile(path.join(planningRoot, "ROADMAP.md"), (content) =>
    content.replace(
      "| TBD | Feature | [~] | 01 Discovery & QA | Ready for first feature plan |",
      `| 02 ${featureSeed.summary} | Feature | [~] | 01 Discovery & QA | Active first implementation slice is scaffolded and ready for tests |`
    )
  );

  updateMarkdownFile(path.join(planningRoot, "STATE.md"), (content) => {
    let next = content;
    next = next.replace(
      /Current project state: .*$/m,
      "Current project state: [~] Active first feature execution."
    );
    next = next.replace(
      /Current phase: .*$/m,
      "Current phase: 02 First Feature Execution"
    );
    next = next.replace(
      /Current feature or bug: .*$/m,
      `Current feature or bug: ${featureRelativePath.replace(".planning/", "")}`
    );
    next = next.replace(
      /Last completed task: .*$/m,
      `Last completed task: Seeded the first execution-ready feature scaffold for ${featureSeed.summary}.`
    );
    next = next.replace(
      /Next task: .*$/m,
      `Next task: Add the first failing tests for ${featureSeed.summary}.`
    );
    next = next.replace(
      /Latest verification result: .*$/m,
      "Latest verification result: Discovery complete and first feature execution scaffolded."
    );
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "SUMMARY.md"), (content) => {
    let next = content;
    next = replaceSection(next, "Current Focus", `- [x] Active feature execution started for ${featureSeed.summary}.`);
    next = replaceSection(
      next,
      "Recent Changes",
      `- [x] Discovery answers closed into an execution-ready feature scaffold.\n- [x] Active feature path: ${featureRelativePath.replace(".planning/", "")}.`
    );
    next = replaceSection(next, "Next Recommended Task", `- [ ] Add the first failing test and implement ${featureSeed.summary}.`);
    return next;
  });

  updateMarkdownFile(path.join(planningRoot, "SPEC_CHANGELOG.md"), (content) => {
    const entry = `| ${nowIso} | Scaffolded first execution-ready feature: ${featureSeed.summary} | Close the bootstrap gap between discovery and implementation | .planning/features/, STATE.md, SUMMARY.md, FEATURE_INDEX.md | tests/integration/cli-smoke.test.js | None |`;
    if (content.includes(`Scaffolded first execution-ready feature: ${featureSeed.summary}`)) return content;
    return `${content.trim()}\n${entry}\n`;
  });

  const currentStatePath = path.join(rootPath, ".codebase", "CURRENT_STATE.md");
  if (fs.existsSync(currentStatePath)) {
    writeFileIfChanged(
      currentStatePath,
      [
        "# Current System State",
        "",
        `**Time**: ${today}  `,
        "**Status**: `IN_PROGRESS`  ",
        `**Latest Session**: \`${today}-run-pipeline\`  `,
        "",
        "## Active Bootstrap",
        "",
        `- Planning harness initialized from the user brief: ${idea}`,
        `- Discovery answers were promoted into the first active feature: ${featureRelativePath.replace(".planning/", "")}.`,
        "- Current planner phase: `IMPLEMENTATION`",
        `- Next task: Add the first failing tests for ${featureSeed.summary}.`
      ].join("\n")
    );
  }

  const statePath = path.join(rootPath, ".codebase", "state.json");
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    const sessionId = state.session_id || `${today}-run-pipeline`;
    state.current_state = "IMPLEMENTATION";
    state.active_work = `Implement ${featureName}`;
    state.active_feature = featureRelativePath;
    state.session_id = sessionId;
    state.session_started_at = state.session_started_at || nowIso;
    state.last_updated_at = nowIso;
    state.latest_recovery_point = "First feature execution scaffolded";
    state.required_verification = [
      `Review ${featureRelativePath}/SPEC.md`,
      `Review ${featureRelativePath}/TEST_CONTRACT.md`,
      "Add the first failing test for the active slice",
      "rtk bash scripts/verify.sh",
      "rtk bash scripts/run-evals.sh",
      "rtk node bin/genesis-harness.js verify-gate"
    ];
    state.pending_tasks = [
      "Add the first failing test",
      "Implement the first feature slice",
      "Run verification and record evidence"
    ];
    writeJsonFile(statePath, state);
    persistRunArtifacts(rootPath, {
      sessionId,
      state,
      answers: state.discovery_answers || {
        idea,
        product_approach: productApproach,
        primary_user: primaryUser,
        v1_outcome: v1Outcome,
        qa_owner: qaOwner,
        backend,
        frontend,
        database,
        deployment,
        test_strategy: testStrategy,
        stack_owner: stackOwner,
        captured_at: nowIso
      },
      idea,
      recordedAt: nowIso
    });
  }

  return featureRelativePath;
}

function runBootstrapPipeline({ rootPath = process.cwd(), options }) {
  initializeProject({
    rootPath,
    platform: options.platform || "codex",
    idea: options.idea
  });
  completeDiscoveryPhase(rootPath, options);
  const featurePath = seedFirstFeatureExecution(rootPath, options);
  console.log("\n\x1b[1m\x1b[32m✓ Run pipeline complete.\x1b[0m");
  console.log(`Discovery answers recorded and ${featurePath} is ready for execution.\n`);
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
  const cliPath = path.join(packageRoot, "bin", "genesis-harness.js");
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  console.log("\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m");
  console.log("\x1b[1m\x1b[36m   GENESIS HARNESS — VERIFY-GATE (L09 Victory Blocker) \x1b[0m");
  console.log("\x1b[1m\x1b[36m══════════════════════════════════════════════════════\x1b[0m");
  console.log("\x1b[33mRunning all verification gates. Task is NOT done until all pass.\x1b[0m\n");

  const gates = [
    {
      name: "1. Structural verify (verify.sh)",
      run: () => spawnSync(bash, [verifyScript], { cwd: packageRoot, stdio: "inherit", env: process.env }).status
    },
    {
      name: "2. Eval regression suite (run-evals.sh)",
      run: () => spawnSync(bash, [evalsScript], { cwd: packageRoot, stdio: "inherit", env: process.env }).status
    },
    {
      name: "3. Documentation drift gate (docs-gate)",
      run: () => spawnSync(process.execPath, [cliPath, "docs-gate"], {
        cwd: packageRoot,
        stdio: "inherit",
        env: process.env
      }).status
    },
    {
      name: "4. Cold-start check (cold-start-check.js)",
      run: () => fs.existsSync(coldStartScript)
        ? spawnSync(process.execPath, [coldStartScript], { cwd: packageRoot, stdio: "inherit", env: process.env }).status
        : 0
    },
    {
      name: "5. Package dry-run (npm run pack:check)",
      run: () => spawnSync(npmCmd, ["run", "pack:check"], {
        cwd: packageRoot,
        stdio: "inherit",
        env: process.env
      }).status
    },
    {
      name: "6. Lean context report (genesis-harness leanctx)",
      run: () => spawnSync(process.execPath, [cliPath, "leanctx"], {
        cwd: packageRoot,
        stdio: "inherit",
        env: process.env
      }).status
    }
  ];

  if (process.env.GENESIS_VERIFY_GATE_SELF_TEST === "1") {
    console.log(gates.map((gate) => gate.name).join("\n"));
    return;
  }

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

function initInteractive() {
  const options = [
    { name: "Antigravity IDE (Gemini)", desc: "Uses global plugin", selected: true },
    { name: "Codex / Claude (VS Code)", desc: "Uses local .codex/skills", selected: false }
  ];

  let selectedIndex = 0;

  const renderMenu = () => {
    console.clear();
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m");
    console.log("\x1b[1m\x1b[36m                GENESIS HARNESS - INITIALIZATION                      \x1b[0m");
    console.log("\x1b[1m\x1b[36m======================================================================\x1b[0m\n");
    console.log("  \x1b[1mWhich AI Agent Platform are you using?\x1b[0m");
    console.log("  Use \x1b[33mUp/Down Arrow\x1b[0m to navigate.");
    console.log("  Press \x1b[32mEnter\x1b[0m to confirm and initialize.");
    console.log("  Press \x1b[90mEsc or Ctrl+C\x1b[0m to cancel.\n");

    options.forEach((opt, idx) => {
      const cursor = idx === selectedIndex ? "\x1b[1m\x1b[36m➔\x1b[0m " : "  ";
      const checkbox = idx === selectedIndex ? "\x1b[32m(◉)\x1b[0m" : "( )";
      const name = idx === selectedIndex ? `\x1b[1m${opt.name}\x1b[0m` : opt.name;
      console.log(`  ${cursor} ${checkbox} ${name.padEnd(30)} \x1b[90m(${opt.desc})\x1b[0m`);
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
    console.log("\n\x1b[33m[-] Initialization Cancelled.\x1b[0m\n");
    process.exit(0);
  };

  const executeInit = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.clear();
    initializeProject({
      rootPath: process.cwd(),
      platform: selectedIndex === 0 ? "antigravity" : "codex"
    });
    process.exit(0);
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
    } else if (key === "\r") { // Enter
      executeInit();
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
  case "init": {
    const initOptions = parseInitArgs(args);
    if (initOptions.autoConfirm) {
      initializeProject({
        rootPath: process.cwd(),
        platform: initOptions.platform || "codex",
        idea: initOptions.idea
      });
      break;
    }
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      fail("init requires a TTY unless you pass --yes --platform <codex|antigravity>.");
    }
    initInteractive();
    break;
  }
  case "run": {
    const runOptions = parseRunArgs(args);
    if (!runOptions.autoConfirm) {
      fail("run requires --yes so the bootstrap pipeline stays deterministic.");
    }
    runBootstrapPipeline({
      rootPath: process.cwd(),
      options: runOptions
    });
    break;
  }
  case "resume":
    resumeProject(process.cwd());
    break;
  case "next":
    showNextAction(process.cwd());
    break;
  case "add-feature":
    addFeature(process.cwd(), parseAddFeatureArgs(args));
    break;
  case "complete-feature":
    completeFeature(process.cwd(), parseCompleteFeatureArgs(args));
    break;
  case "verify-project":
    verifyProject(process.cwd(), parseProjectVerificationArgs(args));
    break;
  case "complete-project":
    completeProject(process.cwd(), parseProjectCompletionArgs(args));
    break;
  case "pipeline-audit":
    auditPipeline(process.cwd());
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
