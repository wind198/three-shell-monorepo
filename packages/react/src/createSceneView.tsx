'use client';
import { useCallback, useRef, type ComponentType } from 'react';
import type { FrameContext } from '@three-shell/core';
import { SceneView, type SceneLoader, type SceneMount, type SceneViewProps } from './SceneView';

export type GeneratedSceneViewProps<T extends FrameContext = FrameContext> = Omit<SceneViewProps<T>, 'load'>;

/**
 * Create a JSX mount component once, at module scope. No per-scene *.view.tsx is necessary.
 * The mount definition is resolved lazily inside the React effect (never during SSR).
 * getProps() reads the latest props, so callback updates don't restart the scene.
 */
export function createSceneView<P extends object = Record<string, never>, T extends FrameContext = FrameContext>(
  load: (element: HTMLDivElement, getProps: () => P) => SceneMount<T> | Promise<SceneMount<T>>,
): ComponentType<P & GeneratedSceneViewProps<T>> {
  function GeneratedSceneView(props: P & GeneratedSceneViewProps<T>) {
    const latest = useRef(props);
    latest.current = props;
    const stableLoader = useCallback<SceneLoader<T>>(
      (element) => load(element, () => latest.current as P),
      [],
    );
    const { onReady, onError, onDispose, className, style, children } = props;
    return (
      <SceneView
        load={stableLoader}
        onReady={onReady}
        onError={onError}
        onDispose={onDispose}
        className={className}
        style={style}
      >
        {children}
      </SceneView>
    );
  }
  GeneratedSceneView.displayName = 'ThreeShellSceneView';
  return GeneratedSceneView;
}
