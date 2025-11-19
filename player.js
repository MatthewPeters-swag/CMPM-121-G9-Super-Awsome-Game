import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Creates and manages the player physics body and Three.js mesh
 * @param {RAPIER.World} world - The Rapier physics world
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} platformTop - The Y position of the platform top surface
 * @param {number} friction - The friction coefficient for the player
 * @returns {Object} Object containing playerBody, playerCollider, and playerMesh
 */
export function createPlayer(world, scene, platformTop, friction = 0.75) {
  // Create player mesh
  const playerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
  playerMesh.position.set(0, platformTop + 0.3, 2);
  scene.add(playerMesh);

  // Create player physics body
  const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setLinearDamping(0.3) // Reduced damping to maintain momentum better
    .setAngularDamping(0.8)
    .setTranslation(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z);
  const playerBody = world.createRigidBody(playerBodyDesc);
  const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3).setFriction(friction);
  const playerCollider = world.createCollider(playerColliderDesc, playerBody);

  return {
    body: playerBody,
    collider: playerCollider,
    mesh: playerMesh,
  };
}

/**
 * Handles player movement based on click input
 * @param {RAPIER.RigidBody} playerBody - The player's physics body
 * @param {THREE.Vector3} clickPoint - The 3D point where the user clicked
 * @param {THREE.Mesh} platformMesh - The platform mesh (for height reference)
 * @param {Object} config - Movement configuration
 * @param {number} config.moveForce - Base force multiplier
 * @param {number} config.maxForce - Maximum force cap
 */
export function movePlayer(playerBody, clickPoint, platformMesh, config = {}) {
  const { moveForce = 1.0, maxForce = 3.0 } = config;

  // Calculate direction from player to click point
  const playerPos = playerBody.translation();
  const dir = new THREE.Vector3(
    clickPoint.x - playerPos.x,
    0, // Only horizontal movement
    clickPoint.z - playerPos.z
  );

  const distance = dir.length();

  if (distance > 0.1) {
    dir.normalize();
    // Scale force based on distance, capped at max force
    const scaledForce = Math.min(distance * moveForce, maxForce);
    // Apply impulse once on mouse down - impulse needs to be strong enough for momentum
    const impulse = new RAPIER.Vector3(dir.x * scaledForce, 0, dir.z * scaledForce);
    playerBody.applyImpulse(impulse, true);
  }
}

/**
 * Updates the player's Three.js mesh to match its physics body position and rotation
 * @param {RAPIER.RigidBody} playerBody - The player's physics body
 * @param {THREE.Mesh} playerMesh - The player's Three.js mesh
 */
export function updatePlayerVisual(playerBody, playerMesh) {
  if (!playerBody || !playerMesh) return;

  const playerPos = playerBody.translation();
  playerMesh.position.set(playerPos.x, playerPos.y, playerPos.z);
  const playerRot = playerBody.rotation();
  playerMesh.quaternion.set(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
}

/**
 * Checks if the player has fallen off the platform
 * @param {RAPIER.RigidBody} playerBody - The player's physics body
 * @param {number} platformHalfSize - Half the size of the platform (for boundary checking)
 * @returns {boolean} True if player is off the platform
 */
export function isPlayerOffPlatform(playerBody, platformHalfSize) {
  if (!playerBody) return false;

  const playerPos = playerBody.translation();
  return (
    playerPos.x < -platformHalfSize ||
    playerPos.x > platformHalfSize ||
    playerPos.z < -platformHalfSize ||
    playerPos.z > platformHalfSize
  );
}
