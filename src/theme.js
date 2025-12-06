/**
 * Theme management for light and dark modes
 * Responds to system preferences via prefers-color-scheme media query
 */

import * as THREE from 'three';

/**
 * Theme configuration with colors for light and dark modes
 */
const themeConfig = {
  light: {
    // UI backgrounds and borders
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColorTransparent: 'rgba(255, 255, 255, 0.6)',
    textColor: '#000000',
    borderColor: '#cccccc',
    borderColorBright: '#666666',
    buttonBg: 'rgba(230, 230, 230, 0.95)',
    buttonBgHover: 'rgba(200, 200, 200, 0.95)',
    buttonBorder: 'rgba(0, 0, 0, 0.3)',
    buttonBorderHover: 'rgba(0, 0, 0, 0.5)',
    inventoryBg: 'rgba(255, 255, 255, 0.8)',
    inventoryBorder: '#000000',
    slotBg: 'rgba(200, 200, 200, 0.5)',
    messageBg: 'rgba(240, 240, 240, 0.95)',
    messageBorder: 'rgba(0, 0, 0, 0.2)',
    // Canvas text colors
    winTextColor: '#00aa00',
    winTextStroke: '#003300',
    loseTextColor: '#ff3333',
    loseTextStroke: '#330000',
    moveCountTextColor: '#333333',
    moveCountTextStroke: '#cccccc',
    // 3D game object colors (day/light mode)
    platformColor: 0x88ccff,
    blockColor: 0xffaa44,
    goalColor: 0x44dd44,
    teleporterColor: 0xff6699,
    ambientLightColor: 0xffffff,
    ambientLightIntensity: 0.8,
    directionalLightColor: 0xffffff,
    directionalLightIntensity: 0.7,
    sceneBackgroundColor: 0xccddff,
  },
  dark: {
    // UI backgrounds and borders
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backgroundColorTransparent: 'rgba(40, 40, 40, 0.8)',
    textColor: '#e0e0e0',
    borderColor: '#555555',
    borderColorBright: '#aaaaaa',
    buttonBg: 'rgba(50, 50, 50, 0.95)',
    buttonBgHover: 'rgba(70, 70, 70, 0.95)',
    buttonBorder: 'rgba(255, 255, 255, 0.3)',
    buttonBorderHover: 'rgba(255, 255, 255, 0.6)',
    inventoryBg: 'rgba(40, 40, 40, 0.9)',
    inventoryBorder: '#999999',
    slotBg: 'rgba(80, 80, 80, 0.6)',
    messageBg: 'rgba(50, 50, 50, 0.95)',
    messageBorder: 'rgba(255, 255, 255, 0.2)',
    // Canvas text colors (adjusted for dark mode visibility)
    winTextColor: '#00ff00',
    winTextStroke: '#004400',
    loseTextColor: '#ff4444',
    loseTextStroke: '#330000',
    moveCountTextColor: '#cccccc',
    moveCountTextStroke: '#333333',
    // 3D game object colors (night/dark mode)
    platformColor: 0x1a3a4a,
    blockColor: 0x4a3a1a,
    goalColor: 0x1a4a1a,
    teleporterColor: 0x4a1a3a,
    ambientLightColor: 0x4a6a7a,
    ambientLightIntensity: 0.5,
    directionalLightColor: 0x8899bb,
    directionalLightIntensity: 0.4,
    sceneBackgroundColor: 0x0a1a2a,
  },
};

/**
 * Current theme state
 */
let currentTheme = 'light';
let prefersDark = false;

/**
 * Initialize theme system
 * Detects system preference and sets up media query listener
 */
export function initTheme() {
  // Detect system preference
  prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  currentTheme = prefersDark ? 'dark' : 'light';

  // Apply initial theme
  applyTheme(currentTheme);

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

/**
 * Get the current theme
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getTheme() {
  return currentTheme;
}

/**
 * Set a specific theme and apply it
 * @param {string} theme - The theme to set ('light' or 'dark')
 */
export function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') {
    console.warn(`Invalid theme: ${theme}. Using 'light'.`);
    theme = 'light';
  }
  currentTheme = theme;
  applyTheme(theme);

  // Dispatch event so other modules can react to theme changes
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

/**
 * Apply theme by updating CSS variables
 * @param {string} theme - The theme to apply
 */
function applyTheme(theme) {
  const colors = themeConfig[theme];
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });

  // Update document data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Get color value for current theme
 * @param {string} colorKey - The color key (e.g., 'backgroundColor', 'textColor')
 * @returns {string} The color value
 */
export function getThemeColor(colorKey) {
  return themeConfig[currentTheme][colorKey] || '#000000';
}

/**
 * Get all colors for current theme
 * @returns {Object} The theme colors object
 */
export function getThemeColors() {
  return { ...themeConfig[currentTheme] };
}

/**
 * Apply theme to 3D scene (lighting, backgrounds, object colors)
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object} lights - Object containing scene lights { ambient, directional }
 */
export function applySceneTheme(scene, lights) {
  if (!scene || !lights) return;

  const colors = themeConfig[currentTheme];

  // Update scene background
  if (scene.background) {
    scene.background.setHex(colors.sceneBackgroundColor);
  } else {
    scene.background = new THREE.Color(colors.sceneBackgroundColor);
  }

  // Update ambient light
  if (lights.ambient) {
    lights.ambient.color.setHex(colors.ambientLightColor);
    lights.ambient.intensity = colors.ambientLightIntensity;
  }

  // Update directional light
  if (lights.directional) {
    lights.directional.color.setHex(colors.directionalLightColor);
    lights.directional.intensity = colors.directionalLightIntensity;
  }
}

/**
 * Get 3D object colors for current theme
 * @returns {Object} Object colors { platform, block, goal, teleporter }
 */
export function getGameObjectColors() {
  const colors = themeConfig[currentTheme];
  return {
    platformColor: colors.platformColor,
    blockColor: colors.blockColor,
    goalColor: colors.goalColor,
    teleporterColor: colors.teleporterColor,
  };
}
