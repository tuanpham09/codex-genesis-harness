#!/usr/bin/env node

/**
 * Spec Visual Sync - Bi-directional AST Sync between Mermaid ERD and JSON Contracts
 * Part of Genesis Codex Harness v0.1.7
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/spec_visual_sync.js --from-erd    # Sync ERD diagram to API contracts');
  console.log('  node scripts/spec_visual_sync.js --to-erd      # Sync API contracts to ERD diagram');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length !== 1 || (args[0] !== '--from-erd' && args[0] !== '--to-erd')) {
  printUsage();
}

const ERD_PATH = path.resolve(process.cwd(), '.planning/diagrams/database-erd.mmd');
const CONTRACTS_DIR = path.resolve(process.cwd(), 'contracts/api');

// 1. Sync from ERD to API Contracts
function syncFromErd() {
  if (!fs.existsSync(ERD_PATH)) {
    console.error(`ERD file not found at: ${ERD_PATH}`);
    process.exit(1);
  }

  const erdContent = fs.readFileSync(ERD_PATH, 'utf8');
  console.log(`Parsing Mermaid ERD from: ${ERD_PATH}`);

  // Regular expression to parse erDiagram blocks
  // e.g. ENTITY { type name }
  const entityRegex = /(\w+)\s*\{\s*([^}]+)\}/g;
  let match;
  let parsedEntities = 0;

  while ((match = entityRegex.exec(erdContent)) !== null) {
    const entityName = match[1].toLowerCase();
    const fieldsBlock = match[2];

    const properties = {};
    const required = [];

    // Parse individual fields
    const fieldLines = fieldsBlock.split('\n');
    for (let line of fieldLines) {
      line = line.trim();
      if (!line || line.startsWith('%%')) continue; // Skip comments/empty

      // Format: <type> <name> "comment" or <type> <name>
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const type = parts[0].toLowerCase();
        const name = parts[1].replace(/["']/g, ''); // strip quotes

        let schemaType = 'string';
        if (type.includes('int') || type.includes('number') || type.includes('float')) {
          schemaType = 'number';
        } else if (type.includes('bool')) {
          schemaType = 'boolean';
        } else if (type.includes('array') || type.includes('list')) {
          schemaType = 'array';
        } else if (type.includes('object')) {
          schemaType = 'object';
        }

        properties[name] = { type: schemaType };
        // For simplicity, let's treat id or key fields as required
        if (name === 'id' || line.includes('PK') || line.includes('FK')) {
          required.push(name);
        }
      }
    }

    // Build the JSON schema for response.json
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} Contract`,
      type: 'object',
      properties: properties,
      required: required.length > 0 ? required : undefined
    };

    // Ensure directory exists
    const entityDir = path.join(CONTRACTS_DIR, entityName);
    fs.mkdirSync(entityDir, { recursive: true });

    const contractPath = path.join(entityDir, 'response.json');
    fs.writeFileSync(contractPath, JSON.stringify(schema, null, 2), 'utf8');
    console.log(`✓ Synchronized contract schema for: ${entityName} -> ${contractPath}`);
    parsedEntities++;
  }

  console.log(`Success: Synchronized ${parsedEntities} entities from ERD to Contracts.`);
}

// 2. Sync from API Contracts to ERD Diagram
function syncToErd() {
  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.error(`Contracts directory not found: ${CONTRACTS_DIR}`);
    process.exit(1);
  }

  console.log(`Scanning API contracts under: ${CONTRACTS_DIR}`);
  const entities = fs.readdirSync(CONTRACTS_DIR);
  
  let erdContent = 'erDiagram\n\n';
  let hasContent = false;

  for (const entity of entities) {
    const responsePath = path.join(CONTRACTS_DIR, entity, 'response.json');
    if (!fs.existsSync(responsePath)) continue;

    try {
      const schema = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
      const properties = schema.properties || {};
      
      const entityUpper = entity.toUpperCase();
      erdContent += `  ${entityUpper} {\n`;

      for (const [fieldName, fieldMeta] of Object.entries(properties)) {
        let fieldType = fieldMeta.type || 'string';
        if (fieldType === 'number') fieldType = 'int';
        if (fieldType === 'boolean') fieldType = 'bool';
        
        erdContent += `    ${fieldType} ${fieldName}\n`;
      }

      erdContent += `  }\n\n`;
      hasContent = true;
    } catch (err) {
      console.error(`Error parsing contract for ${entity}:`, err.message);
    }
  }

  if (!hasContent) {
    console.log('No valid response.json contracts found to synchronize.');
    return;
  }

  // Ensure diagram directory exists
  fs.mkdirSync(path.dirname(ERD_PATH), { recursive: true });
  fs.writeFileSync(ERD_PATH, erdContent.trim() + '\n', 'utf8');
  console.log(`✓ Successfully compiled and synchronized database-erd.mmd: ${ERD_PATH}`);
}

// Execute core flow
if (args[0] === '--from-erd') {
  syncFromErd();
} else {
  syncToErd();
}
