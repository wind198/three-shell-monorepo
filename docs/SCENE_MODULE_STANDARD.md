# Scene module standard

A **SceneModule represents exactly one complete scene**. The directory topology is implementation-agnostic. Three.js, a physics engine, and the rendering host are implementation details; they do not determine scene directories.

## Structure

```text
scenes/<scene-name>/
  <scene-name>.module.ts       # DI providers and exports
  <scene-name>.scene.ts        # Pipeline orchestration only
  <scene-name>.mount.ts        # Optional consuming-host bindings
  operators/                  # Stateless cohesive behaviors/capabilities
  state/                      # Stateful providers, registries and owned resources
  entities/                   # Entity models, interfaces and object definitions
```

`operators/`, `state/` and `entities/` are the standard conceptual directories; create only those needed. There is no mandatory `index.ts`, `resources/`, `physics/`, `services/` or `contracts/`. The scene may also have `tests/` and `assets/` where required.

## Responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Module | Provider registration, imports and explicit DI exports | Operational logic |
| Scene | Composition and order of lifecycle, simulation and presentation steps | Scene-wide mutable state and behavioral implementation |
| Operators | Cohesive actions and domain/technical behavior | Authoritative mutable state, independent frame loops |
| State | Runtime state, registries, resources, cleanup and their lifetimes | Cross-capability orchestration |
| Entities | Per-object definitions, interfaces and object-local behavior | Scene-wide orchestration |

### Operator naming

Name each operator for its **responsibility**, not the lifecycle stage where it is called. Examples in a coffee shop: `camera.operator.ts`, `physics.operator.ts`, `navigation.operator.ts`, `customer.operator.ts`, `barista.operator.ts`, `interaction.operator.ts`, `render.operator.ts`. Both domain and technical capabilities are valid. Avoid generic `initialize.operator.ts`, `update.operator.ts`, and `dispose.operator.ts` and avoid splitting one cohesive operator by lifecycle method.

An operator can expose multiple named operations (e.g. `PhysicsOperator.capturePreviousTransforms`, `simulate`, `synchronizeTransforms`). Operators can mutate state and perform effects, but must not retain mutable execution state across frames. Inject state providers rather than storing counters, registries or resources on operators.

### State ownership

State providers own mutable scene data and external engine objects. Examples: `scene.state.ts` owns the renderer and camera, `physics.state.ts` owns the simulation world, and `entity.registry.ts` owns entity instances. Use explicit lifecycle hooks to dispose owned resources; clean up in reverse dependency order. State methods for registry operations and safe cleanup are permitted, but business decisions and pipeline ordering stay in operators/Scene respectively.

### Scene composition

The Scene extends `ThreeShell`, injects operators, and connects their **named methods** through `pipe`. It must not implement spawning, simulation, rendering, or metrics calculations. The current core contract requires `getAnimationHost()`; this may return a state-owned animation host without transferring ownership to Scene.

`@Module.exports` controls DI visibility, not TypeScript module exports. Individual entity instances are not DI providers. Constructor DI uses `@Injectable()`; host/runtime inputs use `@Inject(TOKEN)` and `useValue`.

## React/Next integration

Mount scenes through the discovered generated registry using `<SceneView scene="slug" />`. `<scene>.mount.ts` is optional for host-supplied tokens; do not create per-scene `*.view.tsx` wrappers. Scene registration is automatic via `withThreeShell()`.

## CLI

`pnpm scene:new CoffeeShop --root apps/playground-next` scaffolds an initial scene. Add responsibility-named operators and state providers as needed; generated placeholder operations are only scaffolding, not the naming convention. `pnpm scene:list --root apps/playground-next` lists discovered scenes.
