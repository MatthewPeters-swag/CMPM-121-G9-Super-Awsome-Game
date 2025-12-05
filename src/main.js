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
import { getPlayerConfig, getBlockConfig } from './dsl/physics-config.js';

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
let currentScene = 1;

// --- Save System ---
function saveGame() {
  if (!physicsObjects.player) return;
  const saveData = {
    scene: currentScene,
    player: physicsObjects.player.getSaveData(),
    block: physicsObjects.block ? physicsObjects.block.getSaveData() : null,
    key: physicsObjects.key ? physicsObjects.key.getSaveData() : { pickedUp: true },
  };
  localStorage.setItem('myGameSave', JSON.stringify(saveData));
}

function loadGame() {
  const dataStr = localStorage.getItem('myGameSave');
  if (!dataStr) return;
  const data = JSON.parse(dataStr);
  if (!data) return;

  currentScene = data.scene || 1;
  loadScene(currentScene).then(() => {
    if (physicsObjects.player) physicsObjects.player.loadFromData(data.player);
    if (physicsObjects.block && data.block) physicsObjects.block.loadFromData(data.block);
    if (physicsObjects.key && data.key) physicsObjects.key.loadFromData(data.key);
  });
}

// Make saveGame globally accessible for auto-save
window.saveGame = saveGame;

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
  textAlign: 'center',
});
document.body.appendChild(message);

window.addEventListener('languageChanged', () => {
  message.style.fontFamily = getCSSFontFamily(getCurrentLanguage());
});

// --- Clear Scene Function ---
function clearScene() {
  if (world) {
    Object.values(physicsObjects).forEach(obj => {
      if (obj && obj.collider) world.removeCollider(obj.collider, true);
      if (obj && obj.body) world.removeRigidBody(obj.body);
      if (obj && obj.mesh) {
        scene.remove(obj.mesh);
        if (obj.mesh.geometry) obj.mesh.geometry.dispose();
        if (obj.mesh.material) obj.mesh.material.dispose();
      }
    });
  }

  physicsObjects = {
    platform: null,
    block: null,
    player: null,
    goal: null,
    key: null,
    teleporter: null,
  };

  keySpawned = false;
  gameOver = false;
}

// --- Load Scene Function ---
async function loadScene(sceneNumber) {
  clearScene();
  currentScene = sceneNumber;

  if (sceneNumber === 1) await loadScene1();
  else if (sceneNumber === 2) await loadScene2();

  showMessage(message, t('scene.loaded', { sceneNumber }));
  setTimeout(() => (message.style.display = 'none'), 2000);
}

// --- Initialize Physics World ---
async function initPhysics() {
  if (!world) world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
  await loadScene1();
}

// --- Scene 1 ---
async function loadScene1() {
  const playerConfig = await getPlayerConfig();
  const blockConfig = await getBlockConfig();

  physicsObjects.platform = new Platform(world, scene);
  physicsObjects.block = new Block(world, scene, physicsObjects.platform.top, blockConfig);
  physicsObjects.goal = new Goal(world, scene, physicsObjects.platform.top);
  physicsObjects.teleporter = new Teleporter(world, scene, physicsObjects.platform.top);

  physicsObjects.teleporter.onPlayerEnter = () => {
    if (!gameOver) {
      showMessage(message, t('teleporter.scene2'));
      gameOver = true;
      setTimeout(() => loadScene(2), 1000);
    }
  };

  physicsObjects.player = new Player(world, scene, physicsObjects.platform.top, playerConfig);

  camera.position.set(6, 10, 6);
  camera.lookAt(0, 0, 0);
}

