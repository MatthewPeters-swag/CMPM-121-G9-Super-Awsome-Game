#!/usr/bin/env node

/**
 * DSL Validator Script
 * 
 * Validates physics-config.json against the JSON schema.
 * Can be run manually or integrated into build process.
 * 
 * Usage:
 *   node scripts/validate-dsl.js [path-to-config-file]
 * 
 * Exit codes:
 *   0 - Validation passed
 *   1 - Validation failed
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get config file path from command line or use default
const configPath = process.argv[2] || join(projectRoot, 'public/data/physics-config.json');
const schemaPath = join(projectRoot, 'public/data/schemas/physics-config.schema.json');

/**
 * Validates a number is within a range
 */
function validateRange(value, min, max, exclusiveMin = false, exclusiveMax = false) {
  if (exclusiveMin && value <= min) return false;
  if (exclusiveMax && value >= max) return false;
  if (!exclusiveMin && value < min) return false;
  if (!exclusiveMax && value > max) return false;
  return true;
}

/**
 * Validates player configuration
 */
function validatePlayerConfig(player) {
  const errors = [];

  if (!player || typeof player !== 'object') {
    errors.push('Player configuration must be an object');
    return errors;
  }

  // Check required properties
  const required = ['friction', 'minForce', 'maxForce', 'linearDamping', 'angularDamping'];
  for (const prop of required) {
    if (!(prop in player)) {
      errors.push(`Missing required property: player.${prop}`);
    }
  }

  if (errors.length > 0) return errors;

  // Validate friction (0.0 - 1.0)
  if (typeof player.friction !== 'number' || isNaN(player.friction)) {
    errors.push('player.friction must be a number');
  } else if (!validateRange(player.friction, 0.0, 1.0)) {
    errors.push(`player.friction must be between 0.0 and 1.0 (got ${player.friction})`);
  }

  // Validate minForce (> 0)
  if (typeof player.minForce !== 'number' || isNaN(player.minForce)) {
    errors.push('player.minForce must be a number');
  } else if (player.minForce <= 0) {
    errors.push(`player.minForce must be greater than 0 (got ${player.minForce})`);
  }

  // Validate maxForce (> 0 and >= minForce)
  if (typeof player.maxForce !== 'number' || isNaN(player.maxForce)) {
    errors.push('player.maxForce must be a number');
  } else if (player.maxForce <= 0) {
    errors.push(`player.maxForce must be greater than 0 (got ${player.maxForce})`);
  } else if (player.maxForce < player.minForce) {
    errors.push(
      `player.maxForce (${player.maxForce}) must be >= player.minForce (${player.minForce})`
    );
  }

  // Validate linearDamping (>= 0)
  if (typeof player.linearDamping !== 'number' || isNaN(player.linearDamping)) {
    errors.push('player.linearDamping must be a number');
  } else if (player.linearDamping < 0) {
    errors.push(`player.linearDamping must be >= 0 (got ${player.linearDamping})`);
  }

  // Validate angularDamping (>= 0)
  if (typeof player.angularDamping !== 'number' || isNaN(player.angularDamping)) {
    errors.push('player.angularDamping must be a number');
  } else if (player.angularDamping < 0) {
    errors.push(`player.angularDamping must be >= 0 (got ${player.angularDamping})`);
  }

  return errors;
}

/**
 * Validates block configuration
 */
function validateBlockConfig(block) {
  const errors = [];

  if (!block || typeof block !== 'object') {
    errors.push('Block configuration must be an object');
    return errors;
  }

  // Check required properties
  const required = ['linearDamping', 'angularDamping', 'friction', 'density'];
  for (const prop of required) {
    if (!(prop in block)) {
      errors.push(`Missing required property: block.${prop}`);
    }
  }

  if (errors.length > 0) return errors;

  // Validate linearDamping (>= 0)
  if (typeof block.linearDamping !== 'number' || isNaN(block.linearDamping)) {
    errors.push('block.linearDamping must be a number');
  } else if (block.linearDamping < 0) {
    errors.push(`block.linearDamping must be >= 0 (got ${block.linearDamping})`);
  }

  // Validate angularDamping (>= 0)
  if (typeof block.angularDamping !== 'number' || isNaN(block.angularDamping)) {
    errors.push('block.angularDamping must be a number');
  } else if (block.angularDamping < 0) {
    errors.push(`block.angularDamping must be >= 0 (got ${block.angularDamping})`);
  }

  // Validate friction (0.0 - 1.0)
  if (typeof block.friction !== 'number' || isNaN(block.friction)) {
    errors.push('block.friction must be a number');
  } else if (!validateRange(block.friction, 0.0, 1.0)) {
    errors.push(`block.friction must be between 0.0 and 1.0 (got ${block.friction})`);
  }

  // Validate density (> 0)
  if (typeof block.density !== 'number' || isNaN(block.density)) {
    errors.push('block.density must be a number');
  } else if (block.density <= 0) {
    errors.push(`block.density must be greater than 0 (got ${block.density})`);
  }

  return errors;
}

/**
 * Main validation function
 */
function validateConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object');
    return errors;
  }

  // Check for required top-level properties
  if (!config.player) {
    errors.push('Missing required property: player');
  }
  if (!config.block) {
    errors.push('Missing required property: block');
  }

  // Validate player config
  if (config.player) {
    const playerErrors = validatePlayerConfig(config.player);
    errors.push(...playerErrors);
  }

  // Validate block config
  if (config.block) {
    const blockErrors = validateBlockConfig(config.block);
    errors.push(...blockErrors);
  }

  return errors;
}

/**
 * Main execution
 */
try {
  // Read and parse config file
  console.log(`Validating: ${configPath}`);
  const configContent = readFileSync(configPath, 'utf-8');
  let config;
  try {
    config = JSON.parse(configContent);
  } catch (parseError) {
    console.error('❌ Invalid JSON:', parseError.message);
    process.exit(1);
  }

  // Validate configuration
  const errors = validateConfig(config);

  if (errors.length > 0) {
    console.error('\n❌ Validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error(`\nFound ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log('✅ Validation passed!');
  console.log('\nConfiguration summary:');
  console.log('  Player:', {
    friction: config.player.friction,
    minForce: config.player.minForce,
    maxForce: config.player.maxForce,
    linearDamping: config.player.linearDamping,
    angularDamping: config.player.angularDamping,
  });
  console.log('  Block:', {
    linearDamping: config.block.linearDamping,
    angularDamping: config.block.angularDamping,
    friction: config.block.friction,
    density: config.block.density,
  });
  process.exit(0);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`❌ File not found: ${configPath}`);
    console.error('Please ensure the file exists or provide a path as an argument.');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

