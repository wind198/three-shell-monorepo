import { Injectable, type FrameContext } from '@three-shell/core';
import { PhysicsState } from '../state/physics.state';
import { EntityRegistry } from '../state/entity.registry';

@Injectable()
export class PhysicsOperator {
  constructor(private readonly physics: PhysicsState, private readonly store: EntityRegistry) {}
  capturePreviousTransforms(_ctx: FrameContext): void {
    for (const entity of this.store.entities.values()) {
      const pos = entity.body.translation(), rot = entity.body.rotation();
      entity.previousPosition.set(pos.x,pos.y,pos.z);
      entity.previousRotation.set(rot.x,rot.y,rot.z,rot.w);
    }
  }
  simulate(_ctx: FrameContext): void { this.physics.world.step(); }
  synchronizeTransforms(ctx: FrameContext): void {
    for (const entity of this.store.entities.values()) {
      const pos = entity.body.translation(), rot = entity.body.rotation();
      entity.mesh.position.set(pos.x,pos.y,pos.z).lerp(entity.previousPosition, 1 - ctx.alpha);
      entity.mesh.quaternion.set(rot.x,rot.y,rot.z,rot.w).slerp(entity.previousRotation, 1 - ctx.alpha);
    }
  }
  removeFallenBodies(_ctx: FrameContext): void {
    for (const entity of this.store.entities.values()) {
      if (entity.body.translation().y < -10) this.store.remove(entity.id);
    }
  }
  enforceObjectLimit(_ctx: FrameContext): void {
    while (this.store.count > this.store.settings.maxObjects) {
      const oldest = this.store.entities.keys().next().value;
      if (oldest === undefined) break;
      this.store.remove(oldest);
    }
  }
}
