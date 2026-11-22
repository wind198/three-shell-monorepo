import { Injectable } from '@three-shell/core';
import { SceneState } from '../state/scene.state';
import { CompositionState } from '../state/composition.state';

@Injectable()
export class SelectionOperator {
 constructor(private readonly scene:SceneState,private readonly state:CompositionState) {}
 update():void {
  const selection=this.scene.getConfig().selection;
  if(selection===this.state.selected)return;
  const chosen=selection?this.state.current?.getObjectByName(selection):undefined;
  this.state.select(chosen??null);
 }
}
