#!/usr/bin/env node

/**
 * Healing Telemetry & Lessons-Learned System
 * Part of Genesis Codex Harness v0.1.8
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/healing_telemetry.js --record --error "<error>" --file "<file>" --fix "<fix-desc>"');
  console.log('  node scripts/healing_telemetry.js --recall --error "<error>"');
  process.exit(1);
}

const args = process.argv.slice(2);
const recordMode = args.includes('--record');
const recallMode = args.includes('--recall');

if (!recordMode && !recallMode) {
  printUsage();
}

const LESSONS_PATH = path.resolve(process.cwd(), '.codebase/failures/lessons_learned.md');

// Helper to sanitize text for markdown table/list compatibility
const sanitize = (text) => text.replace(/[\n\r]/g, ' ').replace(/\|/g, '\\|').trim();

// 1. Record Mode
if (recordMode) {
  const errorIndex = args.indexOf('--error');
  const fileIndex = args.indexOf('--file');
  const fixIndex = args.indexOf('--fix');

  if (errorIndex === -1 || fileIndex === -1 || fixIndex === -1 || !args[errorIndex + 1] || !args[fileIndex + 1] || !args[fixIndex + 1]) {
    printUsage();
  }

  const error = args[errorIndex + 1];
  const file = args[fileIndex + 1];
  const fix = args[fixIndex + 1];

  console.log(`[Healing Telemetry] Recording lessons-learned telemetry entry...`);

  // Ensure directories exist
  fs.mkdirSync(path.dirname(LESSONS_PATH), { recursive: true });

  let header = '';
  if (!fs.existsSync(LESSONS_PATH)) {
    header = `# Self-Healing Lessons Learned Database\n\nThis file persists recorded error-fix telemetry signatures to facilitate immediate 1-turn recovery.\n\n| Timestamp | Target File | Error Signature | Remedial Fix Applied |\n| :--- | :--- | :--- | :--- |\n`;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const rowEntry = `| ${timestamp} | ${sanitize(file)} | ${sanitize(error)} | ${sanitize(fix)} |\n`;

  fs.appendFileSync(LESSONS_PATH, header + rowEntry, 'utf8');
  console.log(`✓ Telemetry successfully recorded inside lessons_learned.md`);
  process.exit(0);
}

// 2. Recall Mode
if (recallMode) {
  const errorIndex = args.indexOf('--error');
  if (errorIndex === -1 || !args[errorIndex + 1]) {
    printUsage();
  }

  const queryError = args[errorIndex + 1].toLowerCase();
  console.log(`[Healing Telemetry] Querying telemetry for: "${queryError}"`);

  if (!fs.existsSync(LESSONS_PATH)) {
    console.log('No telemetry lessons-learned database available yet. Proceeding with standard healing.');
    process.exit(0);
  }

  const content = fs.readFileSync(LESSONS_PATH, 'utf8');
  const lines = content.split('\n');

  let matchFound = false;
  let bestMatch = null;

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('Timestamp') || line.includes(':---')) continue;

    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 5) {
      const errorSignature = parts[3].toLowerCase();
      const refactoringFix = parts[4];

      // Simple keyword intersection/substring search
      if (queryError.includes(errorSignature) || errorSignature.includes(queryError)) {
        bestMatch = {
          file: parts[2],
          signature: parts[3],
          fix: refactoringFix
        };
        matchFound = true;
        break; // Return first closest match
      }
    }
  }

  if (matchFound && bestMatch) {
    console.log(`\n🎯 [RECALL MATCH FOUND] [1-TURN RECOVERY SUGGESTION]:`);
    console.log(`  - Target file: ${bestMatch.file}`);
    console.log(`  - Signature matched: "${bestMatch.signature}"`);
    console.log(`  - Recommended Fix: ${bestMatch.fix}`);
    
    // Output key snippet directly for script parsing/AI intake
    console.log(`\nSUGGESTED_FIX_START: ${bestMatch.fix} :SUGGESTED_FIX_END`);
    process.exit(0);
  } else {
    console.log('No matching error-fix signature found. Defaulting to general code analysis.');
    process.exit(0);
  }
}
