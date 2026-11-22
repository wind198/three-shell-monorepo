import type { Provider } from '@three-shell/core';
import { CANVAS_CONTAINER, ROOM_CONFIG, ROOM_REPORT } from './state/scene.state';
import { DEFAULT_CONFIG, type RoomConfig } from '@/lib/room-types';

/** Host bindings are resolved by the root SceneModule during bootstrap. */
export function createMountProviders(container: HTMLElement, getProps: () => object): Provider[] {
 return [
   { provide: CANVAS_CONTAINER, useValue: container },
   { provide: ROOM_CONFIG, useValue: () => (getProps() as { config?: RoomConfig }).config ?? DEFAULT_CONFIG },
   {
     provide: ROOM_REPORT,
     useValue: (message: string) =>
       (getProps() as { onAssetStatus?: (message: string) => void }).onAssetStatus?.(message),
   },
 ];
}
