# ThreeShell architecture

- **Framework (`packages/core`)**: NestJS-style module metadata, constructor DI, provider lifecycle, `ThreeApplication`, `ThreeShell`, synchronous `pipe`, fixed-step `SimulationRuntime`.
- **Scene (`apps/*/src/scenes/<scene>`)**: a self-contained SceneModule. Scene extends `ThreeShell` and explicitly composes operator methods. Operators group related behavior; entities and state are app-owned. Technical implementation directories must be named for their responsibility.
- **Host (`apps/*`)**: provides animation host (e.g., `WebGLRenderer.setAnimationLoop`) and external constructor tokens. React/Next.js only mounts/disposes; never updates per-frame entities.
- **CLI (`tools/scene-cli`)**: no framework runtime dependency; safe, repeatable, collision-rejecting scene scaffolding.

## Dependency direction

```text
apps/playground-next ──> @three-shell/core
  ├─ scene-owned Three.js resources
  ├─ scene-owned Rapier world
  └─ scene-owned behavior operators

tools/scene-cli ──> Node.js standard library (development time only)
@three-shell/core ──> reflect-metadata
```

DI metadata supports constructor class tokens. A runtime value (canvas element, callback or animation host) uses `@Inject(TOKEN)` and `useValue`. Module `exports` scopes DI, not file import visibility. A SceneModule defines exactly one scene; sharing provider graphs between scenes should be explicit rather than automatic.

## React integration (optional)

`@three-shell/react` supplies `createSceneView(load)` and the lower-level `<SceneView load={...} />` with asynchronous client-only bootstrap and disposal. The playground uses `createSceneView(...)` directly from `Dashboard.tsx`; no `demo.view.tsx` exists. CLI scaffolds only the scene module, scene class, and selected technical directories; it never generates JSX wrappers. Rendering and physics dependencies stay in the consuming app.

## Automatic discovery in Next.js

Use `withThreeShell()` in Next config to discover scenes on dev/build startup and watch them in development. Mount with `<SceneView scene="coffee-shop" />` from the generated registry. No `scene:sync`, `predev`, or manual loader registration is required. The CLI is optional for scaffolding.
