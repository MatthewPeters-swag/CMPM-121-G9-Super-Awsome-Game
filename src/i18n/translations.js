/**
 * Internationalization (i18n) translation module
 * Manages translations and provides a translation function
 */

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  zh: '中文',
  ar: 'العربية',
};

// Default language (fallback)
const DEFAULT_LANGUAGE = 'en';

// Current language (will be set by init or setLanguage)
let currentLanguage = DEFAULT_LANGUAGE;

// Translation cache
let translations = {};
// English translations cache for fallback
let englishTranslations = {};

/**
 * Loads translations for a given language
 * @param {string} lang - Language code (en, zh, ar)
 * @returns {Promise<Object>} Translation object
 */
async function loadTranslations(lang) {
  try {
    const module = await import(`./locales/${lang}.json`);
    return module.default || module;
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, falling back to English`, error);
    // Fallback to English if language file doesn't exist
    if (lang !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE);
    }
    return {};
  }
}

/**
 * Initializes the translation system
 * @param {string} lang - Initial language code (defaults to localStorage preference, then browser language, then 'en')
 * @returns {Promise<void>}
 */
export async function initTranslations(lang = null) {
  // Check localStorage first, then browser language if not provided
  if (!lang) {
    // Try to load saved preference from localStorage
    const savedLang = loadPreferredLanguage();
    if (savedLang) {
      lang = savedLang;
    } else {
      // Detect browser language if no saved preference
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      // Extract base language code (e.g., 'en-US' -> 'en')
      lang = browserLang.split('-')[0].toLowerCase();

      // Map browser language to supported language
      if (!SUPPORTED_LANGUAGES[lang]) {
        lang = DEFAULT_LANGUAGE;
      }
    }
  }

  // Validate language
  if (!SUPPORTED_LANGUAGES[lang]) {
    console.warn(`Unsupported language: ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
    lang = DEFAULT_LANGUAGE;
  }

  currentLanguage = lang;
  translations = await loadTranslations(lang);

  // Always load English translations as fallback
  if (lang !== DEFAULT_LANGUAGE) {
    englishTranslations = await loadTranslations(DEFAULT_LANGUAGE);
  } else {
    englishTranslations = translations;
  }
}

/**
 * Sets the current language and loads translations
 * @param {string} lang - Language code (en, zh, ar)
 * @returns {Promise<void>}
 */
export async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES[lang]) {
    console.warn(`Unsupported language: ${lang}`);
    return;
  }

  currentLanguage = lang;
  translations = await loadTranslations(lang);

  // Always load English translations as fallback
  if (lang !== DEFAULT_LANGUAGE) {
    englishTranslations = await loadTranslations(DEFAULT_LANGUAGE);
  } else {
    englishTranslations = translations;
  }

  // Store preference in localStorage
  try {
    localStorage.setItem('preferredLanguage', lang);
  } catch (_e) {
    // localStorage may not be available
  }
}

/**
 * Gets the current language code
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Helper function to get translation value from a translations object
 * @param {Object} trans - Translations object
 * @param {string} key - Translation key
 * @returns {string|null} Translation value or null if not found
 */
function getTranslationValue(trans, key) {
  const keys = key.split('.');
  let value = trans;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }

  return typeof value === 'string' ? value : null;
}

/**
 * Translation function
 * @param {string} key - Translation key (e.g., 'scene.loaded', 'game.win')
 * @param {Object} params - Optional parameters for string interpolation (e.g., { sceneNumber: 1 })
 * @returns {string} Translated string
 */
export function t(key, params = {}) {
  // Try to get translation from current language
  let value = getTranslationValue(translations, key);

  // Fallback to English if translation missing
  if (
    !value &&
    currentLanguage !== DEFAULT_LANGUAGE &&
    Object.keys(englishTranslations).length > 0
  ) {
    value = getTranslationValue(englishTranslations, key);
    if (value) {
      console.warn(
        `Translation missing for key: ${key} in language: ${currentLanguage}, using English fallback`
      );
    }
  }

  // If still no value, return the key
  if (!value) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }

  // Replace placeholders (e.g., {{sceneNumber}})
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    const placeholder = `{{${paramKey}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(paramValue));
  }

  return result;
}

/**
 * Loads preferred language from localStorage on initialization
 */
export function loadPreferredLanguage() {
  try {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && SUPPORTED_LANGUAGES[saved]) {
      return saved;
    }
  } catch (_e) {
    // localStorage may not be available
  }
  return null;
}
