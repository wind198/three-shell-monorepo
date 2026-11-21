import { Injectable } from '@three-shell/core';
import { SceneResources } from '../resources/scene-resources';

@Injectable()
export class RenderOperator {
  constructor(private readonly resources: SceneResources) {}
  render(): void { this.resources.renderer.render(this.resources.scene, this.resources.camera); }
}
