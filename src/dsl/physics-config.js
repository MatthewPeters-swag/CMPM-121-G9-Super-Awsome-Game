/**
 * Physics Configuration Module
 *
 * Provides convenient access to physics configuration loaded from DSL files.
 * Handles loading, caching, and provides default values if DSL file is missing or invalid.
 */

import {
  loadPhysicsConfig,
  getPlayerConfig as getPlayerConfigFromLoader,
  getBlockConfig as getBlockConfigFromLoader,
} from './loader.js';

// Cache for loaded configuration
let cachedConfig = null;
let configLoadPromise = null;

/**
 * Loads physics configuration from DSL file (cached after first load)
 * @returns {Promise<Object>} Complete physics configuration object
 */
async function loadConfig() {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig;
  }

  // If a load is already in progress, return that promise
  if (configLoadPromise) {
    return configLoadPromise;
  }

  // Start loading configuration
  configLoadPromise = loadPhysicsConfig('/data/physics-config.json')
    .then(config => {
      cachedConfig = config;
      configLoadPromise = null;
      return config;
    })
    .catch(error => {
      configLoadPromise = null;
      console.error('[Physics Config] Failed to load configuration:', error);
      // Return default config on error
      return loadPhysicsConfig();
    });

  return configLoadPromise;
}

/**
 * Gets player physics configuration
 * @returns {Promise<Object>} Player configuration object with properties:
 *   - friction: number
 *   - minForce: number
 *   - maxForce: number
 *   - linearDamping: number
 *   - angularDamping: number
 */
export async function getPlayerConfig() {
  const config = await loadConfig();
  return getPlayerConfigFromLoader(config);
}

/**
 * Gets block physics configuration
 * @returns {Promise<Object>} Block configuration object with properties:
 *   - linearDamping: number
 *   - angularDamping: number
 *   - friction: number
 *   - density: number
 */
export async function getBlockConfig() {
  const config = await loadConfig();
  return getBlockConfigFromLoader(config);
}

/**
 * Preloads the physics configuration (useful for eager loading)
 * @returns {Promise<Object>} Complete physics configuration object
 */
export async function preloadConfig() {
  return loadConfig();
}
