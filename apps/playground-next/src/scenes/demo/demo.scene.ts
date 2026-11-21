import { Injectable, Inject, ThreeShell, pipe, type FrameContext, type PipelineSpec } from '@three-shell/core';
import { SceneResources } from './resources/scene-resources';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';
import { EntityStore } from './state/entity.store';
import { SpawnOperator } from './operators/spawn.operator';
import { PhysicsOperator } from './operators/physics.operator';

export const METRICS_CALLBACK = Symbol('METRICS_CALLBACK');
export type MetricsCallback = (metrics: {fps: number; objects: number}) => void;

/** This class only wires providers and defines the execution order. */
@Injectable()
export class DemoScene extends ThreeShell<FrameContext> {
  private reportStart: number | null = null;
  private reportFrames = 0;
  constructor(
    private readonly scene: SceneResources,
    private readonly entities: EntityStore,
    private readonly spawning: SpawnOperator,
    private readonly physics: PhysicsOperator,
    private readonly camera: CameraOperator,
    private readonly renderer: RenderOperator,
    @Inject(METRICS_CALLBACK) private readonly notify: MetricsCallback,
  ) { super(); }
  getAnimationHost() { return this.scene.renderer; }
  createPipelines(): PipelineSpec<FrameContext> {
    return {
      fixedDelta:1/60, maxFrameDelta:.1, maxStepsPerFrame:5,
      simulation:pipe(
        ctx => this.spawning.processCommands(ctx),
        ctx => this.spawning.spawnScheduled(ctx),
        ctx => this.physics.capturePreviousTransforms(ctx),
        ctx => this.physics.simulate(ctx),
        ctx => this.physics.removeFallenBodies(ctx),
        ctx => this.physics.enforceObjectLimit(ctx),
      ),
      presentation:pipe(
        ctx => this.physics.synchronizeTransforms(ctx),
        () => this.camera.update(),
        () => this.renderer.render(),
        ctx => this.reportMetrics(ctx),
      ),
    };
  }
  private reportMetrics(ctx: FrameContext): void {
    this.reportFrames++;
    if (this.reportStart === null) this.reportStart = 0;
    this.reportStart += ctx.frameDelta;
    if (this.reportStart >= .5) {
      this.notify({fps:Math.round(this.reportFrames/this.reportStart),objects:this.entities.count});
      this.reportFrames = 0; this.reportStart = 0;
    }
  }
  onFrameError(error: unknown): void {
    console.error('ThreeShell frame failure',error);
    this.notify({fps:0,objects:this.entities.count});
  }
}
