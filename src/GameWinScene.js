import * as THREE from 'three';
// We use a CanvasTexture fallback instead of FontLoader/TextGeometry
// to avoid relying on an external font file that may 404 in production.
import { getCSSFontFamily } from './i18n/font-loader.js';
import { getCurrentLanguage, t } from './i18n/translations.js';
import { isRTL } from './i18n/rtl-utils.js';

/**
 * Shows the win screen with translated text
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} winText - Text to display (will be translated)
 * @param {number} moveCount - Number of moves taken to complete the game
 */
export async function showWinScreen(scene, winText, moveCount = 0) {
  // Clear old objects
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
  }

  // Create big WIN text as a CanvasTexture so it always appears
  // This approach works reliably for all languages including Chinese and Arabic
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  // Background transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get language-specific font for proper rendering of non-Latin scripts
  const lang = getCurrentLanguage();
  const fontFamily = getCSSFontFamily(lang);
  const isRTLMode = isRTL();

  // Text styling
  ctx.fillStyle = '#00ff00';
  ctx.strokeStyle = '#003300';
  ctx.lineWidth = 8;
  const fontSize = 160;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Use translated text (defaults to translation if not provided)
  const text = winText || t('game.win');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.strokeText(text, cx, cy);
  ctx.fillText(text, cx, cy);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;

  // Use a Sprite so the texture is always flat and faces the camera (no 3D skew)
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  // Improve visibility: render on top and disable depth test so it won't be occluded
  spriteMat.depthTest = false;
  const sprite = new THREE.Sprite(spriteMat);

  // Size sprite based on canvas aspect ratio
  const aspect = canvas.width / canvas.height;
  const spriteHeight = 2.0; // world units tall
  const spriteWidth = spriteHeight * aspect;
  sprite.scale.set(spriteWidth, spriteHeight, 1);

  // Place sprite slightly in front of background and centered
  sprite.position.set(0, 1, 0);
  sprite.renderOrder = 999;
  scene.add(sprite);

  // Background panel
  const bgGeo = new THREE.PlaneGeometry(10, 6);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.position.set(0, 0, -1);
  scene.add(bg);

  // Create move count text
  const moveCanvas = document.createElement('canvas');
  moveCanvas.width = 1024;
  moveCanvas.height = 256;
  const moveCtx = moveCanvas.getContext('2d');
  moveCtx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);

  // Move count styling
  moveCtx.fillStyle = '#ffffff';
  moveCtx.strokeStyle = '#000000';
  moveCtx.lineWidth = 6;
  const moveFontSize = 80;
  moveCtx.font = `bold ${moveFontSize}px ${fontFamily}`;
  moveCtx.textAlign = 'center';
  moveCtx.textBaseline = 'middle';

  // Use translated completion message
  const moveText = t('game.completedIn', { moves: moveCount });
  const moveCx = moveCanvas.width / 2;
  const moveCy = moveCanvas.height / 2;

  if (isRTLMode) {
    moveCtx.save();
    moveCtx.translate(moveCanvas.width, 0);
    moveCtx.scale(-1, 1);
  }

  moveCtx.strokeText(moveText, moveCx, moveCy);
  moveCtx.fillText(moveText, moveCx, moveCy);

  if (isRTLMode) {
    moveCtx.restore();
  }

  const moveTex = new THREE.CanvasTexture(moveCanvas);
  moveTex.needsUpdate = true;

  const moveSpriteMat = new THREE.SpriteMaterial({ map: moveTex, transparent: true });
  moveSpriteMat.depthTest = false;
  const moveSprite = new THREE.Sprite(moveSpriteMat);

  const moveAspect = moveCanvas.width / moveCanvas.height;
  const moveSpriteHeight = 1.0;
  const moveSpriteWidth = moveSpriteHeight * moveAspect;
  moveSprite.scale.set(moveSpriteWidth, moveSpriteHeight, 1);
  moveSprite.position.set(0, -0.5, 0);
  moveSprite.renderOrder = 999;
  scene.add(moveSprite);
}
