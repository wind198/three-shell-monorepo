import { Module } from '@three-shell/core';
import { InsideShophouseScene } from './inside-shophouse.scene';
import { CoffeeCompositionOperator } from './operators/coffee-composition.operator';
import { SceneState } from '../city-cross/state/scene.state';
import { CompositionState } from '../city-cross/state/composition.state';
import { SelectionOperator } from '../city-cross/operators/selection.operator';
import { CameraOperator } from '../city-cross/operators/camera.operator';
import { LightingOperator } from '../city-cross/operators/lighting.operator';
import { RenderOperator } from '../city-cross/operators/render.operator';

@Module({
 providers:[
  InsideShophouseScene,SceneState,CompositionState,CoffeeCompositionOperator,
  SelectionOperator,CameraOperator,LightingOperator,RenderOperator,
 ],
 exports:[InsideShophouseScene],
})
export class InsideShophouseSceneModule {}
