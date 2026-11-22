import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';

@Injectable()
export class LightingOperator {
 constructor(private readonly scene:SceneState) {}
 update():void {
  const env=this.scene.getConfig().environment;
  const presets={
   day: {color:'#fff7e7', ambient:1.8, power:3.2, bg:'#e6f2f2', sun:[-15,27,18]},
   'golden-hour':{color:'#ffd2a0', ambient:1.5, power:2.65, bg:'#f6dfd1', sun:[-22,13,18]},
   evening:{color:'#c8d9ff', ambient:.95, power:1.25, bg:'#a9bcd1', sun:[-25,9,12]},
  } as const;
  const p=presets[env.time];
  this.scene.sun.color.set(p.color);
  this.scene.sun.intensity=p.power;
  const [sunX, sunY, sunZ] = p.sun;
  this.scene.sun.position.set(sunX, sunY, sunZ);
  this.scene.ambient.intensity=p.ambient;
  (this.scene.scene.background as THREE.Color).set(p.bg);
  this.scene.grid.visible=env.showGrid;
  this.scene.sun.castShadow=env.shadows;
  this.scene.renderer.shadowMap.enabled=env.shadows;
 }
}
