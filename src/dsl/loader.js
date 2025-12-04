/**
 * DSL Loader Module
 *
 * Handles loading and parsing of DSL (Domain-Specific Language) configuration files.
 * Provides functions to load JSON DSL files and validate their structure.
 */

/**
 * Default physics configuration values
 * Used as fallback when DSL file is missing or invalid
 */
const DEFAULT_CONFIG = {
  player: {
    friction: 0.75,
    minForce: 1.0,
    maxForce: 3.0,
    linearDamping: 0.3,
    angularDamping: 0.8,
  },
  block: {
    linearDamping: 0.2,
    angularDamping: 0.3,
    friction: 0.3,
    density: 0.5,
  },
};

/**
 * Validates a player configuration object
 * @param {Object} playerConfig - Player configuration to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePlayerConfig(playerConfig) {
  if (!playerConfig || typeof playerConfig !== 'object') {
    return false;
  }

  const requiredProps = ['friction', 'minForce', 'maxForce', 'linearDamping', 'angularDamping'];
  for (const prop of requiredProps) {
    if (typeof playerConfig[prop] !== 'number' || isNaN(playerConfig[prop])) {
      return false;
    }
  }

  // Validate ranges
  if (playerConfig.friction < 0 || playerConfig.friction > 1) return false;
  if (playerConfig.minForce <= 0) return false;
  if (playerConfig.maxForce <= 0 || playerConfig.maxForce < playerConfig.minForce) return false;
  if (playerConfig.linearDamping < 0) return false;
  if (playerConfig.angularDamping < 0) return false;

  return true;
}

/**
 * Validates a block configuration object
 * @param {Object} blockConfig - Block configuration to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateBlockConfig(blockConfig) {
  if (!blockConfig || typeof blockConfig !== 'object') {
    return false;
  }

  const requiredProps = ['linearDamping', 'angularDamping', 'friction', 'density'];
  for (const prop of requiredProps) {
    if (typeof blockConfig[prop] !== 'number' || isNaN(blockConfig[prop])) {
      return false;
    }
  }

  // Validate ranges
  if (blockConfig.linearDamping < 0) return false;
  if (blockConfig.angularDamping < 0) return false;
  if (blockConfig.friction < 0 || blockConfig.friction > 1) return false;
  if (blockConfig.density <= 0) return false;

  return true;
}

/**
 * Validates the complete physics configuration object
 * @param {Object} config - Complete configuration object
 * @returns {boolean} True if valid, false otherwise
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return validatePlayerConfig(config.player) && validateBlockConfig(config.block);
}

/**
 * Loads and parses the physics configuration DSL file
 * Uses dynamic import for JSON files (Vite handles this at build time)
 * @param {string} filePath - Path to the JSON DSL file (relative to this module)
 * @returns {Promise<Object>} Parsed configuration object, or default config on error
 */
export async function loadPhysicsConfig(filePath = '../../data/physics-config.json') {
  try {
    // Dynamic import of JSON file (Vite handles JSON imports at build time)
    // The path is relative to this file's location
    const configModule = await import(filePath);
    const config = configModule.default || configModule;

    // Validate the loaded configuration
    if (validateConfig(config)) {
      return config;
    } else {
      console.warn('[DSL Loader] Invalid configuration schema, using defaults');
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.warn(`[DSL Loader] Failed to load physics config from ${filePath}:`, error);
    console.warn('[DSL Loader] Using default configuration');
    return DEFAULT_CONFIG;
  }
}

/**
 * Gets player configuration with validation and defaults
 * @param {Object} config - Complete configuration object
 * @returns {Object} Player configuration object
 */
export function getPlayerConfig(config) {
  if (validatePlayerConfig(config?.player)) {
    return config.player;
  }
  return DEFAULT_CONFIG.player;
}

/**
 * Gets block configuration with validation and defaults
 * @param {Object} config - Complete configuration object
 * @returns {Object} Block configuration object
 */
export function getBlockConfig(config) {
  if (validateBlockConfig(config?.block)) {
    return config.block;
  }
  return DEFAULT_CONFIG.block;
}

/**
 * Exports default configuration for use as fallback
 */
export { DEFAULT_CONFIG };
