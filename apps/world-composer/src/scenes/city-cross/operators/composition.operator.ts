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
  const height = Math.max(size.y+size.z*.72, size.x*.65, 1);
  this.scene.camera.zoom=Math.max(.2,Math.min(6,24/(height*1.3)));
  this.scene.controls.target.copy(center);
  this.scene.camera.position.copy(center).add(new THREE.Vector3(1,1.12,1).normalize().multiplyScalar(Math.max(size.length(),20)));
  this.scene.camera.near=.1;
  this.scene.camera.far=Math.max(200,size.length()*5);
  this.scene.camera.updateProjectionMatrix();
  this.scene.controls.update();
 }
}
