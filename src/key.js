import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

/**
 * Key class that manages a clickable 3D key object
 */
export class Key {
  /**
   * Creates a new Key instance
   * @param {RAPIER.World} world - The Rapier physics world
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {THREE.Vector3} position - Position of the key (x, y, z coordinates)
   */
  constructor(world, scene, position) {
    // Create a simple key shape using basic geometries
    // Key head (the part with the hole)
    const headGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.3);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Gold color
    const head = new THREE.Mesh(headGeometry, headMaterial);

    // Key shaft (the long part)
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16);
    const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2; // Rotate to be horizontal
    shaft.position.x = 0.3; // Position shaft extending from head

    // Key tip (the end of the shaft)
    const tipGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.2, 16);
    const tipMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.rotation.z = Math.PI / 2;
    tip.position.x = 0.6;

    // Combine all parts into a single group
    this.mesh = new THREE.Group();
    this.mesh.add(head);
    this.mesh.add(shaft);
    this.mesh.add(tip);

    // Set position
    this.mesh.position.set(position.x, position.y, position.z);

    // Add to scene
    scene.add(this.mesh);

    // Create a sensor collider for click detection (optional, but helps with physics interactions)
    const keyBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x,
      position.y,
      position.z
    );
    this.body = world.createRigidBody(keyBodyDesc);
    // Create a collider that roughly matches the key's bounding box
    const keyColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.1, 0.15).setSensor(true);
    this.collider = world.createCollider(keyColliderDesc, this.body);

    // Store click handler
    this.onClick = () => {
      console.log('Key clicked!');
    };
  }

  /**
   * Checks if the key was clicked based on raycast intersection
   * @param {THREE.Raycaster} raycaster - The raycaster to use for intersection testing
   * @returns {boolean} True if the key was intersected
   */
  checkClick(raycaster) {
    const intersects = raycaster.intersectObject(this.mesh, true);
    if (intersects.length > 0) {
      this.onClick();
      return true;
    }
    return false;
  }
}
