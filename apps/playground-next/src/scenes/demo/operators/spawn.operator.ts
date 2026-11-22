import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Injectable, type FrameContext } from '@three-shell/core';
import { SceneState } from '../state/scene.state';
import { PhysicsState } from '../state/physics.state';
import { EntityRegistry } from '../state/entity.registry';

/** Related spawning operations are public pipeline stages, helpers remain private. */
@Injectable()
export class SpawnOperator {
  constructor(private readonly store: EntityRegistry, private readonly physics: PhysicsState, private readonly scene: SceneState) {}
  processCommands(_ctx: FrameContext): void {
    if (this.store.commands.clearRequested) {
      this.store.clear();
      this.store.commands.clearRequested = false;
    }
    const n = Math.min(20, this.store.commands.spawnRequests);
    this.store.commands.spawnRequests -= n;
    for (let i = 0; i < n; i++) this.createObject();
  }
  spawnScheduled(ctx: FrameContext): void {
    const {settings} = this.store;
    if (!settings.autoSpawn) { this.store.elapsedSinceSpawn = 0; return; }
    this.store.elapsedSinceSpawn += ctx.dt;
    while (this.store.elapsedSinceSpawn >= settings.spawnInterval) {
      this.store.elapsedSinceSpawn -= settings.spawnInterval;
      this.createObject();
    }
  }
  private createObject(): void {
    const variant = this.store.nextVisualKind++ % 3;
    const x = (Math.random() -.5)*3.2, y = 6 + Math.random()*2.5, z = (Math.random()-.5)*3.2;
    const mesh = new THREE.Mesh(variant === 1 ? this.scene.geometries.sphere : this.scene.geometries.box, this.scene.materials[variant]);
    mesh.castShadow = true;
    mesh.position.set(x,y,z);
    const body = this.physics.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z));
    const collider = variant === 1 ? RAPIER.ColliderDesc.ball(.5) : RAPIER.ColliderDesc.cuboid(.5,.5,.5);
    collider.setRestitution(.5).setFriction(.65);
    this.physics.world.createCollider(collider, body);
    const id = `body-${this.store.nextEntityId++}`;
    this.store.entities.set(id, {id, mesh, body, previousPosition:mesh.position.clone(), previousRotation:mesh.quaternion.clone()});
    this.scene.scene.add(mesh);
  }
}
