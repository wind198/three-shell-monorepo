import { Injectable, ThreeShell, pipe, type FrameContext, type PipelineSpec } from '@three-shell/core';
import { SceneState } from './state/scene.state';
import { AssetOperator } from './operators/asset.operator';
import { LightingOperator } from './operators/lighting.operator';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';

@Injectable()
export class LightingRoomScene extends ThreeShell<FrameContext> {
 constructor(
   private readonly state: SceneState,
   private readonly asset: AssetOperator,
   private readonly lights: LightingOperator,
   private readonly camera: CameraOperator,
   private readonly render: RenderOperator,
 ) { super(); }
 getAnimationHost() { return this.state.renderer; }
 createPipelines(): PipelineSpec<FrameContext> {
   return {
     fixedDelta: 1/60, maxFrameDelta: .1, maxStepsPerFrame: 2,
     simulation: pipe(),
     presentation: pipe(
       ctx => this.asset.update(ctx),
       () => this.lights.update(),
       () => this.camera.update(),
       () => this.render.render(),
     ),
   };
 }
 onFrameError(error: unknown) { console.error('[lighting-room] Frame error', error); }
}
