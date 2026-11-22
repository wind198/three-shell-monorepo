import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { createDefaultRegistry } from '@three-shell/world-composition';
import { SceneState } from '../state/scene.state';
import { CompositionState } from '../state/composition.state';

@Injectable()
export class CompositionOperator {
 constructor(private readonly scene:SceneState,private readonly state:CompositionState) {}
 update():void {
  const {city}=this.scene.getConfig();
  const key=JSON.stringify(city);
  if(key===this.state.key)return;
  try {
   const root=createDefaultRegistry().compose({
    id:'CityCross', template:'city-cross', props:city,
   });
   this.state.replace(root);
   this.state.key=key;
   this.frame(root);
   const count=city.rowCount??3;
   this.scene.report('Ready · '+(4*count)+' shophouses in 4 blocks');
  }catch(error){this.state.key=key;this.scene.report('Composition error: '+String(error));}
 }
 private frame(group:THREE.Group):void {
  const box=new THREE.Box3().setFromObject(group);
  if(box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  // Orthographic camera vertical span is 24 units. Zoom to fit in both axes.
  this.scene.controls.target.copy(center);
  this.scene.camera.position.copy(center).add(
   new THREE.Vector3(1,1.12,1).normalize().multiplyScalar(Math.max(size.length(),20)),
  );
  this.scene.camera.lookAt(center);
  this.scene.camera.updateMatrixWorld(true);
  // Project all eight world-space box corners into camera space and fit both axes.
  // This avoids clipping wide city blocks on narrow viewports.
  const xs=[box.min.x,box.max.x], ys=[box.min.y,box.max.y], zs=[box.min.z,box.max.z];
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const x of xs)for(const y of ys)for(const z of zs){
   const p=new THREE.Vector3(x,y,z).applyMatrix4(this.scene.camera.matrixWorldInverse);
   minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
   minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }
  const visibleWidth=this.scene.camera.right-this.scene.camera.left;
  const visibleHeight=this.scene.camera.top-this.scene.camera.bottom;
  const zoom=Math.min(visibleWidth/(Math.max(maxX-minX,.01)*1.18),
                       visibleHeight/(Math.max(maxY-minY,.01)*1.18));
  this.scene.camera.zoom=Math.max(.1,Math.min(6,zoom));
  this.scene.camera.near=.1;
  this.scene.camera.far=Math.max(200,size.length()*5);
  this.scene.camera.updateProjectionMatrix();
  this.scene.controls.update();
 }
}
