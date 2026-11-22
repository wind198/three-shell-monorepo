import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { disposeAssembly } from '@three-shell/world-composition';
import { SceneState } from './scene.state';

@Injectable()
export class CompositionState {
 current: THREE.Group | null = null;
 key='';
 private boxHelper?: THREE.Box3Helper;
 selected='';
 constructor(private readonly scene: SceneState) {}
 replace(group: THREE.Group):void {
  this.clearSelection();
  this.disposeCurrent();
  this.current=group;
  this.scene.content.add(group);
 }
 select(object:THREE.Object3D | null):void {
  this.clearSelection();
  if (!object) return;
  const bounds=new THREE.Box3().setFromObject(object);
  if(bounds.isEmpty())return;
  this.boxHelper=new THREE.Box3Helper(bounds,new THREE.Color('#f4b183'));
  this.boxHelper.name='SelectedBounds';
  this.scene.scene.add(this.boxHelper);
  this.selected=object.name;
 }
 clearSelection():void {
  if(this.boxHelper) {
   this.scene.scene.remove(this.boxHelper);
   this.boxHelper.geometry.dispose();
   (this.boxHelper.material as THREE.Material).dispose();
   this.boxHelper=undefined;
  }
  this.selected='';
 }
 private disposeCurrent():void {
  if(!this.current)return;
  this.scene.content.remove(this.current);
  disposeAssembly(this.current);
  this.current=null;
 }
 onSceneDestroy():void {this.clearSelection();this.disposeCurrent();}
}
