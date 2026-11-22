import type { Provider } from '@three-shell/core';
import { HOST_CONTAINER, HOST_CONFIG, HOST_REPORT } from './state/scene.state';
import { DEFAULT_CONFIG, type ComposerConfig } from '@/lib/config';

export function createMountProviders(container: HTMLElement, getProps: () => object): Provider[] {
 return [
  {provide:HOST_CONTAINER, useValue:container},
  {provide:HOST_CONFIG, useValue:()=>(getProps() as {config?:ComposerConfig}).config ?? DEFAULT_CONFIG},
  {provide:HOST_REPORT, useValue:(status:string)=>
    (getProps() as {onStatus?:(status:string)=>void}).onStatus?.(status)},
 ];
}
