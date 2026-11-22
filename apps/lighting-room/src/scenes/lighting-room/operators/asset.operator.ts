import * as THREE from 'three';
import { Injectable, type FrameContext } from '@three-shell/core';
import { inspectionCatalog } from '@/lib/inspection-catalog';
import { AssetState } from '../state/asset.state';
import { SceneState } from '../state/scene.state';

@Injectable()
export class AssetOperator {
 constructor(private readonly scene: SceneState, private readonly asset: AssetState) {}

 update(frame: FrameContext): void {
   const config = this.scene.getConfig();
   const entry = inspectionCatalog[config.assetId];
   if (entry) {
     const key = config.assetId + JSON.stringify(config.options);
     if (key !== this.asset.key) {
       this.asset.key = key;
       const version = ++this.asset.requestId;
       this.scene.report('Loading ' + entry.name + '…');
       void entry.create(config.options).then(result => {
         if (this.asset.destroyed || version !== this.asset.requestId) {
           // This stale result was never mounted, but its instance materials were
           // allocated. Dispose materials without touching module-shared geometry.
           this.asset.disposeGroup(result);
           return;
         }
         if (!(result instanceof THREE.Group)) throw new Error(entry.name + ' must return THREE.Group');
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

 /** Fit an asset of any size in the existing orthographic camera, including city assemblies. */
 private frameAsset(group: THREE.Group): void {
   const bounds = new THREE.Box3().setFromObject(group);
   if (bounds.isEmpty()) return;
   const size = bounds.getSize(new THREE.Vector3());
   const center = bounds.getCenter(new THREE.Vector3());
   this.scene.controls.target.copy(center);
   this.scene.camera.position.copy(center).add(
     new THREE.Vector3(1, .87, 1).normalize().multiplyScalar(Math.max(size.length(), 6)),
   );
   this.scene.camera.lookAt(center);
   this.scene.camera.updateMatrixWorld(true);
   const xs=[bounds.min.x,bounds.max.x], ys=[bounds.min.y,bounds.max.y], zs=[bounds.min.z,bounds.max.z];
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   for(const x of xs)for(const y of ys)for(const z of zs) {
     const point=new THREE.Vector3(x,y,z).applyMatrix4(this.scene.camera.matrixWorldInverse);
     minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);
     minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
   }
   const visibleWidth=this.scene.camera.right-this.scene.camera.left;
   const visibleHeight=this.scene.camera.top-this.scene.camera.bottom;
   const zoom=Math.min(
     visibleWidth / (Math.max(maxX-minX,.01)*1.25),
     visibleHeight / (Math.max(maxY-minY,.01)*1.25),
   );
   this.scene.camera.zoom=Math.min(12,Math.max(.01,zoom));
   this.scene.camera.near=.01;
   this.scene.camera.far=Math.max(200,size.length()*10);
   this.scene.camera.updateProjectionMatrix();
   this.scene.controls.update();
 }
}
