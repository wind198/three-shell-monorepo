import * as THREE from 'three';

// Immutable low-poly geometries are shared by all assemblies. Never dispose these per instance.
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 8);
const CANOPY = new THREE.IcosahedronGeometry(1, 0);
export const PALETTE = {
  mint: '#8FD6BE', foliage: '#6EBF8B', deepFoliage: '#5BAF86',
  oak: '#D9A86C', cream: '#F2E8D5', white: '#FFF8EC',
  coral: '#F29B91', orange: '#F4B183', yellow: '#F7D774',
  sky: '#9ACDE8', stone: '#C9CED3', charcoal: '#4E5962', soil: '#735B4B',
} as const;
export function matte(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 });
}
export function box(
  parent: THREE.Group, name: string, position: readonly [number,number,number],
  size: readonly [number,number,number], material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(BOX, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...size);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function tree(name: string, height = 2.1): THREE.Group {
  const result = new THREE.Group();
  result.name = name;
  const trunk = new THREE.Mesh(CYLINDER, matte(PALETTE.oak));
  trunk.name = 'Trunk';
  trunk.scale.set(.095, height*.47, .095);
  trunk.position.y = height*.235;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  result.add(trunk);
  const crown = new THREE.Mesh(CANOPY, matte(PALETTE.foliage));
  crown.name = 'Canopy';
  crown.position.y = height*.74;
  crown.scale.set(.58, height*.29, .55);
  crown.castShadow = true;
  crown.receiveShadow = true;
  result.add(crown);
  return result;
}
export function streetLamp(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'StreetLamp';
  const dark = matte(PALETTE.charcoal);
  const warm = matte(PALETTE.yellow);
  box(group, 'Pole', [0, 1.45, 0], [.09, 2.9, .09], dark);
  box(group, 'Arm', [.30, 2.85, 0], [.65, .08, .09], dark);
  box(group, 'Lamp', [.60, 2.76, 0], [.27, .13, .24], warm);
  return group;
}
/** Factories own their per-instance materials, but NOT the shared geometries above. */
export function disposeAssembly(group: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  group.traverse(object => {
    if (object instanceof THREE.Mesh) {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
      }
    }
  });
  for (const material of materials) material.dispose();
}
export function positive(name: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + ' must be finite and positive');
  return value;
}
export function whole(name: string, value: number, max = 24): number {
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new RangeError(name + ' must be an integer between 1 and ' + max);
  }
  return value;
}
