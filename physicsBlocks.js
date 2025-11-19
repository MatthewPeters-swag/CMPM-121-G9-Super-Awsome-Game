import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Creates the platform (ground) physics body and Three.js mesh
 * @param {RAPIER.World} world - The Rapier physics world
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} Object containing platformCollider, platformBody, platformMesh, and platformTop
 */
export function createPlatform(world, scene) {
  const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10);
  const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
  const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
  platformMesh.position.y = -1;
  scene.add(platformMesh);

  const platformTop = platformMesh.position.y + platformGeometry.parameters.height / 2;

  // Create static platform physics body
  const platformColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.25, 5);
  const platformBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    platformMesh.position.x,
    platformMesh.position.y,
    platformMesh.position.z
  );
  const platformBody = world.createRigidBody(platformBodyDesc);
  const platformCollider = world.createCollider(platformColliderDesc, platformBody);

  return {
    body: platformBody,
    collider: platformCollider,
    mesh: platformMesh,
    top: platformTop,
    halfSize: 5,
  };
}

/**
 * Creates a movable physics block
 * @param {RAPIER.World} world - The Rapier physics world
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} platformTop - The Y position of the platform top surface
 * @param {Object} config - Block configuration
 * @param {number} config.linearDamping - Linear damping coefficient
 * @param {number} config.angularDamping - Angular damping coefficient
 * @param {number} config.friction - Friction coefficient
 * @param {number} config.density - Density of the block
 * @returns {Object} Object containing blockBody, blockCollider, and blockMesh
 */
export function createBlock(world, scene, platformTop, config = {}) {
  const { linearDamping = 0.2, angularDamping = 0.3, friction = 0.3, density = 0.5 } = config;

  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
  blockMesh.position.y = platformTop + 0.5;
  scene.add(blockMesh);

  const blockBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setLinearDamping(linearDamping)
    .setAngularDamping(angularDamping)
    .setTranslation(blockMesh.position.x, blockMesh.position.y, blockMesh.position.z);
  const blockBody = world.createRigidBody(blockBodyDesc);
  const blockColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
    .setFriction(friction)
    .setDensity(density);
  const blockCollider = world.createCollider(blockColliderDesc, blockBody);

  return {
    body: blockBody,
    collider: blockCollider,
    mesh: blockMesh,
  };
}

/**
 * Creates the goal area (sensor for win condition)
 * @param {RAPIER.World} world - The Rapier physics world
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} platformTop - The Y position of the platform top surface
 * @param {THREE.Vector3} position - Position of the goal (optional, defaults to (3, 0, -2))
 * @returns {Object} Object containing goalBody, goalCollider, and goalMesh
 */
export function createGoal(world, scene, platformTop, position = new THREE.Vector3(3, 0, -2)) {
  const goalGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const goalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff55 });
  const goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
  goalMesh.position.set(position.x, platformTop + 0.05, position.z);
  scene.add(goalMesh);

  const goalBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    goalMesh.position.x,
    goalMesh.position.y,
    goalMesh.position.z
  );
  const goalBody = world.createRigidBody(goalBodyDesc);
  const goalColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.05, 0.5).setSensor(true);
  const goalCollider = world.createCollider(goalColliderDesc, goalBody);

  return {
    body: goalBody,
    collider: goalCollider,
    mesh: goalMesh,
  };
}

/**
 * Updates the block's Three.js mesh to match its physics body position and rotation
 * @param {RAPIER.RigidBody} blockBody - The block's physics body
 * @param {THREE.Mesh} blockMesh - The block's Three.js mesh
 */
export function updateBlockVisual(blockBody, blockMesh) {
  if (!blockBody || !blockMesh) return;

  const blockPos = blockBody.translation();
  blockMesh.position.set(blockPos.x, blockPos.y, blockPos.z);
  const blockRot = blockBody.rotation();
  blockMesh.quaternion.set(blockRot.x, blockRot.y, blockRot.z, blockRot.w);
}

/**
 * Checks if the block has reached the goal area
 * @param {RAPIER.RigidBody} blockBody - The block's physics body
 * @param {THREE.Mesh} goalMesh - The goal mesh
 * @param {number} threshold - Distance threshold for win condition (default: 0.8)
 * @returns {boolean} True if block is at goal
 */
export function isBlockAtGoal(blockBody, goalMesh, threshold = 0.8) {
  if (!blockBody || !goalMesh) return false;

  const blockPos = blockBody.translation();
  const goalPos = goalMesh.position;
  const goalDist = Math.sqrt(
    Math.pow(blockPos.x - goalPos.x, 2) +
      Math.pow(blockPos.y - goalPos.y, 2) +
      Math.pow(blockPos.z - goalPos.z, 2)
  );

  return goalDist < threshold;
}

/**
 * Checks if the block has fallen off the platform
 * @param {RAPIER.RigidBody} blockBody - The block's physics body
 * @param {number} platformHalfSize - Half the size of the platform (for boundary checking)
 * @returns {boolean} True if block is off the platform
 */
export function isBlockOffPlatform(blockBody, platformHalfSize) {
  if (!blockBody) return false;

  const blockPos = blockBody.translation();
  return (
    blockPos.x < -platformHalfSize ||
    blockPos.x > platformHalfSize ||
    blockPos.z < -platformHalfSize ||
    blockPos.z > platformHalfSize
  );
}
