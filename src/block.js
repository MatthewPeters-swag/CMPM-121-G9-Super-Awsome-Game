import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

export class Block {
  constructor(world, scene, platformTop, config = {}) {
    const { linearDamping = 0.2, angularDamping = 0.3, friction = 0.3, density = 0.5 } = config;

    this.scene = scene;
    this.world = world;

    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    this.mesh = new THREE.Mesh(blockGeometry, blockMaterial);
    this.mesh.position.y = platformTop + 0.5;
    scene.add(this.mesh);

    const blockBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(linearDamping)
      .setAngularDamping(angularDamping)
      .setTranslation(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    this.body = world.createRigidBody(blockBodyDesc);
    const blockColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
      .setFriction(friction)
      .setDensity(density);
    this.collider = world.createCollider(blockColliderDesc, this.body);
  }

  updateVisual() {
    if (!this.body || !this.mesh) return;
    const pos = this.body.translation();
    this.mesh.position.set(pos.x, pos.y, pos.z);
    const rot = this.body.rotation();
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }

  isAtGoal(goalMesh, threshold = 0.8) {
    if (!this.body || !goalMesh) return false;
    const b = this.body.translation();
    const g = goalMesh.position;
    const dist = Math.sqrt(
      Math.pow(b.x - g.x, 2) + Math.pow(b.y - g.y, 2) + Math.pow(b.z - g.z, 2)
    );
    return dist < threshold;
  }

  isOffPlatform(platformHalfSize) {
    if (!this.body) return false;
    const pos = this.body.translation();
    return (
      pos.x < -platformHalfSize ||
      pos.x > platformHalfSize ||
      pos.z < -platformHalfSize ||
      pos.z > platformHalfSize
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
