# @three-shell/react

Optional React client adapter for renderer-neutral `@three-shell/core`.

Use **`createSceneView()`** in the consuming React component file (at module scope), rather than creating a `*.view.tsx` wrapper for each scene:

```tsx
'use client';
import { createSceneView } from '@three-shell/react';

const CoffeeShop = createSceneView(async (container) => {
  const [{ CoffeeShopSceneModule }, { CoffeeShopScene, COFFEE_SHOP_HOST }] = await Promise.all([
    import('@/scenes/coffee-shop/coffee-shop.module'),
    import('@/scenes/coffee-shop/coffee-shop.scene'),
  ]);
  return {
    module: CoffeeShopSceneModule,
    scene: CoffeeShopScene,
    providers: [{ provide: COFFEE_SHOP_HOST, useValue: createBrowserHost(container) }],
  };
});

export function PageContent() {
  return <CoffeeShop style={{ height: 500 }} />;
}
```

`createBrowserHost` above is intentionally application-defined. For non-WebGL scaffolds, `BrowserAnimationHost` is supplied by this package; for a real Three.js scene, the scene's resource owner normally supplies `renderer.setAnimationLoop`.

The factory's second loader parameter, `getProps`, returns current scene-specific props, avoiding stale callbacks without remounting the scene. The returned component also supports `onReady`, `onError`, `onDispose`, `className`, `style`, and `children`.

The factory runs at module scope, but **dynamic imports run only inside the client-side effect**, so Three.js and Rapier modules are not loaded by server rendering. Cleanup and async unmount races are handled by `SceneView`.

## Automatic discovery in Next.js

Use `withThreeShell()` in Next config to discover scenes on dev/build startup and watch them in development. Mount with `<SceneView scene="coffee-shop" />` from the generated registry. No `scene:sync`, `predev`, or manual loader registration is required. The CLI is optional for scaffolding.
