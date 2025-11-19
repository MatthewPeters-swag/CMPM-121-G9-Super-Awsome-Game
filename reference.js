import * as THREE from 'three';

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Platform (Ground) ---
const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10);
const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.y = -1;
scene.add(platform);
const platformTop = platform.position.y + platformGeometry.parameters.height / 2;

// --- Movable Block ---
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
const block = new THREE.Mesh(blockGeometry, blockMaterial);
block.position.y = 0;
scene.add(block);

// --- Goal Area ---
const goalGeometry = new THREE.BoxGeometry(1, 0.1, 1);
const goalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff55 });
const goal = new THREE.Mesh(goalGeometry, goalMaterial);
goal.position.set(3, platformTop + 0.05, -2);
scene.add(goal);

// --- UI Message ---
const message = document.createElement('div');
message.style.position = 'absolute';
message.style.top = '20px';
message.style.left = '50%';
message.style.transform = 'translateX(-50%)';
message.style.padding = '10px 20px';
message.style.background = 'rgba(0,0,0,0.6)';
message.style.color = 'white';
message.style.fontFamily = 'sans-serif';
message.style.fontSize = '20px';
message.style.display = 'none';
message.style.borderRadius = '6px';
document.body.appendChild(message);


// --- Player Box ---
const playerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0, 2);
scene.add(player);

// --- Physics Placeholders ---
let blockVelocity = new THREE.Vector3(0, 0, 0);
let playerVelocity = new THREE.Vector3(0, 0, 0);
const friction = 0.9;

// --- Click-to-Move for Player ---
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let targetPoint = null;

window.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(platform);

  if (intersects.length > 0) {
    targetPoint = intersects[0].point.clone();
  }
});

// --- Apply Movement and Collisions ---
let gameOver = false;

function showMessage(text) {
  message.textContent = text;
  message.style.display = 'block';
  gameOver = true;
}

function applyPhysics() {
  // Move player toward target point
  if (targetPoint) {
    const dir = targetPoint.clone().sub(player.position);

    if (dir.length() > 0.05) {
      dir.normalize();
      playerVelocity.copy(dir.multiplyScalar(0.1));
    } else {
      playerVelocity.set(0, 0, 0);
    }
  }

  // Update player position
  player.position.add(playerVelocity);
  playerVelocity.multiplyScalar(friction);

  // Update block position
  block.position.add(blockVelocity);
  blockVelocity.multiplyScalar(friction);

  // --- Keep Both Objects on Ground ---
  const minY = platformTop + 0.5;
  player.position.y = minY - 0.2;
  block.position.y = minY;

  // --- Collision: Player pushes block ---
  const dist = player.position.distanceTo(block.position);
  const minDist = 1.0;
  if (dist < minDist) {
    const pushDir = block.position.clone().sub(player.position).normalize();
    blockVelocity.add(pushDir.multiplyScalar(0.1));
  }

  // --- Win Condition (block touches goal) ---
  const goalDist = block.position.distanceTo(goal.position);
  if (!gameOver && goalDist < 0.8) {
    showMessage('You Win!');
  }

  // --- Loss Condition (block reaches platform edge) ---
  const halfSize = 5;
  if (!gameOver && (
    block.position.x < -halfSize ||
    block.position.x > halfSize ||
    block.position.z < -halfSize ||
    block.position.z > halfSize
  )) {
    showMessage('You Lose!');
  }
}

// --- Camera ---
camera.position.set(6, 10, 6);
camera.lookAt(0, 0, 0);

// --- Animation Loop ---
function animate() {
  applyPhysics();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

