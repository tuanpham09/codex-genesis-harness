#!/usr/bin/env node

/**
 * Pre-emptive Prompt Sentinel
 * Part of Genesis Codex Harness v0.1.7
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function loadContextPolicy() {
  const defaultPolicy = {
    token_budget: 12000,
    compact_at: 0.7,
    hard_stop_at: 0.85
  };
  const packageRoot = path.resolve(__dirname, '..');
  const packagedPolicy = readJsonIfExists(path.join(packageRoot, '.codebase', 'context-policy.json'));
  const projectPolicy = readJsonIfExists(path.resolve(process.cwd(), '.codebase', 'context-policy.json'));
  return {
    ...defaultPolicy,
    ...(packagedPolicy || {}),
    ...(projectPolicy || {})
  };
}

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/prompt_sentinel.js --check <file-or-log-path> [--threshold <tokens>]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2 || args[0] !== '--check') {
  printUsage();
}

const targetPath = path.resolve(process.cwd(), args[1]);
const policy = loadContextPolicy();
let threshold = Math.round(Number(policy.token_budget || 12000) * Number(policy.compact_at || 0.7));

const thresholdIndex = args.indexOf('--threshold');
if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
  threshold = parseInt(args[thresholdIndex + 1], 10);
}

if (!fs.existsSync(targetPath)) {
  console.error(`Target file/log does not exist: ${targetPath}`);
  process.exit(1);
}

const stats = fs.statSync(targetPath);
const fileSizeChars = stats.size;
const estimatedTokens = Math.ceil(fileSizeChars / 4);

console.log(`[Prompt Sentinel] Evaluating token load for: ${path.basename(targetPath)}`);
console.log(`  - File size: ${fileSizeChars} characters`);
console.log(`  - Estimated token payload: ${estimatedTokens} tokens (Safety threshold: ${threshold})`);
console.log(`  - LeanCTX policy budget: ${policy.token_budget || 12000} tokens`);

if (estimatedTokens > threshold) {
  console.warn(`\n[WARNING] [PROMPT SENTINEL] Payload of ${estimatedTokens} tokens exceeds the safety threshold of ${threshold}!`);
  console.warn(`[WARNING] Risk of context rot, model amnesia, and high API billing costs detected.`);
  console.warn(`[ACTION] Automatically triggering context compaction and log optimization...\n`);

  // Trigger compact-context script if it exists
  const compactionScriptCandidates = [
    path.resolve(process.cwd(), 'scripts/compact-context.sh'),
    path.resolve(__dirname, '..', '.codex', 'skills', 'genesis-harness', 'scripts', 'compact-context.sh')
  ];
  const compactionScript = compactionScriptCandidates.find(candidate => fs.existsSync(candidate));
  if (compactionScript) {
    try {
      console.log(`Executing: ${compactionScript}`);
      const output = execSync(`bash "${compactionScript}"`, { encoding: 'utf8' });
      console.log(output);
      console.log(`[Prompt Sentinel] Context compaction successfully executed. ✓`);
    } catch (err) {
      console.error(`[ERROR] Failed to execute context compaction:`, err.message);
    }
  } else {
    console.warn(`[WARNING] Compaction script not found at ${compactionScript}. Skipping auto-compaction.`);
  }

  // Pre-emptively truncate the bloated log file to keep the window safe
  try {
    const fileContent = fs.readFileSync(targetPath, 'utf8');
    // Keep only the first 500 lines and last 500 lines of the file, strip the rest
    const lines = fileContent.split('\n');
    if (lines.length > 1000) {
      const truncatedContent = [
        ...lines.slice(0, 500),
        `\n... [PROMPT SENTINEL AUTO-TRUNCATION: Stript ${lines.length - 1000} lines of redundant log data to protect token bounds] ...\n`,
        ...lines.slice(-500)
      ].join('\n');
      
      fs.writeFileSync(targetPath, truncatedContent, 'utf8');
      console.log(`[Prompt Sentinel] Bloated file truncated successfully to safeguard token bounds. ✓`);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to truncate target file:`, err.message);
  }
} else {
  console.log(`✓ [Prompt Sentinel] Token payload is within safe boundaries. No action required.`);
}
