import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';

@Injectable()
export class RenderOperator {
  constructor(private readonly resources: SceneState) {}
  render(): void { this.resources.renderer.render(this.resources.scene, this.resources.camera); }
}
