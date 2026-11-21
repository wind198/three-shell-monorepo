'use client';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { ThreeApplication, type Class, type FrameContext, type Provider, type SceneDefinition } from '@three-shell/core';

/** Returned by a lazy-loaded scene entry point. No renderer-specific assumptions. */
export interface SceneMount<T extends FrameContext = FrameContext> {
  module: Class;
  scene: Class<SceneDefinition<T>>;
  providers?: readonly Provider[];
}
export type SceneLoader<T extends FrameContext = FrameContext> = (
  element: HTMLDivElement,
) => SceneMount<T> | Promise<SceneMount<T>>;

export interface SceneViewProps<T extends FrameContext = FrameContext> {
  /** Stable module-level loader. Prefer dynamic import to avoid SSR evaluating WebGL modules. */
  load: SceneLoader<T>;
  onReady?: (app: ThreeApplication<T>) => void;
  onError?: (error: unknown) => void;
  onDispose?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Mounts once per effect, safely disposes even if async bootstrap resolves after unmount. */
export function SceneView<T extends FrameContext = FrameContext>({
  load, onReady, onError, onDispose, className, style, children,
}: SceneViewProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onError, onDispose });
  callbacks.current = { onReady, onError, onDispose };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let current: ThreeApplication<T> | null = null;
    const bootstrap = async () => {
      try {
        const definition = await load(container);
        if (cancelled) return;
        const app = await ThreeApplication.create<T, SceneDefinition<T>>(
          definition.module,
          definition.scene,
          definition.providers ?? [],
        );
        if (cancelled) {
          await app.dispose();
          return;
        }
        current = app;
        app.start();
        callbacks.current.onReady?.(app);
      } catch (error) {
        if (!cancelled) callbacks.current.onError?.(error);
      }
    };
    void bootstrap();
    return () => {
      cancelled = true;
      const app = current;
      current = null;
      if (app) {
        void app.dispose().catch(error => callbacks.current.onError?.(error));
      }
      callbacks.current.onDispose?.();
    };
  }, [load]);

  return <div ref={containerRef} className={className} style={style}>{children}</div>;
}
