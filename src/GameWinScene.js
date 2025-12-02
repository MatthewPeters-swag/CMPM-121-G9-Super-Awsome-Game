import * as THREE from 'three';

export function showWinScreen(scene) {
  // Clear old objects
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
  }

  // Create big WIN text
  const loader = new THREE.FontLoader();
  loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo = new THREE.TextGeometry('YOU WIN!', {
      font: font,
      size: 1,
      height: 0.2,
    });

    const textMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const textMesh = new THREE.Mesh(textGeo, textMat);

    textMesh.position.set(-2, 1, 0);
    scene.add(textMesh);
  });

  // Background panel
  const bgGeo = new THREE.PlaneGeometry(10, 6);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.position.set(0, 0, -1);
  scene.add(bg);
}
