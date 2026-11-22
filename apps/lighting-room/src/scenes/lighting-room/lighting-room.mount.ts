import type { Provider } from '@three-shell/core';
import { CANVAS_CONTAINER, ROOM_CONFIG } from './state/scene.state';
import { DEFAULT_CONFIG, type RoomConfig } from '@/lib/room-types';

export function createMountProviders(container: HTMLElement, getProps: () => object): Provider[] {
 return [
   { provide: CANVAS_CONTAINER, useValue: container },
   { provide: ROOM_CONFIG, useValue: () => (getProps() as {config?: RoomConfig}).config ?? DEFAULT_CONFIG },
 ];
}
