import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { inventory } from './inventory.js';

export class LockedDoor {
  constructor(world, scene, player, destination, position = new THREE.Vector3(0, 0, 0)) {
    this.world = world;
    this.scene = scene;
    this.player = player;
    this.destination = destination.clone();

    this.unlocked = false;
    this.fadedOut = false;
    this.fadeAmount = 1;
    this.onWin = null; // 🚀 callback when the player wins

    // ----- 3D Mesh -----
    const geometry = new THREE.BoxGeometry(1, 2, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x553300,
      transparent: true,
      opacity: 1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    // ----- Sensor Body -----
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x,
      position.y,
      position.z
    );
    this.body = world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 1, 0.1).setSensor(true);

    this.collider = world.createCollider(colliderDesc, this.body);
  }

  isPlayerTouching() {
    if (!this.player || !this.player.collider) return false;
    return this.world.intersectionPair(this.collider, this.player.collider);
  }

  update() {
    // (1) Door locked → touching → check for key
    if (!this.unlocked && this.isPlayerTouching()) {
      if (this.playerHasKey()) {
        this.unlocked = true;
      }
    }

    // (2) Fade out animation
    if (this.unlocked && !this.fadedOut) {
      this.fadeAmount -= 0.02;
      this.mesh.material.opacity = Math.max(0, this.fadeAmount);

      if (this.fadeAmount <= 0) {
        this.fadedOut = true; // unlocked + invisible
      }
    }

    // (3) After fading → walking into it makes you win
    if (this.fadedOut && this.isPlayerTouching()) {
      if (this.onWin) this.onWin(); // 🚀 CALL WIN FUNCTION
    }
  }

  playerHasKey() {
    // Adjust only if your key UI is different
    return inventory.slots.some(slot => slot.firstChild && slot.firstChild.dataset.item === 'key');
  }
}
