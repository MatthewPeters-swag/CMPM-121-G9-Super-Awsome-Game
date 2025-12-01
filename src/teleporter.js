import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Teleporter class that manages the teleporter sensor
 */
export class Teleporter {
  /**
   * Creates a new Teleporter instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {number} platformTop - The Y position of the platform top surface
   * @param {THREE.Vector3} position - Position of the teleporter (optional, defaults to top left corner)
   */
  constructor(world, scene, platformTop, position = new THREE.Vector3(-4, 0, -4)) {
    // Create light blue cylindrical teleporter mesh
    const teleporterGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16);
    const teleporterMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb, // Light blue color
      transparent: true,
      opacity: 0.7,
    });
    this.mesh = new THREE.Mesh(teleporterGeometry, teleporterMaterial);
    this.mesh.position.set(position.x, platformTop + 0.4, position.z);
    scene.add(this.mesh);

    // Create physics body as a sensor (non-solid but detects collisions)
    const teleporterBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );
    this.body = world.createRigidBody(teleporterBodyDesc);
    const teleporterColliderDesc = RAPIER.ColliderDesc.cylinder(0.4, 0.5).setSensor(true);
    this.collider = world.createCollider(teleporterColliderDesc, this.body);

    // Callback for when player enters teleporter
    this.onPlayerEnter = null;
  }

  /**
   * Check if the player is colliding with the teleporter
   * @param {RAPIER.World} world - The physics world
   * @param {Object} player - The player object with a collider
   * @returns {boolean} - True if player is touching the teleporter
   */
  isPlayerTouching(world, player) {
    if (!player || !player.collider) return false;

    return world.intersectionPair(this.collider, player.collider);
  }

  /**
   * Trigger the teleporter event
   */
  trigger() {
    if (this.onPlayerEnter) {
      this.onPlayerEnter();
    }
  }
}
