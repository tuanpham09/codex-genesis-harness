/**
 * Unit Test for prompt_sentinel.js
 * Part of Genesis Codex Harness v0.1.8
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running prompt_sentinel.js unit tests...');

const TEST_FILE_PATH = path.resolve(__dirname, 'prompt_sentinel_bloated_temp.log');

try {
  // Test case 1: In bounds threshold
  console.log('  1. Testing in-bounds file check...');
  fs.writeFileSync(TEST_FILE_PATH, 'Short log lines for in-bounds testing.\n'.repeat(10), 'utf8');
  
  const stdoutSafe = execSync(`node scripts/prompt_sentinel.js --check "${TEST_FILE_PATH}" --threshold 100`, { encoding: 'utf8' });
  assert.ok(stdoutSafe.includes('Token payload is within safe boundaries'), 'Must report safe bounds.');
  
  const lineCountSafe = fs.readFileSync(TEST_FILE_PATH, 'utf8').trim().split('\n').length;
  assert.strictEqual(lineCountSafe, 10, 'File must not be truncated when in bounds.');
  console.log('  ✓ Test case 1 passed: Safe boundaries are respected without changes.');

  // Test case 2: Out of bounds threshold (triggers truncation)
  console.log('  2. Testing out-of-bounds file check and truncation...');
  fs.writeFileSync(TEST_FILE_PATH, 'Redundant bloated log data line entry.\n'.repeat(1200), 'utf8');

  // Run with threshold of 100 tokens (will exceed, trigger truncation)
  const stdoutExcessive = execSync(`node scripts/prompt_sentinel.js --check "${TEST_FILE_PATH}" --threshold 100 2>&1`, { encoding: 'utf8' });
  assert.ok(stdoutExcessive.includes('exceeds the safety threshold'), 'Must log threshold exceeded warning.');
  assert.ok(stdoutExcessive.includes('truncated successfully'), 'Must log truncation success message.');

  const truncatedContent = fs.readFileSync(TEST_FILE_PATH, 'utf8');
  const truncatedLines = truncatedContent.split('\n');
  assert.ok(truncatedLines.length <= 1005, 'File must be truncated to standard boundaries (approx. 1000 lines).');
  assert.ok(truncatedContent.includes('PROMPT SENTINEL AUTO-TRUNCATION'), 'Must contain sentinel truncation statement.');

  console.log('  ✓ Test case 2 passed: Out-of-bounds trigger successfully auto-truncates data.');

} finally {
  if (fs.existsSync(TEST_FILE_PATH)) {
    fs.unlinkSync(TEST_FILE_PATH);
  }
}

console.log('All prompt_sentinel.js tests passed! ✓\n');
process.exit(0);
