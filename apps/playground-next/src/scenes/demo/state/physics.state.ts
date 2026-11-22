import RAPIER from '@dimforge/rapier3d-compat';
import { Injectable } from '@three-shell/core';

/** World is mutable and owned by this provider, not the Rapier adapter. */
@Injectable()
export class PhysicsState {
  world!: RAPIER.World;
  async onSceneInit(): Promise<void> {
    await RAPIER.init();
    this.world = new RAPIER.World({x: 0, y: -9.81, z: 0});
    this.world.timestep = 1 / 60;
    const ground = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -.25, 0));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(5,.25,5).setFriction(.85).setRestitution(0), ground);
  }
  onSceneDestroy(): void { this.world?.free(); }
}
