/**
 * Unit Test for contract_integrity_gate.js
 * Part of Genesis Codex Harness v0.1.8
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running contract_integrity_gate.js unit tests...');

const TEST_CODE_PATH = path.resolve(__dirname, 'temp_dummy_code.js');
const TEST_CONTRACT_PATH = path.resolve(__dirname, 'temp_dummy_contract.json');

try {
  // Setup dummy contract
  const dummySchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Dummy Contract',
    type: 'object',
    properties: {
      name: { type: 'string' },
      score: { type: 'number' }
    },
    required: ['name', 'score']
  };
  fs.writeFileSync(TEST_CONTRACT_PATH, JSON.stringify(dummySchema, null, 2), 'utf8');

  // Test case 1: Happy path (clean code matching schema keys)
  console.log('  1. Testing matching code content...');
  const cleanCode = `
    const user = {
      name: 'Alice',
      score: 95
    };
  `;
  fs.writeFileSync(TEST_CODE_PATH, cleanCode, 'utf8');

  const stdoutHappy = execSync(`node scripts/contract_integrity_gate.js --code "${TEST_CODE_PATH}" --contract "${TEST_CONTRACT_PATH}"`, { encoding: 'utf8' });
  assert.ok(stdoutHappy.includes('INTEGRITY SUCCESS'), 'Must report integrity success when keys match.');
  console.log('  ✓ Test case 1 passed: Matching keys pass gate successfully.');

  // Test case 2: Failure path (missing a key in the code)
  console.log('  2. Testing missing key code content...');
  const brokenCode = `
    const user = {
      name: 'Bob'
      // score is missing!
    };
  `;
  fs.writeFileSync(TEST_CODE_PATH, brokenCode, 'utf8');

  try {
    execSync(`node scripts/contract_integrity_gate.js --code "${TEST_CODE_PATH}" --contract "${TEST_CONTRACT_PATH}" 2>&1`, { encoding: 'utf8' });
    assert.fail('Should throw an error and return exit code 1 for missing fields.');
  } catch (err) {
    const errorOutput = err.stdout || err.message;
    assert.ok(errorOutput.includes('INTEGRITY FAILURE'), 'Must report integrity failure.');
    assert.ok(errorOutput.includes('Missing property: "score"'), 'Must report exact missing property name.');
    console.log('  ✓ Test case 2 passed: Missing key correctly blocks the gate.');
  }

} finally {
  if (fs.existsSync(TEST_CODE_PATH)) {
    fs.unlinkSync(TEST_CODE_PATH);
  }
  if (fs.existsSync(TEST_CONTRACT_PATH)) {
    fs.unlinkSync(TEST_CONTRACT_PATH);
  }
}

console.log('All contract_integrity_gate.js tests passed! ✓\n');
process.exit(0);
