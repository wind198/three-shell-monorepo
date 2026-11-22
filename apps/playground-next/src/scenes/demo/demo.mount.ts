import type { Provider } from '@three-shell/core';
import { CANVAS_CONTAINER } from './state/scene.state';
import { METRICS_CALLBACK, type MetricsCallback } from './state/metrics.state';

/** Optional scene-specific bootstrap tokens. No React imports or view components. */
export function createMountProviders(container: HTMLElement, getProps: () => object): Provider[] {
  return [
    { provide: CANVAS_CONTAINER, useValue: container },
    { provide: METRICS_CALLBACK, useValue: (metrics: Parameters<MetricsCallback>[0]) => (getProps() as {onMetrics?: MetricsCallback}).onMetrics?.(metrics) },
  ];
}
