import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Platform class that manages the ground platform
 */
export class Platform {
  /**
   * Creates a new Platform instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   */
  constructor(world, scene) {
    const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    this.mesh = new THREE.Mesh(platformGeometry, platformMaterial);
    this.mesh.position.y = -1;
    scene.add(this.mesh);

    this.top = this.mesh.position.y + platformGeometry.parameters.height / 2;
    this.halfSize = 5;

    // Create static platform physics body
    const platformColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.25, 5);
    const platformBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );
    this.body = world.createRigidBody(platformBodyDesc);
    this.collider = world.createCollider(platformColliderDesc, this.body);
  }
}
