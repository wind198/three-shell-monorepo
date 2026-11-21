# @three-shell/next

Automatic scene discovery for Next.js. No manual sync or watch command.

Configure once in `next.config.ts`:

```ts
import { withThreeShell } from '@three-shell/next';
export default withThreeShell({});
```

Then mount any scene by filename-derived slug:

```tsx
'use client';
import { SceneView } from '@/scenes/.generated/registry';
export default function Page() { return <SceneView scene="coffee-shop" style={{height: 500}} />; }
```

A scene consists of `<slug>/<slug>.module.ts` and `<slug>/<slug>.scene.ts` under `src/scenes/`. An optional `<slug>.mount.ts` can supply custom mount-time tokens.

The Next.js config automatically generates the statically analyzable import registry on dev/build startup. In dev mode it watches the scenes directory and regenerates only when imports change. No `predev`, `prebuild`, `scene:sync`, manual imports, or app-owned watcher is needed. The watcher uses Node 22+ recursive `fs.watch`.

The optional `three-shell-scene new` CLI can scaffold a scene, but is not necessary for the discovery workflow.
