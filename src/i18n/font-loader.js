/**
 * Font loading utilities for i18n support
 * Handles font loading for different languages, especially Chinese characters
 */

import * as THREE from 'three';

// Font cache
const fontCache = new Map();

/**
 * Gets appropriate font path based on language
 * @param {string} lang - Language code (en, zh, ar)
 * @returns {string} Font path
 */
function getFontPath(lang) {
  // Default font (Helvetiker) works for English and Arabic
  // For Chinese, we'll use the same font but ensure proper rendering
  // Note: Three.js TextGeometry requires typeface.json format fonts
  // Most typeface fonts don't support Chinese, so we'll use the default
  // and rely on browser fallback rendering if needed
  return 'fonts/helvetiker_regular.typeface.json';
}

/**
 * Loads a font for Three.js TextGeometry
 * @param {string} lang - Language code
 * @returns {Promise<THREE.Font>} Loaded font
 */
export function loadFont(lang = 'en') {
  // Check cache first
  if (fontCache.has(lang)) {
    return Promise.resolve(fontCache.get(lang));
  }

  return new Promise((resolve, reject) => {
    const fontPath = getFontPath(lang);
    const loader = new THREE.FontLoader();

    loader.load(
      fontPath,
      font => {
        fontCache.set(lang, font);
        resolve(font);
      },
      undefined,
      error => {
        console.warn(`Failed to load font for ${lang}, using default`, error);
        // Try to load default font as fallback
        if (lang !== 'en') {
          loadFont('en').then(resolve).catch(reject);
        } else {
          reject(error);
        }
      }
    );
  });
}

/**
 * Checks if a font supports Chinese characters
 * Note: Most Three.js typeface fonts don't support Chinese characters
 * This is a limitation of the typeface.json format
 * @param {THREE.Font} font - Font to check
 * @returns {boolean} True if font supports Chinese (usually false for typeface fonts)
 */
export function fontSupportsChinese(font) {
  // Typeface fonts typically don't support Chinese characters
  // We'll return false and handle Chinese rendering differently if needed
  return false;
}

/**
 * Creates text geometry with language-aware font loading
 * @param {string} text - Text to render
 * @param {string} lang - Language code
 * @param {Object} options - TextGeometry options
 * @returns {Promise<THREE.TextGeometry>} Text geometry
 */
export async function createTextGeometry(text, lang = 'en', options = {}) {
  const font = await loadFont(lang);

  const defaultOptions = {
    font: font,
    size: options.size || 1,
    height: options.height || 0.2,
    curveSegments: options.curveSegments || 12,
    bevelEnabled: options.bevelEnabled !== undefined ? options.bevelEnabled : false,
  };

  // For Chinese characters, Three.js TextGeometry may not render properly
  // We'll create the geometry and let Three.js handle it
  // If characters are missing, they may appear as boxes or not render
  // This is a known limitation of typeface fonts with non-Latin scripts
  const geometry = new THREE.TextGeometry(text, defaultOptions);

  return geometry;
}

/**
 * Gets CSS font family for HTML elements based on language
 * @param {string} lang - Language code
 * @returns {string} CSS font-family value
 */
export function getCSSFontFamily(lang) {
  const fonts = {
    en: 'sans-serif, Arial, Helvetica',
    zh: '"Noto Sans SC", "Microsoft YaHei", "SimHei", "SimSun", sans-serif',
    ar: '"Noto Sans Arabic", "Arial Unicode MS", sans-serif',
  };

  return fonts[lang] || fonts.en;
}
