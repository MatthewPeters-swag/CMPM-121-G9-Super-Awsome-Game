import Phaser from 'phaser';
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { Player } from './player.js';
import { Platform } from './platform.js';
import { Block } from './block.js';
import { Goal } from './goal.js';
import { handleResize, checkGameConditions } from './utils.js';

// --- Three.js Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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
  goal: null,
};

// --- Game State ---
let gameOver = false;

// --- UI Message ---
const message = document.createElement('div');
Object.assign(message.style, {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  background: 'rgba(0,0,0,0.6)',
  color: 'white',
  fontFamily: 'sans-serif',
  fontSize: '20px',
  display: 'none',
  borderRadius: '6px',
  zIndex: '1000',
});
document.body.appendChild(message);

function showMessage(text) {
  message.textContent = text;
  message.style.display = 'block';
  gameOver = true;
}

// --- Initialize Physics World ---
async function initPhysics() {
  // Create physics world with gravity
  world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

  // Create platform
  physicsObjects.platform = new Platform(world, scene);

  // Create movable block
  physicsObjects.block = new Block(world, scene, physicsObjects.platform.top);

  // Create goal area
  physicsObjects.goal = new Goal(world, scene, physicsObjects.platform.top);

  // Create player
  physicsObjects.player = new Player(world, scene, physicsObjects.platform.top, {
    friction: 0.75,
    minForce: 1.0,
    maxForce: 3.0,
  });

  // --- Camera ---
  camera.position.set(6, 10, 6);
  camera.lookAt(0, 0, 0);
}

// --- Phaser Game Configuration ---
const config = {
  type: Phaser.HEADLESS, // Use HEADLESS mode since we're not using Phaser's rendering
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'phaser-container',
  scene: {
    create: create,
    update: update,
  },
  // Disable Phaser's rendering since we're using Three.js
  render: {
    antialias: false,
    pixelArt: false,
  },
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
    // Expose test API for integration tests (allows tests to inspect/manipulate physics objects)
    // Tests can use `window.__TEST_API__` to move bodies or trigger game condition checks.
    // This is intentionally only a testing helper and does not affect gameplay.
    // Example usage in tests: window.__TEST_API__.physicsObjects.block.body.setTranslation({x:3,y:...,z:-2}, true)
    window.__TEST_API__ = {
      physicsObjects,
      showMessage,
      checkGameConditions,
      world,
    };
  } catch {
    // Still render the scene even if physics fails
    renderer.render(scene, camera);
  }

  // Handle mouse input through Phaser
  this.input.on('pointerdown', pointer => {
    if (gameOver || !physicsObjects.player || !physicsObjects.platform) return;

    // Convert Phaser pointer coordinates to Three.js normalized device coordinates
    const mouse = new THREE.Vector2(
      (pointer.x / window.innerWidth) * 2 - 1,
      -(pointer.y / window.innerHeight) * 2 + 1
    );

    // Raycast to find click position on platform
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(physicsObjects.platform.mesh);

    if (intersects.length > 0) {
      const clickPoint = intersects[0].point.clone();
      // Keep click point at platform height
      clickPoint.y = physicsObjects.platform.mesh.position.y + 0.25 + 0.3;
      physicsObjects.player.move(clickPoint);
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => handleResize(camera, renderer, game));
}

function update(_time, _delta) {
  // Always render, even if physics isn't ready yet
  if (!world || gameOver) {
    renderer.render(scene, camera);
    return;
  }

  // Step physics simulation
  world.step();

  // Sync physics bodies with Three.js meshes
  const visualUpdateObjects = [physicsObjects.player, physicsObjects.block].filter(Boolean);
  visualUpdateObjects.forEach(obj => obj.updateVisual());

  // Check game conditions
  checkGameConditions({ gameOver, physicsObjects, showMessage });

  // Render Three.js scene
  renderer.render(scene, camera);
}
