import { Injectable, ThreeShell, pipe, type FrameContext, type PipelineSpec } from '@three-shell/core';
import { SceneState } from './state/scene.state';
import { CompositionOperator } from './operators/composition.operator';
import { SelectionOperator } from './operators/selection.operator';
import { CameraOperator } from './operators/camera.operator';
import { LightingOperator } from './operators/lighting.operator';
import { RenderOperator } from './operators/render.operator';

@Injectable()
export class CityCrossScene extends ThreeShell<FrameContext> {
 constructor(
  private readonly scene: SceneState,
  private readonly composition: CompositionOperator,
  private readonly selection: SelectionOperator,
  private readonly camera: CameraOperator,
  private readonly lighting: LightingOperator,
  private readonly render: RenderOperator,
 ) { super(); }
 getAnimationHost() { return this.scene.renderer; }
 createPipelines(): PipelineSpec<FrameContext> {
  return { fixedDelta:1/60, maxFrameDelta:.1, maxStepsPerFrame:2,
    simulation:pipe(),
    presentation:pipe(
      ()=>this.composition.update(),
      ()=>this.selection.update(),
      ()=>this.lighting.update(),
      ()=>this.camera.update(),
      ()=>this.render.render(),
    ),
  };
 }
 onFrameError(error:unknown):void { this.scene.report('Scene error: '+String(error)); }
}
