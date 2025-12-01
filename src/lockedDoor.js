import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { inventory } from './InventoryUI.js';

export class LockedDoor {
  /**
   * @param {RAPIER.World} world
   * @param {THREE.Scene} scene
   * @param {Object} player - Your existing Player instance
   * @param {THREE.Vector3} destination - Where player should appear after unlocking
   * @param {THREE.Vector3} position - Door location
   */
  constructor(world, scene, player, destination, position = new THREE.Vector3(0, 0, 0)) {
    this.world = world;
    this.scene = scene;
    this.player = player;
    this.destination = destination.clone();

    this.unlocked = false;
    this.fadeAmount = 1;

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

  /**
   * Check if player is touching the door
   */
  isPlayerTouching() {
    if (!this.player || !this.player.collider) return false;
    return this.world.intersectionPair(this.collider, this.player.collider);
  }

  /**
   * Call this every frame from your game loop
   */
  update() {
    // If locked and player touches → check for key
    if (!this.unlocked && this.isPlayerTouching()) {
      if (this.playerHasKey()) {
        this.unlocked = true; // begin fade-out
      }
    }

    // If unlocked → fade the door out
    if (this.unlocked && this.fadeAmount > 0) {
      this.fadeAmount -= 0.02;
      this.mesh.material.opacity = Math.max(0, this.fadeAmount);

      // When fully faded → teleport + remove door
      if (this.fadeAmount <= 0) {
        this.teleportPlayer();
        this.removeDoor();
      }
    }
  }

  /**
   * Detect if inventory contains a key (no changes to inventory code)
   */
  playerHasKey() {
    // Adjust this only if YOUR key UI looks different
    return inventory.slots.some(slot => {
      return slot.firstChild && slot.firstChild.dataset.item === 'key';
    });
  }

  /**
   * Teleport the player
   */
  teleportPlayer() {
    if (!this.player?.body) return;

    this.player.body.setTranslation(
      { x: this.destination.x, y: this.destination.y, z: this.destination.z },
      true
    );

    // Sync mesh manually (Player.js will update rotation automatically)
    if (this.player.mesh) {
      this.player.mesh.position.copy(this.destination);
    }
  }

  /**
   * Remove door from scene & physics
   */
  removeDoor() {
    this.scene.remove(this.mesh);
    this.world.removeCollider(this.collider, true);
    this.world.removeRigidBody(this.body);
  }
}
