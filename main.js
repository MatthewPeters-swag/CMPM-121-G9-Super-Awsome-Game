import Phaser from 'phaser';
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

// --- Three.js Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
document.body.appendChild(renderer.domElement);

// --- Rapier Physics World Setup ---
let world = null;
let physicsObjects = {
  platform: null,
  block: null,
  player: null,
  goal: null
};

// --- Three.js Meshes ---
let threeMeshes = {
  platform: null,
  block: null,
  player: null,
  goal: null
};

// --- Game State ---
let gameOver = false;
let targetPoint = null;
let playerMoveForce = 0.08;
let playerFriction = 1;

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
message.style.zIndex = '1000';
document.body.appendChild(message);

function showMessage(text) {
  message.textContent = text;
  message.style.display = 'block';
  gameOver = true;
}

// --- Initialize Physics World ---
async function initPhysics() {
  try {
    // Create physics world with gravity
    world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
  
  // --- Platform (Ground) - Static body ---
  const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10);
  const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
  threeMeshes.platform = new THREE.Mesh(platformGeometry, platformMaterial);
  threeMeshes.platform.position.y = -1;
  scene.add(threeMeshes.platform);
  
  const platformTop = threeMeshes.platform.position.y + platformGeometry.parameters.height / 2;
  
  // Create static platform physics body
  const platformColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.25, 5);
  const platformBodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(
      threeMeshes.platform.position.x,
      threeMeshes.platform.position.y,
      threeMeshes.platform.position.z
    );
  const platformBody = world.createRigidBody(platformBodyDesc);
  physicsObjects.platform = world.createCollider(platformColliderDesc, platformBody);
  
  // --- Movable Block - Dynamic body ---
  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  threeMeshes.block = new THREE.Mesh(blockGeometry, blockMaterial);
  threeMeshes.block.position.y = platformTop + 0.5;
  scene.add(threeMeshes.block);
  
  const blockBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setLinearDamping(0.5)
    .setAngularDamping(0.5)
    .setTranslation(
      threeMeshes.block.position.x,
      threeMeshes.block.position.y,
      threeMeshes.block.position.z
    );
  const blockBody = world.createRigidBody(blockBodyDesc);
  const blockColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
  physicsObjects.block = world.createCollider(blockColliderDesc, blockBody);
  
  // --- Goal Area - Sensor (no physics, just detection) ---
  const goalGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const goalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff55 });
  threeMeshes.goal = new THREE.Mesh(goalGeometry, goalMaterial);
  threeMeshes.goal.position.set(3, platformTop + 0.05, -2);
  scene.add(threeMeshes.goal);
  
  const goalBodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(
      threeMeshes.goal.position.x,
      threeMeshes.goal.position.y,
      threeMeshes.goal.position.z
    );
  const goalBody = world.createRigidBody(goalBodyDesc);
  const goalColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.05, 0.5)
    .setSensor(true);
  physicsObjects.goal = world.createCollider(goalColliderDesc, goalBody);
  
  // --- Player Box - Dynamic body ---
  const playerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  threeMeshes.player = new THREE.Mesh(playerGeometry, playerMaterial);
  threeMeshes.player.position.set(0, platformTop + 0.3, 2);
  scene.add(threeMeshes.player);
  
  const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setLinearDamping(0.8)
    .setAngularDamping(0.8)
    .setTranslation(
      threeMeshes.player.position.x,
      threeMeshes.player.position.y,
      threeMeshes.player.position.z
    );
  const playerBody = world.createRigidBody(playerBodyDesc);
  const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3)
    .setFriction(playerFriction);
  physicsObjects.player = world.createCollider(playerColliderDesc, playerBody);
  
  // Store body references for later use
  physicsObjects.playerBody = playerBody;
  physicsObjects.blockBody = blockBody;
  
    // --- Camera ---
    camera.position.set(6, 10, 6);
    camera.lookAt(0, 0, 0);
  } catch (error) {
    throw error;
  }
}

// --- Phaser Game Configuration ---
const config = {
  type: Phaser.HEADLESS, // Use HEADLESS mode since we're not using Phaser's rendering
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'phaser-container',
  scene: {
    create: create,
    update: update
  },
  // Disable Phaser's rendering since we're using Three.js
  render: {
    antialias: false,
    pixelArt: false
  }
};

