import * as THREE from 'three';

export type DoorVariant = 'single' | 'double' | 'sliding';

export interface DoorOptions {
  variant?: DoorVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}

/**
 * Low-poly wall door with a bottom-center origin (0, 0, 0).
 *
 * +Y is up, +Z is the visible/front side, and the door fills approximately
 * [-width/2, width/2] x [0, height] x [-depth/2, depth/2].
 * The rear mounting plane is z = -depth/2; position/rotate the returned group
 * so this plane meets the host wall. The opening is centered on local X=0.
 * Default catalog footprint: 0.95 x 0.12 x 2.10 world units.
 *
 * Variants are decorative, stationary representations:
 * - single: one hinged leaf, pivot on the left;
 * - double: two hinged leaves, pivots at the outside jambs;
 * - sliding: two parallel leaves with a small central overlap and top track.
 *
 * The unit box geometry is module-shared and must NOT be disposed per door.
 * Materials are owned by each returned group: on removal, dispose its unique
 * materials once; do not dispose the shared geometry. No animation is installed.
 */
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

export function createDoor(options: DoorOptions = {}): THREE.Group {
  const {
    variant = 'single',
    width = 0.95,
    depth = 0.12,
    height = 2.1,
    primaryColor = '#8FD6BE',
    secondaryColor = '#F2E8D5',
  } = options;

  if (!['single', 'double', 'sliding'].includes(variant)) {
    throw new RangeError('Door variant must be single, double, or sliding.');
  }
  if (
    !Number.isFinite(width) || width <= 0 ||
    !Number.isFinite(depth) || depth <= 0 ||
    !Number.isFinite(height) || height <= 0
  ) {
    throw new RangeError('Door dimensions must be positive, finite numbers.');
  }

  const root = new THREE.Group();
  root.name = `Door-${variant}`;
  root.userData.mountingPlaneZ = -depth / 2;
  root.userData.placement = 'wall';
  root.userData.variant = variant;

  const material = (color: THREE.ColorRepresentation): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 });

  const panelMaterial = material(primaryColor);
  const frameMaterial = material(secondaryColor);
  const handleMaterial = material('#4E5962');
  const hingeMaterial = material('#D9A86C');

  // All boxes reuse a single unit cube; geometry is never scaled negatively.
  const box = (
    parent: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    surface: THREE.MeshStandardMaterial,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(UNIT_BOX, surface);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Proportions scale with the specified envelope, including compact doors.
  const jamb = width * 0.065;
  const header = height * 0.045;
  const sill = height * 0.022;
  const openingWidth = width - 2 * jamb;
  const openingHeight = height - header - sill;
  const openingCenterY = sill + openingHeight / 2;
  const frameDepth = depth * 0.67;
  const frameZ = -depth / 2 + frameDepth / 2;
  const openingLeft = -openingWidth / 2;
  const openingRight = openingWidth / 2;

  // Flat, rear-flush frame: the top beam, jambs, and sill form one silhouette.
  box(root, 'Frame-LeftJamb', -width / 2 + jamb / 2, height / 2,
    frameZ, jamb, height, frameDepth, frameMaterial);
  box(root, 'Frame-RightJamb', width / 2 - jamb / 2, height / 2,
    frameZ, jamb, height, frameDepth, frameMaterial);
  box(root, 'Frame-Header', 0, height - header / 2,
    frameZ, openingWidth, header, frameDepth, frameMaterial);
  box(root, 'Frame-Threshold', 0, sill / 2,
    frameZ, openingWidth, sill, frameDepth, frameMaterial);

  const panelDepth = depth * 0.32;
  // Main leaf sits inside the frame depth and does not stick out of its back.
  const panelZ = -depth / 2 + frameDepth - panelDepth / 2;
  const clearance = Math.min(jamb * 0.085, openingWidth * 0.02);
  const handleDepth = depth * 0.13;
  const frontHandleZ = depth / 2 - handleDepth / 2;
  const handleHeight = height * 0.045;
  const handleWidth = width * 0.065;

  const addHandle = (parent: THREE.Group, name: string, x: number): void => {
    box(parent, name, x, height * 0.49, frontHandleZ,
      handleWidth, handleHeight, handleDepth, handleMaterial);
  };

  const addHinges = (
    parent: THREE.Group,
    prefix: string,
    x: number,
    z: number,
  ): void => {
    const hingeWidth = Math.min(jamb * 0.42, openingWidth * 0.025);
    for (const [index, fraction] of [0.2, 0.8].entries()) {
      box(parent, `${prefix}-Hinge-${index + 1}`, x, height * fraction, z,
        hingeWidth, height * 0.055, depth * 0.12, hingeMaterial);
    }
  };

  if (variant === 'single') {
    const leaf = new THREE.Group();
    leaf.name = 'Single-HingedLeaf';
    root.add(leaf);
    box(leaf, 'Single-Slab', 0, openingCenterY, panelZ,
      openingWidth - 2 * clearance, openingHeight - 2 * clearance,
      panelDepth, panelMaterial);
    addHandle(leaf, 'Single-Handle', openingRight - openingWidth * 0.115);
    addHinges(leaf, 'Single', openingLeft + clearance, depth * 0.19);
  } else if (variant === 'double') {
    const leafWidth = openingWidth / 2;
    for (const side of [-1, 1] as const) {
      const name = side === -1 ? 'Left' : 'Right';
      const leaf = new THREE.Group();
      leaf.name = `Double-${name}Leaf`;
      root.add(leaf);
      box(leaf, `Double-${name}Slab`, side * leafWidth / 2,
        openingCenterY, panelZ, leafWidth - 2 * clearance,
        openingHeight - 2 * clearance, panelDepth, panelMaterial);
      addHandle(leaf, `Double-${name}Handle`,
        side * openingWidth * 0.075);
      addHinges(leaf, `Double-${name}`,
        side * (openingWidth / 2 - clearance), depth * 0.19);
    }
  } else {
    // Parallel leaves are staggered in Z and overlap slightly near X=0.
    const overlap = openingWidth * 0.045;
    const leafWidth = (openingWidth + overlap) / 2;
    const offsetX = (openingWidth - leafWidth) / 2;
    const slidingDepth = depth * 0.22;
    const backZ = -depth / 2 + frameDepth - slidingDepth / 2;
    const frontZ = backZ + slidingDepth + depth * 0.035;

    // A low horizontal track distinguishes the sliding model from double doors.
    box(root, 'Sliding-TopTrack', 0, height - header - height * 0.018,
      depth * 0.075, openingWidth, height * 0.018, depth * 0.085,
      hingeMaterial);

    const backLeaf = new THREE.Group();
    backLeaf.name = 'Sliding-RearLeaf';
    root.add(backLeaf);
    box(backLeaf, 'Sliding-RearSlab', -offsetX, openingCenterY, backZ,
      leafWidth - clearance, openingHeight - 2 * clearance,
      slidingDepth, panelMaterial);

    const frontLeaf = new THREE.Group();
    frontLeaf.name = 'Sliding-FrontLeaf';
    root.add(frontLeaf);
    box(frontLeaf, 'Sliding-FrontSlab', offsetX, openingCenterY, frontZ,
      leafWidth - clearance, openingHeight - 2 * clearance,
      slidingDepth, panelMaterial);
    addHandle(frontLeaf, 'Sliding-Handle', offsetX - leafWidth * 0.28);
  }

  return root;
}

/**
 * Usage with an existing scene (no renderer, camera, or lighting created):
 *
 * const door = createDoor({ variant: 'double', primaryColor: '#F29B91' });
 * door.position.set(2, 0, 0); // host wall rear face at local z=-depth/2
 * scene.add(door);
 *
 * Suggested composer snap anchor: bottom-center of the wall opening.
 * The host wall must supply its own opening; this model does not cut geometry.
 */
