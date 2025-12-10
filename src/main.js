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
import { updateRTLPosition } from './i18n/rtl-utils.js';
import { initTheme, getThemeColor, applySceneTheme, getGameObjectColors } from './theme.js';

// --- Three.js Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '1'; // Ensure canvas is above overlays
document.body.appendChild(renderer.domElement);

// --- Three.js Lighting Setup ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Store lights for theme updates
const lights = { ambient: ambientLight, directional: directionalLight };

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
let moveCount = 0; // Track number of moves
let actionHistory = []; // Track actions for undo: { type: 'move' | 'keyPickup', data: {...} }

// --- Save System ---
function saveGame() {
  if (!physicsObjects.player) return;
  const saveData = {
    scene: currentScene,
    player: physicsObjects.player.getSaveData(),
    block: physicsObjects.block ? physicsObjects.block.getSaveData() : null,
    key: physicsObjects.key ? physicsObjects.key.getSaveData() : { pickedUp: true },
    moveCount: moveCount,
    actionHistory: actionHistory,
  };
  localStorage.setItem('myGameSave', JSON.stringify(saveData));
}

function loadGame() {
  const dataStr = localStorage.getItem('myGameSave');
  if (!dataStr) return;
  const data = JSON.parse(dataStr);
  if (!data) return;

  currentScene = data.scene || 1;
  moveCount = data.moveCount || 0;
  actionHistory = data.actionHistory || [];
  updateMoveCounter();
  updateUndoButton();
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
const updateMessageStyle = () => {
  Object.assign(message.style, {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    background: getThemeColor('messageBg'),
    color: getThemeColor('textColor'),
    fontFamily: getCSSFontFamily(getCurrentLanguage()),
    fontSize: '20px',
    display: 'none',
    borderRadius: '6px',
    zIndex: '1000',
    textAlign: 'center',
    border: `2px solid ${getThemeColor('messageBorder')}`,
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  });
};
updateMessageStyle();
document.body.appendChild(message);
window.addEventListener('themeChanged', updateMessageStyle);

// --- Move Counter UI ---
const moveCounter = document.createElement('div');
const moveCounterLTRPosition = {
  position: 'absolute',
  top: '70px',
  left: '10px',
  right: 'auto',
  padding: '10px 15px',
  borderRadius: '6px',
  zIndex: '1000',
};
const moveCounterRTLPosition = {
  position: 'absolute',
  top: '70px',
  right: '10px',
  left: 'auto',
  padding: '10px 15px',
  borderRadius: '6px',
  zIndex: '1000',
};

const updateMoveCounterStyle = () => {
  Object.assign(moveCounter.style, {
    background: getThemeColor('backgroundColor'),
    color: getThemeColor('textColor'),
    fontFamily: getCSSFontFamily(getCurrentLanguage()),
    fontSize: '18px',
    border: `2px solid ${getThemeColor('borderColorBright')}`,
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    ...moveCounterLTRPosition,
  });
  // Ensure RTL/LTR positioning is correct after applying base styles
  updateRTLPosition(moveCounter, moveCounterLTRPosition, moveCounterRTLPosition);
};

function updateMoveCounter() {
  moveCounter.textContent = `${t('ui.moves')}:  ${moveCount}`;
  moveCounter.style.fontFamily = getCSSFontFamily(getCurrentLanguage());
  updateRTLPosition(moveCounter, moveCounterLTRPosition, moveCounterRTLPosition);
}

function incrementMoveCount() {
  moveCount++;
  updateMoveCounter();
}

function trackMoveAction(previousPosition) {
  // Capture block's position before the move
  let previousBlockPosition = null;
  if (physicsObjects.block && physicsObjects.block.body) {
    const blockPos = physicsObjects.block.body.translation();
    previousBlockPosition = { x: blockPos.x, y: blockPos.y, z: blockPos.z };
  }

  // Track if key was already spawned before this move
  const keyWasSpawned = keySpawned;

  actionHistory.push({
    type: 'move',
    data: {
      previousPosition,
      previousBlockPosition,
      keyWasSpawned,
    },
  });
  updateUndoButton();
}

// Make functions globally accessible
window.incrementMoveCount = incrementMoveCount;
window.trackMoveAction = trackMoveAction;

// Initial setup
updateMoveCounterStyle();
updateRTLPosition(moveCounter, moveCounterLTRPosition, moveCounterRTLPosition);
// Text content will be set after translations load (see async init below)
moveCounter.textContent = 'Moves: 0'; // Temporary placeholder
document.body.appendChild(moveCounter);
window.addEventListener('themeChanged', updateMoveCounterStyle);

// --- Undo Button UI ---
const undoButton = document.createElement('button');
const undoButtonLTRPosition = {
  position: 'absolute',
  top: '50px',
  right: '10px',
  left: 'auto',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  zIndex: '2000',
};
const undoButtonRTLPosition = {
  position: 'absolute',
  top: '50px',
  left: '10px',
  right: 'auto',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  zIndex: '2000',
};

const updateUndoButtonStyle = () => {
  Object.assign(undoButton.style, {
    background: getThemeColor('buttonBg'),
    color: getThemeColor('textColor'),
    fontFamily: getCSSFontFamily(getCurrentLanguage()),
    fontSize: '14px',
    border: `2px solid ${getThemeColor('buttonBorder')}`,
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    ...undoButtonLTRPosition,
  });
  // Ensure RTL/LTR positioning is correct after applying base styles
  updateRTLPosition(undoButton, undoButtonLTRPosition, undoButtonRTLPosition);
};

function updateUndoButton() {
  undoButton.textContent = t('ui.undo');
  undoButton.style.fontFamily = getCSSFontFamily(getCurrentLanguage());
  undoButton.disabled = actionHistory.length === 0;
  undoButton.style.opacity = actionHistory.length === 0 ? '0.5' : '1';
  undoButton.style.cursor = actionHistory.length === 0 ? 'not-allowed' : 'pointer';
  updateRTLPosition(undoButton, undoButtonLTRPosition, undoButtonRTLPosition);
}

undoButton.addEventListener('mouseenter', () => {
  if (actionHistory.length > 0) {
    undoButton.style.borderColor = getThemeColor('buttonBorderHover');
    undoButton.style.backgroundColor = getThemeColor('buttonBgHover');
  }
});
undoButton.addEventListener('mouseleave', () => {
  undoButton.style.borderColor = getThemeColor('buttonBorder');
  undoButton.style.backgroundColor = getThemeColor('buttonBg');
});

undoButton.addEventListener('click', () => {
  if (actionHistory.length === 0 || gameOver) return;
  undoLastAction();
});

updateUndoButtonStyle();
// Text content will be set after translations load (see async init below)
undoButton.textContent = 'Undo'; // Temporary placeholder
document.body.appendChild(undoButton);
window.addEventListener('themeChanged', updateUndoButtonStyle);

window.addEventListener('languageChanged', () => {
  updateMoveCounter();
});

window.addEventListener('languageChanged', () => {
  updateUndoButton();
});

window.addEventListener('languageChanged', () => {
  message.style.fontFamily = getCSSFontFamily(getCurrentLanguage());
});

// --- Update 3D Scene Theme ---
function updateSceneTheme() {
  applySceneTheme(scene, lights);
  updateGameObjectTheme();
}

function updateGameObjectTheme() {
  const colors = getGameObjectColors();

  // Update platform color
  if (physicsObjects.platform?.mesh?.material) {
    physicsObjects.platform.mesh.material.color.setHex(colors.platformColor);
  }

  // Update block color
  if (physicsObjects.block?.mesh?.material) {
    physicsObjects.block.mesh.material.color.setHex(colors.blockColor);
  }

  // Update goal color
  if (physicsObjects.goal?.mesh?.material) {
    physicsObjects.goal.mesh.material.color.setHex(colors.goalColor);
  }

  // Update teleporter color
  if (physicsObjects.teleporter?.mesh?.material) {
    physicsObjects.teleporter.mesh.material.color.setHex(colors.teleporterColor);
  }
}

window.addEventListener('themeChanged', updateSceneTheme);

// --- Undo Function ---
function undoLastAction() {
  if (actionHistory.length === 0) return;

  const lastAction = actionHistory.pop();

  if (lastAction.type === 'move') {
    // Undo player move: restore previous position
    if (physicsObjects.player && lastAction.data.previousPosition) {
      const pos = lastAction.data.previousPosition;
      physicsObjects.player.body.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
      physicsObjects.player.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      physicsObjects.player.body.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Undo block position if it was moved during this action
      if (physicsObjects.block && lastAction.data.previousBlockPosition) {
        const blockPos = lastAction.data.previousBlockPosition;
        physicsObjects.block.body.setTranslation(
          { x: blockPos.x, y: blockPos.y, z: blockPos.z },
          true
        );
        physicsObjects.block.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        physicsObjects.block.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Despawn key if it was spawned during this move
      if (keySpawned && !lastAction.data.keyWasSpawned) {
        if (physicsObjects.key) {
          physicsObjects.key.destroy();
          physicsObjects.key = null;
        }
        keySpawned = false;
      }

      // Decrement move counter
      moveCount = Math.max(0, moveCount - 1);
      updateMoveCounter();
    }
  } else if (lastAction.type === 'keyPickup') {
    // Undo key pickup: remove from inventory and respawn key
    inventory.removeLastItem('key');

    if (lastAction.data.keyPosition && !physicsObjects.key) {
      const keyPosition = new THREE.Vector3(
        lastAction.data.keyPosition.x,
        lastAction.data.keyPosition.y,
        lastAction.data.keyPosition.z
      );
      physicsObjects.key = new Key(world, scene, keyPosition);
      physicsObjects.key.onClick = () => {
        inventory.addItem('key');
        saveGame();
      };
      keySpawned = true;
    }
  }

  updateUndoButton();
  saveGame();
}

// --- Clear Scene Function ---
function clearScene() {
  // Remove any win/lose screen overlays
  if (window.__winScreenOverlay) {
    window.__winScreenOverlay.remove();
    window.__winScreenOverlay = null;
  }
  if (window.__loseScreenOverlay) {
    window.__loseScreenOverlay.remove();
    window.__loseScreenOverlay = null;
  }

  // Clear all Three.js scene objects (including GameLoseScene sprites)
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
  }

  // Clear physics objects
  if (world) {
    Object.values(physicsObjects).forEach(obj => {
      if (obj && obj.collider) world.removeCollider(obj.collider, true);
      if (obj && obj.body) world.removeRigidBody(obj.body);
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
  actionHistory = [];
  updateUndoButton();
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

  // Apply theme colors to game objects
  updateGameObjectTheme();
  applySceneTheme(scene, lights);

  physicsObjects.teleporter.onPlayerEnter = () => {
    showMessage(message, t('teleporter.scene2'));
    gameOver = true;
    loadScene(2);
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

  // Apply theme colors to game objects
  updateGameObjectTheme();
  applySceneTheme(scene, lights);

  physicsObjects.teleporter.onPlayerEnter = () => {
    showMessage(message, t('teleporter.scene1'));
    gameOver = true;
    loadScene(1);
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
        import('./i18n/translations.js').then(({ t }) =>
          showWinScreen(scene, t('game.win'), moveCount)
        );
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
phaserContainer.style.zIndex = '2'; // Ensure input layer is above canvas
document.body.appendChild(phaserContainer);

renderer.render(scene, camera);

(async () => {
  initTheme(); // Initialize theme system first
  await initTranslations();
  initLanguageSelector();
  document.title = t('page.title');
  inventory.updatePosition?.();
  updateMoveCounter(); // Update move counter with translations
  updateUndoButton(); // Update undo button with translations
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
      // Track key pickup action for undo
      actionHistory.push({
        type: 'keyPickup',
        data: {
          keyPosition: { x: keyPosition.x, y: keyPosition.y, z: keyPosition.z },
        },
      });
      inventory.addItem('key');
      updateUndoButton();
      saveGame();
    };
    keySpawned = true;
  }

  if (!gameOver && physicsObjects.teleporter?.isPlayerTouching(world, physicsObjects.player))
    physicsObjects.teleporter.trigger();

  const wasGameOver = gameOver;
  gameOver = isGameOver(physicsObjects, message);

  // Show lose screen when game over is triggered
  if (gameOver && !wasGameOver) {
    import('./GameLoseScene.js').then(({ showLoseScreen }) => {
      showLoseScreen(
        scene,
        t('game.lose'),
        () => {
          // Reset game state and reload scene 1
          gameOver = false;
          keySpawned = false;
          moveCount = 0;
          inventory.clear(); // Clear inventory on retry
          updateMoveCounter();
          loadScene(1);
        },
        camera
      );
    });
  }

  renderer.render(scene, camera);
}
