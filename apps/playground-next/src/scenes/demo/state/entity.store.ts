import { Injectable } from '@three-shell/core';
import { SceneResources } from '../resources/scene-resources';
import { PhysicsWorld } from '../physics/physics-world';
import type { SimulationEntity } from '../entities/simulation-entity';

/** Entity registry and command state. Destroy before world and scene resources. */
@Injectable()
export class EntityStore {
  readonly entities = new Map<string, SimulationEntity>();
  readonly settings = {autoSpawn:true, spawnInterval:1, maxObjects:80};
  readonly commands = {spawnRequests:4, clearRequested:false};
  elapsedSinceSpawn = 0;
  nextEntityId = 0;
  nextVisualKind = 0;
  constructor(private readonly physics: PhysicsWorld, private readonly scene: SceneResources) {}
  get count(): number { return this.entities.size; }
  enqueueSpawn(count = 1): void {
    if (!Number.isFinite(count)) throw new Error('Spawn count must be finite');
    this.commands.spawnRequests = Math.min(200, this.commands.spawnRequests + Math.max(0, Math.floor(count)));
  }
  remove(id: string): void {
    const entity = this.entities.get(id);
    if (!entity) return;
    this.entities.delete(id);
    this.scene.scene.remove(entity.mesh);
    this.physics.world.removeRigidBody(entity.body);
  }
  clear(): void { for (const id of [...this.entities.keys()]) this.remove(id); }
  onSceneDestroy(): void { this.clear(); }
}
