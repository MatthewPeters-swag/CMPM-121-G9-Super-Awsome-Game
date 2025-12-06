import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

export class Player {
  constructor(world, scene, platformTop, config = {}) {
    const {
      friction = 0.75,
      minForce = 1.0,
      maxForce = 3.0,
      linearDamping = 0.3,
      angularDamping = 0.8,
    } = config;

    this.minForce = minForce;
    this.maxForce = maxForce;
    this.scene = scene;
    this.world = world;

    const playerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.mesh.position.set(0, platformTop + 0.3, 2);
    scene.add(this.mesh);

    const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(linearDamping)
      .setAngularDamping(angularDamping)
      .setTranslation(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    this.body = world.createRigidBody(playerBodyDesc);
    const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3).setFriction(friction);
    this.collider = world.createCollider(playerColliderDesc, this.body);
  }

  move(clickPoint) {
    const playerPos = this.body.translation();
    const dir = new THREE.Vector3(clickPoint.x - playerPos.x, 0, clickPoint.z - playerPos.z);
    const distance = dir.length();
    if (distance > 0.1) {
      // Track previous position for undo
      const previousPosition = { x: playerPos.x, y: playerPos.y, z: playerPos.z };

      dir.normalize();
      const scaledForce = Math.min(distance * this.minForce, this.maxForce);
      const impulse = new RAPIER.Vector3(dir.x * scaledForce, 0, dir.z * scaledForce);
      this.body.applyImpulse(impulse, true);

      // Track move action for undo
      window.trackMoveAction?.(previousPosition);
      window.incrementMoveCount?.(); // Increment move counter
      window.saveGame?.(); // Auto-save on move
    }
  }

  updateVisual() {
    if (!this.body || !this.mesh) return;
    const playerPos = this.body.translation();
    this.mesh.position.set(playerPos.x, playerPos.y, playerPos.z);
    const playerRot = this.body.rotation();
    this.mesh.quaternion.set(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
  }

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

  // Save/load helpers
  getSaveData() {
    const pos = this.body.translation();
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  loadFromData(data) {
    if (!data) return;
    this.body.setTranslation({ x: data.x, y: data.y, z: data.z }, true);
  }
}
