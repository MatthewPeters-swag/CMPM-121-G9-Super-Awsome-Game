import * as THREE from 'three';
// We use a CanvasTexture fallback instead of FontLoader/TextGeometry
// to avoid relying on an external font file that may 404 in production.

export function showWinScreen(scene) {
  // Clear old objects
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
  }

  // Create big WIN text as a CanvasTexture so it always appears
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  // Background transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Text styling
  ctx.fillStyle = '#00ff00';
  ctx.strokeStyle = '#003300';
  ctx.lineWidth = 8;
  const fontSize = 160;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = 'YOU WIN!';
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
}
