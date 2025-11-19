import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Goal class that manages the goal area sensor
 */
export class Goal {
  /**
   * Creates a new Goal instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {number} platformTop - The Y position of the platform top surface
   * @param {THREE.Vector3} position - Position of the goal (optional, defaults to (3, 0, -2))
   */
  constructor(world, scene, platformTop, position = new THREE.Vector3(3, 0, -2)) {
    const goalGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const goalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff55 });
    this.mesh = new THREE.Mesh(goalGeometry, goalMaterial);
    this.mesh.position.set(position.x, platformTop + 0.05, position.z);
    scene.add(this.mesh);

    const goalBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );
    this.body = world.createRigidBody(goalBodyDesc);
    const goalColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.05, 0.5).setSensor(true);
    this.collider = world.createCollider(goalColliderDesc, this.body);
  }
}
