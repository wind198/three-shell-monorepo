import { Module } from '@three-shell/core';
import { DemoScene } from './demo.scene';
import { SceneState } from './state/scene.state';
import { PhysicsState } from './state/physics.state';
import { EntityRegistry } from './state/entity.registry';
import { SpawnOperator } from './operators/spawn.operator';
import { PhysicsOperator } from './operators/physics.operator';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';
import { MetricsOperator } from './operators/metrics.operator';
import { MetricsState } from './state/metrics.state';

/** A SceneModule is ONE scene, not a technical feature. */
@Module({
  providers: [
    DemoScene,
    SceneState,
    PhysicsState,
    EntityRegistry,
    SpawnOperator,
    PhysicsOperator,
    CameraOperator,
    RenderOperator,
    MetricsState,
    MetricsOperator,
  ],
  exports: [DemoScene, EntityRegistry],
})
export class DemoSceneModule {}
