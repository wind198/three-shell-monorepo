import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { add, group, place, repeat, rotate, row, stack } from '../src/helpers';

describe('thin Three.js assembly helpers', () => {
  it('creates named groups and attaches actual object instances', () => {
    const a = new THREE.Group();
    const b = new THREE.Group();
    const root = group('House', a);
    expect(root.name).toBe('House');
    expect(add(root, b)).toBe(root);
    expect(root.children).toEqual([a, b]);
    expect(a.parent).toBe(root);
  });
  it('edits transforms in place', () => {
    const child = new THREE.Group();
    expect(place(child, 2, 3, 4)).toBe(child);
    expect(rotate(child, 0, Math.PI / 2, 0)).toBe(child);
    expect(child.position.toArray()).toEqual([2, 3, 4]);
    expect(child.rotation.y).toBeCloseTo(Math.PI / 2);
  });
  it('always creates independent repeated instances', () => {
    const result = repeat(3, index => {
      const child = new THREE.Group();
      child.name = 'Shop-' + index;
      return child;
    });
    expect(result.map(x => x.name)).toEqual(['Shop-0','Shop-1','Shop-2']);
    expect(new Set(result).size).toBe(3);
    expect(repeat(0, () => new THREE.Group())).toEqual([]);
    expect(() => repeat(-1, () => new THREE.Group())).toThrow(RangeError);
    expect(() => repeat(1.5, () => new THREE.Group())).toThrow(RangeError);
  });
  it('lays out a centered row while preserving local Z/Y', () => {
    const children = repeat(3, () => place(new THREE.Group(), 4, 3, 9));
    const result = row(children, 2.5);
    expect(result.children).toHaveLength(3);
    expect(children.map(x => x.position.x)).toEqual([-2.5,0,2.5]);
    expect(children.every(x => x.position.y === 3 && x.position.z === 9)).toBe(true);
    expect(() => row(children, 0)).toThrow(RangeError);
  });
  it('stacks along Y without altering X/Z', () => {
    const children = repeat(3, () => place(new THREE.Group(), 2, 0, 5));
    const result = stack(children, 2.4);
    expect(result.children).toHaveLength(3);
    expect(children.map(x => x.position.y)).toEqual([0,2.4,4.8]);
    expect(children.every(x => x.position.x === 2 && x.position.z === 5)).toBe(true);
  });
});
