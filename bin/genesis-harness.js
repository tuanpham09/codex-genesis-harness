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
  "ui-ux-test-skill",
  "genesis-harness-engineering",
  "genesis-ai-provider",
  "genesis-pipeline-orchestration",
  "genesis-research",
  "genesis-docs",
  "genesis-release",
  "genesis-api-sync",
  "genesis-debug-guide",
  "genesis-docs-automation",
  "genesis-spec-propagation",
  "genesis-release-orchestration",
  "genesis-performance-profiling",
  "genesis-observability-automation",
  "genesis-research-first",
  "spec-impact-engine"
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

Environment:
  CODEX_HOME=/custom/.codex  Override Codex home
  GENESIS_HARNESS_HOME=/custom/.agents  Override modern skills home
  GENESIS_HARNESS_SKIP_POSTINSTALL=1  Skip npm postinstall auto-install
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
        const backupDir = `${dir}.backup.${timestamp()}`;
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

const command = process.argv[2] || "help";
const args = process.argv.slice(3);

switch (command) {
  case "install":
    copySkills({ target: parseTarget(args, "both") });
    break;
  case "postinstall":
    if (process.env.GENESIS_HARNESS_SKIP_POSTINSTALL === "1") {
      process.exit(0);
    }
    copySkills({ quiet: true, target: "both" });
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
  case "help":
  case "--help":
  case "-h":
    usage(0);
    break;
  default:
    usage(2);
}
