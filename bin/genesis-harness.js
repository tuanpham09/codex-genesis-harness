#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const packageRoot = path.resolve(__dirname, "..");
const skillName = "project-genesis-harness";
const sourceDir = path.join(packageRoot, ".codex", "skills", skillName);
const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
const agentsHome = process.env.GENESIS_HARNESS_HOME || path.join(process.env.HOME || "", ".agents");
const legacyTargetDir = path.join(codexHome, "skills", skillName);
const agentsTargetDir = path.join(agentsHome, "skills", skillName);

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
  const skillFile = path.join(sourceDir, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    fail(`missing packaged skill at ${skillFile}`);
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

function targetDirs(target) {
  if (target === "agents") return [agentsTargetDir];
  if (target === "legacy") return [legacyTargetDir];
  return [agentsTargetDir, legacyTargetDir];
}

function copySkill({ quiet = false, target = "both" } = {}) {
  ensureSource();
  for (const dir of targetDirs(target)) {
    fs.mkdirSync(path.dirname(dir), { recursive: true });

    if (fs.existsSync(dir)) {
      const backupDir = `${dir}.backup.${timestamp()}`;
      fs.renameSync(dir, backupDir);
      if (!quiet) console.log(`Existing skill backed up to: ${backupDir}`);
    }

    fs.cpSync(sourceDir, dir, { recursive: true });
    chmodScripts(path.join(dir, "scripts"));

    if (!quiet) console.log(`Installed ${skillName} to: ${dir}`);
  }

  if (!quiet) console.log(`Restart Codex, then invoke: Use $${skillName}`);
}

function uninstallSkill(target = "both") {
  for (const dir of targetDirs(target)) {
    if (!fs.existsSync(dir)) {
      console.log(`Skill is not installed at: ${dir}`);
      continue;
    }
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Removed: ${dir}`);
  }
}

function verifySkill(target = "both") {
  const verifyScript = path.join(packageRoot, "scripts", "verify.sh");
  if (!fs.existsSync(verifyScript)) fail(`missing verify script at ${verifyScript}`);

  for (const verifyTarget of targetDirs(target)) {
    const result = spawnSync("bash", [verifyScript, verifyTarget], {
      stdio: "inherit",
      env: process.env
    });
    if (result.status) process.exit(result.status);
  }
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
    copySkill({ target: parseTarget(args, "both") });
    break;
  case "postinstall":
    if (process.env.GENESIS_HARNESS_SKIP_POSTINSTALL === "1") {
      process.exit(0);
    }
    copySkill({ quiet: true, target: "both" });
    break;
  case "verify":
    verifySkill(parseTarget(args, "both"));
    break;
  case "uninstall":
    uninstallSkill(parseTarget(args, "both"));
    break;
  case "path":
    console.log(agentsTargetDir);
    console.log(legacyTargetDir);
    break;
  case "help":
  case "--help":
  case "-h":
    usage(0);
    break;
  default:
    usage(2);
}
