import * as THREE from 'three';
import { describe, it, expect } from 'vitest';
import {
 createCityCross, createRoadCross, createShophouse, createShophouseRow,
 createDefaultRegistry, applyTransform, anchorWorld, snapAnchors, disposeAssembly,
} from '../src';

describe('typed assembly factories', () => {
 it('builds a shophouse with existing upstream storefront components', () => {
  const house=createShophouse({floors:3,width:3.6,depth:5.8,shop:'cafe'});
  expect(house).toBeInstanceOf(THREE.Group);
  expect(house.getObjectByName('EntranceDoor')).toBeTruthy();
  expect(house.getObjectByName('GroundFloorStorefront')).toBeTruthy();
  expect(house.getObjectByName('EntranceAwning')).toBeTruthy();
  expect(house.getObjectByName('Window-2-1')).toBeTruthy();
  const bounds=new THREE.Box3().setFromObject(house);
  const size=bounds.getSize(new THREE.Vector3());
  expect(size.x).toBeGreaterThan(3.5);
  expect(size.y).toBeGreaterThan(7);
  expect(bounds.min.y).toBeGreaterThanOrEqual(-.001);
  disposeAssembly(house);
 });
 it('positions exactly N shophouses in a row', () => {
  const group=createShophouseRow({count:4,width:3,gap:.2,floors:2});
  expect(group.children).toHaveLength(4);
  expect(group.userData.count).toBe(4);
  const start=anchorWorld(group,'row-start');
  const end=anchorWorld(group,'row-end');
  expect(end.x-start.x).toBeCloseTo(12.6);
  disposeAssembly(group);
 });
 it('constructs four separated city blocks with a shared road cross', () => {
  const scene=createCityCross({rowCount:2,floors:2,showStreetFurniture:false});
  expect(scene.children.filter(x=>x.name.startsWith('Block-'))).toHaveLength(4);
  const road=scene.getObjectByName('RoadCross');
  expect(road).toBeTruthy();
  const blocks=scene.children.filter(x=>x.name.startsWith('Block-'));
  for(const block of blocks) {
   expect(block.getObjectByName('StorefrontRow')?.children).toHaveLength(2);
  }
  expect(scene.userData.footprint[0]).toBeGreaterThan(20);
  disposeAssembly(scene);
 });
 it('rejects invalid dimension and count inputs',()=>{
  expect(()=>createCityCross({rowCount:0})).toThrow(RangeError);
  expect(()=>createCityCross({roadWidth:NaN})).toThrow(RangeError);
  expect(()=>createShophouse({floors:2.5})).toThrow(RangeError);
  expect(()=>createRoadCross({roadWidth:8,span:10})).toThrow(RangeError);
 });
 it('supports declarative assembly instantiation',()=>{
  const group=createDefaultRegistry().compose({
   id:'BlockStorefront',template:'shophouse',
   props:{floors:2,shop:'retail'},transform:{position:[1,0,2]},
  });
  expect(group.name).toBe('BlockStorefront');
  expect(group.position.x).toBe(1);
  expect(group.userData.template).toBe('shophouse');
  disposeAssembly(group);
 });
});
describe('snap anchors',()=>{
 it('aligns two rotated groups under a transformed parent',()=>{
  const parent=new THREE.Group();
  parent.position.set(5,0,-3);
  parent.rotation.y=.45;
  const a=createRoadCross({span:24,roadWidth:6});
  const b=createRoadCross({span:24,roadWidth:6});
  parent.add(a,b);
  applyTransform(a,{position:[2,0,0]});
  applyTransform(b,{position:[-4,0,0],rotation:[0,Math.PI/2,0]});
  snapAnchors(b,'west',a,'east');
  expect(anchorWorld(b,'west').distanceTo(anchorWorld(a,'east'))).toBeLessThan(1e-5);
  disposeAssembly(a);
  disposeAssembly(b);
 });
});
