import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';

@Injectable()
export class CameraOperator {
  constructor(private readonly resources: SceneState) {}
  update(): void { this.resources.controls.update(); }
}
