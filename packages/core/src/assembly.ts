/**
 * Thin Three.js assembly helpers. No configuration engine or separate runtime.
 * Available as @three-shell/core/assembly so host-neutral core APIs stay independent.
 * Each call uses ordinary Three.js objects and returns them for further imperative edits.
 */
import * as THREE from 'three';

type Object = THREE.Object3D;

/** A named group with child objects attached in the supplied order. */
export function group(name: string, ...children: readonly Object[]): THREE.Group {
  const root = new THREE.Group();
  root.name = name;
  if (children.length) root.add(...children);
  return root;
}

/** Attach children to an existing object and return that parent. */
export function add<T extends Object>(parent: T, ...children: readonly Object[]): T {
  parent.add(...children);
  return parent;
}

/** Set local position and return the same object. */
export function place<T extends Object>(object: T, x: number, y: number, z: number): T {
  object.position.set(x, y, z);
  return object;
}

/** Set local Euler rotation (radians) and return the same object. */
export function rotate<T extends Object>(object: T, x: number, y: number, z: number): T {
  object.rotation.set(x, y, z);
  return object;
}

/** Invoke the factory for every index; never clone a mesh or reuse one instance. */
export function repeat<T>(count: number, factory: (index: number) => T): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('repeat count must be a non-negative integer');
  }
  return Array.from({length: count}, (_, index) => factory(index));
}

/**
 * Arrange objects along X at a fixed center-to-center step. Does not measure
 * geometry or overwrite their Y/Z coordinates. Center the row around X=0.
 */
export function row<T extends Object>(children: readonly T[], step: number): THREE.Group {
  if (!Number.isFinite(step) || step <= 0) throw new RangeError('row step must be positive and finite');
  const root = group('Row');
  const start = -(children.length - 1) * step / 2;
  children.forEach((child, index) => {
    child.position.x = start + index * step;
    root.add(child);
  });
  return root;
}

/** Arrange objects along Y at a fixed base-to-base step; preserve their X/Z. */
export function stack<T extends Object>(children: readonly T[], step: number): THREE.Group {
  if (!Number.isFinite(step) || step <= 0) throw new RangeError('stack step must be positive and finite');
  const root = group('Stack');
  children.forEach((child, index) => {
    child.position.y = index * step;
    root.add(child);
  });
  return root;
}
