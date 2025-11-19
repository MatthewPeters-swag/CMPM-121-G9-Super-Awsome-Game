import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * PhysicsBlock class that manages a movable physics block
 */
export class Block {
  /**
   * Creates a new PhysicsBlock instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {number} platformTop - The Y position of the platform top surface
   * @param {Object} config - Block configuration
   * @param {number} config.linearDamping - Linear damping coefficient
   * @param {number} config.angularDamping - Angular damping coefficient
   * @param {number} config.friction - Friction coefficient
   * @param {number} config.density - Density of the block
   */
  constructor(world, scene, platformTop, config = {}) {
    const { linearDamping = 0.2, angularDamping = 0.3, friction = 0.3, density = 0.5 } = config;

    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    this.mesh = new THREE.Mesh(blockGeometry, blockMaterial);
    this.mesh.position.y = platformTop + 0.5;
    scene.add(this.mesh);

    const blockBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(linearDamping)
      .setAngularDamping(angularDamping)
      .setTranslation(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    this.body = world.createRigidBody(blockBodyDesc);
    const blockColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
      .setFriction(friction)
      .setDensity(density);
    this.collider = world.createCollider(blockColliderDesc, this.body);
  }

  /**
   * Updates the block's Three.js mesh to match its physics body position and rotation
   */
  updateVisual() {
    if (!this.body || !this.mesh) return;

    const blockPos = this.body.translation();
    this.mesh.position.set(blockPos.x, blockPos.y, blockPos.z);
    const blockRot = this.body.rotation();
    this.mesh.quaternion.set(blockRot.x, blockRot.y, blockRot.z, blockRot.w);
  }

  /**
   * Checks if the block has reached the goal area
   * @param {THREE.Mesh} goalMesh - The goal mesh
   * @param {number} threshold - Distance threshold for win condition (default: 0.8)
   * @returns {boolean} True if block is at goal
   */
  isAtGoal(goalMesh, threshold = 0.8) {
    if (!this.body || !goalMesh) return false;

    const blockPos = this.body.translation();
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
   * @param {number} platformHalfSize - Half the size of the platform (for boundary checking)
   * @returns {boolean} True if block is off the platform
   */
  isOffPlatform(platformHalfSize) {
    if (!this.body) return false;

    const blockPos = this.body.translation();
    return (
      blockPos.x < -platformHalfSize ||
      blockPos.x > platformHalfSize ||
      blockPos.z < -platformHalfSize ||
      blockPos.z > platformHalfSize
    );
  }
}
