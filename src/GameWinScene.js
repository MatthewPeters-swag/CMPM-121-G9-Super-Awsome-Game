import * as THREE from 'three';
import { loadFont, getCSSFontFamily } from './i18n/font-loader.js';
import { getCurrentLanguage } from './i18n/translations.js';
import { isRTL } from './i18n/rtl-utils.js';

/**
 * Shows the win screen with translated text
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} winText - Text to display (will be translated)
 */
export async function showWinScreen(scene, winText) {
  // Clear old objects
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
  }

  const lang = getCurrentLanguage();
  const isRTLMode = isRTL();

  // For Chinese characters, Three.js TextGeometry may not render properly
  // because typeface.json fonts typically don't support Chinese
  // We'll try to render with the font, but may need HTML overlay fallback
  try {
    const font = await loadFont(lang);
    const textGeo = new THREE.TextGeometry(winText, {
      font: font,
      size: 1,
      height: 0.2,
    });

    // Center the text geometry
    textGeo.computeBoundingBox();
    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    const textHeight = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;

    // Adjust position for RTL (mirror horizontally)
    const xOffset = isRTLMode ? textWidth / 2 : -textWidth / 2;

    const textMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(xOffset, 1, 0);

    // Mirror for RTL
    if (isRTLMode) {
      textMesh.scale.x = -1;
    }

    scene.add(textMesh);
  } catch (error) {
    console.warn(
      'Failed to render 3D text, text may not display correctly for this language',
      error
    );
    // Fallback: Could create HTML overlay here if needed
  }

  // Background panel
  const bgGeo = new THREE.PlaneGeometry(10, 6);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.position.set(0, 0, -1);
  scene.add(bg);
}
