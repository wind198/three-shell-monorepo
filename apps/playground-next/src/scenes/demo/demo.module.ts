import { Module } from '@three-shell/core';
import { DemoScene } from './demo.scene';
import { SceneResources } from './resources/scene-resources';
import { PhysicsWorld } from './physics/physics-world';
import { EntityStore } from './state/entity.store';
import { SpawnOperator } from './operators/spawn.operator';
import { PhysicsOperator } from './operators/physics.operator';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';

/** A SceneModule is ONE scene, not a technical feature. */
@Module({
  providers: [
    DemoScene,
    SceneResources,
    PhysicsWorld,
    EntityStore,
    SpawnOperator,
    PhysicsOperator,
    CameraOperator,
    RenderOperator,
  ],
  exports: [DemoScene, EntityStore],
})
export class DemoSceneModule {}
