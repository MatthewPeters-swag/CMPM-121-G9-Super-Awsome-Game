import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Player class that manages the player's physics body and Three.js mesh
 */
export class Player {
  /**
   * Creates a new Player instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {number} platformTop - The Y position of the platform top surface
   * @param {Object} config - Player configuration
   * @param {number} config.friction - The friction coefficient for the player (default: 0.75)
   * @param {number} config.minForce - Base force multiplier for movement (default: 1.0)
   * @param {number} config.maxForce - Maximum force cap for far clicks (default: 3.0)
   * @param {number} config.linearDamping - Linear damping coefficient (default: 0.3)
   * @param {number} config.angularDamping - Angular damping coefficient (default: 0.8)
   */
  constructor(world, scene, platformTop, config = {}) {
    const {
      friction = 0.75,
      minForce = 1.0,
      maxForce = 3.0,
      linearDamping = 0.3,
      angularDamping = 0.8,
    } = config;

    // Store movement configuration
    this.minForce = minForce;
    this.maxForce = maxForce;

    // Create player mesh
    const playerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.mesh.position.set(0, platformTop + 0.3, 2);
    scene.add(this.mesh);

    // Create player physics body
    const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(linearDamping) // Reduced damping to maintain momentum better
      .setAngularDamping(angularDamping)
      .setTranslation(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    this.body = world.createRigidBody(playerBodyDesc);
    const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3).setFriction(friction);
    this.collider = world.createCollider(playerColliderDesc, this.body);
  }

  /**
   * Handles player movement based on click input
   * @param {THREE.Vector3} clickPoint - The 3D point where the user clicked
   */
  move(clickPoint) {
    // Calculate direction from player to click point
    const playerPos = this.body.translation();
    const dir = new THREE.Vector3(
      clickPoint.x - playerPos.x,
      0, // Only horizontal movement
      clickPoint.z - playerPos.z
    );

    const distance = dir.length();

    if (distance > 0.1) {
      dir.normalize();
      // Scale force based on distance, capped at max force
      const scaledForce = Math.min(distance * this.minForce, this.maxForce);
      // Apply impulse once on mouse down - impulse needs to be strong enough for momentum
      const impulse = new RAPIER.Vector3(dir.x * scaledForce, 0, dir.z * scaledForce);
      this.body.applyImpulse(impulse, true);
    }
  }

  /**
   * Updates the player's Three.js mesh to match its physics body position and rotation
   */
  updateVisual() {
    if (!this.body || !this.mesh) return;

    const playerPos = this.body.translation();
    this.mesh.position.set(playerPos.x, playerPos.y, playerPos.z);
    const playerRot = this.body.rotation();
    this.mesh.quaternion.set(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
  }

  /**
   * Checks if the player has fallen off the platform
   * @param {number} platformHalfSize - Half the size of the platform (for boundary checking)
   * @returns {boolean} True if player is off the platform
   */
  isOffPlatform(platformHalfSize) {
    if (!this.body) return false;

    const playerPos = this.body.translation();
    return (
      playerPos.x < -platformHalfSize ||
      playerPos.x > platformHalfSize ||
      playerPos.z < -platformHalfSize ||
      playerPos.z > platformHalfSize
    );
  }
}
