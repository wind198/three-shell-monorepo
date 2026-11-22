import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';

@Injectable()
export class LightingOperator {
 constructor(private readonly scene: SceneState) {}
 update(): void {
   const { lighting, environment } = this.scene.getConfig();
   const az = THREE.MathUtils.degToRad(lighting.azimuth);
   const el = THREE.MathUtils.degToRad(lighting.elevation);
   const r = 12;
   this.scene.keyLight.position.set(Math.sin(az)*Math.cos(el)*r, Math.sin(el)*r, Math.cos(az)*Math.cos(el)*r);
   this.scene.keyLight.intensity = lighting.intensity;
   this.scene.keyLight.color.set(lighting.color);
   this.scene.keyLight.castShadow = lighting.shadows;
   this.scene.ambientLight.intensity = lighting.ambientIntensity;
   this.scene.renderer.shadowMap.enabled = lighting.shadows;
   (this.scene.scene.background as THREE.Color).set(environment.backgroundColor);
   this.scene.floor.material.color.set(environment.floorColor);
   this.scene.grid.visible = environment.showGrid;
 }
}
