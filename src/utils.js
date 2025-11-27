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
 * Displays a message to the user
 * @param {HTMLElement} messageElement - The message DOM element
 * @param {string} text - The message text to display
 */
export function showMessage(messageElement, text) {
  messageElement.textContent = text;
  messageElement.style.display = 'block';
}

/**
 * Checks if the block is at the goal
 * @param {Object} physicsObjects - Physics objects (block, goal)
 * @returns {boolean} True if block is at goal, false otherwise
 */
export function checkBlockGoal(physicsObjects) {
  return physicsObjects.block?.isAtGoal(physicsObjects.goal?.mesh) ?? false;
}

/**
 * Checks if the game is over (player or block is off the platform)
 * @param {Object} physicsObjects - Physics objects (block, player, platform)
 * @param {HTMLElement} messageElement - The message DOM element
 * @returns {boolean} True if player or block is off the platform, false otherwise
 */
export function isGameOver(physicsObjects, messageElement) {
  const platformHalfSize = physicsObjects.platform?.halfSize;
  if (!platformHalfSize) return false;

  if (
    physicsObjects.block?.isOffPlatform(platformHalfSize) ||
    physicsObjects.player?.isOffPlatform(platformHalfSize)
  ) {
    showMessage(messageElement, 'You Lose!');
    return true;
  }

  return false;
}
