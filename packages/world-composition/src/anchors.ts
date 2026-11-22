import * as THREE from 'three';
import type { TransformSpec, Vec3 } from './types';

export function setAnchors(group: THREE.Group, anchors: Record<string, Vec3>): void {
  group.userData.anchors = Object.fromEntries(Object.entries(anchors).map(([k,v])=>[k,[...v]]));
}
export function anchorLocal(group: THREE.Object3D, name: string): THREE.Vector3 {
  const map: Record<string, Vec3> | undefined = group.userData.anchors;
  const coords = map?.[name];
  if (!coords) throw new Error('Unknown anchor ' + name + ' on ' + group.name);
  return new THREE.Vector3(...coords);
}
export function anchorWorld(group: THREE.Object3D, name: string): THREE.Vector3 {
  group.updateWorldMatrix(true, false);
  return anchorLocal(group, name).applyMatrix4(group.matrixWorld);
}
export function applyTransform(group: THREE.Group, transform: TransformSpec = {}): THREE.Group {
  if (transform.position) group.position.set(...transform.position);
  if (transform.rotation) group.rotation.set(...transform.rotation);
  if (transform.scale) {
    if (transform.scale.some(value => !Number.isFinite(value) || value <= 0)) throw new RangeError('Scale must be positive');
    group.scale.set(...transform.scale);
  }
  return group;
}
/** Align a moving assembly anchor to a fixed assembly anchor under arbitrary parents. */
export function snapAnchors(
  moving: THREE.Object3D, movingAnchor: string,
  fixed: THREE.Object3D, fixedAnchor: string,
): void {
  if (!moving.parent) throw new Error('Moving object must be attached to its parent before snapping');
  const target = anchorWorld(fixed, fixedAnchor);
  const current = anchorWorld(moving, movingAnchor);
  const delta = target.sub(current);
  moving.parent.updateWorldMatrix(true, false);
  const parentInverse = new THREE.Matrix4().copy(moving.parent.matrixWorld).invert();
  const localDelta = delta.applyMatrix3(new THREE.Matrix3().setFromMatrix4(parentInverse));
  moving.position.add(localDelta);
  moving.updateWorldMatrix(true, true);
}
