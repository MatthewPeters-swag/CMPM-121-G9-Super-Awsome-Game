import Phaser from 'phaser';
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { Player } from './player.js';
import { Platform } from './platform.js';
import { Block } from './block.js';
import { Goal } from './goal.js';
import { Key } from './key.js';
import { Teleporter } from './teleporter.js';
import { inventory } from './inventory.js';
import { handleResize, checkBlockGoal, isGameOver, showMessage } from './utils.js';
import { initTranslations, t, getCurrentLanguage } from './i18n/translations.js';
import { initLanguageSelector } from './i18n/languageSelector.js';
import { getCSSFontFamily } from './i18n/font-loader.js';

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
  key: null,
  teleporter: null,
};

// --- Game State ---
let gameOver = false;
let keySpawned = false; // Track if the key has already been spawned
const requestAnimationFrame = window.requestAnimationFrame.bind(window);

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
  fontFamily: getCSSFontFamily(getCurrentLanguage()),
  fontSize: '20px',
  display: 'none',
  borderRadius: '6px',
  zIndex: '1000',
  textAlign: 'center', // Center text for both LTR and RTL
});
document.body.appendChild(message);

// Update message font when language changes
window.addEventListener('languageChanged', () => {
  message.style.fontFamily = getCSSFontFamily(getCurrentLanguage());
});

// --- Clear Scene Function ---
function clearScene() {
  // Remove all physics objects from world
  if (world) {
    // Remove colliders and bodies
    Object.values(physicsObjects).forEach(obj => {
      if (obj && obj.collider) {
        world.removeCollider(obj.collider, true);
      }
      if (obj && obj.body) {
        world.removeRigidBody(obj.body);
      }
      // Remove mesh from scene
      if (obj && obj.mesh) {
        scene.remove(obj.mesh);
        if (obj.mesh.geometry) obj.mesh.geometry.dispose();
        if (obj.mesh.material) obj.mesh.material.dispose();
      }
    });
  }

  // Reset physics objects
  physicsObjects = {
    platform: null,
    block: null,
    player: null,
    goal: null,
    key: null,
    teleporter: null,
  };

  // Reset game state
  keySpawned = false;
  gameOver = false;
}

// --- Load Scene Function ---
async function loadScene(sceneNumber) {
  clearScene();

  if (sceneNumber === 1) {
    await loadScene1();
  } else if (sceneNumber === 2) {
    await loadScene2();
  }

  showMessage(message, `Scene ${sceneNumber} loaded!`);
  setTimeout(() => {
    message.style.display = 'none';
  }, 2000);
}

// --- Initialize Physics World ---
async function initPhysics() {
  // Create physics world with gravity
  if (!world) {
    world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
  }

  // Load the first scene
  await loadScene1();
}

