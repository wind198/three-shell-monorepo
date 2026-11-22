import * as THREE from 'three';
import { Injectable } from '@three-shell/core';
import { SceneState } from './scene.state';

/**
 * Asset modules own their immutable shared geometries. Dispose only unique
 * per-instance materials on replacement; never traverse/dispose geometries.
 */
@Injectable()
export class AssetState {
 current: THREE.Group | null = null;
 key = '';
 requestId = 0;
 destroyed = false;
 spin = 0;
 constructor(private readonly scene: SceneState) {}
 replace(next: THREE.Group): void {
   if (this.current) this.disposeCurrent();
   this.current = next;
   this.scene.assetMount.add(next);
 }
 private disposeCurrent(): void {
   if (!this.current) return;
   this.scene.assetMount.remove(this.current);
   this.disposeGroup(this.current);
   this.current = null;
 }
 /** Per-instance materials belong to the group; source geometry is shared. */
 disposeGroup(group: THREE.Group): void {
   const materials = new Set<THREE.Material>();
   group.traverse(object => {
     if (object instanceof THREE.Mesh) {
       const entries = Array.isArray(object.material) ? object.material : [object.material];
       for (const material of entries) materials.add(material);
     }
   });
   for (const material of materials) material.dispose();
 }
 onSceneDestroy(): void {
   this.destroyed = true;
   this.requestId++;
   this.disposeCurrent();
 }
}
