import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

export class Key {
  constructor(world, scene, position, pickedUp = false) {
    this.world = world;
    this.scene = scene;
    this.pickedUp = pickedUp;

    if (pickedUp) return; // Already collected, don't spawn

    // Key head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    // Shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.3;
    // Tip
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    tip.rotation.z = Math.PI / 2;
    tip.position.x = 0.6;

    // Hitbox for raycast
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.x = 0.3;
    this.hitbox = hitbox;

    this.mesh = new THREE.Group();
    this.mesh.add(head, shaft, tip, hitbox);
    this.mesh.position.set(position.x, position.y, position.z);
    scene.add(this.mesh);

    const body = RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
    this.body = world.createRigidBody(body);
    const collider = RAPIER.ColliderDesc.cuboid(0.5, 0.1, 0.15).setSensor(true);
    this.collider = world.createCollider(collider, this.body);

    this.onClick = null;
  }

  checkClick(raycaster) {
    if (this.pickedUp || !this.hitbox) return false;
    const intersects = raycaster.intersectObject(this.hitbox, false);
    if (intersects.length > 0) {
      this.pickedUp = true;
      if (this.onClick) this.onClick();
      this.onClick = null;
      this.hitbox = null;
      window.saveGame?.(); // Auto-save on pickup
      return true;
    }
    return false;
  }

  destroy() {
    if (this.collider) this.world.removeCollider(this.collider);
    if (this.body) this.world.removeRigidBody(this.body);
    if (this.mesh) this.scene.remove(this.mesh);
    this.mesh = null;
    this.hitbox = null;
    this.onClick = null;
  }

  // Save/load helpers
  getSaveData() {
    return { pickedUp: this.pickedUp };
  }

  loadFromData(data) {
    if (data?.pickedUp) {
      this.pickedUp = true;
      if (this.mesh) this.scene.remove(this.mesh);
      this.mesh = null;
      this.hitbox = null;
    }
  }
}