// --- Scene 1: Original Scene ---
async function loadScene1() {
  // Create platform
  physicsObjects.platform = new Platform(world, scene);

  // Create movable block
  physicsObjects.block = new Block(world, scene, physicsObjects.platform.top);

  // Create goal area
  physicsObjects.goal = new Goal(world, scene, physicsObjects.platform.top);

  // Create teleporter in top left corner
  physicsObjects.teleporter = new Teleporter(world, scene, physicsObjects.platform.top);

  // Set up teleporter event handler to load scene 2
  physicsObjects.teleporter.onPlayerEnter = () => {
    if (!gameOver) {
      showMessage(message, 'Teleporting to Scene 2...');
      gameOver = true; // Prevent further actions during transition
      setTimeout(() => {
        loadScene(2);
      }, 1000);
    }
  };

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

// --- Scene 2: New Scene with Different Layout ---
async function loadScene2() {
  // Create platform (same as scene 1)
  physicsObjects.platform = new Platform(world, scene);

  // No block or goal in this scene - just the platform and teleporter

  // Create teleporter to go back to scene 1 (different position - top right)
  physicsObjects.teleporter = new Teleporter(
    world,
    scene,
    physicsObjects.platform.top,
    new THREE.Vector3(4, 0, -4)
  );

  // Set up teleporter event handler to go back to scene 1
  physicsObjects.teleporter.onPlayerEnter = () => {
    if (!gameOver) {
      showMessage(message, 'Teleporting back to Scene 1...');
      gameOver = true;
      setTimeout(() => {
        loadScene(1);
      }, 1000);
    }
  };

  // Create player in a different starting position
  physicsObjects.player = new Player(world, scene, physicsObjects.platform.top, {
    friction: 0.75,
    minForce: 1.0,
    maxForce: 3.0,
  });

  if (physicsObjects.player.body) {
    physicsObjects.player.body.setTranslation(
      { x: 0, y: physicsObjects.platform.top + 0.3, z: -2 },
      true
    );
  }

  camera.position.set(6, 10, 6);
  camera.lookAt(0, 0, 0);

  // Load the Locked Door (WIN door)
  import('./lockedDoor.js').then(({ LockedDoor }) => {
    const doorPos = new THREE.Vector3(-4, physicsObjects.platform.top, 3);
    const dummyDestination = new THREE.Vector3(0, physicsObjects.platform.top, 0);

    physicsObjects.lockedDoor = new LockedDoor(
      world,
      scene,
      physicsObjects.player, // ✔ FIXED
      dummyDestination,
      doorPos
    );

    physicsObjects.lockedDoor.onWin = () => {
      import('./GameWinScene.js').then(({ showWinScreen }) => {
        import('./i18n/translations.js').then(({ t }) => {
          showWinScreen(scene, t('game.win'));
        });
      });
    };
  });

  // Check each frame if player touches the door
  const checkDoorWin = () => {
    if (
      physicsObjects.lockedDoor &&
      physicsObjects.lockedDoor.doorMesh &&
      physicsObjects.player.body
    ) {
      const p = physicsObjects.player.body.position; // ✔ FIXED
      const d = physicsObjects.lockedDoor.doorMesh.position;

      const dist = Math.sqrt((p.x - d.x) ** 2 + (p.y - d.y) ** 2 + (p.z - d.z) ** 2);

      if (dist < 1.2 && physicsObjects.lockedDoor.onWin) {
        physicsObjects.lockedDoor.onWin();
      }
    }

    requestAnimationFrame(checkDoorWin);
  };

  checkDoorWin();
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

// Initialize i18n system
(async () => {
  await initTranslations();
  initLanguageSelector();

  // Update page title with translated text
  document.title = t('page.title');

  // Listen for language changes to update page title
  window.addEventListener('languageChanged', () => {
    document.title = t('page.title');
  });
})();

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
      showMessage: text => showMessage(message, text),
      checkBlockGoal,
      isGameOver,
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

    // Raycast to check for clicks
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check if key was clicked first
    if (physicsObjects.key && physicsObjects.key.checkClick(raycaster)) {
      physicsObjects.key.destroy(); // Remove key from scene and physics
      physicsObjects.key = null;
      return; // Key click handled, don't move player
    }

    // Check for click on platform to move player
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

  const blockAtGoal = checkBlockGoal(physicsObjects);
  if (blockAtGoal && !keySpawned) {
    // Spawn key only once
    const keyPosition = new THREE.Vector3(0, physicsObjects.platform.top + 1, 0);
    physicsObjects.key = new Key(world, scene, keyPosition);

    // Assign onClick behavior
    physicsObjects.key.onClick = () => {
      inventory.addItem('key');
    };

    keySpawned = true; // Prevent further spawning
  }

  // Check if player is touching the teleporter
  if (
    physicsObjects.teleporter &&
    physicsObjects.teleporter.isPlayerTouching(world, physicsObjects.player)
  ) {
    physicsObjects.teleporter.trigger();
  }

  // Check if game is over (player or block off platform)
  gameOver = isGameOver(physicsObjects, message);

  // Render Three.js scene
  renderer.render(scene, camera);
}
