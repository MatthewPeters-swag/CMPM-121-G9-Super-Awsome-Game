/**
 * Language selector UI component
 * Creates a dropdown menu for language selection
 */

import { setLanguage, SUPPORTED_LANGUAGES, getCurrentLanguage } from './translations.js';

/**
 * Creates and returns a language selector dropdown element
 * @returns {HTMLElement} Language selector dropdown element
 */
export function createLanguageSelector() {
  const container = document.createElement('div');
  const isRTL = getCurrentLanguage() === 'ar';

  Object.assign(container.style, {
    position: 'absolute',
    top: '10px',
    [isRTL ? 'left' : 'right']: '10px',
    zIndex: '2000',
    fontFamily: 'sans-serif',
    direction: isRTL ? 'rtl' : 'ltr',
  });

  const label = document.createElement('label');
  label.textContent = 'Language: ';
  label.style.color = 'white';
  label.style.marginRight = '8px';
  label.style.fontSize = '14px';
  container.appendChild(label);

  const select = document.createElement('select');
  Object.assign(select.style, {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    outline: 'none',
  });

  // Add hover effect
  select.addEventListener('mouseenter', () => {
    select.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    select.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  });
  select.addEventListener('mouseleave', () => {
    select.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    select.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  });

  // Populate dropdown with supported languages
  for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    select.appendChild(option);
  }

  // Set current language
  select.value = getCurrentLanguage();

  // Handle language change
  select.addEventListener('change', async e => {
    const newLang = e.target.value;
    await setLanguage(newLang);

    // Update page direction for RTL languages
    updatePageDirection(newLang);

    // Update container positioning for RTL
    const isRTL = newLang === 'ar';
    container.style.right = isRTL ? 'auto' : '10px';
    container.style.left = isRTL ? '10px' : 'auto';
    container.style.direction = isRTL ? 'rtl' : 'ltr';

    // Trigger custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
  });

  container.appendChild(select);
  return container;
}

/**
 * Updates the page direction based on language
 * @param {string} lang - Language code
 */
function updatePageDirection(lang) {
  const html = document.documentElement;
  if (lang === 'ar') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', lang);
  }
}

/**
 * Initializes the language selector and sets up initial language
 * @param {string} preferredLang - Preferred language (from localStorage or browser)
 */
export function initLanguageSelector(preferredLang = null) {
  // Update page direction based on initial language
  const initialLang = preferredLang || getCurrentLanguage();
  updatePageDirection(initialLang);

  // Create and append language selector
  const selector = createLanguageSelector();
  document.body.appendChild(selector);

  return selector;
}
