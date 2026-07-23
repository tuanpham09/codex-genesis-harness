#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const hygieneScript = path.join(repoRoot, "scripts", "check-repository-hygiene.js");

const output = execFileSync(process.execPath, [hygieneScript], {
  cwd: repoRoot,
  encoding: "utf8"
});

assert(output.includes("repository hygiene passed"), "hygiene gate should report success");
console.log("repository_hygiene tests passed");
