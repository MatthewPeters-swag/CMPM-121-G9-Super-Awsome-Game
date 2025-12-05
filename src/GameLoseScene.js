import * as THREE from 'three';
// We use a CanvasTexture fallback instead of FontLoader/TextGeometry
// to avoid relying on an external font file that may 404 in production.
import { getCSSFontFamily } from './i18n/font-loader.js';
import { getCurrentLanguage, t } from './i18n/translations.js';
import { isRTL } from './i18n/rtl-utils.js';

/**
 * Shows the lose screen with translated text
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} loseText - Text to display (will be translated)
 * @param {Function} onRetry - Callback function to execute when retry button is clicked
 * @param {THREE.Camera} camera - Camera for raycasting
 */
export async function showLoseScreen(scene, loseText, onRetry, camera) {
  // Clear old objects
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
  }

  // Create big LOSE text as a CanvasTexture so it always appears
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

  // Text styling - red for lose screen
  ctx.fillStyle = '#ff0000';
  ctx.strokeStyle = '#330000';
  ctx.lineWidth = 8;
  const fontSize = 160;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Use translated text (defaults to translation if not provided)
  const text = loseText || t('game.lose');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // For RTL languages, we can mirror the canvas if needed
  if (isRTLMode) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.strokeText(text, cx, cy);
  ctx.fillText(text, cx, cy);

  if (isRTLMode) {
    ctx.restore();
  }

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

  // Create retry button
  const buttonCanvas = document.createElement('canvas');
  buttonCanvas.width = 512;
  buttonCanvas.height = 128;
  const btnCtx = buttonCanvas.getContext('2d');

  // Button background
  btnCtx.fillStyle = '#444444';
  btnCtx.fillRect(0, 0, buttonCanvas.width, buttonCanvas.height);

  // Button border
  btnCtx.strokeStyle = '#ffffff';
  btnCtx.lineWidth = 4;
  btnCtx.strokeRect(2, 2, buttonCanvas.width - 4, buttonCanvas.height - 4);

  // Button text
  btnCtx.fillStyle = '#ffffff';
  const btnFontSize = 48;
  btnCtx.font = `bold ${btnFontSize}px ${fontFamily}`;
  btnCtx.textAlign = 'center';
  btnCtx.textBaseline = 'middle';

  if (isRTLMode) {
    btnCtx.save();
    btnCtx.translate(buttonCanvas.width, 0);
    btnCtx.scale(-1, 1);
  }

  btnCtx.fillText('RETRY', buttonCanvas.width / 2, buttonCanvas.height / 2);

  if (isRTLMode) {
    btnCtx.restore();
  }

  const btnTex = new THREE.CanvasTexture(buttonCanvas);
  btnTex.needsUpdate = true;

  const btnSpriteMat = new THREE.SpriteMaterial({ map: btnTex, transparent: true });
  btnSpriteMat.depthTest = false;
  const btnSprite = new THREE.Sprite(btnSpriteMat);

  const btnAspect = buttonCanvas.width / buttonCanvas.height;
  const btnHeight = 0.8;
  const btnWidth = btnHeight * btnAspect;
  btnSprite.scale.set(btnWidth, btnHeight, 1);
  btnSprite.position.set(0, -1.2, 0);
  btnSprite.renderOrder = 1000;
  btnSprite.userData.isRetryButton = true;
  scene.add(btnSprite);

  // Add click handler for retry button
  if (onRetry && camera) {
    const handleClick = event => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(btnSprite);
      if (intersects.length > 0) {
        window.removeEventListener('click', handleClick);
        onRetry();
      }
    };

    window.addEventListener('click', handleClick);
  }
}
