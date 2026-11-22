# Asset Lighting Room

A Next.js visual workbench built on the **existing ThreeShell scene architecture**. It previews a single low-poly asset at a time; it is not a world composer.

## Run

From the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:lighting-room
```

Open http://localhost:3001.

## Features

- Search/select implemented assets from the imported architecture factory snapshot.
- Select typed variants, optionally override dimensions, and tune primary/secondary colors.
- Studio/daylight/warm/neutral lighting presets, live key and ambient light controls.
- Orbit, pan, zoom, XYZ rotation, auto-rotation, ground/grid and shadow controls.
- Reframe the camera automatically whenever an asset factory is rebuilt.

## Asset source

The **pinned source snapshot** lives in `packages/world-assets/src/upstream/`, copied from
`wind198/low-poly-world-prompts` at the time of initial implementation.
`packages/world-assets/catalog/assets.json` contains catalog metadata for the 20 implemented
architecture factories; specifications without TypeScript factories are deliberately omitted.

Add new `<category>/<asset>.ts` sources directly inside `src/upstream/`. Each must export a
named `createName(options?)` factory returning `THREE.Group`. Optionally add catalog
metadata under `catalog/assets.json`. `@three-shell/next` automatically generates the
scene registry; `tools/asset-discovery` generates the factory registry at dev/build startup
and watches the source directory in development.

A separate upstream sync workflow is intentionally **not automatic**. Updates should be
reviewed and committed so the app's sources stay reproducible.

## Runtime ownership

- SceneState owns renderer, camera, lights, controls and floor resources.
- AssetState owns current group and its **instance-specific materials**, but not factory module-level geometry.
- Scene operators handle loading, lighting, camera and rendering.
- One mounted scene/renderer persists when switching asset factories.
- Factory errors are surfaced in the toolbar instead of crashing the rendering loop.

## Limitations

- No WebGL-based screenshots or comparisons yet.
- No automatic upstream Git synchronization; source snapshot is versioned.
- A few upstream factories may have their own geometry/material ownership rules.
- Standard pipeline renders continuously; render-on-demand can be introduced after visual validation.
