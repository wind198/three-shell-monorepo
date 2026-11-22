import * as THREE from 'three';
import { Injectable, type FrameContext } from '@three-shell/core';
import { assets } from '@three-shell/world-assets';
import { AssetState } from '../state/asset.state';
import { SceneState } from '../state/scene.state';

@Injectable()
export class AssetOperator {
 constructor(private readonly scene: SceneState, private readonly asset: AssetState) {}

 update(frame: FrameContext): void {
   const config = this.scene.getConfig();
   const entry = assets[config.assetId];
   if (entry) {
     const options = {
       ...(config.options.variant ? {variant: config.options.variant} : {}),
       ...(config.options.width !== undefined ? {width: config.options.width} : {}),
       ...(config.options.depth !== undefined ? {depth: config.options.depth} : {}),
       ...(config.options.height !== undefined ? {height: config.options.height} : {}),
       primaryColor: config.options.primaryColor,
       secondaryColor: config.options.secondaryColor,
     };
     const key = config.assetId + JSON.stringify(options);
     if (key !== this.asset.key) {
       this.asset.key = key;
       const version = ++this.asset.requestId;
       this.scene.report('Loading ' + entry.name + '…');
       void entry.load().then(mod => {
         if (this.asset.destroyed || version !== this.asset.requestId) return;
         const factory = (mod as Record<string, unknown>)[entry.factory];
         if (typeof factory !== 'function') throw new Error('Missing ' + entry.factory);
         const result: unknown = factory(options);
         if (!(result instanceof THREE.Group)) throw new Error(entry.factory + ' must return THREE.Group');
         if (this.asset.destroyed || version !== this.asset.requestId) return;
         this.asset.replace(result);
         this.asset.spin = 0;
         this.frameAsset(result);
         this.scene.report('Ready · ' + entry.name);
       }).catch(error => {
         if (version === this.asset.requestId && !this.asset.destroyed) {
           this.scene.report('Error · ' + String(error));
         }
       });
     }
   }
   const object = this.asset.current;
   if (object) {
     if (config.transform.autoRotate) {
       this.asset.spin += Math.min(Math.max(frame.frameDelta || 0, 0), .1) * .48;
     }
     object.rotation.set(
       THREE.MathUtils.degToRad(config.transform.x),
       THREE.MathUtils.degToRad(config.transform.y) + this.asset.spin,
       THREE.MathUtils.degToRad(config.transform.z),
     );
   }
 }
 private frameAsset(group: THREE.Group): void {
   const box = new THREE.Box3().setFromObject(group);
   if (box.isEmpty()) return;
   const size = box.getSize(new THREE.Vector3());
   const center = box.getCenter(new THREE.Vector3());
   const radius = Math.max(size.length() * .5, .3);
   this.scene.controls.target.copy(center);
   this.scene.camera.position.copy(center).add(new THREE.Vector3(1, .87, 1).normalize().multiplyScalar(radius * 3.6));
   this.scene.camera.zoom = Math.min(9, Math.max(.22, 2.3 / (radius * 2.15)));
   this.scene.camera.near = .01;
   this.scene.camera.far = Math.max(100, radius * 20);
   this.scene.camera.updateProjectionMatrix();
   this.scene.controls.update();
 }
}
