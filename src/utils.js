/**
 * Utility functions for game logic and UI management
 */

/**
 * Handles window resize events
 * @param {THREE.PerspectiveCamera} camera - The Three.js camera
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @param {Phaser.Game} game - The Phaser game instance
 */
export function handleResize(camera, renderer, game) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  game.scale.resize(window.innerWidth, window.innerHeight);
}

/**
 * Checks game win/loss conditions
 * @param {Object} state - Game state object
 * @param {boolean} state.gameOver - Whether the game is over
 * @param {Object} state.physicsObjects - Physics objects (block, player, goal, platform)
 * @param {Function} state.showMessage - Function to display game messages
 * @returns {boolean} True if a game condition was triggered
 */
export function checkGameConditions({ gameOver, physicsObjects, showMessage }) {
  if (gameOver) return false;

  // Check win condition (block touches goal)
  if (physicsObjects.block?.isAtGoal(physicsObjects.goal?.mesh)) {
    showMessage('You Win!');
    return true;
  }

  // Check loss conditions
  const platformHalfSize = physicsObjects.platform?.halfSize;
  if (!platformHalfSize) return false;

  if (physicsObjects.block?.isOffPlatform(platformHalfSize)) {
    showMessage('You Lose!');
    return true;
  }

  if (physicsObjects.player?.isOffPlatform(platformHalfSize)) {
    showMessage('You Lose!');
    return true;
  }

  return false;
}
