/**
 * Unit Test for spec_visual_sync.js
 * Part of Genesis Codex Harness v0.1.7
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running spec_visual_sync.js unit tests...');

const TEST_PLANNING_DIR = path.resolve(__dirname, '../../.planning/diagrams');
const TEST_ERD_PATH = path.join(TEST_PLANNING_DIR, 'database-erd.mmd');
const TEST_CONTRACTS_DIR = path.resolve(__dirname, '../../contracts/api/testentity');
const TEST_CONTRACT_PATH = path.join(TEST_CONTRACTS_DIR, 'response.json');

// Backup existing if any
let originalErd = null;
if (fs.existsSync(TEST_ERD_PATH)) {
  originalErd = fs.readFileSync(TEST_ERD_PATH, 'utf8');
}

// Ensure clean directories
fs.mkdirSync(TEST_PLANNING_DIR, { recursive: true });
fs.mkdirSync(TEST_CONTRACTS_DIR, { recursive: true });

try {
  // Test case 1: Parse ERD to Contract JSON
  const dummyErd = `erDiagram
  TESTENTITY {
    string name
    int id
    bool active
  }
`;
  fs.writeFileSync(TEST_ERD_PATH, dummyErd, 'utf8');

  console.log('  1. Running spec_visual_sync.js --from-erd...');
  execSync('node scripts/spec_visual_sync.js --from-erd');

  assert.ok(fs.existsSync(TEST_CONTRACT_PATH), 'Contract file response.json must be created.');
  const contract = JSON.parse(fs.readFileSync(TEST_CONTRACT_PATH, 'utf8'));

  assert.strictEqual(contract.title, 'Testentity Contract');
  assert.strictEqual(contract.properties.name.type, 'string');
  assert.strictEqual(contract.properties.id.type, 'number');
  assert.strictEqual(contract.properties.active.type, 'boolean');
  console.log('  ✓ Test case 1 passed: ERD to Contract parsing is 100% correct.');

  // Test case 2: Generate ERD from Contract
  console.log('  2. Running spec_visual_sync.js --to-erd...');
  execSync('node scripts/spec_visual_sync.js --to-erd');

  const compiledErd = fs.readFileSync(TEST_ERD_PATH, 'utf8');
  assert.ok(compiledErd.includes('TESTENTITY'), 'Erd must contain entity TESTENTITY.');
  assert.ok(compiledErd.includes('int id'), 'Erd must contain attribute int id.');
  assert.ok(compiledErd.includes('bool active'), 'Erd must contain attribute bool active.');
  console.log('  ✓ Test case 2 passed: Contract to ERD generation is 100% correct.');

} finally {
  // Cleanup test structures
  if (fs.existsSync(TEST_CONTRACT_PATH)) {
    fs.unlinkSync(TEST_CONTRACT_PATH);
  }
  if (fs.existsSync(TEST_CONTRACTS_DIR)) {
    fs.rmdirSync(TEST_CONTRACTS_DIR);
  }
  if (originalErd !== null) {
    fs.writeFileSync(TEST_ERD_PATH, originalErd, 'utf8');
  } else if (fs.existsSync(TEST_ERD_PATH)) {
    fs.unlinkSync(TEST_ERD_PATH);
  }
}

console.log('All spec_visual_sync.js tests passed! ✓\n');
process.exit(0);
