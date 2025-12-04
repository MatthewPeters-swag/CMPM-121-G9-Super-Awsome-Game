import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import { inventory } from './inventory.js';

export class LockedDoor {
  constructor(world, scene, player, destination, position = new THREE.Vector3(0, 0, 0)) {
    this.world = world;
    this.scene = scene;
    this.player = player;
    this.destination = destination ? destination.clone() : new THREE.Vector3(0, 0, 0);

    this.unlocked = false;
    this.fadedOut = false;
    this.fadeAmount = 1;
    this.onWin = null;

    // Purple door
    const geometry = new THREE.BoxGeometry(1, 2, 0.2);
    // Use an unlit material so the door remains visibly purple even without scene lighting
    const material = new THREE.MeshBasicMaterial({
      color: 0x8000ff, // purple
      transparent: true,
      opacity: 1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    // Rapier sensor collider
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
    if (!this.world) return;

    // If locked and touching, check for key and unlock
    if (!this.unlocked && this.isPlayerTouching()) {
      if (this.playerHasKey()) {
        this.unlocked = true;
        console.log('[LockedDoor] unlocked: player had the key');
      }
    }

    // Fade-out when unlocked
    if (this.unlocked && !this.fadedOut) {
      this.fadeAmount -= 0.02;
      this.mesh.material.opacity = Math.max(0, this.fadeAmount);

      if (this.fadeAmount <= 0) {
        this.fadedOut = true;
        console.log('[LockedDoor] faded out; collider removed');
        // remove collider so player can pass through
        if (this.collider) {
          this.world.removeCollider(this.collider, true);
          this.collider = null;
        }
      }
    }

    // After fade, if player overlaps, trigger win once
    if (this.fadedOut) {
      // We still use intersectionPair but if collider removed, fallback to distance check
      let touching = false;
      if (this.collider && this.player && this.player.collider) {
        touching = this.world.intersectionPair(this.collider, this.player.collider);
      } else if (this.player && this.player.body) {
        // Rapier: use translation() (not .position)
        const pos = this.player.body.translation();
        const d = this.mesh.position;
        const dx = pos.x - d.x;
        const dy = pos.y - d.y;
        const dz = pos.z - d.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        touching = dist < 1.2;
      }

      if (touching && this.onWin) {
        const cb = this.onWin;
        this.onWin = null; // prevent double-call
        console.log('[LockedDoor] triggering onWin callback');
        cb();
      }
    }
  }

  playerHasKey() {
    // Prefer a hasItem API if inventory has it
    if (inventory && typeof inventory.hasItem === 'function') {
      return inventory.hasItem('key');
    }

    // Fallback: check DOM icons placed into inventory slots
    if (inventory && Array.isArray(inventory.slots)) {
      return inventory.slots.some(slot => {
        const icon = slot.firstChild;
        if (!icon) return false;
        if (icon.dataset && icon.dataset.item) return icon.dataset.item === 'key';
        // fallback by style color
        const bg = icon.style && icon.style.backgroundColor;
        return bg && (bg === 'gold' || bg === 'rgb(255, 215, 0)');
      });
    }

    return false;
  }
}
