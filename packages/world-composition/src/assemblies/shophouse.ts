import * as THREE from 'three';
import { createDoor } from '@three-shell/world-assets/architecture/door';
import { createWindow } from '@three-shell/world-assets/architecture/window';
import { createAwning } from '@three-shell/world-assets/architecture/awning';
import { createStorefrontFacade } from '@three-shell/world-assets/architecture/storefront-facade';
import type { ShophouseOptions, ShophouseRowOptions, ShopType } from '../types';
import { box, matte, PALETTE, positive, whole } from '../primitives';
import { setAnchors } from '../anchors';

const SHOPS: readonly ShopType[] = ['cafe', 'retail', 'office'];

/** One low-poly shophouse, origin at ground/frontage center, +Z faces the street. */
export function createShophouse(options: ShophouseOptions = {}): THREE.Group {
  const width = positive('width', options.width ?? 3.6);
  const depth = positive('depth', options.depth ?? 5.8);
  const floors = whole('floors', options.floors ?? 3, 8);
  const floorHeight = positive('floorHeight', options.floorHeight ?? 2.55);
  const shop = options.shop ?? 'cafe';
  if (!SHOPS.includes(shop)) throw new RangeError('Unsupported shop type');
  const overallHeight = floors * floorHeight + .22;
  const group = new THREE.Group();
  group.name = 'Shophouse';
  group.userData.template = 'shophouse';
  group.userData.shop = shop;
  const primary = matte(options.primaryColor ?? PALETTE.cream);
  const secondary = matte(options.secondaryColor ?? PALETTE.oak);
  const roof = matte(options.roofColor ?? PALETTE.coral);
  const inner = matte(PALETTE.white);
  const facing = depth / 2;

  box(group, 'MainBody', [0, overallHeight/2-.11, 0],
    [width, overallHeight-.22, depth], primary);
  box(group, 'SideTrimLeft', [-width*.48, overallHeight/2, 0],
    [width*.04, overallHeight, depth], secondary);
  box(group, 'SideTrimRight', [width*.48, overallHeight/2, 0],
    [width*.04, overallHeight, depth], secondary);
  for (let level = 1; level < floors; level++) {
    const y = level * floorHeight;
    box(group, 'FloorBand-' + level, [0, y, facing+.025], [width, .085, .075], secondary);
  }
  box(group, 'FlatRoof', [0, overallHeight-.07, 0],
    [width+.18, .14, depth+.16], roof);
  box(group, 'RoofParapet', [0, overallHeight+.05, facing],
    [width+.15, .19, .17], roof);

  // Existing asset factories provide the storefront, door, windows and awning.
  const facade = createStorefrontFacade({
    variant: shop === 'office' ? 'office' : 'cafe',
    width: width*.88, depth: .17, height: floorHeight*.93,
    primaryColor: options.secondaryColor ?? PALETTE.oak,
    secondaryColor: options.primaryColor ?? PALETTE.cream,
  });
  facade.name = 'GroundFloorStorefront';
  facade.position.set(0, 0, facing+.12);
  group.add(facade);

  const door = createDoor({
    variant: 'single', width: width*.20, depth: .10, height: floorHeight*.70,
    primaryColor: shop === 'cafe' ? PALETTE.mint : PALETTE.sky,
    secondaryColor: PALETTE.white,
  });
  door.name = 'EntranceDoor';
  door.position.set(0, 0, facing+.25);
  group.add(door);

  const awning = createAwning({
    variant: shop === 'office' ? 'flat' : 'sloped',
    width: width*.78, depth: .75, height: .23,
    primaryColor: shop === 'cafe' ? PALETTE.coral : PALETTE.mint,
    secondaryColor: PALETTE.cream,
  });
  awning.name = 'EntranceAwning';
  awning.position.set(0, floorHeight*.88, facing+.38);
  group.add(awning);

  for (let level = 1; level < floors; level++) {
    const centerY = level * floorHeight + floorHeight*.31;
    for (const side of [-1,1]) {
      const window = createWindow({
        variant: 'tall', width: width*.28, depth: .13, height: floorHeight*.48,
        primaryColor: PALETTE.sky,
        secondaryColor: options.secondaryColor ?? PALETTE.oak,
      });
      window.name = 'Window-' + level + '-' + side;
      window.position.set(side*width*.245, centerY, facing+.10);
      group.add(window);
    }
    box(group, 'BalconyBand-' + level, [0, level*floorHeight+.12, facing+.21],
      [width*.82, .105, .32], secondary);
  }
  // A warm front panel is the visually coherent backing for facade components.
  box(group, 'DoorInset', [0, floorHeight*.34, facing+.083],
    [width*.21, floorHeight*.66, .045], inner);
  setAnchors(group, {
    'front-center':[0,0,facing], 'back-center':[0,0,-facing],
    'left-front':[-width/2,0,facing], 'right-front':[width/2,0,facing],
    'floor-top':[0,overallHeight,0],
  });
  return group;
}

export function createShophouseRow(options: ShophouseRowOptions = {}): THREE.Group {
  const count = whole('count', options.count ?? 3, 16);
  const width = positive('width', options.width ?? 3.6);
  const gap = options.gap ?? .15;
  if (!Number.isFinite(gap) || gap < 0) throw new RangeError('gap must be non-negative');
  const depth = positive('depth', options.depth ?? 5.8);
  const row = new THREE.Group();
  row.name = 'ShophouseRow';
  row.userData.template = 'shophouse-row';
  const rowWidth = count*width + (count-1)*gap;
  for(let i=0;i<count;i++){
    const floorCount = options.floorPattern?.[i % (options.floorPattern.length || 1)] ?? options.floors ?? 3;
    const shop = options.shops?.[i % (options.shops.length || 1)] ?? SHOPS[i % SHOPS.length];
    const child = createShophouse({ ...options, width, depth, floors: floorCount, shop });
    child.name = 'Shophouse-' + (i+1);
    child.userData.index = i;
    child.position.x = -rowWidth/2+width/2+i*(width+gap);
    row.add(child);
  }
  row.userData.count = count;
  setAnchors(row, {
    'front-center':[0,0,depth/2], 'back-center':[0,0,-depth/2],
    'row-start':[-rowWidth/2,0,0], 'row-end':[rowWidth/2,0,0],
  });
  return row;
}
