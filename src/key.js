import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Key class that manages a clickable 3D key object
 */
export class Key {
  constructor(world, scene, position) {
    this.world = world;
    this.scene = scene;
    this.pickedUp = false; // Prevent multiple pickups

    // Key head
    const headGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.3);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const head = new THREE.Mesh(headGeometry, headMaterial);

    // Key shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16);
    const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.3;

    // Key tip
    const tipGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.2, 16);
    const tipMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.rotation.z = Math.PI / 2;
    tip.position.x = 0.6;

    // Invisible hitbox for raycasting clicks
    const hitboxGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.5);
    const hitboxMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    });
    const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
    hitbox.position.x = 0.3;

    this.hitbox = hitbox; // Store hitbox reference

    // Group all parts
    this.mesh = new THREE.Group();
    this.mesh.add(head, shaft, tip, hitbox);
    this.mesh.position.set(position.x, position.y, position.z);
    scene.add(this.mesh);

    // Physics
    const keyBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x,
      position.y,
      position.z
    );
    this.body = world.createRigidBody(keyBodyDesc);
    const keyColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.1, 0.15).setSensor(true);
    this.collider = world.createCollider(keyColliderDesc, this.body);

    // Default onClick (will be replaced in main.js)
    this.onClick = null;
  }

  /**
   * Checks if the key was clicked
   * Only allows one click per key
   * @param {THREE.Raycaster} raycaster
   * @returns {boolean} True if clicked
   */
  checkClick(raycaster) {
    if (this.pickedUp || !this.hitbox) return false; // Already picked up

    const intersects = raycaster.intersectObject(this.hitbox, false);
    if (intersects.length > 0) {
      this.pickedUp = true; // Mark as picked up
      if (this.onClick) this.onClick();

      // Immediately disable references to prevent multiple triggers
      this.onClick = null;
      this.hitbox = null;

      return true;
    }
    return false;
  }

  /**
   * Removes key from scene and physics
   */
  destroy() {
    if (this.collider) this.world.removeCollider(this.collider);
    if (this.body) this.world.removeRigidBody(this.body);
    if (this.mesh) this.scene.remove(this.mesh);

    this.mesh = null;
    this.hitbox = null;
    this.onClick = null;
  }
}
