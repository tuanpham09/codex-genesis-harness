#!/usr/bin/env node
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const workTreeCheck = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
  cwd: repoRoot,
  encoding: "utf8"
});

if (workTreeCheck.status !== 0) {
  console.log("repository hygiene skipped: package is not inside a Git worktree");
  process.exit(0);
}

const result = spawnSync("git", ["ls-files", "-z"], {
  cwd: repoRoot,
  encoding: "utf8"
});

if (result.status !== 0) {
  console.error(result.stderr || "repository hygiene failed: git ls-files failed");
  process.exit(result.status || 1);
}

const tracked = result.stdout.split("\0").filter(Boolean);
const forbidden = tracked.filter(file =>
  file === "node_modules"
  || file.startsWith("node_modules/")
  || file === "dist"
  || file.startsWith("dist/")
  || file.endsWith(".tgz")
);

if (forbidden.length > 0) {
  console.error("repository hygiene failed: generated or dependency artifacts are tracked:");
  for (const file of forbidden.slice(0, 20)) {
    console.error(`- ${file}`);
  }
  if (forbidden.length > 20) {
    console.error(`- ... and ${forbidden.length - 20} more`);
  }
  process.exit(1);
}

console.log("repository hygiene passed");
