/**
 * RTL (Right-to-Left) layout utilities
 * Provides helper functions for RTL-aware positioning and styling
 */

/**
 * Checks if the current language is RTL
 * @returns {boolean} True if current language is RTL (Arabic)
 */
export function isRTL() {
  return document.documentElement.getAttribute('dir') === 'rtl';
}

/**
 * Gets the appropriate horizontal position property based on RTL
 * @param {string} ltrValue - Value for left-to-right (e.g., 'left', '10px')
 * @param {string} rtlValue - Value for right-to-left (e.g., 'right', '10px')
 * @returns {Object} Object with appropriate property and value
 */
export function getRTLPosition(ltrValue, rtlValue) {
  if (isRTL()) {
    return { [rtlValue.includes('right') ? 'right' : 'left']: rtlValue };
  }
  return { [ltrValue.includes('right') ? 'right' : 'left']: ltrValue };
}

/**
 * Applies RTL-aware positioning to an element
 * @param {HTMLElement} element - Element to position
 * @param {Object} position - Position object with left/right properties
 */
export function applyRTLPosition(element, position) {
  if (isRTL()) {
    // Swap left/right for RTL
    if (position.left !== undefined) {
      element.style.right = position.left;
      element.style.left = 'auto';
    }
    if (position.right !== undefined) {
      element.style.left = position.right;
      element.style.right = 'auto';
    }
  } else {
    // Use normal LTR positioning
    if (position.left !== undefined) {
      element.style.left = position.left;
      element.style.right = 'auto';
    }
    if (position.right !== undefined) {
      element.style.right = position.right;
      element.style.left = 'auto';
    }
  }
}

/**
 * Updates element positioning when language changes
 * @param {HTMLElement} element - Element to update
 * @param {Object} ltrPosition - Position for LTR
 * @param {Object} rtlPosition - Position for RTL
 */
export function updateRTLPosition(element, ltrPosition, rtlPosition) {
  if (isRTL()) {
    Object.assign(element.style, rtlPosition);
  } else {
    Object.assign(element.style, ltrPosition);
  }
}

/**
 * Gets text alignment based on RTL
 * @param {string} ltrAlign - Alignment for LTR (e.g., 'left', 'right', 'center')
 * @param {string} rtlAlign - Alignment for RTL (e.g., 'right', 'left', 'center')
 * @returns {string} Appropriate text alignment
 */
export function getRTLTextAlign(ltrAlign = 'left', rtlAlign = 'right') {
  return isRTL() ? rtlAlign : ltrAlign;
}
