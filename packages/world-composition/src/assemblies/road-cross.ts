import * as THREE from 'three';
import type { RoadCrossOptions } from '../types';
import { box, matte, PALETTE, positive } from '../primitives';
import { setAnchors } from '../anchors';

/** Cross-shaped two-way roads. All coplanar asphalt slabs avoid overlap and z-fighting. */
export function createRoadCross(options: RoadCrossOptions = {}): THREE.Group {
  const roadWidth = positive('roadWidth', options.roadWidth ?? 7);
  const span = positive('span', options.span ?? 42);
  if (span <= roadWidth + 4) throw new RangeError('span must exceed roadWidth + 4');
  const root = new THREE.Group();
  root.name = 'RoadCross';
  root.userData.template = 'road-cross';
  const asphalt = matte('#818b92');
  const white = matte(PALETTE.white);
  const curb = matte(PALETTE.stone);
  const y = .01;
  box(root,'Road-EastWest',[0,y,0],[span,.075,roadWidth],asphalt);
  // Two disconnected north/south arms stop exactly at the horizontal slab edges.
  const armLength = (span-roadWidth)/2;
  for (const side of [-1,1]) {
    box(root,'Road-NorthSouth-'+side,[0,y,side*(roadWidth/2+armLength/2)],
      [roadWidth,.075,armLength],asphalt);
  }
  // Broken center markings, stopping before crosswalks and the junction.
  for (let offset=roadWidth/2+3;offset<span/2-1;offset+=2.8) {
    for (const side of [-1,1]) {
      box(root,'EastWest-Dash',[side*offset,y+.045,0],[1.3,.008,.10],white);
      box(root,'NorthSouth-Dash',[0,y+.045,side*offset],[.10,.008,1.3],white);
    }
  }
  for (const side of [-1,1]) {
    const crossX = side*(roadWidth/2+1.0);
    const crossZ = side*(roadWidth/2+1.0);
    for (let i=0;i<7;i++) {
      const lateral = (i-3)*roadWidth*.12;
      box(root,'Crosswalk-EW',[crossX,y+.047,lateral],[.35,.008,roadWidth*.095],white);
      box(root,'Crosswalk-NS',[lateral,y+.047,crossZ],[roadWidth*.095,.008,.35],white);
    }
    box(root,'EdgeGuide-EW',[side*(roadWidth/2+2.6),y+.047,side*(roadWidth/2-.15)],
      [2.4,.008,.09],curb);
  }
  setAnchors(root,{
    center:[0,0,0],
    north:[0,0,span/2],south:[0,0,-span/2],
    east:[span/2,0,0],west:[-span/2,0,0],
  });
  return root;
}
