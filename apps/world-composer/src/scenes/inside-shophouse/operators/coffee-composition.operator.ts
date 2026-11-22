import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { createInsideShophouse } from '@three-shell/world-composition';
import { SceneState } from '../../city-cross/state/scene.state';
import { CompositionState } from '../../city-cross/state/composition.state';

@Injectable()
export class CoffeeCompositionOperator {
 constructor(private readonly scene:SceneState,private readonly composition:CompositionState) {}
 update():void {
  const options=this.scene.getConfig().coffee;
  const key=JSON.stringify(options);
  if(key===this.composition.key)return;
  try {
   const assembled=createInsideShophouse(options);
   this.composition.replace(assembled);
   this.composition.key=key;
   this.fit(assembled);
   this.scene.report('Ready · Shophouse coffee interior');
  }catch(error){
   this.composition.key=key;
   this.scene.report('Coffee shop composition error: '+String(error));
  }
 }
 private fit(root:THREE.Group):void {
  const bounds=new THREE.Box3().setFromObject(root);
  if(bounds.isEmpty())return;
  const center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  this.scene.controls.target.copy(center);
  this.scene.camera.position.copy(center).add(
   new THREE.Vector3(1,1.12,1).normalize().multiplyScalar(Math.max(size.length()*1.6,14)),
  );
  this.scene.camera.lookAt(center);
  this.scene.camera.updateMatrixWorld(true);
  const xs=[bounds.min.x,bounds.max.x],ys=[bounds.min.y,bounds.max.y],zs=[bounds.min.z,bounds.max.z];
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const x of xs)for(const y of ys)for(const z of zs){
   const point=new THREE.Vector3(x,y,z).applyMatrix4(this.scene.camera.matrixWorldInverse);
   minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);
   minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
  }
  this.scene.camera.zoom=Math.max(.1,Math.min(8,Math.min(
   (this.scene.camera.right-this.scene.camera.left)/Math.max(maxX-minX,.01),
   (this.scene.camera.top-this.scene.camera.bottom)/Math.max(maxY-minY,.01),
  )/1.2));
  this.scene.camera.near=.1;
  this.scene.camera.far=Math.max(200,size.length()*6);
  this.scene.camera.updateProjectionMatrix();
  this.scene.controls.update();
 }
}
