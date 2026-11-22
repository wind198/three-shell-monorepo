import { Injectable, Inject } from '@three-shell/core';

export const METRICS_CALLBACK = Symbol('METRICS_CALLBACK');
export type MetricsCallback = (metrics: { fps: number; objects: number }) => void;

/** Persistent reporting counters and host callback. No behavior or frame orchestration. */
@Injectable()
export class MetricsState {
  elapsedSeconds = 0;
  frameCount = 0;
  constructor(@Inject(METRICS_CALLBACK) readonly notify: MetricsCallback) {}
}
