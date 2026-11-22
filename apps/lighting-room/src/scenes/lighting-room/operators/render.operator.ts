import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';

@Injectable()
export class RenderOperator {
 constructor(private readonly scene: SceneState) {}
 render(): void { this.scene.renderer.render(this.scene.scene, this.scene.camera); }
}
