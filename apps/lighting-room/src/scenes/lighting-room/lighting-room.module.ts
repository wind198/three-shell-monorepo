import { Module } from '@three-shell/core';
import { LightingRoomScene } from './lighting-room.scene';
import { SceneState } from './state/scene.state';
import { AssetState } from './state/asset.state';
import { AssetOperator } from './operators/asset.operator';
import { LightingOperator } from './operators/lighting.operator';
import { CameraOperator } from './operators/camera.operator';
import { RenderOperator } from './operators/render.operator';

@Module({
 providers: [LightingRoomScene, SceneState, AssetState, AssetOperator, LightingOperator, CameraOperator, RenderOperator],
 exports: [LightingRoomScene, AssetState],
})
export class LightingRoomSceneModule {}
