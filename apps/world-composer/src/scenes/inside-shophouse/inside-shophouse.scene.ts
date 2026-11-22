import { Injectable, ThreeShell, pipe, type FrameContext, type PipelineSpec } from '@three-shell/core';
import { SceneState } from '../city-cross/state/scene.state';
import { CoffeeCompositionOperator } from './operators/coffee-composition.operator';
import { SelectionOperator } from '../city-cross/operators/selection.operator';
import { CameraOperator } from '../city-cross/operators/camera.operator';
import { LightingOperator } from '../city-cross/operators/lighting.operator';
import { RenderOperator } from '../city-cross/operators/render.operator';

@Injectable()
export class InsideShophouseScene extends ThreeShell<FrameContext> {
 constructor(
  private readonly state:SceneState,
  private readonly compose:CoffeeCompositionOperator,
  private readonly selection:SelectionOperator,
  private readonly camera:CameraOperator,
  private readonly lighting:LightingOperator,
  private readonly render:RenderOperator,
 ) {super();}
 getAnimationHost(){return this.state.renderer;}
 createPipelines():PipelineSpec<FrameContext>{
  return {fixedDelta:1/60,maxFrameDelta:.1,maxStepsPerFrame:2,
   simulation:pipe(),
   presentation:pipe(
    ()=>this.compose.update(),
    ()=>this.selection.update(),
    ()=>this.lighting.update(),
    ()=>this.camera.update(),
    ()=>this.render.render(),
   ),
  };
 }
 onFrameError(error:unknown):void {this.state.report('Coffee shop scene error: '+String(error));}
}
