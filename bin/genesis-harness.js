#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const packageRoot = path.resolve(__dirname, "..");
const skillName = "project-genesis-harness";
const sourceDir = path.join(packageRoot, ".codex", "skills", skillName);
const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
const targetDir = path.join(codexHome, "skills", skillName);

function usage(exitCode = 0) {
  const text = `
Project Genesis Harness

Usage:
  genesis-harness install
  genesis-harness verify
  genesis-harness uninstall
  genesis-harness path

Environment:
  CODEX_HOME=/custom/.codex  Override Codex home
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

function copySkill({ quiet = false } = {}) {
  ensureSource();
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });

  if (fs.existsSync(targetDir)) {
    const backupDir = `${targetDir}.backup.${timestamp()}`;
    fs.renameSync(targetDir, backupDir);
    if (!quiet) console.log(`Existing skill backed up to: ${backupDir}`);
  }

  fs.cpSync(sourceDir, targetDir, { recursive: true });
  chmodScripts(path.join(targetDir, "scripts"));

  if (!quiet) {
    console.log(`Installed ${skillName} to: ${targetDir}`);
    console.log(`Restart Codex, then invoke: Use $${skillName}`);
  }
}

function uninstallSkill() {
  if (!fs.existsSync(targetDir)) {
    console.log(`Skill is not installed at: ${targetDir}`);
    return;
  }
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log(`Removed: ${targetDir}`);
}

function verifySkill() {
  const verifyScript = path.join(packageRoot, "scripts", "verify.sh");
  if (!fs.existsSync(verifyScript)) fail(`missing verify script at ${verifyScript}`);

  const result = spawnSync("bash", [verifyScript, targetDir], {
    stdio: "inherit",
    env: process.env
  });
  process.exit(result.status || 0);
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

switch (command) {
  case "install":
    copySkill();
    break;
  case "postinstall":
    if (process.env.GENESIS_HARNESS_SKIP_POSTINSTALL === "1") {
      process.exit(0);
    }
    copySkill({ quiet: true });
    break;
  case "verify":
    verifySkill();
    break;
  case "uninstall":
    uninstallSkill();
    break;
  case "path":
    console.log(targetDir);
    break;
  case "help":
  case "--help":
  case "-h":
    usage(0);
    break;
  default:
    usage(2);
}
