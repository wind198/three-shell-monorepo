import * as THREE from 'three';
import { add, group as createGroup, place, rotate } from '../helpers';
import type { CityCrossDocument, CityCrossOptions } from '../types';
import { box, matte, PALETTE, positive, streetLamp, tree, whole } from '../primitives';
import { createSidewalkSegment } from './sidewalk';
import { createShophouseRow } from './shophouse';
import { createRoadCross } from './road-cross';
import { setAnchors } from '../anchors';

export const DEFAULT_CITY_CROSS: CityCrossDocument = {
  schemaVersion:1, template:'city-cross',
  options: {
    rowCount:3, roadWidth:7, sidewalkWidth:2,
    buildingWidth:3.6, buildingDepth:5.8, buildingGap:.14,
    floors:3, showStreetFurniture:true,
  },
};
const SHOPS = ['cafe','retail','office'] as const;
const COLORS = [PALETTE.cream, PALETTE.mint, PALETTE.coral, PALETTE.sky];

/** Four quadrant shophouse rows around a connected plus-shaped intersection. */
export function createCityCross(options: CityCrossOptions = {}): THREE.Group {
  const rowCount = whole('rowCount', options.rowCount ?? 3, 12);
  const roadWidth = positive('roadWidth', options.roadWidth ?? 7);
  const sidewalkWidth = positive('sidewalkWidth', options.sidewalkWidth ?? 2);
  const buildingWidth = positive('buildingWidth', options.buildingWidth ?? 3.6);
  const buildingDepth = positive('buildingDepth', options.buildingDepth ?? 5.8);
  const buildingGap = options.buildingGap ?? .14;
  if (!Number.isFinite(buildingGap) || buildingGap < 0) throw new RangeError('buildingGap must be non-negative');
  const floors = whole('floors', options.floors ?? 3, 8);
  const palette = options.palette?.length ? options.palette : COLORS;
  const rowWidth = rowCount*buildingWidth+(rowCount-1)*buildingGap;
  const reach = roadWidth/2 + sidewalkWidth + Math.max(rowWidth, buildingDepth) + 2;
  const span = reach*2;
  const group = new THREE.Group();
  group.name = 'CityCross';
  group.userData.template = 'city-cross';
  group.userData.options = { ...options, rowCount, roadWidth, sidewalkWidth, buildingWidth, buildingDepth, buildingGap, floors };
  const ground = matte('#bfd8b9');
  box(group,'Terrain',[0,-.16,0],[span+.5,.22,span+.5],ground);

  const road = createRoadCross({roadWidth,span});
  add(group, road);
  const sidewalkY = .115;
  const xCenter = roadWidth/2 + sidewalkWidth + rowWidth/2;
  const zCenter = roadWidth/2 + sidewalkWidth + buildingDepth/2;
  // Keep the buildings aligned to the east-west street, in four distinct quadrants.
  // They face the nearby roadway; north blocks rotate 180 degrees.
  for (const zSide of [-1,1]) {
    for (const xSide of [-1,1]) {
      const block = createGroup('Block-'+(zSide>0?'North':'South')+'-'+(xSide>0?'East':'West'));
      block.userData.template = 'city-block';
      place(block, xSide*xCenter, 0, zSide*zCenter);
      const sidewalk = createSidewalkSegment({
        length: rowWidth + .6, depth: sidewalkWidth,
        height: sidewalkY, curbSide: zSide === 1 ? 'back' : 'front',
      });
      sidewalk.name = 'Sidewalk';
      add(block, place(sidewalk, 0, 0, -zSide * (buildingDepth / 2 + sidewalkWidth / 2)));

      const row = createShophouseRow({
        count:rowCount, width:buildingWidth, depth:buildingDepth,
        gap:buildingGap, floors, floorPattern:[floors,Math.max(1,floors-1),floors],
        shops:SHOPS,
        primaryColor:palette[(zSide===1?0:2)+(xSide===1?1:0)] ?? PALETTE.cream,
        secondaryColor:PALETTE.oak,
      });
      row.name = 'StorefrontRow';
      add(block, rotate(place(row, 0, sidewalkY, 0), 0, zSide===1?Math.PI:0, 0));
      if(options.showStreetFurniture!==false) {
        const streetEdgeZ = -zSide*(buildingDepth/2+sidewalkWidth*.54);
        for (const x of [-rowWidth*.36,rowWidth*.36]) {
          const plant = tree('PlanterTree',1.75);
          add(block, place(plant, x, sidewalkY, streetEdgeZ));
        }
        const lamp = streetLamp();
        add(block, place(lamp, xSide*rowWidth*.47, sidewalkY, streetEdgeZ));
      }
      add(group, block);
    }
  }
  setAnchors(group,{
    center:[0,0,0],north:[0,0,span/2],south:[0,0,-span/2],
    east:[span/2,0,0],west:[-span/2,0,0],
  });
  group.userData.footprint = [span,span];
  return group;
}
