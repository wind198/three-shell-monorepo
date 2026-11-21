import { Injectable } from '@three-shell/core';
import { SceneResources } from '../resources/scene-resources';

@Injectable()
export class CameraOperator {
  constructor(private readonly resources: SceneResources) {}
  update(): void { this.resources.controls.update(); }
}
