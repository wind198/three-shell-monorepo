import type * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';

export interface SimulationEntity {
  id: string;
  mesh: THREE.Mesh;
  body: RAPIER.RigidBody;
  previousPosition: THREE.Vector3;
  previousRotation: THREE.Quaternion;
}
