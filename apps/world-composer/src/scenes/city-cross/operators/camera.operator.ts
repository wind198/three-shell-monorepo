import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';
@Injectable()
export class CameraOperator {
 constructor(private readonly scene:SceneState) {}
 update():void { this.scene.controls.update(); }
}
