import { Injectable, ThreeShell, pipe, type FrameContext, type PipelineSpec } from '@three-shell/core';
import { SceneState } from './state/scene.state';
import { SpawnOperator } from './operators/spawn.operator';
import { PhysicsOperator } from './operators/physics.operator';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';
import { MetricsOperator } from './operators/metrics.operator';

/** Orchestrates domain-capability operators; never retains mutable scene state. */
@Injectable()
export class DemoScene extends ThreeShell<FrameContext> {
  constructor(
    private readonly state: SceneState,
    private readonly spawning: SpawnOperator,
    private readonly physics: PhysicsOperator,
    private readonly camera: CameraOperator,
    private readonly rendering: RenderOperator,
    private readonly metrics: MetricsOperator,
  ) { super(); }

  getAnimationHost() { return this.state.renderer; }

  createPipelines(): PipelineSpec<FrameContext> {
    return {
      fixedDelta: 1 / 60,
      maxFrameDelta: 0.1,
      maxStepsPerFrame: 5,
      simulation: pipe(
        ctx => this.spawning.processCommands(ctx),
        ctx => this.spawning.spawnScheduled(ctx),
        ctx => this.physics.capturePreviousTransforms(ctx),
        ctx => this.physics.simulate(ctx),
        ctx => this.physics.removeFallenBodies(ctx),
        ctx => this.physics.enforceObjectLimit(ctx),
      ),
      presentation: pipe(
        ctx => this.physics.synchronizeTransforms(ctx),
        () => this.camera.update(),
        () => this.rendering.render(),
        ctx => this.metrics.report(ctx),
      ),
    };
  }

  onFrameError(error: unknown): void { this.metrics.reportError(error); }
}
