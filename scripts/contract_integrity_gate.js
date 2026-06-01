#!/usr/bin/env node

/**
 * AST Contract-Code Integrity Gate
 * Part of Genesis Codex Harness v0.1.8
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/contract_integrity_gate.js --code <code-file-path> --contract <response-json-path>');
  process.exit(1);
}

const args = process.argv.slice(2);
const codeIndex = args.indexOf('--code');
const contractIndex = args.indexOf('--contract');

if (codeIndex === -1 || contractIndex === -1 || !args[codeIndex + 1] || !args[contractIndex + 1]) {
  printUsage();
}

const codePath = path.resolve(process.cwd(), args[codeIndex + 1]);
const contractPath = path.resolve(process.cwd(), args[contractIndex + 1]);

if (!fs.existsSync(codePath)) {
  console.error(`Error: Source code file does not exist at: ${codePath}`);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) {
  console.error(`Error: Contract JSON file does not exist at: ${contractPath}`);
  process.exit(1);
}

// 1. Parse Contract JSON Schema
let contractSchema = {};
try {
  contractSchema = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
} catch (err) {
  console.error(`[ERROR] Failed to parse JSON contract:`, err.message);
  process.exit(1);
}

const properties = contractSchema.properties || {};
const requiredFields = contractSchema.required || Object.keys(properties);

// 2. Parse Source Code File (Static scan)
const codeContent = fs.readFileSync(codePath, 'utf8');

console.log(`[Integrity Gate] Auditing static code alignment:`);
console.log(`  - Code file: ${path.basename(codePath)}`);
console.log(`  - Contract: ${path.basename(contractPath)}`);

let integrityFailed = false;
const missingFields = [];

// For each required field in the contract, verify its presence inside the code
for (const field of requiredFields) {
  // Use a simple, robust regex to match field names in common object/JSON structures
  // Matches: "field", 'field', field:, field =
  const fieldRegex = new RegExp(`['"]?${field}['"]?\\s*[:=]`, 'g');
  
  if (!fieldRegex.test(codeContent)) {
    missingFields.push(field);
    integrityFailed = true;
  }
}

if (integrityFailed) {
  console.error(`\n❌ [INTEGRITY FAILURE] [STATIC ALIGNMENT DRIFT]`);
  console.error(`  The source code file is missing implementations/properties for the following required contract fields:`);
  for (const field of missingFields) {
    console.error(`  - Missing property: "${field}" (Expected type: "${properties[field]?.type || 'any'}")`);
  }
  console.error(`  Transition Blocked. Please align your source implementation with the API contracts.`);
  process.exit(1);
} else {
  console.log(`\n✅ [INTEGRITY SUCCESS] Code matches all ${requiredFields.length} required fields from contract.`);
  process.exit(0);
}