// Create a container for Phaser (though we won't use its rendering)
const phaserContainer = document.createElement('div');
phaserContainer.id = 'phaser-container';
phaserContainer.style.position = 'absolute';
phaserContainer.style.width = '100%';
phaserContainer.style.height = '100%';
phaserContainer.style.pointerEvents = 'auto'; // Enable pointer events for Phaser input
document.body.appendChild(phaserContainer);

// Render initial empty scene
renderer.render(scene, camera);

const game = new Phaser.Game(config);

async function create() {
  try {
    // Initialize physics
    await initPhysics();
  } catch (error) {
    // Still render the scene even if physics fails
    renderer.render(scene, camera);
  }
  
  // Handle mouse input through Phaser
  this.input.on('pointerdown', (pointer) => {
    if (gameOver) return;
    
    // Convert Phaser pointer coordinates to Three.js normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (pointer.x / window.innerWidth) * 2 - 1;
    mouse.y = -(pointer.y / window.innerHeight) * 2 + 1;
    
    // Raycast to find click position on platform
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(threeMeshes.platform);
    
    if (intersects.length > 0) {
      targetPoint = intersects[0].point.clone();
      // Keep target point at platform height
      targetPoint.y = threeMeshes.platform.position.y + 0.25 + 0.3;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
}

function update(time, delta) {
  // Always render, even if physics isn't ready yet
  if (!world) {
    renderer.render(scene, camera);
    return;
  }
  
  if (gameOver) {
    renderer.render(scene, camera);
    return;
  }
  
  // Step physics simulation
  const timeStep = delta / 1000; // Convert to seconds
  world.step();
  
  // Move player toward target point using physics
  if (targetPoint && physicsObjects.playerBody) {
    const playerPos = physicsObjects.playerBody.translation();
    const dir = new THREE.Vector3(
      targetPoint.x - playerPos.x,
      targetPoint.y - playerPos.y,
      targetPoint.z - playerPos.z
    );
    
    if (dir.length() > 0.1) {
      dir.normalize();
      // Apply impulse to move player (reduced force for smoother movement)
      const impulse = new RAPIER.Vector3(dir.x * playerMoveForce, 0, dir.z * playerMoveForce);
      physicsObjects.playerBody.applyImpulse(impulse, true);
    } else {
      targetPoint = null;
    }
  }
  
  // Sync physics bodies with Three.js meshes
  if (physicsObjects.playerBody && threeMeshes.player) {
    const playerPos = physicsObjects.playerBody.translation();
    threeMeshes.player.position.set(playerPos.x, playerPos.y, playerPos.z);
    const playerRot = physicsObjects.playerBody.rotation();
    threeMeshes.player.quaternion.set(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
  }
  
  if (physicsObjects.blockBody && threeMeshes.block) {
    const blockPos = physicsObjects.blockBody.translation();
    threeMeshes.block.position.set(blockPos.x, blockPos.y, blockPos.z);
    const blockRot = physicsObjects.blockBody.rotation();
    threeMeshes.block.quaternion.set(blockRot.x, blockRot.y, blockRot.z, blockRot.w);
  }
  
  // Check win condition (block touches goal)
  if (physicsObjects.blockBody && !gameOver) {
    const blockPos = physicsObjects.blockBody.translation();
    const goalPos = threeMeshes.goal.position;
    const goalDist = Math.sqrt(
      Math.pow(blockPos.x - goalPos.x, 2) +
      Math.pow(blockPos.y - goalPos.y, 2) +
      Math.pow(blockPos.z - goalPos.z, 2)
    );
    
    if (goalDist < 0.8) {
      showMessage('You Win!');
    }
  }
  
  // Check loss condition (block reaches platform edge)
  if (physicsObjects.blockBody && !gameOver) {
    const blockPos = physicsObjects.blockBody.translation();
    const halfSize = 5;
    if (
      blockPos.x < -halfSize ||
      blockPos.x > halfSize ||
      blockPos.z < -halfSize ||
      blockPos.z > halfSize
    ) {
      showMessage('You Lose!');
    }
  }
  
  // Render Three.js scene
  renderer.render(scene, camera);
}