// --- Scene 2 ---
async function loadScene2() {
  const playerConfig = await getPlayerConfig();
  physicsObjects.platform = new Platform(world, scene);
  physicsObjects.teleporter = new Teleporter(
    world,
    scene,
    physicsObjects.platform.top,
    new THREE.Vector3(4, 0, -4)
  );

  physicsObjects.teleporter.onPlayerEnter = () => {
    if (!gameOver) {
      showMessage(message, t('teleporter.scene1'));
      gameOver = true;
      setTimeout(() => loadScene(1), 1000);
    }
  };

  physicsObjects.player = new Player(world, scene, physicsObjects.platform.top, playerConfig);
  if (physicsObjects.player.body)
    physicsObjects.player.body.setTranslation(
      { x: 0, y: physicsObjects.platform.top + 0.3, z: -2 },
      true
    );

  camera.position.set(6, 10, 6);
  camera.lookAt(0, 0, 0);

  // Locked Door
  import('./lockedDoor.js').then(({ LockedDoor }) => {
    const doorPos = new THREE.Vector3(-4, physicsObjects.platform.top, 3);
    const dummyDestination = new THREE.Vector3(0, physicsObjects.platform.top, 0);

    physicsObjects.lockedDoor = new LockedDoor(
      world,
      scene,
      physicsObjects.player,
      dummyDestination,
      doorPos
    );

    if (physicsObjects.lockedDoor?.mesh?.material) {
      physicsObjects.lockedDoor.mesh.material.color = new THREE.Color(0x8000ff);
      physicsObjects.lockedDoor.mesh.material.needsUpdate = true;
    }

    physicsObjects.lockedDoor.onWin = () => {
      import('./GameWinScene.js').then(({ showWinScreen }) => {
        import('./i18n/translations.js').then(({ t }) => showWinScreen(scene, t('game.win')));
      });
    };
  });
}

// --- Phaser Setup ---
const config = {
  type: Phaser.HEADLESS,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'phaser-container',
  scene: { create, update },
  render: { antialias: false, pixelArt: false },
};

const phaserContainer = document.createElement('div');
phaserContainer.id = 'phaser-container';
phaserContainer.style.position = 'absolute';
phaserContainer.style.width = '100%';
phaserContainer.style.height = '100%';
phaserContainer.style.pointerEvents = 'auto';
document.body.appendChild(phaserContainer);

renderer.render(scene, camera);

(async () => {
  await initTranslations();
  initLanguageSelector();
  document.title = t('page.title');
  inventory.updatePosition?.();
  window.addEventListener('languageChanged', () => (document.title = t('page.title')));
})();

const game = new Phaser.Game(config);

// --- Create Scene ---
async function create() {
  try {
    await initPhysics();
    loadGame(); // Load saved progress

    window.__TEST_API__ = {
      physicsObjects,
      showMessage: text => showMessage(message, text),
      checkBlockGoal,
      isGameOver,
      world,
    };
  } catch {
    renderer.render(scene, camera);
  }

  // Pointer input
  this.input.on('pointerdown', pointer => {
    if (gameOver || !physicsObjects.player || !physicsObjects.platform) return;

    const mouse = new THREE.Vector2(
      (pointer.x / window.innerWidth) * 2 - 1,
      -(pointer.y / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Key click
    if (physicsObjects.key?.checkClick(raycaster)) {
      physicsObjects.key.destroy();
      physicsObjects.key = null;
      return;
    }

    // Move player
    const intersects = raycaster.intersectObject(physicsObjects.platform.mesh);
    if (intersects.length > 0) {
      const clickPoint = intersects[0].point.clone();
      clickPoint.y = physicsObjects.platform.mesh.position.y + 0.25 + 0.3;
      physicsObjects.player.move(clickPoint);
    }
  });

  window.addEventListener('resize', () => handleResize(camera, renderer, game));
}

// --- Update Loop ---
function update(_time, _delta) {
  if (!world || gameOver) {
    renderer.render(scene, camera);
    return;
  }

  world.step();

  [physicsObjects.player, physicsObjects.block].filter(Boolean).forEach(obj => obj.updateVisual());
  physicsObjects.lockedDoor?.update?.();

  const blockAtGoal = checkBlockGoal(physicsObjects);
  if (blockAtGoal && !keySpawned) {
    const keyPosition = new THREE.Vector3(0, physicsObjects.platform.top + 1, 0);
    physicsObjects.key = new Key(world, scene, keyPosition);
    physicsObjects.key.onClick = () => {
      inventory.addItem('key');
      saveGame();
    };
    keySpawned = true;
  }

  if (physicsObjects.teleporter?.isPlayerTouching(world, physicsObjects.player))
    physicsObjects.teleporter.trigger();

  gameOver = isGameOver(physicsObjects, message);

  renderer.render(scene, camera);
}
