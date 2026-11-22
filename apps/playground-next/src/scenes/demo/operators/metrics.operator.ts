import { Injectable, type FrameContext } from '@three-shell/core';
import { EntityRegistry } from '../state/entity.registry';
import { MetricsState } from '../state/metrics.state';

/** Stateless frame-metrics capability. Counters belong to MetricsState. */
@Injectable()
export class MetricsOperator {
  constructor(
    private readonly metrics: MetricsState,
    private readonly entities: EntityRegistry,
  ) {}

  report(ctx: FrameContext): void {
    this.metrics.frameCount++;
    this.metrics.elapsedSeconds += ctx.frameDelta;
    if (this.metrics.elapsedSeconds >= 0.5) {
      this.metrics.notify({
        fps: Math.round(this.metrics.frameCount / this.metrics.elapsedSeconds),
        objects: this.entities.count,
      });
      this.metrics.frameCount = 0;
      this.metrics.elapsedSeconds = 0;
    }
  }

  reportError(error: unknown): void {
    console.error('ThreeShell frame failure', error);
    this.metrics.notify({ fps: 0, objects: this.entities.count });
  }
}
