/**
 * Unit Test for test_generator.js
 * Part of Genesis Codex Harness v0.1.8
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running test_generator.js unit tests...');

const TEST_CONTRACT_DIR = path.resolve(__dirname, '../../contracts/api/testendpoint');
const TEST_RESPONSE_PATH = path.join(TEST_CONTRACT_DIR, 'response.json');
const EXPECTED_TEST_PATH = path.resolve(__dirname, '../../tests/integration/testendpoint.test.js');

// Ensure clean directories
fs.mkdirSync(TEST_CONTRACT_DIR, { recursive: true });

try {
  // Setup mock contract
  const mockSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Test Endpoint response schema',
    type: 'object',
    properties: {
      name: { type: 'string' },
      score: { type: 'number' }
    },
    required: ['name']
  };

  fs.writeFileSync(TEST_RESPONSE_PATH, JSON.stringify(mockSchema, null, 2), 'utf8');

  console.log('  1. Running test_generator.js testendpoint...');
  execSync('node scripts/test_generator.js testendpoint');

  assert.ok(fs.existsSync(EXPECTED_TEST_PATH), 'Integration test file must be generated.');

  const generatedCode = fs.readFileSync(EXPECTED_TEST_PATH, 'utf8');
  assert.ok(generatedCode.includes('TDD Contract Compliance Test Suite'), 'Test suite must contain header statement.');
  assert.ok(generatedCode.includes("data.name, 'string'"), 'Test code must assert property name is string.');
  assert.ok(generatedCode.includes("data.score, 'number'"), 'Test code must assert property score is number.');
  assert.ok(generatedCode.includes('["name"]'), 'Test code must assert required fields list matches contract.');

  console.log('  ✓ Test case passed: Integration test template compilation is 100% correct.');

} finally {
  // Cleanup
  if (fs.existsSync(TEST_RESPONSE_PATH)) {
    fs.unlinkSync(TEST_RESPONSE_PATH);
  }
  if (fs.existsSync(TEST_CONTRACT_DIR)) {
    fs.rmdirSync(TEST_CONTRACT_DIR);
  }
  if (fs.existsSync(EXPECTED_TEST_PATH)) {
    fs.unlinkSync(EXPECTED_TEST_PATH);
  }
}

console.log('All test_generator.js tests passed! ✓\n');
process.exit(0);
