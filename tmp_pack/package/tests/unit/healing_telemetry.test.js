/**
 * Unit Test for healing_telemetry.js
 * Part of Genesis Codex Harness v0.1.8
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running healing_telemetry.js unit tests...');

const TEST_LESSONS_PATH = path.resolve(__dirname, '../../.codebase/failures/lessons_learned.md');

// Backup existing if any
let originalLessons = null;
if (fs.existsSync(TEST_LESSONS_PATH)) {
  originalLessons = fs.readFileSync(TEST_LESSONS_PATH, 'utf8');
} else {
  // Ensure directory exists
  fs.mkdirSync(path.dirname(TEST_LESSONS_PATH), { recursive: true });
}

try {
  // Clean start
  if (fs.existsSync(TEST_LESSONS_PATH)) {
    fs.unlinkSync(TEST_LESSONS_PATH);
  }

  // Test case 1: Record a successful self-healing fix signature
  console.log('  1. Testing record signature...');
  execSync('node scripts/healing_telemetry.js --record --error "SyntaxError: Unexpected token" --file "src/routes.js" --fix "Add missing closing brace to route handler"', { encoding: 'utf8' });

  assert.ok(fs.existsSync(TEST_LESSONS_PATH), 'Lessons database file must be created.');
  const dbContent = fs.readFileSync(TEST_LESSONS_PATH, 'utf8');
  assert.ok(dbContent.includes('SyntaxError: Unexpected token'), 'Must contain matching error signature.');
  assert.ok(dbContent.includes('Add missing closing brace'), 'Must contain matching fix payload.');
  console.log('  ✓ Test case 1 passed: Lessons correctly recorded in markdown database.');

  // Test case 2: Recall / retrieve matching fix signature
  console.log('  2. Testing recall search query matching...');
  const stdoutRecall = execSync('node scripts/healing_telemetry.js --recall --error "SyntaxError: Unexpected token at src/routes.js:25"', { encoding: 'utf8' });
  
  assert.ok(stdoutRecall.includes('RECALL MATCH FOUND'), 'Must report matching signature is found.');
  assert.ok(stdoutRecall.includes('SUGGESTED_FIX_START: Add missing closing brace to route handler'), 'Must output matching corrective snippet.');
  console.log('  ✓ Test case 2 passed: Match recall and fix parsing is 100% correct.');

} finally {
  // Cleanup test structures
  if (originalLessons !== null) {
    fs.writeFileSync(TEST_LESSONS_PATH, originalLessons, 'utf8');
  } else if (fs.existsSync(TEST_LESSONS_PATH)) {
    fs.unlinkSync(TEST_LESSONS_PATH);
  }
}

console.log('All healing_telemetry.js tests passed! ✓\n');
process.exit(0);
