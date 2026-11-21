import type { AnimationHost } from '@three-shell/core';

/** Generic browser frame source for scaffolds; real Three.js scenes can return renderer.setAnimationLoop. */
export class BrowserAnimationHost implements AnimationHost {
  private callback: ((timestamp: number) => void) | null = null;
  private frameId: number | null = null;
  setAnimationLoop(callback: ((timestamp: number) => void) | null): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.callback = callback;
    if (!callback) return;
    const tick = (time: number) => {
      if (this.callback !== callback) return;
      callback(time);
      if (this.callback === callback) this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }
}
