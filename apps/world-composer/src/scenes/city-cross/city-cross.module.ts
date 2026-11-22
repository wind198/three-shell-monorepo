import { Module } from '@three-shell/core';
import { CityCrossScene } from './city-cross.scene';
import { SceneState } from './state/scene.state';
import { CompositionState } from './state/composition.state';
import { CompositionOperator } from './operators/composition.operator';
import { SelectionOperator } from './operators/selection.operator';
import { CameraOperator } from './operators/camera.operator';
import { LightingOperator } from './operators/lighting.operator';
import { RenderOperator } from './operators/render.operator';

@Module({
  providers: [
    CityCrossScene, SceneState, CompositionState,
    CompositionOperator, SelectionOperator, CameraOperator, LightingOperator, RenderOperator,
  ],
  exports: [CityCrossScene],
})
export class CityCrossSceneModule {}
