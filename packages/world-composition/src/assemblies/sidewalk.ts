import * as THREE from 'three';
import { box, matte, PALETTE, positive } from '../primitives';
import { setAnchors } from '../anchors';
import type { SidewalkOptions } from '../types';

/**
 * Reusable sidewalk section with a single street-facing curb.
 * Origin at bottom-center, +X along frontage, +Z front.
 * Front or back curb determines which edge meets the road.
 */
export function createSidewalkSegment(options: SidewalkOptions = {}): THREE.Group {
 const length = positive('length', options.length ?? 4);
 const depth = positive('depth', options.depth ?? 2);
 const height = positive('height', options.height ?? .115);
 const curbSide = options.curbSide ?? 'front';
 if (curbSide !== 'front' && curbSide !== 'back') throw new RangeError('curbSide must be front or back');
 const side = curbSide === 'front' ? 1 : -1;
 const group = new THREE.Group();
 group.name = 'SidewalkSegment';
 group.userData.template = 'sidewalk-segment';
 const pavement = matte(options.color ?? '#e8e2d3');
 const trim = matte(PALETTE.stone);
 box(group,'Pavement',[0,height/2,0],[length,height,depth],pavement);
 box(group,'StreetCurb',[0,height*.36,side*(depth/2-.06)],
   [length,height*.72,.12],trim);
 setAnchors(group,{
  'left-end':[-length/2,0,0], 'right-end':[length/2,0,0],
  'street-edge':[0,0,side*depth/2], 'rear-edge':[0,0,-side*depth/2],
  'top-center':[0,height,0],
 });
 return group;
}
