# ThreeShell Framework

Composable scene architecture for TypeScript applications: module DI, thin ThreeShell, cohesive operators, fixed-step pipelines, and optional React mounting.

## Zero-maintenance scene discovery (Next.js)

1. Add `withThreeShell` to Next configuration (one-time integration).
2. Create a scene folder with `<slug>.module.ts` and `<slug>.scene.ts` (or use optional `pnpm scene:new`).
3. Render `<SceneView scene="slug" />` from `src/scenes/.generated/registry`.

No manual import registration, generator invocation, sync command, or `predev`/`prebuild` scripts. `@three-shell/next` discovers scenes on startup and watches for changes in development.

```ts
// next.config.ts
import { withThreeShell } from '@three-shell/next';
export default withThreeShell({});
```

```tsx
'use client';
import { SceneView } from '@/scenes/.generated/registry';
export function App() { return <SceneView scene="demo" style={{height:500}} />; }
```

`packages/core` is independent of React, Three.js, and physics. `packages/react` is an optional integration; `packages/next` contains build-time discovery only. The consuming app owns all graphics and simulation resources.

Run: `corepack enable && pnpm install && pnpm dev`. Full builds require workspace dependencies.

## City Cross World Composer

`apps/world-composer` previews an editable low-poly intersection composed from reusable
shophouse, storefront, road and sidewalk factories. It uses the existing ThreeShell scene
module pattern without altering `apps/playground-next` or `apps/lighting-room`.

```bash
pnpm install --frozen-lockfile
pnpm dev:world-composer
# http://localhost:3002
```

The `@three-shell/world-composition` package exposes typed assembly factories,
declarative template registration, snap anchors, and disposal conventions. See
[World Composer documentation](apps/world-composer/README.md).
